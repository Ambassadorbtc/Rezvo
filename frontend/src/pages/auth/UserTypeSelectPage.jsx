import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Calendar, ArrowLeft, Building2, User, ArrowRight } from 'lucide-react';

const UserTypeSelectPage = () => {
  const navigate = useNavigate();

  const handleSelectType = (type) => {
    // Store user type and navigate to OTP page
    sessionStorage.setItem('signup_user_type', type);
    navigate('/verify-phone');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Rezvo</span>
          </div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-gray-200 rounded-full" />
            <div className="flex-1 h-1 bg-gray-200 rounded-full" />
            <div className="flex-1 h-1 bg-gray-200 rounded-full" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Step 1 of 4</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
            How will you use Rezvo?
          </h1>
          <p className="text-gray-500 mb-10 text-center">
            Choose the option that best describes you
          </p>

          {/* Options */}
          <div className="space-y-4">
            {/* Business Option */}
            <button
              onClick={() => handleSelectType('business')}
              className="w-full p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/10 transition-all text-left group"
              data-testid="select-business-btn"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <Building2 className="w-7 h-7 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">I'm a Business</h3>
                  <p className="text-sm text-gray-500">
                    I want to manage my appointments and accept bookings from clients
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors mt-4" />
              </div>
            </button>

            {/* Customer Option - Disabled for now */}
            <button
              disabled
              className="w-full p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 opacity-50 cursor-not-allowed text-left"
              data-testid="select-customer-btn"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <User className="w-7 h-7 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-400 mb-1">I'm a Customer</h3>
                  <p className="text-sm text-gray-400">
                    I want to book appointments with my favourite businesses
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-500">
                    Coming Soon
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserTypeSelectPage;
