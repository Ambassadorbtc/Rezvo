import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Link2, 
  Copy, 
  Share2, 
  QrCode, 
  Check, 
  ExternalLink,
  Upload,
  Building2,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Globe,
  Sparkles,
  Save,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

const ShareLinkPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [shortLinks, setShortLinks] = useState([]);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Form state for business branding
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    logo_url: '',
    instagram: '',
    facebook: '',
    website: '',
    booking_message: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [businessRes, linksRes] = await Promise.all([
        api.get('/business'),
        api.get('/links/list').catch(() => ({ data: [] }))
      ]);
      
      const bizData = businessRes.data;
      setBusiness(bizData);
      setShortLinks(linksRes.data || []);
      
      setFormData({
        name: bizData.name || '',
        tagline: bizData.tagline || '',
        description: bizData.description || '',
        phone: bizData.phone || '',
        email: bizData.email || '',
        address: bizData.address || '',
        logo_url: bizData.logo_url || '',
        instagram: bizData.instagram || '',
        facebook: bizData.facebook || '',
        website: bizData.website || '',
        booking_message: bizData.booking_message || 'Book your appointment with us!'
      });
    } catch (error) {
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/business', formData);
      toast.success('Booking page updated!');
      loadData();
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const generateShortLink = async () => {
    try {
      const response = await api.post('/links/create');
      toast.success('Short link created!');
      loadData();
    } catch (error) {
      toast.error('Failed to generate short link');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const shareLink = async (link) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book with ${business?.name}`,
          text: formData.booking_message,
          url: link,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      copyToClipboard(link);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, use a placeholder - in production this would upload to storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo_url: e.target?.result }));
      };
      reader.readAsDataURL(file);
      toast.success('Logo uploaded! Save to apply changes.');
    }
  };

  const bookingLink = business?.id ? `${window.location.origin}/book/${business.id}` : '';
  const latestShortLink = shortLinks[0];
  const displayLink = latestShortLink?.short_link || bookingLink;
  
  const qrCodeUrl = displayLink 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(displayLink)}&bgcolor=FDFBF7&color=00BFA5`
    : null;

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
      <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6" data-testid="share-link-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 anim-fade-up">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900">Booking Page</h1>
            <p className="text-navy-400 mt-1">Customize your public booking page and share your link</p>
          </div>
          <div className="flex gap-2">
            <a href={bookingLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-gray-200 rounded-full">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </a>
            <Button onClick={handleSave} disabled={saving} className="bg-teal-500 hover:bg-teal-600 text-white rounded-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Share Links */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Link Card */}
            <Card className="bg-white rounded-2xl shadow-card border-0 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-400" />
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center mx-auto mb-3">
                      <Link2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <h3 className="font-bold text-navy-900">{formData.name || 'Your Business'}</h3>
                  <p className="text-sm text-navy-500">Booking Link</p>
                </div>

                {/* Display Link */}
                <div className="p-3 rounded-xl bg-cream border border-gray-100 mb-4">
                  <p className="text-center text-sm text-teal-600 font-mono truncate">{displayLink}</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    onClick={() => copyToClipboard(displayLink)}
                    className={`rounded-full ${copied ? 'bg-emerald-500' : 'bg-teal-500 hover:bg-teal-600'} text-white`}
                  >
                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    onClick={() => shareLink(displayLink)}
                    variant="outline"
                    className="rounded-full border-gray-200"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="text-center pt-4 border-t border-dashed border-gray-200">
                    <p className="text-sm text-navy-500 mb-3">Scan to book</p>
                    <div className="inline-block p-3 bg-cream rounded-xl">
                      <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Short Links */}
            <Card className="bg-white rounded-2xl shadow-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  Short Links
                </CardTitle>
                <CardDescription>Create branded short links for easy sharing</CardDescription>
              </CardHeader>
              <CardContent>
                {shortLinks.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {shortLinks.slice(0, 3).map((link, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-cream">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono text-teal-600 truncate">{link.short_link}</p>
                          <p className="text-xs text-navy-400">{link.clicks || 0} clicks</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(link.short_link)}
                          className="text-navy-500 hover:text-teal-600"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-navy-500 text-center py-4">No short links yet</p>
                )}
                <Button
                  onClick={generateShortLink}
                  variant="outline"
                  className="w-full border-dashed border-teal-300 text-teal-600 hover:bg-teal-50 rounded-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate New Short Link
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Branding Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Identity */}
            <Card className="bg-white rounded-2xl shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  Business Identity
                </CardTitle>
                <CardDescription>How your business appears on the booking page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <Label className="text-navy-700">Business Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="w-20 h-20 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-gray-200 rounded-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-navy-400 mt-1">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-navy-700">Business Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your Business Name"
                      className="mt-1 bg-cream border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline" className="text-navy-700">Tagline</Label>
                    <Input
                      id="tagline"
                      value={formData.tagline}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="Your catchy tagline"
                      className="mt-1 bg-cream border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-navy-700">About Your Business</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell customers about your business..."
                    rows={3}
                    className="mt-1 bg-cream border-gray-200 rounded-xl resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="booking_message" className="text-navy-700">Welcome Message</Label>
                  <Input
                    id="booking_message"
                    value={formData.booking_message}
                    onChange={(e) => setFormData(prev => ({ ...prev, booking_message: e.target.value }))}
                    placeholder="Book your appointment with us!"
                    className="mt-1 bg-cream border-gray-200 rounded-xl"
                  />
                  <p className="text-xs text-navy-400 mt-1">Shown at the top of your booking page</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card className="bg-white rounded-2xl shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-500" />
                  Contact Details
                </CardTitle>
                <CardDescription>Let customers know how to reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-navy-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+44 7XXX XXXXXX"
                      className="mt-1 bg-cream border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-navy-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="hello@yourbusiness.com"
                      className="mt-1 bg-cream border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-navy-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Business Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 High Street, London, SW1A 1AA"
                    className="mt-1 bg-cream border-gray-200 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-white rounded-2xl shadow-card border-0">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-500" />
                  Social Media & Website
                </CardTitle>
                <CardDescription>Connect with customers on social media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-navy-700 flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </Label>
                    <div className="mt-1 flex">
                      <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-navy-500 text-sm">@</span>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="yourbusiness"
                        className="bg-cream border-gray-200 rounded-l-none rounded-r-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-navy-700 flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={formData.facebook}
                      onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="facebook.com/yourbusiness"
                      className="mt-1 bg-cream border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website" className="text-navy-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.yourbusiness.com"
                    className="mt-1 bg-cream border-gray-200 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-teal-50 rounded-2xl border-0">
              <CardContent className="p-5">
                <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  Tips for more bookings
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    Add a professional logo to build trust
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    Write a catchy tagline that describes what you do
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    Link your Instagram to showcase your work
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5">•</span>
                    Share your short link on social media bios
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ShareLinkPage;
