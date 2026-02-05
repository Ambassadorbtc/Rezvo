import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api, { formatPrice } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Globe,
  Star,
  User,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { format, setHours, setMinutes, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';

const PublicBookingPage = () => {
  const { businessId } = useParams();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Selected items - support multiple services
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  // Week navigation
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const scrollRef = useRef(null);

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

  const getWeekDates = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getDayAvailability = (date) => {
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
      { day: 1, start: '09:00', end: '20:00', enabled: true },
      { day: 2, start: '09:00', end: '20:00', enabled: true },
      { day: 3, start: '09:00', end: '20:00', enabled: true },
      { day: 4, start: '09:00', end: '20:00', enabled: true },
      { day: 5, start: '09:00', end: '20:00', enabled: true },
      { day: 6, start: '09:00', end: '18:00', enabled: true },
    ];
    
    const availability = business?.availability?.length > 0 ? business.availability : defaultAvailability;
    const dayAvailability = availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.enabled) return [];
    
    const slots = [];
    const startParts = dayAvailability.start?.split(':') || ['09', '00'];
    const endParts = dayAvailability.end?.split(':') || ['20', '00'];
    const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    const serviceDuration = selectedServices.reduce((sum, s) => sum + (s.duration_min || 60), 0) || 60;
    
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
      if (timeOfDay === 'evening') return hour >= 17 && hour < 22;
      return true;
    });
  };

  const formatTimeDisplay = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const addService = (service) => {
    if (!selectedServices.find(s => s.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const calculateTotal = () => {
    const subtotal = selectedServices.reduce((sum, s) => sum + (s.price_pence || 0), 0);
    const tax = Math.round(subtotal * 0.1); // 10% tax
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

  const getEndTime = () => {
    if (!selectedTime) return '';
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + calculateDuration();
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return formatTimeDisplay(`${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`);
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

      // Book all services
      for (const service of selectedServices) {
        await api.post('/public/bookings', {
          service_id: service.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          datetime_iso: bookingDate.toISOString(),
          notes,
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
        <div className="w-10 h-10 border-3 border-[#1B9AAA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business not found</h2>
          <p className="text-gray-500">This booking page doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B9AAA]/10 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center" data-testid="booking-success">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-8">We've sent a confirmation to {clientEmail}</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4">
            {selectedServices.map((service, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-gray-600">{service.name}</span>
                <span className="font-semibold text-gray-900">{formatPrice(service.price_pence)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-4 flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-semibold text-gray-900">
                {format(selectedDate, 'EEE, d MMM')} at {formatTimeDisplay(selectedTime)}
              </span>
            </div>
            {selectedTeamMember && (
              <div className="flex justify-between">
                <span className="text-gray-600">Staff</span>
                <span className="font-semibold text-gray-900">{selectedTeamMember.name}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-4 flex justify-between text-lg">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-[#1B9AAA]">{formatPrice(calculateTotal().total)}</span>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  const weekDates = getWeekDates();
  const availableSlots = getAvailableTimeSlots();
  const filteredSlots = filterTimesByPeriod(availableSlots);
  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-white" data-testid="public-booking-page">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {business.logo_url ? (
                <img src={business.logo_url} alt={business.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B9AAA] to-[#168B9A] flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{business.name?.charAt(0)}</span>
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900">{business.name}</h1>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">5.0 (128)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Date Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-4 sm:pt-8 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 mb-8 relative animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{format(selectedDate, 'MMMM yyyy')}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Week Day Selector */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setWeekStart(addDays(weekStart, -7))}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                
                <div className="flex-1 flex gap-1 overflow-x-auto py-2" ref={scrollRef}>
                  {weekDates.map((date, idx) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isAvailable = getDayAvailability(date) && date >= new Date(new Date().setHours(0,0,0,0));
                    const todayDate = isToday(date);
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => isAvailable && setSelectedDate(date)}
                        disabled={!isAvailable}
                        className={`flex-1 min-w-[52px] flex flex-col items-center py-3 px-2 rounded-xl transition-all ${
                          isSelected 
                            ? 'bg-[#1B9AAA] text-white shadow-lg shadow-[#1B9AAA]/30' 
                            : isAvailable 
                              ? 'hover:bg-gray-100 text-gray-700'
                              : 'opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <span className={`text-xs font-medium uppercase ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                          {format(date, 'EEE')}
                        </span>
                        <span className={`text-lg font-bold mt-1 ${isSelected ? 'text-white' : ''}`}>
                          {format(date, 'd')}
                        </span>
                        {todayDate && !isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />
                        )}
                        {isAvailable && !isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => setWeekStart(addDays(weekStart, 7))}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Time of Day Filter */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex gap-2 justify-center">
                {['morning', 'afternoon', 'evening'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeOfDay(period)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                      timeOfDay === period
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="p-6 border-b border-gray-100">
              {filteredSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No available times for this period
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button 
                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors"
                    onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  <div className="flex gap-2 overflow-x-auto flex-1" ref={scrollRef}>
                    {filteredSlots.slice(0, 8).map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-5 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                          selectedTime === time
                            ? 'bg-[#1B9AAA] text-white shadow-lg shadow-[#1B9AAA]/30'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {formatTimeDisplay(time)}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition-colors"
                    onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Selected Services Summary */}
            {selectedServices.length > 0 && (
              <div className="p-6 bg-gray-50 space-y-3">
                {selectedServices.map((service, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-500">
                        {selectedTime && `${formatTimeDisplay(selectedTime)} - ${getEndTime()}`}
                      </p>
                      {selectedTeamMember && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">Staff:</span>
                          <div className="flex items-center gap-1.5">
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: selectedTeamMember.color || '#1B9AAA' }}
                            >
                              {selectedTeamMember.avatar_url ? (
                                <img src={selectedTeamMember.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                selectedTeamMember.name?.charAt(0)
                              )}
                            </div>
                            <span className="text-xs font-medium text-gray-700">{selectedTeamMember.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(service.price_pence)}+</p>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full text-left text-[#1B9AAA] font-semibold text-sm flex items-center gap-2 hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add another service
                </button>
              </div>
            )}

            {/* Total & Continue */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">
                  Total (Includes tax: {formatPrice(tax)}) :
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(total)}+</span>
                  <p className="text-sm text-gray-500">{formatDuration(calculateDuration())}</p>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  if (!selectedTime) {
                    toast.error('Please select a time');
                    return;
                  }
                  // Show client details form
                  setShowModal(false);
                }}
                disabled={!selectedTime || selectedServices.length === 0}
                className="w-full bg-[#1B9AAA] hover:bg-[#168B9A] text-white rounded-2xl py-6 font-semibold text-lg shadow-lg shadow-[#1B9AAA]/30"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Services</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((service) => {
              const isSelected = selectedServices.find(s => s.id === service.id);
              return (
                <div
                  key={service.id}
                  className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'border-[#1B9AAA] shadow-lg shadow-[#1B9AAA]/10' : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => isSelected ? removeService(service.id) : addService(service)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[#1B9AAA] border-[#1B9AAA]' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration_min} min</span>
                    </div>
                    <div className="text-xl font-bold text-[#1B9AAA]">
                      {formatPrice(service.price_pence)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Professional</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedTeamMember(null)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all flex-shrink-0 ${
                  selectedTeamMember === null 
                    ? 'border-[#1B9AAA] bg-[#1B9AAA]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <span className="font-medium text-gray-900">Any available</span>
              </button>
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedTeamMember(member)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all flex-shrink-0 ${
                    selectedTeamMember?.id === member.id 
                      ? 'border-[#1B9AAA] bg-[#1B9AAA]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: member.color || '#1B9AAA' }}
                  >
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      member.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Client Details */}
        {selectedServices.length > 0 && selectedTime && (
          <div className="mb-8 bg-gray-50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Details</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-medium">Name *</Label>
                <Input
                  placeholder="Enter your name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1.5 rounded-xl bg-white border-gray-200 py-5"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium">Email *</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="mt-1.5 rounded-xl bg-white border-gray-200 py-5"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Phone (optional)</Label>
                  <Input
                    type="tel"
                    placeholder="+44 7XXX XXXXXX"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="mt-1.5 rounded-xl bg-white border-gray-200 py-5"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Booking Bar */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} • {formatDuration(calculateDuration())}
                </p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(total)}</p>
              </div>
              
              {!selectedTime ? (
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-[#1B9AAA] hover:bg-[#168B9A] text-white rounded-2xl px-8 py-6 font-semibold shadow-lg shadow-[#1B9AAA]/30"
                >
                  Select Date & Time
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{format(selectedDate, 'EEE, d MMM')}</p>
                    <p className="font-semibold text-gray-900">{formatTimeDisplay(selectedTime)}</p>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !clientName || !clientEmail}
                    className="bg-[#1B9AAA] hover:bg-[#168B9A] text-white rounded-2xl px-8 py-6 font-semibold shadow-lg shadow-[#1B9AAA]/30"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 mt-8 pb-32">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-gray-500 hover:text-[#1B9AAA]">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{business.phone}</span>
                </a>
              )}
              {business.address && (
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{business.address}</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              Powered by <span className="text-[#1B9AAA] font-semibold">Rezvo</span>
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
};

export default PublicBookingPage;
