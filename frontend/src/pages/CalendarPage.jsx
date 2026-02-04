import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { formatPrice } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone, Mail, X, Users, Settings, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfMonth, isSameDay, isSameMonth, setHours, setMinutes, eachDayOfInterval } from 'date-fns';

// Service colors for visual distinction
const SERVICE_COLORS = [
  { bg: 'bg-teal-100', border: 'border-l-teal-500', text: 'text-teal-700' },
  { bg: 'bg-blue-100', border: 'border-l-blue-500', text: 'text-blue-700' },
  { bg: 'bg-purple-100', border: 'border-l-purple-500', text: 'text-purple-700' },
  { bg: 'bg-amber-100', border: 'border-l-amber-500', text: 'text-amber-700' },
  { bg: 'bg-rose-100', border: 'border-l-rose-500', text: 'text-rose-700' },
  { bg: 'bg-indigo-100', border: 'border-l-indigo-500', text: 'text-indigo-700' },
  { bg: 'bg-emerald-100', border: 'border-l-emerald-500', text: 'text-emerald-700' },
  { bg: 'bg-orange-100', border: 'border-l-orange-500', text: 'text-orange-700' },
];

const CalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  
  // New booking form
  const [newBooking, setNewBooking] = useState({
    service_id: '',
    team_member_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    time: '',
    notes: ''
  });
  
  // New team member form
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    color: '#00BFA5'
  });

  const MEMBER_COLORS = [
    '#00BFA5', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
    '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F97316'
  ];

  // Hours for the calendar grid (8am to 8pm)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  const HOUR_HEIGHT = 60; // pixels per hour

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const [bookingsRes, servicesRes, membersRes] = await Promise.all([
        api.get(`/bookings?date=${dateStr}`).catch(() => ({ data: [] })),
        api.get('/services').catch(() => ({ data: [] })),
        api.get('/team-members').catch(() => ({ data: [] }))
      ]);
      setBookings(bookingsRes.data || []);
      setServices(servicesRes.data || []);
      setTeamMembers(membersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceColor = (serviceId) => {
    const index = services.findIndex(s => s.id === serviceId);
    return SERVICE_COLORS[index % SERVICE_COLORS.length];
  };

  const getMemberColor = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    return member?.color || '#00BFA5';
  };

  const getBookingsForMember = (memberId) => {
    return bookings.filter(b => 
      b.team_member_id === memberId || 
      (!b.team_member_id && memberId === 'unassigned')
    );
  };

  const getBookingPosition = (booking) => {
    const date = new Date(booking.datetime);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const top = (hours - 8) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
    const height = (booking.duration_min / 60) * HOUR_HEIGHT;
    return { top, height: Math.max(height, 30) };
  };

  const formatBookingTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDates = getWeekDates();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleCreateBooking = async () => {
    if (!newBooking.service_id || !newBooking.client_name || !newBooking.client_email || !newBooking.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const [hours, mins] = newBooking.time.split(':').map(Number);
      const bookingDate = setMinutes(setHours(selectedDate, hours), mins);
      
      await api.post('/bookings/with-team', {
        service_id: newBooking.service_id,
        team_member_id: newBooking.team_member_id || null,
        client_name: newBooking.client_name,
        client_email: newBooking.client_email,
        client_phone: newBooking.client_phone,
        datetime_iso: bookingDate.toISOString(),
        notes: newBooking.notes
      });
      
      toast.success('Booking created');
      setShowAddBooking(false);
      setNewBooking({ service_id: '', team_member_id: '', client_name: '', client_email: '', client_phone: '', time: '', notes: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const handleAddTeamMember = async () => {
    if (!newMember.name) {
      toast.error('Please enter a name');
      return;
    }
    
    try {
      await api.post('/team-members', newMember);
      toast.success('Team member added');
      setNewMember({ name: '', email: '', phone: '', role: 'staff', color: '#00BFA5' });
      loadData();
    } catch (error) {
      toast.error('Failed to add team member');
    }
  };

  const handleDeleteTeamMember = async (memberId) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await api.delete(`/team-members/${memberId}`);
      toast.success('Team member removed');
      loadData();
    } catch (error) {
      toast.error('Failed to remove team member');
    }
  };

  const changeDate = (days) => {
    setSelectedDate(prev => addDays(prev, days));
  };

  const timeOptions = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeOptions.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // Calculate columns based on team members
  const displayMembers = teamMembers.length > 0 ? teamMembers : [{ id: 'all', name: 'All Bookings', color: '#00BFA5' }];

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col bg-cream-50" data-testid="calendar-page">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Calendar</h1>
            <p className="text-sm text-navy-500">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Team Member Avatars - Link to /team */}
            <Link to="/team" className="flex items-center gap-1 hover:opacity-80 transition-opacity" title="Manage Team">
              <div className="flex -space-x-2">
                {teamMembers.slice(0, 5).map((member, idx) => (
                  <div 
                    key={member.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                    style={{ backgroundColor: member.color || '#00BFA5', zIndex: 5 - idx }}
                    title={member.name}
                  >
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      member.name?.charAt(0)?.toUpperCase() || 'T'
                    )}
                  </div>
                ))}
                {teamMembers.length > 5 && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white bg-gray-200 text-gray-600">
                    +{teamMembers.length - 5}
                  </div>
                )}
              </div>
              {teamMembers.length === 0 && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-dashed border-gray-300 text-gray-400">
                  <Plus className="w-4 h-4" />
                </div>
              )}
            </Link>
            <Button
              onClick={() => setShowAddBooking(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl gap-2"
              data-testid="add-booking-btn"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Date Navigation + View Tabs */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate(viewMode === 'month' ? -30 : viewMode === 'week' ? -7 : -1)}
              className="rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
              className="rounded-full text-sm px-4"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate(viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 1)}
              className="rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          {/* View Mode Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode 
                    ? 'bg-white text-teal-600 shadow-sm' 
                    : 'text-navy-500 hover:text-navy-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Week Strip (only in day view) */}
          {viewMode === 'day' && (
            <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl">
              {weekDates.map((date, index) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                const hasBookings = bookings.some(b => 
                  new Date(b.datetime).toDateString() === date.toDateString()
                );
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
                      isSelected 
                        ? 'bg-teal-500 text-white shadow-lg' 
                        : isToday 
                          ? 'bg-teal-100 text-teal-700'
                          : 'hover:bg-white text-navy-600'
                    }`}
                  >
                    <span className="text-xs font-medium">{dayNames[index]}</span>
                    <span className={`text-lg font-bold ${isSelected ? 'text-white' : ''}`}>
                      {format(date, 'd')}
                    </span>
                    {hasBookings && !isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          
          <div className="text-sm text-navy-500">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} {viewMode === 'day' ? 'today' : 'this ' + viewMode}
          </div>
        </div>

        {/* Calendar Views */}
        {viewMode === 'day' && (
          <div className="flex-1 overflow-hidden flex">
            {/* Time Column */}
            <div className="w-16 border-r border-gray-200 bg-white flex-shrink-0">
              <div className="h-14 border-b border-gray-200" /> {/* Spacer for header */}
              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className="h-[60px] border-b border-gray-50 flex items-start justify-end pr-2 pt-0">
                    <span className="text-xs text-navy-400 -mt-2">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Member Columns */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex min-w-max">
                {displayMembers.map((member) => {
                  const memberBookings = teamMembers.length > 0 
                    ? getBookingsForMember(member.id)
                    : bookings;
                  
                  return (
                    <div key={member.id} className="flex-1 min-w-[200px] border-r border-gray-100 last:border-r-0">
                      {/* Member Header */}
                      <div 
                        className="h-14 border-b border-gray-200 bg-white flex items-center justify-center gap-2 px-3 sticky top-0"
                        style={{ borderTopWidth: 3, borderTopColor: member.color }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-navy-900 truncate">{member.name}</p>
                          <p className="text-xs text-navy-400">{member.role || 'All'}</p>
                        </div>
                      </div>
                      
                      {/* Time Grid with Bookings */}
                      <div className="relative bg-white">
                        {/* Hour lines */}
                        {hours.map((hour) => (
                          <div key={hour} className="h-[60px] border-b border-gray-50" />
                        ))}
                        
                        {/* Bookings */}
                        {memberBookings.map((booking) => {
                          const { top, height } = getBookingPosition(booking);
                          const colors = getServiceColor(booking.service_id);
                          
                          return (
                            <div
                              key={booking.id}
                              className={`absolute left-1 right-1 ${colors.bg} ${colors.border} border-l-4 rounded-lg p-2 overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
                              style={{ top: `${top}px`, height: `${height}px` }}
                              onClick={() => toast.info(`${booking.client_name} - ${booking.service_name}`)}
                            >
                              <div className={`text-xs font-semibold ${colors.text}`}>
                                {formatBookingTime(booking.datetime)}
                              </div>
                              <div className="text-sm font-medium text-navy-900 truncate">
                                {booking.client_name}
                              </div>
                              {height > 50 && (
                                <div className="text-xs text-navy-500 truncate">
                                  {booking.service_name}
                                </div>
                              )}
                              {height > 70 && (
                                <div className="text-xs text-navy-400 mt-1">
                                  {formatPrice(booking.price_pence)}
                                </div>
                              )}
                            </div>
                          );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Add Booking Modal */}
        <Dialog open={showAddBooking} onOpenChange={setShowAddBooking}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-navy-900">New Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-navy-700">Service *</Label>
                  <Select
                    value={newBooking.service_id}
                    onValueChange={(v) => setNewBooking(prev => ({ ...prev, service_id: v }))}
                  >
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} - {formatPrice(s.price_pence)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-navy-700">Time *</Label>
                  <Select
                    value={newBooking.time}
                    onValueChange={(v) => setNewBooking(prev => ({ ...prev, time: v }))}
                  >
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {timeOptions.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {teamMembers.length > 0 && (
                <div>
                  <Label className="text-navy-700">Assign To</Label>
                  <Select
                    value={newBooking.team_member_id}
                    onValueChange={(v) => setNewBooking(prev => ({ ...prev, team_member_id: v }))}
                  >
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {teamMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: m.color }}
                            />
                            {m.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label className="text-navy-700">Client Name *</Label>
                <Input
                  value={newBooking.client_name}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, client_name: e.target.value }))}
                  className="mt-1.5 rounded-xl"
                  placeholder="Enter client name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-navy-700">Email *</Label>
                  <Input
                    type="email"
                    value={newBooking.client_email}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, client_email: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                    placeholder="client@email.com"
                  />
                </div>
                <div>
                  <Label className="text-navy-700">Phone</Label>
                  <Input
                    value={newBooking.client_phone}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, client_phone: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                    placeholder="+44 7..."
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-navy-700">Notes</Label>
                <Input
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1.5 rounded-xl"
                  placeholder="Any special requests..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddBooking(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBooking}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
                >
                  Create Booking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Management Modal */}
        <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-navy-900">Team Members</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Existing Members */}
              <div className="space-y-2">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-navy-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No team members yet</p>
                    <p className="text-sm">Add your first team member below</p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-navy-900">{member.name}</p>
                        <p className="text-sm text-navy-400 capitalize">{member.role}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
              
              {/* Add New Member */}
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-navy-900 mb-3">Add New Member</p>
                <div className="space-y-3">
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    className="rounded-xl"
                    placeholder="Name"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      className="rounded-xl"
                      placeholder="Email (optional)"
                    />
                    <Select
                      value={newMember.role}
                      onValueChange={(v) => setNewMember(prev => ({ ...prev, role: v }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-navy-600 mb-2 block">Calendar Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {MEMBER_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewMember(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full transition-transform ${
                            newMember.color === color ? 'ring-2 ring-offset-2 ring-navy-900 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleAddTeamMember}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
