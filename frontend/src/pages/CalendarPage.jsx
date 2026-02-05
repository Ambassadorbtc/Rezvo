import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { formatPrice } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone, Mail, X, Users, Settings, Edit2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfMonth, isSameDay, isSameMonth, setHours, setMinutes, eachDayOfInterval } from 'date-fns';

// Service colors for visual distinction
const SERVICE_COLORS = [
  { bg: 'bg-teal-100', border: 'border-l-teal-500', text: 'text-teal-700', accent: '#00BFA5' },
  { bg: 'bg-blue-100', border: 'border-l-blue-500', text: 'text-blue-700', accent: '#3B82F6' },
  { bg: 'bg-purple-100', border: 'border-l-purple-500', text: 'text-purple-700', accent: '#8B5CF6' },
  { bg: 'bg-amber-100', border: 'border-l-amber-500', text: 'text-amber-700', accent: '#F59E0B' },
  { bg: 'bg-rose-100', border: 'border-l-rose-500', text: 'text-rose-700', accent: '#F43F5E' },
  { bg: 'bg-indigo-100', border: 'border-l-indigo-500', text: 'text-indigo-700', accent: '#6366F1' },
  { bg: 'bg-emerald-100', border: 'border-l-emerald-500', text: 'text-emerald-700', accent: '#10B981' },
  { bg: 'bg-orange-100', border: 'border-l-orange-500', text: 'text-orange-700', accent: '#F97316' },
];

const CalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [preselectedTime, setPreselectedTime] = useState('');
  const [preselectedMember, setPreselectedMember] = useState('');
  const [draggedBooking, setDraggedBooking] = useState(null);
  
  const [newBooking, setNewBooking] = useState({
    service_id: '',
    team_member_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    time: '',
    notes: ''
  });

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  const HOUR_HEIGHT = 64;

  const loadData = useCallback(async () => {
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
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getServiceColor = (serviceId) => {
    const index = services.findIndex(s => s.id === serviceId);
    return SERVICE_COLORS[index % SERVICE_COLORS.length];
  };

  const getBookingsForMember = (memberId) => {
    return bookings.filter(b => 
      b.team_member_id === memberId || 
      (!b.team_member_id && memberId === 'unassigned')
    );
  };

  const getBookingPosition = (booking) => {
    const date = new Date(booking.datetime);
    const bookingHours = date.getHours();
    const minutes = date.getMinutes();
    const top = (bookingHours - 8) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
    const height = (booking.duration_min / 60) * HOUR_HEIGHT;
    return { top, height: Math.max(height, 40) };
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

  // Double-click to add booking
  const handleDoubleClick = (hour, memberId = '') => {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    setPreselectedTime(time);
    setPreselectedMember(memberId);
    setNewBooking(prev => ({ ...prev, time, team_member_id: memberId }));
    setShowAddBooking(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e, booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetDate, targetHour) => {
    e.preventDefault();
    if (!draggedBooking) return;

    const newDateTime = new Date(targetDate);
    newDateTime.setHours(targetHour, 0, 0, 0);

    try {
      await api.patch(`/bookings/${draggedBooking.id}`, {
        datetime: newDateTime.toISOString()
      });
      toast.success('Booking moved!');
      loadData();
    } catch (error) {
      toast.error('Failed to move booking');
    }
    setDraggedBooking(null);
  };

  const handleCreateBooking = async () => {
    if (!newBooking.service_id || !newBooking.client_name || !newBooking.client_email || !newBooking.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const [bookingHours, mins] = newBooking.time.split(':').map(Number);
      const bookingDate = setMinutes(setHours(selectedDate, bookingHours), mins);
      
      await api.post('/bookings/with-team', {
        service_id: newBooking.service_id,
        team_member_id: newBooking.team_member_id || null,
        client_name: newBooking.client_name,
        client_email: newBooking.client_email,
        client_phone: newBooking.client_phone,
        datetime_iso: bookingDate.toISOString(),
        notes: newBooking.notes
      });
      
      toast.success('Booking created!');
      setShowAddBooking(false);
      setNewBooking({ service_id: '', team_member_id: '', client_name: '', client_email: '', client_phone: '', time: '', notes: '' });
      setPreselectedTime('');
      setPreselectedMember('');
      loadData();
    } catch (error) {
      toast.error('Failed to create booking');
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

  const displayMembers = teamMembers.length > 0 ? teamMembers : [{ id: 'all', name: 'All Bookings', color: '#00BFA5' }];

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col bg-cream-50" data-testid="calendar-page">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Calendar</h1>
            <p className="text-sm text-navy-400 font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-4">
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
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl gap-2 shadow-lg shadow-teal-500/20"
              data-testid="add-booking-btn"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Date Navigation + View Tabs - FIXED LAYOUT */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2 w-[200px]">
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
              className="rounded-full text-sm px-4 font-semibold"
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
          
          {/* Center: View Mode Tabs - Always in same position */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === mode 
                    ? 'bg-white text-teal-600 shadow-sm' 
                    : 'text-navy-500 hover:text-navy-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Right: Week Strip or Spacer */}
          <div className="w-[400px] flex justify-end">
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
                      <span className="text-xs font-semibold">{dayNames[index]}</span>
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
            {viewMode !== 'day' && (
              <div className="text-sm text-navy-400 font-medium">
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''} this {viewMode}
              </div>
            )}
          </div>
        </div>

        {/* Calendar Views */}
        {viewMode === 'day' && (
          <div className="flex-1 overflow-hidden flex">
            {/* Time Column */}
            <div className="w-20 border-r border-gray-200 bg-white flex-shrink-0">
              <div className="h-16 border-b border-gray-200" />
              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className="h-[64px] border-b border-gray-50 flex items-start justify-end pr-3 pt-0">
                    <span className="text-xs font-semibold text-navy-400 -mt-2 tracking-wide">
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
                    <div key={member.id} className="flex-1 min-w-[220px] border-r border-gray-100 last:border-r-0">
                      {/* Member Header */}
                      <div 
                        className="h-16 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex items-center justify-center gap-3 px-4 sticky top-0"
                        style={{ borderTopWidth: 4, borderTopColor: member.color }}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-navy-900 truncate">{member.name}</p>
                          <p className="text-xs text-navy-400 font-medium capitalize">{member.role || 'All'}</p>
                        </div>
                      </div>
                      
                      {/* Time Grid with Bookings */}
                      <div className="relative bg-white">
                        {hours.map((hour) => (
                          <div 
                            key={hour} 
                            className="h-[64px] border-b border-gray-50 hover:bg-teal-50/30 transition-colors cursor-pointer"
                            onDoubleClick={() => handleDoubleClick(hour, member.id !== 'all' ? member.id : '')}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, selectedDate, hour)}
                          >
                            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-100" />
                          </div>
                        ))}
                        
                        {/* Bookings */}
                        {memberBookings.map((booking) => {
                          const { top, height } = getBookingPosition(booking);
                          const colors = getServiceColor(booking.service_id);
                          
                          return (
                            <div
                              key={booking.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, booking)}
                              className={`absolute left-2 right-2 ${colors.bg} ${colors.border} border-l-4 rounded-xl p-3 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-xl transition-all group`}
                              style={{ top: `${top}px`, height: `${height}px` }}
                              onClick={() => toast.info(`${booking.client_name} - ${booking.service_name}`)}
                            >
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className={`text-xs font-bold ${colors.text} tracking-wide`}>
                                {formatBookingTime(booking.datetime)}
                              </div>
                              <div className="text-sm font-bold text-navy-900 truncate mt-0.5">
                                {booking.client_name}
                              </div>
                              {height > 55 && (
                                <div className="text-xs text-navy-500 truncate font-medium">
                                  {booking.service_name}
                                </div>
                              )}
                              {height > 75 && (
                                <div className="text-xs text-navy-400 mt-1 font-semibold">
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
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {weekDates.map((date, idx) => {
                  const isToday = isSameDay(date, new Date());
                  const dayBookings = bookings.filter(b => isSameDay(new Date(b.datetime), date));
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 text-center border-r border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50 ${isToday ? 'bg-teal-50' : ''}`}
                      onDoubleClick={() => { setSelectedDate(date); setViewMode('day'); setShowAddBooking(true); }}
                    >
                      <div className="text-xs font-bold text-navy-400 uppercase tracking-wider">{dayNames[idx]}</div>
                      <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-teal-600' : 'text-navy-900'}`}>{format(date, 'd')}</div>
                      <div className="text-xs text-navy-400 font-medium mt-1">{dayBookings.length} bookings</div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDates.map((date, idx) => {
                  const dayBookings = bookings.filter(b => isSameDay(new Date(b.datetime), date));
                  return (
                    <div 
                      key={idx} 
                      className="border-r border-gray-100 last:border-r-0 p-3 space-y-2"
                      onDoubleClick={() => { setSelectedDate(date); setViewMode('day'); setShowAddBooking(true); }}
                    >
                      {dayBookings.slice(0, 5).map((booking) => {
                        const colors = getServiceColor(booking.service_id);
                        return (
                          <div 
                            key={booking.id} 
                            className={`${colors.bg} ${colors.border} border-l-3 rounded-lg p-2.5 text-xs cursor-pointer hover:shadow-md transition-shadow`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, booking)}
                          >
                            <div className={`font-bold ${colors.text}`}>{formatBookingTime(booking.datetime)}</div>
                            <div className="font-bold text-navy-900 truncate">{booking.client_name}</div>
                            <div className="text-navy-500 truncate font-medium">{booking.service_name}</div>
                          </div>
                        );
                      })}
                      {dayBookings.length > 5 && (
                        <button 
                          onClick={() => { setSelectedDate(date); setViewMode('day'); }} 
                          className="text-xs text-teal-600 font-bold hover:underline"
                        >
                          +{dayBookings.length - 5} more
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 text-center bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-2xl font-bold text-navy-900 tracking-tight">{format(selectedDate, 'MMMM yyyy')}</h2>
              </div>
              <div className="grid grid-cols-7 border-b border-gray-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-3 text-center text-xs font-bold text-navy-400 uppercase tracking-wider border-r border-gray-100 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {(() => {
                  const monthStart = startOfMonth(selectedDate);
                  const monthEnd = endOfMonth(selectedDate);
                  const startDate = startOfWeek(monthStart);
                  const days = eachDayOfInterval({ start: startDate, end: addDays(monthEnd, 6 - monthEnd.getDay()) });
                  
                  return days.slice(0, 42).map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const dayBookings = bookings.filter(b => isSameDay(new Date(b.datetime), day));
                    
                    return (
                      <div
                        key={idx}
                        onDoubleClick={() => { setSelectedDate(day); setViewMode('day'); setShowAddBooking(true); }}
                        className={`min-h-[110px] p-2 border-r border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          !isCurrentMonth ? 'bg-gray-50/50' : ''
                        } ${isToday ? 'bg-teal-50' : ''}`}
                      >
                        <div className={`text-sm font-bold mb-1 ${isToday ? 'text-teal-600' : isCurrentMonth ? 'text-navy-900' : 'text-navy-300'}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayBookings.slice(0, 3).map((booking) => {
                            const colors = getServiceColor(booking.service_id);
                            return (
                              <div key={booking.id} className={`${colors.bg} rounded px-2 py-1 text-xs truncate font-medium`}>
                                <span className={colors.text}>{booking.client_name}</span>
                              </div>
                            );
                          })}
                          {dayBookings.length > 3 && (
                            <div className="text-xs text-teal-600 font-bold">+{dayBookings.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Add Booking Modal */}
        <Dialog open={showAddBooking} onOpenChange={setShowAddBooking}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-navy-900">New Booking</DialogTitle>
              <p className="text-sm text-navy-400">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-navy-700 font-semibold">Service *</Label>
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
                  <Label className="text-navy-700 font-semibold">Time *</Label>
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
                  <Label className="text-navy-700 font-semibold">Assign To</Label>
                  <Select
                    value={newBooking.team_member_id}
                    onValueChange={(v) => setNewBooking(prev => ({ ...prev, team_member_id: v }))}
                  >
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
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
                <Label className="text-navy-700 font-semibold">Client Name *</Label>
                <Input
                  value={newBooking.client_name}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, client_name: e.target.value }))}
                  className="mt-1.5 rounded-xl"
                  placeholder="Enter client name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-navy-700 font-semibold">Email *</Label>
                  <Input
                    type="email"
                    value={newBooking.client_email}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, client_email: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                    placeholder="client@email.com"
                  />
                </div>
                <div>
                  <Label className="text-navy-700 font-semibold">Phone</Label>
                  <Input
                    value={newBooking.client_phone}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, client_phone: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                    placeholder="+44 7..."
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-navy-700 font-semibold">Notes</Label>
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
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-500/20"
                >
                  Create Booking
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
