import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, ArrowLeft, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !businessName) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, businessName);
      toast.success('Account created! Let\'s set up your business.');
      navigate('/onboarding');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold font-heading text-navy-900">Rezvo</span>
          </div>

          <Card className="bg-white rounded-3xl shadow-card border-0" data-testid="signup-card">
            <CardHeader className="text-center pb-4 pt-8 px-8">
              <CardTitle className="font-display text-2xl font-bold text-navy-900">Create your account</CardTitle>
              <CardDescription className="text-navy-500">
                Start your 14-day free trial. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-navy-700 font-medium">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="e.g. Sarah's Hair Studio"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl py-5 focus:border-teal-500 focus:ring-teal-500"
                    data-testid="signup-business-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-navy-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl py-5 focus:border-teal-500 focus:ring-teal-500"
                    data-testid="signup-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-navy-700 font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-cream border-gray-200 rounded-xl py-5 focus:border-teal-500 focus:ring-teal-500"
                    data-testid="signup-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full py-6 font-semibold shadow-button hover:shadow-button-hover transition-all btn-press"
                  data-testid="signup-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              {/* Benefits */}
              <div className="mt-6 p-4 rounded-2xl bg-cream">
                <p className="text-sm font-medium text-navy-700 mb-3">What you get:</p>
                <ul className="space-y-2">
                  {['14-day free trial', 'Unlimited bookings', 'Shareable links', 'Email reminders'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-navy-600">
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-teal-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 text-center">
                <p className="text-navy-500 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium" data-testid="login-link">
                    Log in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SignupPage;
