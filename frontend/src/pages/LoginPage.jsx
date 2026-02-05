import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Business images showcasing target market
const businessImages = [
  {
    url: 'https://images.unsplash.com/photo-1549663369-22ac6b052faf?w=800&h=1000&fit=crop',
    caption: 'Barber shops',
    alt: 'Barber cutting hair'
  },
  {
    url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=1000&fit=crop',
    caption: 'Beauty salons',
    alt: 'Spa treatment'
  },
  {
    url: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=800&h=1000&fit=crop',
    caption: 'Wellness services',
    alt: 'Beauty service'
  },
  {
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=1000&fit=crop',
    caption: 'Hair stylists',
    alt: 'Hair styling'
  }
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Rotate images every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % businessImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Rotating background images */}
        {businessImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ))}
        
        {/* Overlay content */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold font-heading">Rezvo</span>
          </div>
          
          <h2 className="text-4xl font-bold font-heading mb-4 leading-tight">
            The booking system<br />built for UK micro-businesses
          </h2>
          
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Join thousands of {businessImages[currentImage].caption.toLowerCase()} using Rezvo to manage appointments effortlessly.
          </p>
          
          {/* Image indicators */}
          <div className="flex gap-2 mb-4">
            {businessImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentImage 
                    ? 'w-8 bg-white' 
                    : 'w-4 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
          
          <p className="text-sm text-white/60">{businessImages[currentImage].caption}</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col bg-cream-50">
        {/* Header */}
        <header className="p-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </header>

        {/* Form Container */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
              <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold font-heading text-navy-900">Rezvo</span>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100" data-testid="login-card">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-navy-900 mb-2">Welcome back</h1>
                <p className="text-navy-500">Log in to manage your bookings</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-navy-700 font-semibold text-sm">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 border-gray-200 rounded-xl h-12 focus:border-teal-500 focus:ring-teal-500 focus:ring-2 transition-all"
                    data-testid="login-email-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-navy-700 font-semibold text-sm">
                      Password
                    </Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-50 border-gray-200 rounded-xl h-12 focus:border-teal-500 focus:ring-teal-500 focus:ring-2 transition-all"
                    data-testid="login-password-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full h-12 font-semibold shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 transition-all"
                  data-testid="login-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-navy-500 text-sm">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="text-teal-600 hover:text-teal-700 font-semibold"
                    data-testid="signup-link"
                  >
                    Sign up free
                  </Link>
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-navy-400">
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
