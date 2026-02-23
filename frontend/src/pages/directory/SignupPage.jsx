import SEO from '../../components/seo/SEO'
import Navbar from '../../components/directory/Navbar'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Store, CheckCircle } from 'lucide-react';
import RezvoFooter from '../../components/directory/RezvoFooter';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessType: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'owner'
      });
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Google signup coming soon');
  };

  const handleAppleSignup = () => {
    console.log('Apple signup coming soon');
  };

  return (
    <div className="min-h-screen bg-warm">
      <Navbar />
      <SEO title="Sign Up" description="Create your free Rezvo account. Book restaurants, salons, and more — or list your business and start accepting bookings today." path="/signup" noindex />
      <div className="flex items-center justify-center px-4 py-12 pt-32">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-forest rounded flex items-center justify-center">
            <span className="text-white font-heading font-black text-2xl">R</span>
          </div>
          <span className="text-forest font-heading font-black text-3xl tracking-tight">REZVO</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-forest mb-3">
              Get Started Free
            </h1>
            <p className="text-muted text-base">
              Join Rezvo and start accepting bookings in minutes. No per-cover fees, setup in 5 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-forest mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-muted w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-border rounded-xl text-text placeholder-subtle focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-forest mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-muted w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-border rounded-xl text-text placeholder-subtle focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-forest mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-muted w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-border rounded-xl text-text placeholder-subtle focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-forest transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted">
                Must be at least 8 characters with letters and numbers
              </p>
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-semibold text-forest mb-2">
                Business Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Store className="text-muted w-5 h-5" />
                </div>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-border rounded-xl text-text focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select your business type</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="hair_salon">Salon</option>
                  <option value="barber">Barber</option>
                  <option value="spa">Spa</option>
                  <option value="cafe">Café</option>
                  <option value="bar">Bar/Pub</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 border-2 border-border rounded accent-forest cursor-pointer flex-shrink-0"
                  required
                />
                <span className="text-sm text-muted leading-relaxed">
                  I agree to Rezvo's{' '}
                  <a href="https://rezvo.app/terms.html" className="text-forest font-semibold hover:text-sage transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="https://rezvo.app/privacy.html" className="text-forest font-semibold hover:text-sage transition-colors">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3 bg-coral/10 border border-coral/20 rounded-xl text-coral text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest text-white font-bold py-4 rounded-full hover:bg-sage transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted font-medium">or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-border rounded-xl hover:border-forest hover:bg-off-white transition-all font-semibold text-text"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleAppleSignup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-border rounded-xl hover:border-forest hover:bg-off-white transition-all font-semibold text-text"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-forest font-bold hover:text-sage transition-colors">
                Log In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 bg-pale-green rounded-2xl p-6">
          <h3 className="text-forest font-heading font-black text-lg mb-4">
            Why business owners choose Rezvo
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="text-white w-4 h-4" />
              </div>
              <span className="text-sm text-forest font-medium">
                <strong>No per-cover fees</strong> – Keep more of what you earn
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="text-white w-4 h-4" />
              </div>
              <span className="text-sm text-forest font-medium">
                <strong>5-minute setup</strong> – Get started immediately
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="text-white w-4 h-4" />
              </div>
              <span className="text-sm text-forest font-medium">
                <strong>Real-time bookings</strong> – Manage your availability effortlessly
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="text-white w-4 h-4" />
              </div>
              <span className="text-sm text-forest font-medium">
                <strong>Grow your customer base</strong> – Reach diners actively searching
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted">
            Already listed on Rezvo?{' '}
            <a href="https://rezvo.app/for-business" className="text-forest font-semibold hover:text-sage transition-colors">
              Claim your listing
            </a>
          </p>
        </div>
      </div>

      </div>

      <RezvoFooter />
    </div>
  );
}
