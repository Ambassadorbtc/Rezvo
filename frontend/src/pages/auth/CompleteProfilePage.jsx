import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar, ArrowLeft, User, Building2, MapPin, Mail, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState(null); // 'google' | 'email'
  
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check if phone is verified
  useEffect(() => {
    const phoneVerified = sessionStorage.getItem('phone_verified');
    const phone = sessionStorage.getItem('signup_phone');
    
    if (!phoneVerified || !phone) {
      toast.error('Please verify your phone first');
      navigate('/verify-phone');
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    
    // Store form data for after Google auth
    sessionStorage.setItem('signup_form_data', JSON.stringify({
      fullName: formData.fullName,
      businessName: formData.businessName,
      address: formData.address
    }));
    
    const redirectUrl = window.location.origin + '/auth-callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleEmailSignup = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.businessName.trim()) {
      toast.error('Please enter your business name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const phone = sessionStorage.getItem('signup_phone');
      
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        business_name: formData.businessName,
        address: formData.address,
        phone: phone,
        auth_method: 'email'
      });

      // Store token and navigate to onboarding - MUST use 'rezvo_token' key
      localStorage.setItem('rezvo_token', response.data.token);
      localStorage.removeItem('rezvo_user'); // Clear cached user
      sessionStorage.setItem('new_signup', 'true');
      
      // Clear signup session data
      sessionStorage.removeItem('phone_verified');
      sessionStorage.removeItem('signup_phone');
      sessionStorage.removeItem('signup_user_type');
      
      toast.success('Account created successfully!');
      navigate('/onboarding-wizard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between">
          <Link to="/verify-phone" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Rezvo</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-gray-200 rounded-full" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Step 3 of 4</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-emerald-600">Phone Verified</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
            Complete your profile
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Tell us about yourself and your business
          </p>

          {/* Form */}
          <div className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="fullName"
                  placeholder="John Smith"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="h-14 pl-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0"
                  data-testid="fullname-input"
                />
              </div>
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">Business Name</Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="businessName"
                  placeholder="Smith's Barbershop"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="h-14 pl-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0"
                  data-testid="businessname-input"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">Business Address <span className="text-gray-400">(Optional)</span></Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="address"
                  placeholder="123 High Street, London"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="h-14 pl-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0"
                  data-testid="address-input"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-br from-slate-50 via-white to-teal-50 px-4 text-sm text-gray-500">Continue with</span>
              </div>
            </div>

            {/* Auth Method Selection */}
            {!authMethod ? (
              <div className="space-y-3">
                {/* Google Button */}
                <Button
                  onClick={handleGoogleSignup}
                  disabled={googleLoading || !formData.fullName || !formData.businessName}
                  className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-2xl font-semibold transition-all disabled:opacity-50"
                  data-testid="google-signup-btn"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                {/* Email Button */}
                <Button
                  onClick={() => setAuthMethod('email')}
                  disabled={!formData.fullName || !formData.businessName}
                  variant="outline"
                  className="w-full h-14 bg-transparent hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-2xl font-semibold transition-all disabled:opacity-50"
                  data-testid="email-signup-btn"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Continue with Email
                </Button>
              </div>
            ) : (
              /* Email Form */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-14 pl-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0"
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-14 px-4 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0"
                    data-testid="password-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="h-14 px-4 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0"
                    data-testid="confirm-password-input"
                  />
                </div>

                <Button
                  onClick={handleEmailSignup}
                  disabled={loading}
                  className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30 hover:shadow-xl transition-all"
                  data-testid="create-account-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <button
                  onClick={() => setAuthMethod(null)}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to options
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompleteProfilePage;
