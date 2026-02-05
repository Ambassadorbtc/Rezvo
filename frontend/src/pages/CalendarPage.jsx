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

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  const HOUR_HEIGHT = 72;

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
      <div className="h-[calc(100vh-64px)] flex flex-col bg-[#FDFBF7]" data-testid="calendar-page">
        {/* Premium Header */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calendar</h1>
              <p className="text-sm text-gray-500 mt-0.5 font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Team avatars */}
              <Link to="/team" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl gap-2 shadow-lg shadow-teal-500/25 px-6"
                data-testid="add-booking-btn"
              >
                <Plus className="w-4 h-4" />
                New Booking
              </Button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between px-8 py-3 bg-gray-50/50">
            {/* Left: Date Nav */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeDate(viewMode === 'month' ? -30 : viewMode === 'week' ? -7 : -1)}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Today
              </button>
              <button
                onClick={() => changeDate(viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 1)}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
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
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === mode 
                      ? 'bg-teal-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Right: Week Strip or Stats */}
            <div className="w-[400px] flex justify-end">
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
          <div className="flex-1 overflow-hidden flex bg-white m-6 rounded-2xl border border-gray-100 shadow-lg">
            {/* Time Column */}
            <div className="w-20 border-r border-gray-100 flex-shrink-0 bg-gray-50/30">
              <div className="h-16 border-b border-gray-100" />
              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className="h-[72px] border-b border-gray-50 flex items-start justify-end pr-4 pt-0">
                    <span className="text-xs font-semibold text-gray-400 -mt-2 tracking-wide">
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
                        className="h-16 border-b border-gray-100 flex items-center justify-center gap-3 px-4 sticky top-0 bg-white"
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
                          
                          return (
                            <div
                              key={booking.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, booking)}
                              onDragEnd={handleDragEnd}
                              className={`absolute left-2 right-2 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all group border-l-4 ${
                                isDragging ? 'opacity-50 scale-95' : 'hover:shadow-xl hover:scale-[1.02]'
                              }`}
                              style={{ 
                                top: `${top}px`, 
                                height: `${height}px`,
                                backgroundColor: colors.bg,
                                borderLeftColor: colors.border
                              }}
                              onClick={() => setShowEditBooking(booking)}
                            >
                              {/* Drag handle */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-4 h-4" style={{ color: colors.border }} />
                              </div>
                              
                              <div className="text-[11px] font-bold tracking-wide" style={{ color: colors.text }}>
                                {formatBookingTime(booking.datetime)}
                              </div>
                              <div className="text-sm font-bold text-gray-900 truncate mt-0.5">
                                {booking.client_name}
                              </div>
                              {height > 55 && (
                                <div className="text-xs text-gray-600 truncate font-medium mt-0.5">
                                  {booking.service_name}
                                </div>
                              )}
                              {height > 75 && (
                                <div className="text-xs font-bold mt-1" style={{ color: colors.border }}>
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
              <div className="grid grid-cols-7 min-h-[400px]">
                {weekDates.map((date, idx) => {
                  const dayBookings = bookings.filter(b => isSameDay(new Date(b.datetime), date));
                  const isDropTarget = dragOverSlot?.date && isSameDay(dragOverSlot.date, date);
                  return (
                    <div 
                      key={idx} 
                      className={`border-r border-gray-100 last:border-r-0 p-3 space-y-2 min-h-[300px] transition-colors ${
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
                      {dayBookings.slice(0, 5).map((booking) => {
                        const colors = getServiceColor(booking.service_id);
                        const isDragging = draggedBooking?.id === booking.id;
                        return (
                          <div 
                            key={booking.id} 
                            className={`rounded-lg p-2.5 text-xs cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-3 ${
                              isDragging ? 'opacity-50 scale-95' : ''
                            }`}
                            style={{ backgroundColor: colors.bg, borderLeftColor: colors.border }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, booking)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setShowEditBooking(booking)}
                          >
                            <div className="font-bold" style={{ color: colors.text }}>{formatBookingTime(booking.datetime)}</div>
                            <div className="font-bold text-gray-900 truncate">{booking.client_name}</div>
                            <div className="text-gray-600 truncate">{booking.service_name}</div>
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
                          {dayBookings.slice(0, 3).map((booking) => {
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
                          {dayBookings.length > 3 && (
                            <div className="text-[10px] text-teal-600 font-bold">+{dayBookings.length - 3} more</div>
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
