import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, ArrowRight, ArrowLeft, Loader2, Check, Building2, Scissors, Clock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Step 1: Business
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');

  // Step 2: Service
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('60');
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  // Step 3: Availability
  const [availability, setAvailability] = useState({
    1: { enabled: true, start: '09:00', end: '17:00' },
    2: { enabled: true, start: '09:00', end: '17:00' },
    3: { enabled: true, start: '09:00', end: '17:00' },
    4: { enabled: true, start: '09:00', end: '17:00' },
    5: { enabled: true, start: '09:00', end: '17:00' },
    6: { enabled: false, start: '10:00', end: '16:00' },
    0: { enabled: false, start: '10:00', end: '16:00' },
  });

  // Step 4: Dojo
  const [dojoKey, setDojoKey] = useState('');

  const days = [
    { key: 1, name: 'Monday' },
    { key: 2, name: 'Tuesday' },
    { key: 3, name: 'Wednesday' },
    { key: 4, name: 'Thursday' },
    { key: 5, name: 'Friday' },
    { key: 6, name: 'Saturday' },
    { key: 0, name: 'Sunday' },
  ];

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const response = await api.get('/business');
        if (response.data.name) {
          setBusinessName(response.data.name);
          setTagline(response.data.tagline || '');
        }
      } catch (error) {
        // No business yet
      }
    };
    loadBusiness();
  }, []);

  const handleStep1 = async () => {
    if (!businessName) {
      toast.error('Please enter your business name');
      return;
    }
    setLoading(true);
    try {
      await api.patch('/business', { name: businessName, tagline });
      setStep(2);
    } catch (error) {
      toast.error('Failed to save business name');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!serviceName || !servicePrice) {
      toast.error('Please enter service name and price');
      return;
    }
    setLoading(true);
    try {
      await api.post('/services', {
        name: serviceName,
        price_pence: Math.round(parseFloat(servicePrice) * 100),
        duration_min: parseInt(serviceDuration),
        deposit_required: depositRequired,
        deposit_amount_pence: depositRequired ? Math.round(parseFloat(depositAmount) * 100) : 0,
      });
      setStep(3);
    } catch (error) {
      toast.error('Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    setLoading(true);
    try {
      const slots = days
        .filter(d => availability[d.key].enabled)
        .map(d => ({
          day: d.key,
          start_min: timeToMinutes(availability[d.key].start),
          end_min: timeToMinutes(availability[d.key].end),
        }));
      
      await api.patch('/business/availability', { slots });
      setStep(4);
    } catch (error) {
      toast.error('Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  const handleStep4 = async () => {
    setLoading(true);
    try {
      if (dojoKey) {
        await api.post('/payments/verify-key', { api_key: dojoKey });
      }
      await api.post('/onboarding/complete');
      toast.success('Setup complete! Welcome to Rezvo');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
            s < step
              ? 'bg-teal-500 text-white'
              : s === step
              ? 'bg-teal-500 text-white shadow-button'
              : 'bg-gray-100 text-navy-400'
          }`}
        >
          {s < step ? <Check className="w-5 h-5" /> : s}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card className="bg-white rounded-3xl shadow-card border-0" data-testid="onboarding-step1">
      <CardHeader className="text-center pt-8">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-teal-600" />
        </div>
        <CardTitle className="font-display text-2xl text-navy-900">Your business</CardTitle>
        <CardDescription className="text-navy-500">Let's personalise your booking page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-8 pb-8">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-navy-700 font-medium">Business Name</Label>
          <Input
            id="businessName"
            placeholder="e.g. Sarah's Hair Studio"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="bg-cream border-gray-200 rounded-xl py-5"
            data-testid="onboarding-business-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline" className="text-navy-700 font-medium">Tagline (optional)</Label>
          <Input
            id="tagline"
            placeholder="e.g. Professional cuts at your doorstep"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="bg-cream border-gray-200 rounded-xl py-5"
            data-testid="onboarding-tagline"
          />
        </div>
        <Button
          onClick={handleStep1}
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full py-6 font-semibold shadow-button btn-press"
          data-testid="onboarding-step1-next"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="bg-white rounded-3xl shadow-card border-0" data-testid="onboarding-step2">
      <CardHeader className="text-center pt-8">
        <div className="w-16 h-16 rounded-2xl bg-coral-50 flex items-center justify-center mx-auto mb-4">
          <Scissors className="w-8 h-8 text-coral-500" />
        </div>
        <CardTitle className="font-display text-2xl text-navy-900">Add a service</CardTitle>
        <CardDescription className="text-navy-500">What do you offer? You can add more later.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-8 pb-8">
        <div className="space-y-2">
          <Label htmlFor="serviceName" className="text-navy-700 font-medium">Service Name</Label>
          <Input
            id="serviceName"
            placeholder="e.g. Haircut & Beard Trim"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="bg-cream border-gray-200 rounded-xl py-5"
            data-testid="onboarding-service-name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="servicePrice" className="text-navy-700 font-medium">Price (£)</Label>
            <Input
              id="servicePrice"
              type="number"
              step="0.01"
              placeholder="25.00"
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              className="bg-cream border-gray-200 rounded-xl py-5"
              data-testid="onboarding-service-price"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-navy-700 font-medium">Duration</Label>
            <Select value={serviceDuration} onValueChange={setServiceDuration}>
              <SelectTrigger className="bg-cream border-gray-200 rounded-xl py-5" data-testid="onboarding-service-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-cream">
          <div>
            <Label className="text-navy-700 font-medium">Require Deposit?</Label>
            <p className="text-sm text-navy-500">Reduces no-shows</p>
          </div>
          <Switch
            checked={depositRequired}
            onCheckedChange={setDepositRequired}
            data-testid="onboarding-deposit-toggle"
          />
        </div>
        {depositRequired && (
          <div className="space-y-2">
            <Label htmlFor="depositAmount" className="text-navy-700 font-medium">Deposit Amount (£)</Label>
            <Input
              id="depositAmount"
              type="number"
              step="0.01"
              placeholder="10.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="bg-cream border-gray-200 rounded-xl py-5"
              data-testid="onboarding-deposit-amount"
            />
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-gray-200 rounded-full py-5 text-navy-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button
            onClick={handleStep2}
            disabled={loading}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-full py-5 font-semibold btn-press"
            data-testid="onboarding-step2-next"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="bg-white rounded-3xl shadow-card border-0" data-testid="onboarding-step3">
      <CardHeader className="text-center pt-8">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-purple-600" />
        </div>
        <CardTitle className="font-display text-2xl text-navy-900">Set your hours</CardTitle>
        <CardDescription className="text-navy-500">When are you available for bookings?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-8 pb-8">
        {days.map((day) => (
          <div key={day.key} className="flex items-center gap-3 p-3 rounded-xl bg-cream">
            <Switch
              checked={availability[day.key].enabled}
              onCheckedChange={(checked) =>
                setAvailability((prev) => ({
                  ...prev,
                  [day.key]: { ...prev[day.key], enabled: checked },
                }))
              }
              data-testid={`onboarding-day-${day.key}-toggle`}
            />
            <span className="w-24 font-medium text-navy-700">{day.name}</span>
            {availability[day.key].enabled ? (
              <div className="flex items-center gap-2 ml-auto">
                <Input
                  type="time"
                  value={availability[day.key].start}
                  onChange={(e) =>
                    setAvailability((prev) => ({
                      ...prev,
                      [day.key]: { ...prev[day.key], start: e.target.value },
                    }))
                  }
                  className="w-28 bg-white border-gray-200 rounded-lg text-sm"
                />
                <span className="text-navy-400">to</span>
                <Input
                  type="time"
                  value={availability[day.key].end}
                  onChange={(e) =>
                    setAvailability((prev) => ({
                      ...prev,
                      [day.key]: { ...prev[day.key], end: e.target.value },
                    }))
                  }
                  className="w-28 bg-white border-gray-200 rounded-lg text-sm"
                />
              </div>
            ) : (
              <span className="ml-auto text-navy-400 text-sm">Closed</span>
            )}
          </div>
        ))}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-gray-200 rounded-full py-5 text-navy-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button
            onClick={handleStep3}
            disabled={loading}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-full py-5 font-semibold btn-press"
            data-testid="onboarding-step3-next"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="bg-white rounded-3xl shadow-card border-0" data-testid="onboarding-step4">
      <CardHeader className="text-center pt-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-emerald-600" />
        </div>
        <CardTitle className="font-display text-2xl text-navy-900">Connect payments</CardTitle>
        <CardDescription className="text-navy-500">Optional: Add Dojo to collect deposits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-8 pb-8">
        <div className="p-5 rounded-2xl bg-cream">
          <p className="text-sm text-navy-600 mb-4">
            Dojo is a UK payment processor. If you have a Dojo account, paste your API key below to enable deposit collection.
          </p>
          <div className="space-y-2">
            <Label htmlFor="dojoKey" className="text-navy-700 font-medium">Dojo API Key (optional)</Label>
            <Input
              id="dojoKey"
              type="password"
              placeholder="sk_live_..."
              value={dojoKey}
              onChange={(e) => setDojoKey(e.target.value)}
              className="bg-white border-gray-200 rounded-xl py-5"
              data-testid="onboarding-dojo-key"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(3)} className="flex-1 border-gray-200 rounded-full py-5 text-navy-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button
            onClick={handleStep4}
            disabled={loading}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-full py-5 font-semibold btn-press"
            data-testid="onboarding-complete-btn"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Complete setup <Check className="w-4 h-4 ml-2" /></>}
          </Button>
        </div>
        <button
          onClick={() => {
            setDojoKey('');
            handleStep4();
          }}
          className="w-full text-center text-sm text-navy-400 hover:text-navy-600 transition-colors"
          data-testid="onboarding-skip-btn"
        >
          Skip for now
        </button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold font-heading text-navy-900">Rezvo</span>
      </div>

      {renderStepIndicator()}

      <div className="w-full max-w-md">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default OnboardingPage;
