import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar, Loader2, Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

// Alternating business images for TailAdmin style
const BUSINESS_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', // Hair salon
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', // Personal trainer
  'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800', // Barber
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800', // Massage
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', // Nail salon
];

const SignupAuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState(null); // null | 'email'
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex] = useState(Math.floor(Math.random() * BUSINESS_IMAGES.length));
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    sessionStorage.setItem('signup_user_type', 'business');
    sessionStorage.setItem('auth_method', 'google');
    
    const redirectUrl = window.location.origin + '/auth-callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleEmailSignup = async () => {
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

    // Store email credentials and proceed to profile
    sessionStorage.setItem('signup_email', formData.email);
    sessionStorage.setItem('signup_password', formData.password);
    sessionStorage.setItem('signup_user_type', 'business');
    sessionStorage.setItem('auth_method', 'email');
    
    navigate('/signup/profile');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={BUSINESS_IMAGES[currentImageIndex]} 
          alt="Local business" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Rezvo</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Join thousands of UK businesses
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Manage your bookings, grow your client base, and take control of your schedule.
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Rezvo</span>
          </Link>
          <div className="hidden lg:block" />
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">
              Log in
            </Link>
          </p>
        </header>

        {/* Form Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            {/* User Type Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">Business Account</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Create your account
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Start your 14-day free trial today
            </p>

            {!authMethod ? (
              <>
                {/* Google Signup */}
                <Button
                  onClick={handleGoogleSignup}
                  disabled={googleLoading}
                  variant="outline"
                  className="w-full h-14 border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 mb-4"
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

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">or continue with email</span>
                  </div>
                </div>

                {/* Email Signup Button */}
                <Button
                  onClick={() => setAuthMethod('email')}
                  variant="outline"
                  className="w-full h-14 border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50"
                  data-testid="email-signup-btn"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Continue with Email
                </Button>

                {/* Customer option (disabled) */}
                <div className="mt-8 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-600">Customer Account</p>
                      <p className="text-xs text-gray-400">Coming soon</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Email Form */
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-14 pl-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0"
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="h-14 pl-12 pr-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0"
                      data-testid="password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="h-14 pl-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0"
                      data-testid="confirm-password-input"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleEmailSignup}
                  disabled={loading}
                  className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30"
                  data-testid="continue-btn"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <button
                  onClick={() => setAuthMethod(null)}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                  ← Back to options
                </button>
              </div>
            )}

            {/* Terms */}
            <p className="mt-8 text-xs text-gray-400 text-center">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignupAuthPage;
