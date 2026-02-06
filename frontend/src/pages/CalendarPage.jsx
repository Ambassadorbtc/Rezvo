import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { formatPrice } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Clock, User, GripVertical, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, isSameDay, isSameMonth, setHours, setMinutes, eachDayOfInterval } from 'date-fns';

const SERVICE_COLORS = [
  { bg: '#E8F5F3', border: '#00BFA5', text: '#047857' },
  { bg: '#DBEAFE', border: '#3B82F6', text: '#1D4ED8' },
  { bg: '#F3E8FF', border: '#8B5CF6', text: '#6D28D9' },
  { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309' },
  { bg: '#FCE7F3', border: '#EC4899', text: '#BE185D' },
  { bg: '#E0E7FF', border: '#6366F1', text: '#4338CA' },
  { bg: '#D1FAE5', border: '#10B981', text: '#059669' },
  { bg: '#FFEDD5', border: '#F97316', text: '#C2410C' },
];

const CalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showEditBooking, setShowEditBooking] = useState(null);
  const [draggedBooking, setDraggedBooking] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  
  const [newBooking, setNewBooking] = useState({
    service_id: '',
    team_member_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    time: '',
    notes: ''
  });

  // Hours from 6am to 10pm (22:00)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const HOUR_HEIGHT = 90;

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
    // Calculate from hour 6 (first hour displayed) - CRITICAL FIX
    const top = (bookingHours - 6) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
    const height = (booking.duration_min / 60) * HOUR_HEIGHT;
    return { top, height: Math.max(height, 48) };
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

  // Drag handlers for moving appointments
  const handleDragStart = (e, booking) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', booking.id);
    setDraggedBooking(booking);
    // Add visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedBooking(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e, hour, memberId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ hour, memberId });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e, targetHour, targetMemberId, targetDate = null) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    if (!draggedBooking) return;

    // Use targetDate if provided (for week view), otherwise use selectedDate
    const dateToUse = targetDate || selectedDate;
    const newDateTime = new Date(dateToUse);
    
    // Preserve original time if dropping on a day column (week view) without specific hour
    if (targetHour !== null && targetHour !== undefined) {
      newDateTime.setHours(targetHour, 0, 0, 0);
    } else {
      // Keep original time when moving between days
      const originalDate = new Date(draggedBooking.datetime);
      newDateTime.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);
    }

    try {
      await api.patch(`/bookings/${draggedBooking.id}`, {
        datetime_iso: newDateTime.toISOString(),
        team_member_id: targetMemberId && targetMemberId !== 'all' ? targetMemberId : draggedBooking.team_member_id
      });
      toast.success('Booking moved!');
      loadData();
    } catch (error) {
      toast.error('Failed to move booking');
      console.error(error);
    }
    setDraggedBooking(null);
  };

  // Handle drop for week view (date change)
  const handleWeekDrop = async (e, targetDate) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    if (!draggedBooking) return;

    // Keep original time, just change the date
    const originalDate = new Date(draggedBooking.datetime);
    const newDateTime = new Date(targetDate);
    newDateTime.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);

    try {
      await api.patch(`/bookings/${draggedBooking.id}`, {
        datetime_iso: newDateTime.toISOString()
      });
      toast.success(`Booking moved to ${format(targetDate, 'EEE, d MMM')}!`);
      loadData();
    } catch (error) {
      toast.error('Failed to move booking');
      console.error(error);
    }
    setDraggedBooking(null);
  };

  // Double-click to add booking
  const handleDoubleClick = (hour, memberId = '') => {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    setNewBooking(prev => ({ ...prev, time, team_member_id: memberId }));
    setShowAddBooking(true);
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
      loadData();
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled');
      setShowEditBooking(null);
      loadData();
    } catch (error) {
      toast.error('Failed to cancel booking');
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
        <div className="flex items-center justify-center h-screen bg-[#FDFBF7]">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const displayMembers = teamMembers.length > 0 ? teamMembers : [{ id: 'all', name: 'All Bookings', color: '#00BFA5' }];

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-0px)] flex flex-col bg-[#FDFBF7]" data-testid="calendar-page">
        {/* Premium Header */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-8 py-3 sm:py-5 gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Calendar</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">{format(selectedDate, 'EEE, MMM d, yyyy')}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Team avatars - hidden on mobile */}
              <Link to="/team" className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex -space-x-2">
                  {teamMembers.slice(0, 4).map((member, idx) => (
                    <div 
                      key={member.id}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md"
                      style={{ backgroundColor: member.color || '#00BFA5', zIndex: 4 - idx }}
                    >
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        member.name?.charAt(0)?.toUpperCase()
                      )}
                    </div>
                  ))}
                </div>
              </Link>
              <Button
                onClick={() => setShowAddBooking(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl gap-2 shadow-lg shadow-teal-500/25 px-4 sm:px-6 text-sm"
                data-testid="add-booking-btn"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Booking</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-2 sm:py-3 bg-gray-50/50 gap-2 sm:gap-0">
            {/* Left: Date Nav */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => changeDate(viewMode === 'month' ? -30 : viewMode === 'week' ? -7 : -1)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Today
              </button>
              <button
                onClick={() => changeDate(viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 1)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* Center: View Tabs */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              {['day', 'week', 'month'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    viewMode === mode 
                      ? 'bg-teal-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Right: Week Strip or Stats - hidden on mobile */}
            <div className="hidden lg:flex w-[400px] justify-end">
              {viewMode === 'day' && (
                <div className="flex items-center gap-1 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm">
                  {weekDates.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const hasBookings = bookings.some(b => new Date(b.datetime).toDateString() === date.toDateString());
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all min-w-[44px] ${
                          isSelected 
                            ? 'bg-teal-500 text-white shadow-md' 
                            : isToday 
                              ? 'bg-teal-50 text-teal-700'
                              : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{dayNames[index]}</span>
                        <span className="text-base font-bold">{format(date, 'd')}</span>
                        {hasBookings && !isSelected && (
                          <div className="w-1 h-1 rounded-full bg-teal-500 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {viewMode !== 'day' && (
                <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-lg border border-gray-200">
                  {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        {viewMode === 'day' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white m-2 sm:m-6 rounded-2xl border border-gray-100 shadow-lg">
            <div className="flex-1 overflow-y-auto overflow-x-auto">
              <div className="flex min-w-[600px]">
                {/* Time Column */}
                <div className="w-16 sm:w-20 border-r border-gray-100 flex-shrink-0 bg-gray-50/30 sticky left-0 z-20">
                  <div className="h-12 sm:h-16 border-b border-gray-100 bg-gray-50/30" />
                  <div className="relative">
                    {hours.map((hour) => (
                      <div key={hour} className="h-[60px] sm:h-[72px] border-b border-gray-50 flex items-start justify-end pr-2 sm:pr-4 pt-0">
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-400 -mt-2 tracking-wide">
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
                      const memberBookings = teamMembers.length > 0 ? getBookingsForMember(member.id) : bookings;
                      
                      return (
                        <div key={member.id} className="flex-1 min-w-[200px] border-r border-gray-100 last:border-r-0">
                          {/* Member Header */}
                          <div 
                            className="h-16 border-b border-gray-100 flex items-center justify-center gap-3 px-4 sticky top-0 bg-white z-10"
                            style={{ borderTopWidth: 4, borderTopColor: member.color }}
                          >
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                              style={{ backgroundColor: member.color }}
                            >
                              {member.avatar_url ? (
                                <img src={member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                member.name?.charAt(0)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{member.name}</p>
                              <p className="text-xs text-gray-500 font-medium">{member.role || 'Team'}</p>
                            </div>
                          </div>
                      
                          {/* Time Grid */}
                          <div className="relative bg-white">
                            {hours.map((hour) => {
                              const isDropTarget = dragOverSlot?.hour === hour && dragOverSlot?.memberId === member.id;
                              return (
                                <div 
                                  key={hour} 
                                  className={`h-[72px] border-b border-gray-50 cursor-pointer transition-colors ${
                                    isDropTarget ? 'bg-teal-100' : 'hover:bg-teal-50/30'
                                  }`}
                                  onDoubleClick={() => handleDoubleClick(hour, member.id !== 'all' ? member.id : '')}
                                  onDragOver={(e) => handleDragOver(e, hour, member.id)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, hour, member.id !== 'all' ? member.id : null)}
                                >
                                  <div className="absolute inset-x-0 h-px bg-gray-50" style={{ top: HOUR_HEIGHT / 2 }} />
                                </div>
                              );
                            })}
                            
                            {/* Bookings */}
                            {memberBookings.map((booking) => {
                              const { top, height } = getBookingPosition(booking);
                              const colors = getServiceColor(booking.service_id);
                              const isDragging = draggedBooking?.id === booking.id;
                              const teamMember = teamMembers.find(m => m.id === booking.team_member_id);
                              const minHeight = Math.max(height, 70);
                              
                              return (
                                <div
                                  key={booking.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, booking)}
                                  onDragEnd={handleDragEnd}
                                  className={`absolute left-1 right-1 rounded-xl cursor-grab active:cursor-grabbing transition-all group overflow-hidden shadow-sm hover:shadow-lg ${
                                    isDragging ? 'opacity-50 scale-95 z-50' : 'hover:z-10'
                                  }`}
                                  style={{ 
                                    top: `${top}px`, 
                                    minHeight: `${minHeight}px`,
                                    height: `${minHeight}px`,
                                    backgroundColor: '#fff',
                                    border: `1px solid ${colors.border}20`,
                                  }}
                                  onClick={() => setShowEditBooking(booking)}
                                >
                                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: colors.border }} />
                                  <div className="pl-3 pr-2 py-2 h-full flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      {teamMember && (
                                        <div 
                                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                          style={{ backgroundColor: teamMember.color || colors.border }}
                                        >
                                          {teamMember.name?.charAt(0)}
                                        </div>
                                      )}
                                      <span className="text-[11px] font-semibold" style={{ color: colors.border }}>
                                        {formatBookingTime(booking.datetime)}
                                      </span>
                                    </div>
                                    <div className="font-semibold text-gray-900 text-[13px] truncate leading-tight">
                                      {booking.client_name}
                                    </div>
                                    <div className="text-[11px] text-gray-500 truncate mt-0.5">
                                      {booking.service_name}
                                    </div>
                                  </div>
                                  <div className="absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="w-3 h-3 text-gray-300" />
                                  </div>
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
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {weekDates.map((date, idx) => {
                  const isToday = isSameDay(date, new Date());
                  const dayBookings = bookings.filter(b => isSameDay(new Date(b.datetime), date));
                  return (
                    <div 
                      key={idx} 
                      className={`p-5 text-center border-r border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${isToday ? 'bg-teal-50' : ''}`}
                      onDoubleClick={() => { setSelectedDate(date); setViewMode('day'); setShowAddBooking(true); }}
                    >
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dayNames[idx]}</div>
                      <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-teal-600' : 'text-gray-900'}`}>{format(date, 'd')}</div>
                      <div className="text-xs text-gray-400 font-medium mt-1">{dayBookings.length} bookings</div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7">
                {weekDates.map((date, idx) => {
                  const dayBookings = bookings.filter(b => isSameDay(new Date(b.datetime), date));
                  const isDropTarget = dragOverSlot?.date && isSameDay(dragOverSlot.date, date);
                  return (
                    <div 
                      key={idx} 
                      className={`border-r border-gray-100 last:border-r-0 p-3 space-y-2 min-h-[200px] transition-colors ${
                        isDropTarget ? 'bg-teal-100' : ''
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setDragOverSlot({ date });
                      }}
                      onDragLeave={() => setDragOverSlot(null)}
                      onDrop={(e) => handleWeekDrop(e, date)}
                    >
                      {/* Show ALL bookings - no limit */}
                      {dayBookings.map((booking) => {
                        const colors = getServiceColor(booking.service_id);
                        const isDragging = draggedBooking?.id === booking.id;
                        const teamMember = teamMembers.find(m => m.id === booking.team_member_id);
                        return (
                          <div 
                            key={booking.id} 
                            className={`rounded-xl text-xs cursor-grab active:cursor-grabbing hover:shadow-lg transition-all overflow-hidden bg-white border ${
                              isDragging ? 'opacity-50 scale-95' : ''
                            }`}
                            style={{ borderColor: `${colors.border}30` }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, booking)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setShowEditBooking(booking)}
                          >
                            <div className="flex">
                              <div className="w-1 rounded-l-xl flex-shrink-0" style={{ backgroundColor: colors.border }} />
                              <div className="p-2 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {teamMember && (
                                    <div 
                                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                                      style={{ backgroundColor: teamMember.color || colors.border }}
                                    >
                                      {teamMember.name?.charAt(0)}
                                    </div>
                                  )}
                                  <span className="font-semibold" style={{ color: colors.border }}>{formatBookingTime(booking.datetime)}</span>
                                </div>
                                <div className="font-semibold text-gray-900 truncate">{booking.client_name}</div>
                                <div className="text-gray-500 truncate">{booking.service_name}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {dayBookings.length === 0 && !isDropTarget && (
                        <div className="h-full flex items-center justify-center text-gray-300 text-xs">
                          Drop here
                        </div>
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
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
              <div className="p-5 border-b border-gray-100 text-center bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{format(selectedDate, 'MMMM yyyy')}</h2>
              </div>
              <div className="grid grid-cols-7 border-b border-gray-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100 last:border-r-0">
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
                        className={`min-h-[100px] p-2 border-r border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          !isCurrentMonth ? 'bg-gray-50/50' : ''
                        } ${isToday ? 'bg-teal-50' : ''}`}
                      >
                        <div className={`text-sm font-bold mb-1 ${isToday ? 'text-teal-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {/* Show ALL bookings dynamically */}
                          {dayBookings.map((booking) => {
                            const colors = getServiceColor(booking.service_id);
                            return (
                              <div 
                                key={booking.id} 
                                className="rounded px-2 py-1 text-[10px] truncate font-semibold"
                                style={{ backgroundColor: colors.bg, color: colors.text }}
                                onClick={(e) => { e.stopPropagation(); setShowEditBooking(booking); }}
                              >
                                {booking.client_name}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Add Booking Dialog */}
        <Dialog open={showAddBooking} onOpenChange={setShowAddBooking}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">New Booking</DialogTitle>
              <p className="text-sm text-gray-500">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Service *</Label>
                  <Select
                    value={newBooking.service_id}
                    onValueChange={(v) => setNewBooking(prev => ({ ...prev, service_id: v }))}
                  >
                    <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} - {formatPrice(s.price_pence)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Time *</Label>
                  <Select
                    value={newBooking.time}
                    onValueChange={(v) => setNewBooking(prev => ({ ...prev, time: v }))}
                  >
                    <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue placeholder="Select time" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {timeOptions.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {teamMembers.length > 0 && (
                <div>
                  <Label className="text-gray-700 font-semibold">Assign To</Label>
                  <Select
                    value={newBooking.team_member_id}
                    onValueChange={(v) => setNewBooking(prev => ({ ...prev, team_member_id: v }))}
                  >
                    <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue placeholder="Select team member" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {teamMembers.map((m) => (<SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label className="text-gray-700 font-semibold">Client Name *</Label>
                <Input value={newBooking.client_name} onChange={(e) => setNewBooking(prev => ({ ...prev, client_name: e.target.value }))} className="mt-1.5 rounded-xl" placeholder="Enter client name" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Email *</Label>
                  <Input type="email" value={newBooking.client_email} onChange={(e) => setNewBooking(prev => ({ ...prev, client_email: e.target.value }))} className="mt-1.5 rounded-xl" placeholder="client@email.com" />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Phone</Label>
                  <Input value={newBooking.client_phone} onChange={(e) => setNewBooking(prev => ({ ...prev, client_phone: e.target.value }))} className="mt-1.5 rounded-xl" placeholder="+44 7..." />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddBooking(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button onClick={handleCreateBooking} className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-500/20">Create Booking</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit/View Booking Dialog */}
        <Dialog open={!!showEditBooking} onOpenChange={() => setShowEditBooking(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Booking Details</DialogTitle>
            </DialogHeader>
            {showEditBooking && (
              <div className="space-y-4 mt-2">
                <div className="p-4 rounded-xl" style={{ backgroundColor: getServiceColor(showEditBooking.service_id).bg }}>
                  <div className="font-bold text-lg text-gray-900">{showEditBooking.client_name}</div>
                  <div className="text-sm text-gray-600">{showEditBooking.service_name}</div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{formatBookingTime(showEditBooking.datetime)} - {showEditBooking.duration_min} min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{showEditBooking.client_email}</span>
                  </div>
                  {showEditBooking.client_phone && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📞</span>
                      <span>{showEditBooking.client_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 font-bold text-teal-600">
                    <span>💰</span>
                    <span>{formatPrice(showEditBooking.price_pence)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowEditBooking(null)} className="flex-1 rounded-xl">Close</Button>
                  <Button variant="destructive" onClick={() => handleCancelBooking(showEditBooking.id)} className="flex-1 rounded-xl">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
