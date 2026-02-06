import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Rezvo</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm text-center">
          {/* Hero Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-teal-500/30">
            <Calendar className="w-12 h-12 text-white" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-700">UK's #1 Booking Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Welcome to Rezvo
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            The simple way to manage bookings for your business
          </p>

          {/* CTA Button */}
          <Link to="/get-started" className="block">
            <Button 
              className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all"
              data-testid="welcome-get-started-btn"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>

          {/* Login Link */}
          <p className="mt-6 text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">
              Log in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-gray-400">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-gray-600">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
        </p>
      </footer>
    </div>
  );
};

export default WelcomePage;
