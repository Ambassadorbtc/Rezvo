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
  User, 
  Building2, 
  CreditCard, 
  Bell, 
  Settings as SettingsIcon,
  Loader2,
  Save,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [settings, setSettings] = useState(null);

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [dojoKey, setDojoKey] = useState('');
  const [emailReminders, setEmailReminders] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);
  const [reminderHours, setReminderHours] = useState('24');

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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blaze border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6" data-testid="settings-page">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-white/50 mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-obsidian-paper border border-white/5">
            <TabsTrigger value="profile" className="data-[state=active]:bg-blaze data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-blaze data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="reminders" className="data-[state=active]:bg-blaze data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Reminders
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-obsidian-paper border-white/5" data-testid="profile-settings">
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription className="text-white/50">
                  This information appears on your public booking page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-obsidian border-white/10"
                    data-testid="settings-business-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="e.g. Professional cuts at your doorstep"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="bg-obsidian border-white/10"
                    data-testid="settings-tagline"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+44 7XXX XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-obsidian border-white/10"
                      data-testid="settings-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@yourbusiness"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="bg-obsidian border-white/10"
                      data-testid="settings-instagram"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Your business address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-obsidian border-white/10"
                    data-testid="settings-address"
                  />
                </div>
                <Button
                  onClick={saveBusinessProfile}
                  disabled={saving}
                  className="bg-blaze hover:bg-blaze-hover text-white"
                  data-testid="save-profile-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="bg-obsidian-paper border-white/5 mt-6">
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian border border-white/5">
                  <div>
                    <div className="font-medium">{user?.email}</div>
                    <div className="text-sm text-white/50">Logged in as</div>
                  </div>
                  <Button variant="outline" onClick={logout} className="border-white/10" data-testid="logout-settings-btn">
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="bg-obsidian-paper border-white/5" data-testid="payment-settings">
              <CardHeader>
                <CardTitle>Dojo Payments</CardTitle>
                <CardDescription className="text-white/50">
                  Connect your Dojo account to collect deposits from clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-obsidian border border-white/5">
                  <p className="text-sm text-white/70 mb-4">
                    Dojo is a UK payment processor. Get your API key from the{' '}
                    <a href="https://developer.dojo.tech" target="_blank" rel="noopener noreferrer" className="text-blaze hover:underline">
                      Dojo Developer Portal
                    </a>
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="dojoKey">API Key</Label>
                    <Input
                      id="dojoKey"
                      type="password"
                      placeholder="sk_live_..."
                      value={dojoKey}
                      onChange={(e) => setDojoKey(e.target.value)}
                      className="bg-obsidian-deep border-white/10"
                      data-testid="settings-dojo-key"
                    />
                  </div>
                </div>
                <Button
                  onClick={savePaymentSettings}
                  disabled={saving}
                  className="bg-blaze hover:bg-blaze-hover text-white"
                  data-testid="save-payments-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>

            {/* Billing Card */}
            <Card className="bg-obsidian-paper border-blaze/30 mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-blaze/20 text-blaze text-xs font-medium">FREE TRIAL</span>
                    </div>
                    <h3 className="text-xl font-bold">QuickSlot Pro</h3>
                    <p className="text-white/50 text-sm">14-day free trial, then £4.99/month</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blaze tabular-nums">£4.99</div>
                    <div className="text-sm text-white/40">/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <Card className="bg-obsidian-paper border-white/5" data-testid="reminder-settings">
              <CardHeader>
                <CardTitle>Reminder Settings</CardTitle>
                <CardDescription className="text-white/50">
                  Configure how and when clients receive booking reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian border border-white/5">
                  <div>
                    <Label className="text-base">Email Reminders</Label>
                    <p className="text-sm text-white/50">Send email before appointment</p>
                  </div>
                  <Switch
                    checked={emailReminders}
                    onCheckedChange={setEmailReminders}
                    data-testid="email-reminders-toggle"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-obsidian border border-white/5">
                  <div>
                    <Label className="text-base">SMS Reminders</Label>
                    <p className="text-sm text-white/50">Coming soon via Twilio</p>
                  </div>
                  <Switch
                    checked={smsReminders}
                    onCheckedChange={setSmsReminders}
                    disabled
                    data-testid="sms-reminders-toggle"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reminder Timing</Label>
                  <div className="flex gap-2">
                    {['2', '24', '48'].map((hours) => (
                      <Button
                        key={hours}
                        variant={reminderHours === hours ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setReminderHours(hours)}
                        className={reminderHours === hours ? 'bg-blaze text-white' : 'border-white/10'}
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
                  className="bg-blaze hover:bg-blaze-hover text-white"
                  data-testid="save-reminders-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Reminder Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
