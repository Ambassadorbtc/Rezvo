import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Calendar, 
  ArrowRight, 
  Check,
  Scissors,
  Dumbbell,
  Heart,
  Car,
  Dog,
  Coffee,
  Camera,
  Brush,
  Stethoscope,
  Music,
  Utensils,
  Wrench,
  BookOpen,
  Home,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const BUSINESS_TYPES = [
  { id: 'hairdresser', label: 'Hairdresser', icon: Scissors, color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { id: 'barber', label: 'Barber Shop', icon: Scissors, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'beauty', label: 'Beauty Salon', icon: Sparkles, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'nails', label: 'Nail Technician', icon: Brush, color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { id: 'lashes', label: 'Lash & Brow', icon: Sparkles, color: 'bg-violet-50 text-violet-600 border-violet-100' },
  { id: 'massage', label: 'Massage Therapist', icon: Heart, color: 'bg-red-50 text-red-600 border-red-100' },
  { id: 'personal_trainer', label: 'Personal Trainer', icon: Dumbbell, color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { id: 'yoga', label: 'Yoga Instructor', icon: Heart, color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { id: 'physiotherapy', label: 'Physiotherapist', icon: Stethoscope, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  { id: 'driving', label: 'Driving Instructor', icon: Car, color: 'bg-green-50 text-green-600 border-green-100' },
  { id: 'dog_grooming', label: 'Dog Groomer', icon: Dog, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { id: 'pet_services', label: 'Pet Services', icon: Dog, color: 'bg-lime-50 text-lime-600 border-lime-100' },
  { id: 'photography', label: 'Photographer', icon: Camera, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { id: 'music', label: 'Music Teacher', icon: Music, color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100' },
  { id: 'tutoring', label: 'Tutor / Coach', icon: BookOpen, color: 'bg-sky-50 text-sky-600 border-sky-100' },
  { id: 'tattoo', label: 'Tattoo Artist', icon: Brush, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { id: 'cafe', label: 'Café / Coffee Shop', icon: Coffee, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils, color: 'bg-red-50 text-red-600 border-red-100' },
  { id: 'food_truck', label: 'Food Truck', icon: Utensils, color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { id: 'cleaning', label: 'Cleaning Services', icon: Home, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'handyman', label: 'Handyman', icon: Wrench, color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { id: 'other', label: 'Other', icon: Sparkles, color: 'bg-gray-50 text-gray-600 border-gray-100' },
];

const SignupBusinessTypePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [customType, setCustomType] = useState('');

  const handleComplete = async () => {
    if (!selectedType) {
      toast.error('Please select a business type');
      return;
    }

    if (selectedType === 'other' && !customType.trim()) {
      toast.error('Please specify your business type');
      return;
    }

    setLoading(true);
    try {
      const businessType = selectedType === 'other' ? customType : selectedType;
      
      await api.post('/business/onboarding', {
        business_type: businessType,
        team_members: []
      });

      // Clear all signup session data
      sessionStorage.removeItem('auth_method');
      sessionStorage.removeItem('signup_user_type');
      sessionStorage.removeItem('signup_profile');
      sessionStorage.removeItem('signup_phone');
      sessionStorage.removeItem('phone_verified');

      toast.success('Welcome to Rezvo!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save settings');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Clear session data and go to dashboard
    sessionStorage.clear();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Rezvo</span>
          </div>
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </Button>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
          </div>
          <p className="text-xs text-gray-400 text-center">Final step</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pb-10 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              What type of business do you run?
            </h1>
            <p className="text-gray-500">This helps us personalize your booking page</p>
          </div>

          {/* Business Type Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {BUSINESS_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left hover:shadow-md ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50 shadow-md'
                      : `border-gray-100 bg-white hover:border-gray-200`
                  }`}
                  data-testid={`business-type-${type.id}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${type.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-teal-700' : 'text-gray-700'}`}>
                    {type.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Type Input */}
          {selectedType === 'other' && (
            <div className="mb-6">
              <Input
                placeholder="Specify your business type (e.g., Life Coach)"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="h-14 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500"
              />
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={handleComplete}
            disabled={loading || !selectedType}
            className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30"
            data-testid="complete-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Complete Setup
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SignupBusinessTypePage;
