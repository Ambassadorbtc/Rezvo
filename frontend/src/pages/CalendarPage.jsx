import { useState, useEffect } from 'react';
import api, { formatPrice, formatTime } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

const CalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('week');

  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
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
      default: return 'bg-gray-300';
    }
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

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
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
              className={view === 'week' ? 'bg-teal-500 text-white rounded-full' : 'border-gray-200 rounded-full text-navy-600'}
              data-testid="view-week-btn"
            >
              Week
            </Button>
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
              className={view === 'month' ? 'bg-teal-500 text-white rounded-full' : 'border-gray-200 rounded-full text-navy-600'}
              data-testid="view-month-btn"
            >
              Month
            </Button>
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
                  hasBooking: bookings.map(b => new Date(b.datetime))
                }}
                modifiersClassNames={{
                  hasBooking: "bg-teal-100 text-teal-700 font-bold"
                }}
              />
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
                  data-testid="prev-week-btn"
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
                  data-testid="next-week-btn"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="border-gray-200 rounded-full text-navy-600"
                data-testid="today-btn"
              >
                Today
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${
                      isSameDay(day, new Date()) ? 'bg-teal-50' : ''
                    }`}
                  >
                    <div className="text-xs text-navy-400 uppercase">{format(day, 'EEE')}</div>
                    <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-teal-600' : 'text-navy-900'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <div className="min-h-[400px] md:min-h-[500px]">
                  {timeSlots.map((time, timeIndex) => (
                    <div key={time} className="grid grid-cols-7 border-b border-gray-50 last:border-b-0">
                      {weekDays.map((day, dayIndex) => {
                        const dayBookings = getBookingsForDate(day).filter(b => {
                          const bookingHour = new Date(b.datetime).getHours();
                          return bookingHour === parseInt(time);
                        });
                        
                        return (
                          <div
                            key={dayIndex}
                            className={`min-h-[60px] p-1 border-r border-gray-50 last:border-r-0 relative ${
                              dayIndex === 0 ? 'pl-12' : ''
                            }`}
                          >
                            {dayIndex === 0 && (
                              <span className="absolute left-2 top-1 text-xs text-navy-400">{time}</span>
                            )}
                            {dayBookings.map((booking, bi) => (
                              <div
                                key={bi}
                                className={`${getStatusColor(booking.status)} rounded-lg p-2 mb-1 text-xs cursor-pointer hover:opacity-80`}
                                title={`${booking.client_name} - ${booking.service_name}`}
                                data-testid={`booking-slot-${booking.id}`}
                              >
                                <div className="font-medium text-white truncate">{booking.client_name}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Day Bookings */}
        <Card className="bg-white rounded-2xl shadow-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-heading font-semibold text-navy-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getBookingsForDate(selectedDate).length === 0 ? (
              <p className="text-navy-500 text-center py-8">No bookings on this day</p>
            ) : (
              <div className="space-y-3">
                {getBookingsForDate(selectedDate).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-cream"
                    data-testid={`day-booking-${booking.id}`}
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
                      <div className="text-xs text-navy-400">{booking.duration_min} min</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
