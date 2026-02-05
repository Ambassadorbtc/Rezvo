import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { formatPrice } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Globe,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { format, setHours, setMinutes } from 'date-fns';

const PublicBookingPage = () => {
  const { businessId } = useParams();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

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
      // Only show team members who have show_on_booking_page enabled
      setTeamMembers(teamRes.data.filter(m => m.show_on_booking_page !== false));
    } catch (error) {
      toast.error('Business not found');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    const dayOfWeek = selectedDate.getDay();
    
    // Default availability (Mon-Sat 9-17) if none set
    const defaultAvailability = [
      { day: 0, start: '10:00', end: '16:00', enabled: true }, // Sunday
      { day: 1, start: '09:00', end: '17:00', enabled: true }, // Monday
      { day: 2, start: '09:00', end: '17:00', enabled: true }, // Tuesday
      { day: 3, start: '09:00', end: '17:00', enabled: true }, // Wednesday
      { day: 4, start: '09:00', end: '17:00', enabled: true }, // Thursday
      { day: 5, start: '09:00', end: '17:00', enabled: true }, // Friday
      { day: 6, start: '09:00', end: '17:00', enabled: true }, // Saturday
    ];
    
    const availability = business?.availability?.length > 0 ? business.availability : defaultAvailability;
    const dayAvailability = availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.enabled) return [];
    
    const slots = [];
    const startParts = dayAvailability.start?.split(':') || ['09', '00'];
    const endParts = dayAvailability.end?.split(':') || ['17', '00'];
    const startMin = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMin = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    const serviceDuration = selectedService?.duration_min || 60;
    
    for (let time = startMin; time + serviceDuration <= endMin; time += 30) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    
    return slots;
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const bookingDate = setMinutes(setHours(selectedDate, hours), minutes);

      await api.post('/public/bookings', {
        service_id: selectedService.id,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        datetime_iso: bookingDate.toISOString(),
        notes,
      });

      setBookingComplete(true);
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const isDateAvailable = (date) => {
    if (!business?.availability) return true; // Allow all if no availability set
    const dayOfWeek = date.getDay();
    const dayAvail = business.availability.find(a => a.day === dayOfWeek);
    return dayAvail?.enabled !== false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00BFA5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <Card className="bg-white rounded-3xl shadow-lg border-0 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0A1626] mb-2">Business not found</h2>
            <p className="text-[#627D98]">This booking page doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <Card className="bg-white rounded-3xl shadow-lg border-0 max-w-md w-full" data-testid="booking-success">
          <CardContent className="py-12 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A1626] mb-2">Booking confirmed!</h2>
            <p className="text-[#627D98] mb-6">
              We've sent a confirmation to {clientEmail}
            </p>
            <div className="p-5 rounded-2xl bg-[#F5F0E8] text-left">
              <div className="flex justify-between mb-3">
                <span className="text-[#627D98]">Service</span>
                <span className="font-medium text-[#0A1626]">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-[#627D98]">Date</span>
                <span className="font-medium text-[#0A1626]">{format(selectedDate, 'EEE, d MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#627D98]">Time</span>
                <span className="font-medium text-[#0A1626]">{selectedTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="public-booking-page">
      {/* Branded Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00BFA5] to-[#00A896] flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{business.name?.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#0A1626]">{business.name}</h1>
              {business.tagline && <p className="text-[#627D98]">{business.tagline}</p>}
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-sm text-[#627D98] ml-1">5.0</span>
              </div>
            </div>
          </div>
          
          {/* Welcome Message */}
          {business.booking_message && (
            <div className="mt-4 p-4 bg-[#00BFA5]/10 rounded-xl border border-[#00BFA5]/20">
              <p className="text-[#0A1626] text-center">{business.booking_message}</p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                s < step ? 'bg-[#00BFA5] text-white' : s === step ? 'bg-[#00BFA5] text-white' : 'bg-gray-100 text-[#627D98]'
              }`}
            >
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4" data-testid="step-1">
            <h2 className="text-xl font-bold text-[#0A1626] text-center mb-6">Select a service</h2>
            {services.length === 0 ? (
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardContent className="py-8 text-center">
                  <p className="text-[#627D98]">No services available at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`bg-white rounded-2xl shadow-sm border-2 cursor-pointer transition-all ${
                      selectedService?.id === service.id ? 'border-[#00BFA5] shadow-md' : 'border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[#0A1626]">{service.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-[#627D98] mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration_min} min
                          </span>
                          {service.description && (
                            <span className="hidden sm:inline">{service.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-[#00BFA5]">
                        {formatPrice(service.price_pence)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedService}
              className="w-full bg-[#00BFA5] hover:bg-[#00A896] text-white rounded-full py-6 font-semibold shadow-md"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="space-y-4" data-testid="step-2">
            <h2 className="text-xl font-bold text-[#0A1626] text-center mb-6">Select date & time</h2>
            
            {/* Team Member Selection */}
            {teamMembers.length > 0 && (
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#0A1626]">Choose your professional</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedTeamMember(null)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                        selectedTeamMember === null 
                          ? 'border-[#00BFA5] bg-[#00BFA5]/10' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="font-medium text-[#0A1626]">Any available</span>
                    </button>
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedTeamMember(member)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                          selectedTeamMember?.id === member.id 
                            ? 'border-[#00BFA5] bg-[#00BFA5]/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: member.color || '#00BFA5' }}
                        >
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            member.name?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <span className="font-medium text-[#0A1626]">{member.name}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || !isDateAvailable(date)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {selectedDate && (
              <Card className="bg-white rounded-2xl shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-[#0A1626]">Available times for {format(selectedDate, 'EEE, d MMM')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {getAvailableTimeSlots().length === 0 ? (
                    <p className="text-[#627D98] text-center py-4">No available times for this date</p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {getAvailableTimeSlots().map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className={selectedTime === time ? 'bg-[#00BFA5] text-white rounded-full' : 'border-gray-200 text-[#0A1626] rounded-full hover:border-[#00BFA5]'}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 border-gray-200 rounded-full py-5 text-[#627D98]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 bg-[#00BFA5] hover:bg-[#00A896] text-white rounded-full py-5 font-semibold"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Your Details */}
        {step === 3 && (
          <div className="space-y-4" data-testid="step-3">
            <h2 className="text-xl font-bold text-[#0A1626] text-center mb-6">Your details</h2>

            {/* Summary Card */}
            <Card className="bg-[#00BFA5]/10 rounded-2xl border border-[#00BFA5]/20">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-[#0A1626]">{selectedService?.name}</h3>
                    <p className="text-sm text-[#627D98]">{selectedService?.duration_min} min</p>
                  </div>
                  <div className="text-xl font-bold text-[#00BFA5]">
                    {formatPrice(selectedService?.price_pence)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-[#0A1626]">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-[#00BFA5]" />
                    {format(selectedDate, 'EEE, d MMM')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#00BFA5]" />
                    {selectedTime}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#0A1626] font-medium">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-[#F5F0E8] border-gray-200 rounded-xl py-5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#0A1626] font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="bg-[#F5F0E8] border-gray-200 rounded-xl py-5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#0A1626] font-medium">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7XXX XXXXXX"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="bg-[#F5F0E8] border-gray-200 rounded-xl py-5"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 border-gray-200 rounded-full py-5 text-[#627D98]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !clientName || !clientEmail}
                className="flex-1 bg-[#00BFA5] hover:bg-[#00A896] text-white rounded-full py-5 font-semibold"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm booking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Business Contact Info Footer */}
      <footer className="bg-white border-t border-gray-100 mt-8">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div>
              <h3 className="font-semibold text-[#0A1626] mb-4">Contact</h3>
              <div className="space-y-3">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-[#627D98] hover:text-[#00BFA5]">
                    <Phone className="w-4 h-4" />
                    {business.phone}
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-[#627D98] hover:text-[#00BFA5]">
                    <Mail className="w-4 h-4" />
                    {business.email}
                  </a>
                )}
                {business.address && (
                  <div className="flex items-center gap-3 text-[#627D98]">
                    <MapPin className="w-4 h-4" />
                    {business.address}
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-semibold text-[#0A1626] mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {business.instagram && (
                  <a
                    href={`https://instagram.com/${business.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#627D98] hover:bg-[#00BFA5] hover:text-white transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {business.facebook && (
                  <a
                    href={business.facebook.startsWith('http') ? business.facebook : `https://facebook.com/${business.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#627D98] hover:bg-[#00BFA5] hover:text-white transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {business.website && (
                  <a
                    href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#627D98] hover:bg-[#00BFA5] hover:text-white transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          {business.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-[#0A1626] mb-2">About {business.name}</h3>
              <p className="text-[#627D98] text-sm">{business.description}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[#9FB3C8] text-sm">
              Powered by <span className="text-[#00BFA5] font-semibold">Rezvo</span>
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
};

export default PublicBookingPage;
