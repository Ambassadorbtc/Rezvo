import { useState, useEffect } from 'react';
import api, { formatPrice, formatTime } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronLeft, ChevronRight, Clock, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes } from 'date-fns';

const CalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [view, setView] = useState('week');
  
  // Modal states
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [showEditAvailability, setShowEditAvailability] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  
  // New booking form
  const [newBooking, setNewBooking] = useState({
    service_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    date: null,
    time: '',
    notes: ''
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const defaultAvailability = [
    { day: 1, start: '09:00', end: '17:00', enabled: true },
    { day: 2, start: '09:00', end: '17:00', enabled: true },
    { day: 3, start: '09:00', end: '17:00', enabled: true },
    { day: 4, start: '09:00', end: '17:00', enabled: true },
    { day: 5, start: '09:00', end: '17:00', enabled: true },
    { day: 6, start: '10:00', end: '14:00', enabled: false },
    { day: 0, start: '10:00', end: '14:00', enabled: false },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, servicesRes, businessRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/services'),
        api.get('/business/me')
      ]);
      setBookings(bookingsRes.data || []);
      setServices(servicesRes.data || []);
      
      // Load availability from business or use defaults
      const businessAvailability = businessRes.data?.availability;
      if (businessAvailability && businessAvailability.length > 0) {
        setAvailability(businessAvailability);
      } else {
        setAvailability(defaultAvailability);
      }
      setBlockedDates(businessRes.data?.blocked_dates || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(b => b.datetime.startsWith(dateStr));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const handleCreateBooking = async () => {
    if (!newBooking.service_id || !newBooking.client_name || !newBooking.client_email || !newBooking.date || !newBooking.time) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const [hours, mins] = newBooking.time.split(':').map(Number);
      const bookingDate = setMinutes(setHours(newBooking.date, hours), mins);
      
      await api.post('/bookings', {
        service_id: newBooking.service_id,
        client_name: newBooking.client_name,
        client_email: newBooking.client_email,
        client_phone: newBooking.client_phone,
        datetime_iso: bookingDate.toISOString(),
        notes: newBooking.notes
      });
      
      toast.success('Booking created');
      setShowAddBooking(false);
      setNewBooking({ service_id: '', client_name: '', client_email: '', client_phone: '', date: null, time: '', notes: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status });
      toast.success(`Booking ${status}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleSaveAvailability = async () => {
    try {
      await api.patch('/business/me', { availability });
      toast.success('Availability saved');
      setShowEditAvailability(false);
    } catch (error) {
      toast.error('Failed to save availability');
    }
  };

  const updateAvailability = (dayIndex, field, value) => {
    setAvailability(prev => prev.map(a => 
      a.day === dayIndex ? { ...a, [field]: value } : a
    ));
  };

  const toggleBlockedDate = async (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isBlocked = blockedDates.includes(dateStr);
    
    const newBlockedDates = isBlocked 
      ? blockedDates.filter(d => d !== dateStr)
      : [...blockedDates, dateStr];
    
    try {
      await api.patch('/business/me', { blocked_dates: newBlockedDates });
      setBlockedDates(newBlockedDates);
      toast.success(isBlocked ? 'Date unblocked' : 'Date blocked');
    } catch (error) {
      toast.error('Failed to update blocked dates');
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 8; h <= 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        options.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return options;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6" data-testid="calendar-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900">Calendar</h1>
            <p className="text-navy-500 mt-1">{format(selectedDate, 'MMMM yyyy')}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditAvailability(true)}
              className="border-gray-200 rounded-full text-navy-600"
              data-testid="edit-availability-btn"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Hours
            </Button>
            <Button
              onClick={() => {
                setNewBooking(prev => ({ ...prev, date: selectedDate }));
                setShowAddBooking(true);
              }}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
              data-testid="add-booking-btn"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Booking
            </Button>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
                className={view === 'week' ? 'bg-teal-500 text-white rounded-full' : 'border-gray-200 rounded-full text-navy-600'}
              >
                Week
              </Button>
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
                className={view === 'month' ? 'bg-teal-500 text-white rounded-full' : 'border-gray-200 rounded-full text-navy-600'}
              >
                Month
              </Button>
            </div>
          </div>
        </div>

        {view === 'month' ? (
          <Card className="bg-white rounded-2xl shadow-card border-0">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                modifiers={{
                  hasBooking: bookings.map(b => new Date(b.datetime)),
                  blocked: blockedDates.map(d => new Date(d))
                }}
                modifiersClassNames={{
                  hasBooking: "bg-teal-100 text-teal-700 font-bold",
                  blocked: "bg-red-100 text-red-700 line-through"
                }}
              />
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-100 rounded" />
                  <span className="text-navy-600">Has bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 rounded" />
                  <span className="text-navy-600">Blocked</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBlockedDate(selectedDate)}
                  className="ml-auto border-gray-200 rounded-full text-sm"
                >
                  {blockedDates.includes(format(selectedDate, 'yyyy-MM-dd')) ? 'Unblock Date' : 'Block Date'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white rounded-2xl shadow-card border-0 overflow-hidden">
            <CardHeader className="pb-2 flex-row items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                  className="text-navy-500 hover:text-navy-900"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="font-medium text-navy-900">
                  {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                  className="text-navy-500 hover:text-navy-900"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="border-gray-200 rounded-full text-navy-600"
              >
                Today
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-2 text-center text-xs text-navy-400 border-r border-gray-100">Time</div>
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className={`p-2 text-center border-r border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                      isSameDay(day, new Date()) ? 'bg-teal-50' : ''
                    } ${isSameDay(day, selectedDate) ? 'ring-2 ring-inset ring-teal-500' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-xs text-navy-400 uppercase">{format(day, 'EEE')}</div>
                    <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-teal-600' : 'text-navy-900'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-y-auto max-h-[500px]">
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-gray-50 last:border-b-0">
                    <div className="p-2 text-xs text-navy-400 border-r border-gray-100 flex items-start justify-center">
                      {time}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dayBookings = getBookingsForDate(day).filter(b => {
                        const bookingHour = new Date(b.datetime).getHours();
                        return bookingHour === parseInt(time);
                      });
                      
                      return (
                        <div
                          key={dayIndex}
                          className="min-h-[50px] p-1 border-r border-gray-50 last:border-r-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedDate(day);
                            setNewBooking(prev => ({ ...prev, date: day, time }));
                            setShowAddBooking(true);
                          }}
                        >
                          {dayBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className={`${getStatusColor(booking.status)} rounded-lg p-1.5 mb-1 text-xs cursor-pointer hover:opacity-90 transition-opacity`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBooking(booking);
                              }}
                            >
                              <div className="font-medium text-white truncate text-[10px]">{formatTime(booking.datetime)}</div>
                              <div className="text-white/90 truncate">{booking.client_name}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Day Bookings */}
        <Card className="bg-white rounded-2xl shadow-card border-0">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold text-navy-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setNewBooking(prev => ({ ...prev, date: selectedDate }));
                setShowAddBooking(true);
              }}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            {getBookingsForDate(selectedDate).length === 0 ? (
              <p className="text-navy-500 text-center py-8">No bookings on this day</p>
            ) : (
              <div className="space-y-3">
                {getBookingsForDate(selectedDate).sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-cream hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setEditingBooking(booking)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status)}`} />
                      <div className="text-lg font-bold font-display tabular-nums text-teal-600">{formatTime(booking.datetime)}</div>
                      <div>
                        <div className="font-medium text-navy-900">{booking.client_name}</div>
                        <div className="text-sm text-navy-500">{booking.service_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-teal-600">{formatPrice(booking.price_pence)}</div>
                      <div className="text-xs text-navy-400 capitalize">{booking.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Booking Modal */}
      <Dialog open={showAddBooking} onOpenChange={setShowAddBooking}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Service *</Label>
              <Select value={newBooking.service_id} onValueChange={(v) => setNewBooking(prev => ({ ...prev, service_id: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} - {formatPrice(s.price_pence)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input 
                  type="date" 
                  value={newBooking.date ? format(newBooking.date, 'yyyy-MM-dd') : ''} 
                  onChange={(e) => setNewBooking(prev => ({ ...prev, date: new Date(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Select value={newBooking.time} onValueChange={(v) => setNewBooking(prev => ({ ...prev, time: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Client Name *</Label>
              <Input 
                value={newBooking.client_name} 
                onChange={(e) => setNewBooking(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="John Smith"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Client Email *</Label>
              <Input 
                type="email"
                value={newBooking.client_email} 
                onChange={(e) => setNewBooking(prev => ({ ...prev, client_email: e.target.value }))}
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Client Phone</Label>
              <Input 
                value={newBooking.client_phone} 
                onChange={(e) => setNewBooking(prev => ({ ...prev, client_phone: e.target.value }))}
                placeholder="+44 7XXX XXXXXX"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input 
                value={newBooking.notes} 
                onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requests..."
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAddBooking(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreateBooking} className="flex-1 bg-teal-500 hover:bg-teal-600">Create Booking</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Availability Modal */}
      <Dialog open={showEditAvailability} onOpenChange={setShowEditAvailability}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Working Hours</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
            {availability.sort((a, b) => a.day - b.day).map((slot) => (
              <div key={slot.day} className="flex items-center gap-3 p-3 rounded-xl bg-cream">
                <input
                  type="checkbox"
                  checked={slot.enabled}
                  onChange={(e) => updateAvailability(slot.day, 'enabled', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                />
                <span className="w-24 font-medium text-navy-900">{dayNames[slot.day]}</span>
                <Input
                  type="time"
                  value={slot.start}
                  onChange={(e) => updateAvailability(slot.day, 'start', e.target.value)}
                  disabled={!slot.enabled}
                  className="w-28"
                />
                <span className="text-navy-500">to</span>
                <Input
                  type="time"
                  value={slot.end}
                  onChange={(e) => updateAvailability(slot.day, 'end', e.target.value)}
                  disabled={!slot.enabled}
                  className="w-28"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowEditAvailability(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSaveAvailability} className="flex-1 bg-teal-500 hover:bg-teal-600">
              <Save className="w-4 h-4 mr-2" />
              Save Hours
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Modal */}
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Booking Details</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-cream">
                <div className="flex justify-between mb-2">
                  <span className="text-navy-500">Service</span>
                  <span className="font-medium text-navy-900">{editingBooking.service_name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-navy-500">Date & Time</span>
                  <span className="font-medium text-navy-900">{format(new Date(editingBooking.datetime), 'EEE, d MMM')} at {formatTime(editingBooking.datetime)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-navy-500">Duration</span>
                  <span className="font-medium text-navy-900">{editingBooking.duration_min} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-500">Price</span>
                  <span className="font-bold text-teal-600">{formatPrice(editingBooking.price_pence)}</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-gray-200">
                <h4 className="font-medium text-navy-900 mb-2">Client</h4>
                <p className="text-navy-700">{editingBooking.client_name}</p>
                <p className="text-sm text-navy-500">{editingBooking.client_email}</p>
                {editingBooking.client_phone && <p className="text-sm text-navy-500">{editingBooking.client_phone}</p>}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-navy-500">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(editingBooking.status)}`}>
                  {editingBooking.status}
                </span>
              </div>

              {editingBooking.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => { handleUpdateBookingStatus(editingBooking.id, 'confirmed'); setEditingBooking(null); }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  >
                    Confirm
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => { handleUpdateBookingStatus(editingBooking.id, 'cancelled'); setEditingBooking(null); }}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Decline
                  </Button>
                </div>
              )}
              
              {editingBooking.status === 'confirmed' && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => { handleUpdateBookingStatus(editingBooking.id, 'completed'); setEditingBooking(null); }}
                    className="flex-1 bg-teal-500 hover:bg-teal-600"
                  >
                    Mark Complete
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => { handleDeleteBooking(editingBooking.id); setEditingBooking(null); }}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CalendarPage;
