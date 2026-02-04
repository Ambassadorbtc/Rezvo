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
  Check, 
  ArrowLeft, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { format, setHours, setMinutes } from 'date-fns';

const PublicBookingPage = () => {
  const { businessId } = useParams();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

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

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !business?.availability) return [];
    
    const dayOfWeek = selectedDate.getDay();
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
    if (!business?.availability) return false;
    const dayOfWeek = date.getDay();
    return business.availability.some(a => a.day === dayOfWeek);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <Card className="bg-white rounded-3xl shadow-card border-0 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold font-display text-navy-900 mb-2">Business not found</h2>
            <p className="text-navy-500">This booking page doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <Card className="bg-white rounded-3xl shadow-card border-0 max-w-md w-full" data-testid="booking-success">
          <CardContent className="py-12 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold font-display text-navy-900 mb-2">Booking confirmed!</h2>
            <p className="text-navy-500 mb-6">
              We've sent a confirmation to {clientEmail}
            </p>
            <div className="p-5 rounded-2xl bg-cream text-left">
              <div className="flex justify-between mb-3">
                <span className="text-navy-500">Service</span>
                <span className="font-medium text-navy-900">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-navy-500">Date</span>
                <span className="font-medium text-navy-900">{format(selectedDate, 'EEE, d MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Time</span>
                <span className="font-medium text-navy-900">{selectedTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream" data-testid="public-booking-page">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          {business.logo_url ? (
            <img src={business.logo_url} alt={business.name} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="font-bold font-heading text-navy-900">{business.name}</h1>
            {business.tagline && <p className="text-sm text-navy-500">{business.tagline}</p>}
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
                s < step ? 'bg-teal-500 text-white' : s === step ? 'bg-teal-500 text-white' : 'bg-gray-100 text-navy-400'
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4" data-testid="step-1">
            <h2 className="text-xl font-bold font-display text-navy-900 text-center mb-6">Select a service</h2>
            {services.length === 0 ? (
              <Card className="bg-white rounded-2xl shadow-card border-0">
                <CardContent className="py-8 text-center">
                  <p className="text-navy-500">No services available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`bg-white rounded-2xl shadow-card border-0 cursor-pointer transition-all ${
                      selectedService?.id === service.id ? 'ring-2 ring-teal-500' : 'hover:shadow-card-hover'
                    }`}
                    onClick={() => setSelectedService(service)}
                    data-testid={`service-option-${service.id}`}
                  >
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-navy-900">{service.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-navy-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration_min} min
                          </span>
                          {service.deposit_required && (
                            <span className="text-amber-600">
                              Deposit: {formatPrice(service.deposit_amount_pence)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-teal-600">
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
              className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full py-6 font-semibold shadow-button btn-press"
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
            <h2 className="text-xl font-bold font-display text-navy-900 text-center mb-6">Select date & time</h2>
            
            <Card className="bg-white rounded-2xl shadow-card border-0">
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
              <Card className="bg-white rounded-2xl shadow-card border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-heading text-navy-900">Available times</CardTitle>
                </CardHeader>
                <CardContent>
                  {getAvailableTimeSlots().length === 0 ? (
                    <p className="text-navy-500 text-center py-4">No available times for this date</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {getAvailableTimeSlots().map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className={selectedTime === time ? 'bg-teal-500 text-white rounded-full' : 'border-gray-200 text-navy-600 rounded-full'}
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
                className="flex-1 border-gray-200 rounded-full py-5 text-navy-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-full py-5 font-semibold btn-press"
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
            <h2 className="text-xl font-bold font-display text-navy-900 text-center mb-6">Your details</h2>

            {/* Summary Card */}
            <Card className="bg-teal-50 rounded-2xl border-0">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-navy-900">{selectedService?.name}</h3>
                    <p className="text-sm text-navy-500">{selectedService?.duration_min} min</p>
                  </div>
                  <div className="text-xl font-bold text-teal-600">
                    {formatPrice(selectedService?.price_pence)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-navy-600">
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

            <Card className="bg-white rounded-2xl shadow-card border-0">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-navy-700 font-medium">Your Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl py-5"
                    data-testid="client-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-navy-700 font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl py-5"
                    data-testid="client-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-navy-700 font-medium">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7XXX XXXXXX"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl py-5"
                    data-testid="client-phone-input"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 border-gray-200 rounded-full py-5 text-navy-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !clientName || !clientEmail}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-full py-5 font-semibold btn-press"
                data-testid="confirm-booking-btn"
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

      {/* Footer */}
      <footer className="text-center py-8 text-navy-400 text-sm">
        Powered by Rezvo
      </footer>

      <Toaster />
    </div>
  );
};

export default PublicBookingPage;
