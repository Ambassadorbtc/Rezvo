import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CalendarDays, Loader2, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import api from '../../lib/api';

const RescheduleBookingPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduled, setRescheduled] = useState(false);
  const [error, setError] = useState(null);
  
  // Date/Time selection
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/booking/token/${token}`);
        setBooking(response.data);
        
        // Fetch business availability
        const availResponse = await api.get(`/public/business/${response.data.business_id}`);
        setAvailability(availResponse.data.availability || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Booking not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [token]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setRescheduling(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':');
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      await api.post(`/booking/reschedule/${token}`, {
        new_datetime: newDateTime.toISOString()
      });
      
      setRescheduled(true);
      toast.success('Booking rescheduled successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reschedule booking');
    } finally {
      setRescheduling(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    
    const dayOfWeek = date.getDay();
    const dayAvail = availability.find(a => a.day === dayOfWeek);
    return dayAvail?.enabled !== false;
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !availability.length) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const dayAvail = availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvail || !dayAvail.enabled) return [];
    
    const slots = [];
    const [startHour, startMin] = (dayAvail.start || '09:00').split(':').map(Number);
    const [endHour, endMin] = (dayAvail.end || '17:00').split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push(timeStr);
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }
    
    return slots;
  };

  const formatTimeSlot = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
        <p className="text-gray-500 text-center mb-6">{error}</p>
        <Button onClick={() => navigate('/')} variant="outline">
          Go to Homepage
        </Button>
      </div>
    );
  }

  if (rescheduled) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Rescheduled</h1>
        <p className="text-gray-500 text-center mb-6">
          Your booking has been successfully rescheduled to a new date and time.
        </p>
        <Button onClick={() => navigate('/')} className="bg-teal-500 hover:bg-teal-600">
          Back to Homepage
        </Button>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const timeSlots = getAvailableTimeSlots();

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-500 rounded-xl mb-2">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Rezvo</h2>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reschedule Booking</h1>
              <p className="text-gray-500 text-sm">Select a new date and time</p>
            </div>
          </div>

          {/* Current Booking */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Current booking</p>
            <p className="font-semibold text-gray-900">{booking.service_name}</p>
            <p className="text-sm text-gray-600">{formatDate(booking.datetime)} at {booking.start_time}</p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const available = isDateAvailable(date);
              const isSelected = selectedDate && date && 
                date.toDateString() === selectedDate.toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => available && setSelectedDate(date)}
                  disabled={!date || !available}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-colors
                    ${!date ? 'invisible' : ''}
                    ${!available ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-teal-50'}
                    ${isSelected ? 'bg-teal-500 text-white hover:bg-teal-600' : 'text-gray-700'}
                  `}
                >
                  {date?.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Available times for {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
            </h3>
            
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`
                      py-3 px-4 rounded-xl text-sm font-medium transition-colors
                      ${selectedTime === time 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-gray-50 text-gray-700 hover:bg-teal-50'}
                    `}
                  >
                    {formatTimeSlot(time)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No times available on this day</p>
            )}
          </div>
        )}

        {/* Confirm Button */}
        <Button
          onClick={handleReschedule}
          disabled={rescheduling || !selectedDate || !selectedTime}
          className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
          data-testid="confirm-reschedule-btn"
        >
          {rescheduling ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Rescheduling...
            </>
          ) : (
            'Confirm New Time'
          )}
        </Button>

        <p className="text-center text-gray-400 text-sm mt-6">
          Powered by Rezvo.app
        </p>
      </div>
    </div>
  );
};

export default RescheduleBookingPage;
