import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api, { formatPrice } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Phone,
  MapPin,
  Star,
  User,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { format, setHours, setMinutes, addDays, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';

const PublicBookingPage = () => {
  const { businessId } = useParams();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Selected items
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Calendar month navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadBusinessData();
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      const [businessRes, servicesRes, teamRes] = await Promise.all([
        api.get(`/public/business/${businessId}`),
        api.get(`/public/business/${businessId}/services`),
        api.get(`/public/business/${businessId}/team`).catch(() => ({ data: [] })),
      ]);
      setBusiness(businessRes.data);
      setServices(servicesRes.data);
      setTeamMembers(teamRes.data.filter(m => m.show_on_booking_page !== false));
    } catch (error) {
      toast.error('Business not found');
    } finally {
      setLoading(false);
    }
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getDayAvailability = (date) => {
    if (isBefore(startOfDay(date), startOfDay(new Date()))) return false;
    if (!business?.availability) return true;
    const dayOfWeek = date.getDay();
    const dayAvail = business.availability.find(a => a.day === dayOfWeek);
    return dayAvail?.enabled !== false;
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    const dayOfWeek = selectedDate.getDay();
    const defaultAvailability = [
      { day: 0, start: '10:00', end: '16:00', enabled: true },
      { day: 1, start: '09:00', end: '21:00', enabled: true },
      { day: 2, start: '09:00', end: '21:00', enabled: true },
      { day: 3, start: '09:00', end: '21:00', enabled: true },
      { day: 4, start: '09:00', end: '21:00', enabled: true },
      { day: 5, start: '09:00', end: '21:00', enabled: true },
      { day: 6, start: '09:00', end: '18:00', enabled: true },
    ];
    
    const availability = business?.availability?.length > 0 ? business.availability : defaultAvailability;
    const dayAvailability = availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.enabled) return [];
    
    const slots = [];
    const startParts = dayAvailability.start?.split(':') || ['09', '00'];
    const endParts = dayAvailability.end?.split(':') || ['21', '00'];
    const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    const serviceDuration = selectedServices.reduce((sum, s) => sum + (s.duration_min || 60), 0) || 30;
    
    for (let time = startMin; time + serviceDuration <= endMin; time += 15) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    
    return slots;
  };

  const filterTimesByPeriod = (slots) => {
    return slots.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      if (timeOfDay === 'morning') return hour >= 6 && hour < 12;
      if (timeOfDay === 'afternoon') return hour >= 12 && hour < 17;
      if (timeOfDay === 'evening') return hour >= 17 && hour < 24;
      return true;
    });
  };

  const formatTimeDisplay = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const toggleService = (service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const calculateTotal = () => {
    const subtotal = selectedServices.reduce((sum, s) => sum + (s.price_pence || 0), 0);
    const tax = Math.round(subtotal * 0.1);
    return { subtotal, tax, total: subtotal + tax };
  };

  const calculateDuration = () => {
    return selectedServices.reduce((sum, s) => sum + (s.duration_min || 0), 0);
  };

  const formatDuration = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime || !clientName || !clientEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const bookingDate = setMinutes(setHours(selectedDate, hours), minutes);

      for (const service of selectedServices) {
        await api.post('/public/bookings', {
          service_id: service.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          datetime_iso: bookingDate.toISOString(),
          team_member_id: selectedTeamMember?.id || null,
        });
      }

      setBookingComplete(true);
      setShowModal(false);
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Business not found</h2>
          <p className="text-sm text-gray-500">This booking page doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center" data-testid="booking-success">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Confirmed!</h2>
          <p className="text-sm text-gray-500 mb-6">Confirmation sent to {clientEmail}</p>
          
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2">
            {selectedServices.map((service, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-gray-600">{service.name}</span>
                <span className="font-medium text-gray-900">{formatPrice(service.price_pence)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-medium text-gray-900">
                {format(selectedDate, 'EEE, d MMM')} • {formatTimeDisplay(selectedTime)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-teal-600">{formatPrice(calculateTotal().total)}</span>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  const monthDays = getMonthDays();
  const availableSlots = getAvailableTimeSlots();
  const filteredSlots = filterTimesByPeriod(availableSlots);
  const { subtotal, tax, total } = calculateTotal();
  const firstDayOffset = startOfMonth(currentMonth).getDay();

  return (
    <div className="min-h-screen bg-gray-50" data-testid="public-booking-page">
      {/* Compact Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{business.name?.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">{business.name}</h1>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs text-gray-500 ml-1">5.0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Date/Time Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-3">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array(firstDayOffset).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {monthDays.map((date, idx) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const isAvailable = getDayAvailability(date);
                  const todayDate = isToday(date);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => isAvailable && setSelectedDate(date)}
                      disabled={!isAvailable}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                        isSelected 
                          ? 'bg-teal-500 text-white font-bold' 
                          : isAvailable 
                            ? todayDate
                              ? 'bg-teal-50 text-teal-700 font-medium hover:bg-teal-100'
                              : 'hover:bg-gray-100 text-gray-700'
                            : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Period Tabs */}
            <div className="px-3 pb-2">
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                {['morning', 'afternoon', 'evening'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeOfDay(period)}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                      timeOfDay === period
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="px-3 pb-3 max-h-32 overflow-y-auto">
              {filteredSlots.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-400">No times available</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {formatTimeDisplay(time)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Summary */}
            {selectedServices.length > 0 && (
              <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  {selectedServices.map((service, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{service.name}</span>
                      <span className="font-medium">{formatPrice(service.price_pence)}</span>
                    </div>
                  ))}
                  {selectedTeamMember && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-200">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]" style={{ backgroundColor: selectedTeamMember.color || '#14B8A6' }}>
                        {selectedTeamMember.name?.charAt(0)}
                      </div>
                      <span>{selectedTeamMember.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="p-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total (incl. tax)</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(total)}</p>
              </div>
              <Button
                onClick={() => setShowModal(false)}
                disabled={!selectedTime}
                className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-6"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Services - Compact Grid */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Select Services</h2>
          <div className="space-y-2">
            {services.map((service) => {
              const isSelected = selectedServices.find(s => s.id === service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service)}
                  className={`flex items-center gap-3 p-3 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-teal-500 bg-teal-50/50' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-xs text-gray-500">{service.duration_min} min</p>
                  </div>
                  <span className="text-sm font-bold text-teal-600">{formatPrice(service.price_pence)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Members - Compact */}
        {teamMembers.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Choose Professional</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedTeamMember(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all flex-shrink-0 ${
                  selectedTeamMember === null ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">Any</span>
              </button>
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedTeamMember(member)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all flex-shrink-0 ${
                    selectedTeamMember?.id === member.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: member.color || '#14B8A6' }}
                  >
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      member.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{member.name?.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Client Details - Compact */}
        {selectedServices.length > 0 && selectedTime && (
          <div className="mb-4 bg-white rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Your Details</h2>
            <div className="space-y-3">
              <Input
                placeholder="Your name *"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="rounded-lg text-sm h-10"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="email"
                  placeholder="Email *"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="rounded-lg text-sm h-10"
                />
                <Input
                  type="tel"
                  placeholder="Phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="rounded-lg text-sm h-10"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Bar - Compact */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[100]">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">{selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} • {formatDuration(calculateDuration())}</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(total)}</p>
              </div>
              
              {!selectedTime ? (
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-5"
                  data-testid="select-time-btn"
                >
                  Select Time
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{format(selectedDate, 'EEE, d MMM')}</p>
                    <p className="text-sm font-semibold text-gray-900">{formatTimeDisplay(selectedTime)}</p>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !clientName || !clientEmail}
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-5"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Book Now'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="pb-24 pt-4 text-center">
        <p className="text-xs text-gray-400">
          Powered by <span className="text-teal-500 font-medium">Rezvo</span>
        </p>
      </footer>

      <Toaster />
    </div>
  );
};

export default PublicBookingPage;
