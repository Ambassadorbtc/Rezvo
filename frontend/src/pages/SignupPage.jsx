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
    <div className="min-h-screen bg-obsidian flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-blaze rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">QuickSlot</span>
          </div>

          <Card className="bg-obsidian-paper border-white/5" data-testid="signup-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
              <CardDescription className="text-white/50">
                Start your 14-day free trial. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="e.g. Sarah's Hair Studio"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-obsidian-deep border-white/10 focus:border-blaze focus:ring-blaze"
                    data-testid="signup-business-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-obsidian-deep border-white/10 focus:border-blaze focus:ring-blaze"
                    data-testid="signup-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-obsidian-deep border-white/10 focus:border-blaze focus:ring-blaze"
                    data-testid="signup-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-blaze hover:opacity-90 text-white rounded-full py-5 font-semibold btn-press"
                  data-testid="signup-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              {/* Benefits */}
              <div className="mt-6 p-4 rounded-xl bg-obsidian border border-white/5">
                <p className="text-sm font-medium mb-3 text-white/80">What you get:</p>
                <ul className="space-y-2">
                  {['14-day free trial', 'Unlimited bookings', 'Shareable links', 'Email reminders'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 text-center">
                <p className="text-white/50 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blaze hover:underline" data-testid="login-link">
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
