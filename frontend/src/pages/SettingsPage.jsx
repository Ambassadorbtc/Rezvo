import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Building2, 
  CreditCard, 
  Bell, 
  Loader2,
  Save,
  Clock,
  Calendar,
  HelpCircle,
  MessageSquare,
  FileText,
  ExternalLink,
  Link2,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useSearchParams } from 'react-router-dom';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [settings, setSettings] = useState(null);
  const [searchParams] = useSearchParams();
  
  // Google Calendar state
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState({ connected: false, configured: false });
  const [connectingGoogle, setConnectingGoogle] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [dojoKey, setDojoKey] = useState('');
  const [emailReminders, setEmailReminders] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);
  const [reminderHours, setReminderHours] = useState('24');
  
  // Working hours state
  const [workingHours, setWorkingHours] = useState({
    monday: { enabled: true, open: '09:00', close: '17:00' },
    tuesday: { enabled: true, open: '09:00', close: '17:00' },
    wednesday: { enabled: true, open: '09:00', close: '17:00' },
    thursday: { enabled: true, open: '09:00', close: '17:00' },
    friday: { enabled: true, open: '09:00', close: '17:00' },
    saturday: { enabled: false, open: '10:00', close: '16:00' },
    sunday: { enabled: false, open: '10:00', close: '16:00' },
  });

  // Booking settings state
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [allowCancellations, setAllowCancellations] = useState(true);
  const [sendReminders, setSendReminders] = useState(true);
  const [bufferTime, setBufferTime] = useState('15');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [businessRes, settingsRes] = await Promise.all([
        api.get('/business').catch(() => ({ data: null })),
        api.get('/settings').catch(() => ({ data: null })),
      ]);

      if (businessRes.data) {
        setBusiness(businessRes.data);
        setBusinessName(businessRes.data.name || '');
        setTagline(businessRes.data.tagline || '');
        setPhone(businessRes.data.phone || '');
        setAddress(businessRes.data.address || '');
        setInstagram(businessRes.data.instagram || '');
      }

      if (settingsRes.data) {
        setSettings(settingsRes.data);
        if (settingsRes.data.dojo_api_key) {
          setDojoKey(settingsRes.data.dojo_api_key);
        }
        if (settingsRes.data.reminder_settings) {
          setEmailReminders(settingsRes.data.reminder_settings.email_enabled);
          setSmsReminders(settingsRes.data.reminder_settings.sms_enabled);
          setReminderHours(settingsRes.data.reminder_settings.reminder_hours?.toString() || '24');
        }
        if (settingsRes.data.working_hours) {
          setWorkingHours(settingsRes.data.working_hours);
        }
        if (settingsRes.data.booking_settings) {
          setAutoConfirm(settingsRes.data.booking_settings.auto_confirm ?? true);
          setAllowCancellations(settingsRes.data.booking_settings.allow_cancellations ?? true);
          setSendReminders(settingsRes.data.booking_settings.send_reminders ?? true);
          setBufferTime(settingsRes.data.booking_settings.buffer_time?.toString() || '15');
        }
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/business', {
        name: businessName,
        tagline,
        phone,
        address,
        instagram,
      });
      toast.success('Profile saved');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    if (!dojoKey || dojoKey.startsWith('****')) {
      toast.info('Enter a new API key to update');
      return;
    }
    setSaving(true);
    try {
      await api.post('/payments/verify-key', { api_key: dojoKey });
      toast.success('Payment settings saved');
    } catch (error) {
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const saveReminderSettings = async () => {
    setSaving(true);
    try {
      await api.patch('/settings/reminders', null, {
        params: {
          email_enabled: emailReminders,
          sms_enabled: smsReminders,
          reminder_hours: parseInt(reminderHours),
        },
      });
      toast.success('Reminder settings saved');
    } catch (error) {
      toast.error('Failed to save reminder settings');
    } finally {
      setSaving(false);
    }
  };

  const saveWorkingHours = async () => {
    setSaving(true);
    try {
      await api.patch('/settings/working-hours', { working_hours: workingHours });
      toast.success('Working hours saved');
    } catch (error) {
      toast.error('Failed to save working hours');
    } finally {
      setSaving(false);
    }
  };

  const saveBookingSettings = async () => {
    setSaving(true);
    try {
      await api.patch('/settings/booking', {
        auto_confirm: autoConfirm,
        allow_cancellations: allowCancellations,
        send_reminders: sendReminders,
        buffer_time: parseInt(bufferTime),
      });
      toast.success('Booking settings saved');
    } catch (error) {
      toast.error('Failed to save booking settings');
    } finally {
      setSaving(false);
    }
  };

  const updateDayHours = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
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
      <div className="p-4 md:p-6 lg:p-8 space-y-6" data-testid="settings-page">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900">Settings</h1>
          <p className="text-navy-500 mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border border-gray-200 rounded-2xl p-1.5 w-full overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-hide">
            <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-teal-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
              <Building2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="rounded-xl data-[state=active]:bg-teal-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
              <Clock className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Hours</span>
            </TabsTrigger>
            <TabsTrigger value="booking" className="rounded-xl data-[state=active]:bg-teal-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
              <Calendar className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Booking</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-xl data-[state=active]:bg-teal-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
              <CreditCard className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="rounded-xl data-[state=active]:bg-teal-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
              <Bell className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Reminders</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="rounded-xl data-[state=active]:bg-teal-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
              <HelpCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="profile-settings">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Business Profile</CardTitle>
                <CardDescription className="text-navy-500">
                  This information appears on your public booking page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-navy-700 font-medium">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl"
                    data-testid="settings-business-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline" className="text-navy-700 font-medium">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="e.g. Professional cuts at your doorstep"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl"
                    data-testid="settings-tagline"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-navy-700 font-medium">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+44 7XXX XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-cream border-gray-200 rounded-xl"
                      data-testid="settings-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-navy-700 font-medium">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@yourbusiness"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="bg-cream border-gray-200 rounded-xl"
                      data-testid="settings-instagram"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-navy-700 font-medium">Address</Label>
                  <Input
                    id="address"
                    placeholder="Your business address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl"
                    data-testid="settings-address"
                  />
                </div>
                <Button
                  onClick={saveBusinessProfile}
                  disabled={saving}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
                  data-testid="save-profile-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="bg-white rounded-2xl shadow-card border-0 mt-6">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                  <div>
                    <div className="font-medium text-navy-900">{user?.email}</div>
                    <div className="text-sm text-navy-500">Logged in as</div>
                  </div>
                  <Button variant="outline" onClick={logout} className="border-gray-200 rounded-full" data-testid="logout-settings-btn">
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Working Hours Tab */}
          <TabsContent value="hours">
            <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="hours-settings">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Working Hours</CardTitle>
                <CardDescription className="text-navy-500">
                  Set your business operating hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex items-center justify-between p-4 rounded-xl bg-cream">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={workingHours[day]?.enabled}
                        onCheckedChange={(checked) => updateDayHours(day, 'enabled', checked)}
                        data-testid={`${day}-enabled-toggle`}
                      />
                      <span className="font-medium text-navy-700 capitalize w-24">{day}</span>
                    </div>
                    {workingHours[day]?.enabled ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={workingHours[day]?.open || '09:00'}
                          onChange={(e) => updateDayHours(day, 'open', e.target.value)}
                          className="w-28 bg-white border-gray-200 rounded-lg text-center"
                          data-testid={`${day}-open-time`}
                        />
                        <span className="text-navy-400">to</span>
                        <Input
                          type="time"
                          value={workingHours[day]?.close || '17:00'}
                          onChange={(e) => updateDayHours(day, 'close', e.target.value)}
                          className="w-28 bg-white border-gray-200 rounded-lg text-center"
                          data-testid={`${day}-close-time`}
                        />
                      </div>
                    ) : (
                      <span className="text-navy-400 text-sm">Closed</span>
                    )}
                  </div>
                ))}
                
                <Button
                  onClick={saveWorkingHours}
                  disabled={saving}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-full mt-4"
                  data-testid="save-hours-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Working Hours
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="payment-settings">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Dojo Payments</CardTitle>
                <CardDescription className="text-navy-500">
                  Connect your Dojo account to collect deposits from clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-5 rounded-2xl bg-cream">
                  <p className="text-sm text-navy-600 mb-4">
                    Dojo is a UK payment processor. Get your API key from the{' '}
                    <a href="https://developer.dojo.tech" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                      Dojo Developer Portal
                    </a>
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="dojoKey" className="text-navy-700 font-medium">API Key</Label>
                    <Input
                      id="dojoKey"
                      type="password"
                      placeholder="sk_live_..."
                      value={dojoKey}
                      onChange={(e) => setDojoKey(e.target.value)}
                      className="bg-white border-gray-200 rounded-xl"
                      data-testid="settings-dojo-key"
                    />
                  </div>
                </div>
                <Button
                  onClick={savePaymentSettings}
                  disabled={saving}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
                  data-testid="save-payments-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>

            {/* Billing Card */}
            <Card className="bg-white rounded-2xl shadow-card border-2 border-teal-200 mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">FREE TRIAL</span>
                    </div>
                    <h3 className="text-xl font-bold font-heading text-navy-900">Rezvo Pro</h3>
                    <p className="text-navy-500 text-sm">14-day free trial, then £4.99/month</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold font-display text-teal-600 tabular-nums">£4.99</div>
                    <div className="text-sm text-navy-400">/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="reminder-settings">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Reminder Settings</CardTitle>
                <CardDescription className="text-navy-500">
                  Configure how and when clients receive booking reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                  <div>
                    <Label className="text-navy-700 font-medium">Email Reminders</Label>
                    <p className="text-sm text-navy-500">Send email before appointment</p>
                  </div>
                  <Switch
                    checked={emailReminders}
                    onCheckedChange={setEmailReminders}
                    data-testid="email-reminders-toggle"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                  <div>
                    <Label className="text-navy-700 font-medium">SMS Reminders</Label>
                    <p className="text-sm text-navy-500">Coming soon via Twilio</p>
                  </div>
                  <Switch
                    checked={smsReminders}
                    onCheckedChange={setSmsReminders}
                    disabled
                    data-testid="sms-reminders-toggle"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-navy-700 font-medium">Reminder Timing</Label>
                  <div className="flex gap-2">
                    {['2', '24', '48'].map((hours) => (
                      <Button
                        key={hours}
                        variant={reminderHours === hours ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setReminderHours(hours)}
                        className={reminderHours === hours ? 'bg-teal-500 text-white rounded-full' : 'border-gray-200 rounded-full text-navy-600'}
                        data-testid={`reminder-${hours}h-btn`}
                      >
                        {hours}h before
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={saveReminderSettings}
                  disabled={saving}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
                  data-testid="save-reminders-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Reminder Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Settings Tab */}
          <TabsContent value="booking">
            <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="booking-settings">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Booking Settings</CardTitle>
                <CardDescription className="text-navy-500">
                  Configure how bookings are handled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                  <div>
                    <Label className="text-navy-700 font-medium">Auto-confirm bookings</Label>
                    <p className="text-sm text-navy-500">Automatically confirm new bookings</p>
                  </div>
                  <Switch
                    checked={autoConfirm}
                    onCheckedChange={setAutoConfirm}
                    data-testid="auto-confirm-toggle"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                  <div>
                    <Label className="text-navy-700 font-medium">Allow cancellations</Label>
                    <p className="text-sm text-navy-500">Let customers cancel bookings</p>
                  </div>
                  <Switch
                    checked={allowCancellations}
                    onCheckedChange={setAllowCancellations}
                    data-testid="allow-cancellations-toggle"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                  <div>
                    <Label className="text-navy-700 font-medium">Send reminders</Label>
                    <p className="text-sm text-navy-500">Email customers 24h before</p>
                  </div>
                  <Switch
                    checked={sendReminders}
                    onCheckedChange={setSendReminders}
                    data-testid="send-reminders-toggle"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-navy-700 font-medium">Buffer time</Label>
                  <p className="text-sm text-navy-500 mb-2">Time between appointments</p>
                  <div className="flex gap-2">
                    {['0', '15', '30', '60'].map((mins) => (
                      <Button
                        key={mins}
                        variant={bufferTime === mins ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBufferTime(mins)}
                        className={bufferTime === mins ? 'bg-teal-500 text-white rounded-full' : 'border-gray-200 rounded-full text-navy-600'}
                        data-testid={`buffer-${mins}min-btn`}
                      >
                        {mins === '0' ? 'None' : `${mins} min`}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={saveBookingSettings}
                  disabled={saving}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
                  data-testid="save-booking-settings-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Booking Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="support-settings">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Support</CardTitle>
                <CardDescription className="text-navy-500">
                  Get help and access important documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="https://rezvo.app/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-cream hover:bg-cream/70 transition-colors"
                  data-testid="help-centre-link"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-navy-900">Help Centre</div>
                      <div className="text-sm text-navy-500">Browse FAQs and guides</div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-navy-400" />
                </a>

                <Link 
                  to="/support"
                  className="flex items-center justify-between p-4 rounded-xl bg-cream hover:bg-cream/70 transition-colors"
                  data-testid="contact-support-link"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-navy-900">Contact Support</div>
                      <div className="text-sm text-navy-500">Chat with our support team</div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-navy-400" />
                </Link>

                <Link 
                  to="/terms"
                  className="flex items-center justify-between p-4 rounded-xl bg-cream hover:bg-cream/70 transition-colors"
                  data-testid="terms-privacy-link"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-navy-900">Terms & Privacy</div>
                      <div className="text-sm text-navy-500">View our policies</div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-navy-400" />
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
