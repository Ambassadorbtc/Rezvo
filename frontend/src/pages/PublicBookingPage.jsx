import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { formatPrice } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { format, addDays, setHours, setMinutes } from 'date-fns';

const PublicBookingPage = () => {
  const { businessId } = useParams();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Booking form state
  const [selectedService, setSelectedService] = useState(null);
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
      const [businessRes, servicesRes] = await Promise.all([
        api.get(`/public/business/${businessId}`),
        api.get(`/public/business/${businessId}/services`),
      ]);
      setBusiness(businessRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      toast.error('Business not found');
    } finally {
      setLoading(false);
    }
  };

  // Generate available time slots based on business availability
  const getAvailableTimeSlots = () => {
    if (!selectedDate || !business?.availability) return [];
    
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayAvailability = business.availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability) return [];
    
    const slots = [];
    const { start_min, end_min } = dayAvailability;
    const serviceDuration = selectedService?.duration_min || 60;
    
    for (let time = start_min; time + serviceDuration <= end_min; time += 30) {
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

      const response = await api.post('/public/bookings', {
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

  // Check if date is available (has availability for that day)
  const isDateAvailable = (date) => {
    if (!business?.availability) return false;
    const dayOfWeek = date.getDay();
    return business.availability.some(a => a.day === dayOfWeek);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blaze border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
        <Card className="bg-obsidian-paper border-white/5 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Business Not Found</h2>
            <p className="text-white/50">This booking page doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center p-4">
        <Card className="bg-obsidian-paper border-white/5 max-w-md w-full" data-testid="booking-success">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-white/50 mb-6">
              We've sent a confirmation to {clientEmail}
            </p>
            <div className="p-4 rounded-xl bg-obsidian border border-white/5 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-white/50">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/50">Date</span>
                <span className="font-medium">{format(selectedDate, 'EEE, d MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian" data-testid="public-booking-page">
      {/* Header */}
      <header className="glass border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          {business.logo_url ? (
            <img src={business.logo_url} alt={business.name} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-blaze flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="font-bold">{business.name}</h1>
            {business.tagline && <p className="text-sm text-white/50">{business.tagline}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                s < step ? 'bg-success text-white' : s === step ? 'bg-blaze text-white' : 'bg-white/10 text-white/40'
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4" data-testid="step-1">
            <h2 className="text-xl font-bold text-center mb-6">Select a Service</h2>
            {services.length === 0 ? (
              <Card className="bg-obsidian-paper border-white/5">
                <CardContent className="py-8 text-center">
                  <p className="text-white/50">No services available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`bg-obsidian-paper border-white/5 cursor-pointer transition-all ${
                      selectedService?.id === service.id ? 'ring-2 ring-blaze' : 'hover:bg-obsidian-subtle'
                    }`}
                    onClick={() => setSelectedService(service)}
                    data-testid={`service-option-${service.id}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration_min} min
                          </span>
                          {service.deposit_required && (
                            <span className="text-warning">
                              Deposit: {formatPrice(service.deposit_amount_pence)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-accent-teal">
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
              className="w-full bg-gradient-blaze hover:opacity-90 text-white rounded-full py-6 font-semibold btn-press"
              data-testid="step-1-next"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="space-y-4" data-testid="step-2">
            <h2 className="text-xl font-bold text-center mb-6">Select Date & Time</h2>
            
            <Card className="bg-obsidian-paper border-white/5">
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
              <Card className="bg-obsidian-paper border-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Available Times</CardTitle>
                </CardHeader>
                <CardContent>
                  {getAvailableTimeSlots().length === 0 ? (
                    <p className="text-white/50 text-center py-4">No available times for this date</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {getAvailableTimeSlots().map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className={selectedTime === time ? 'bg-blaze text-white' : 'border-white/10'}
                          data-testid={`time-slot-${time}`}
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
                className="flex-1 border-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 bg-gradient-blaze hover:opacity-90 text-white rounded-full font-semibold btn-press"
                data-testid="step-2-next"
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
            <h2 className="text-xl font-bold text-center mb-6">Your Details</h2>

            {/* Summary Card */}
            <Card className="bg-obsidian-paper border-blaze/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{selectedService?.name}</h3>
                    <p className="text-sm text-white/50">{selectedService?.duration_min} min</p>
                  </div>
                  <div className="text-xl font-bold text-accent-teal">
                    {formatPrice(selectedService?.price_pence)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {format(selectedDate, 'EEE, d MMM')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedTime}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-obsidian-paper border-white/5">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-obsidian border-white/10"
                    data-testid="client-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="bg-obsidian border-white/10"
                    data-testid="client-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7XXX XXXXXX"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="bg-obsidian border-white/10"
                    data-testid="client-phone-input"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 border-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !clientName || !clientEmail}
                className="flex-1 bg-gradient-blaze hover:opacity-90 text-white rounded-full font-semibold btn-press"
                data-testid="confirm-booking-btn"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-white/30 text-sm">
        Powered by QuickSlot
      </footer>

      <Toaster />
    </div>
  );
};

export default PublicBookingPage;
