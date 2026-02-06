import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Check,
  MapPin,
  Users,
  Plus,
  X,
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
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const BUSINESS_TYPES = [
  { id: 'hairdresser', label: 'Hairdresser', icon: Scissors, color: 'bg-pink-50 text-pink-600' },
  { id: 'barber', label: 'Barber Shop', icon: Scissors, color: 'bg-blue-50 text-blue-600' },
  { id: 'beauty', label: 'Beauty Salon', icon: Sparkles, color: 'bg-purple-50 text-purple-600' },
  { id: 'nails', label: 'Nail Technician', icon: Brush, color: 'bg-rose-50 text-rose-600' },
  { id: 'lashes', label: 'Lash & Brow', icon: Sparkles, color: 'bg-violet-50 text-violet-600' },
  { id: 'massage', label: 'Massage Therapist', icon: Heart, color: 'bg-red-50 text-red-600' },
  { id: 'personal_trainer', label: 'Personal Trainer', icon: Dumbbell, color: 'bg-orange-50 text-orange-600' },
  { id: 'yoga', label: 'Yoga Instructor', icon: Heart, color: 'bg-teal-50 text-teal-600' },
  { id: 'physiotherapy', label: 'Physiotherapist', icon: Stethoscope, color: 'bg-cyan-50 text-cyan-600' },
  { id: 'driving', label: 'Driving Instructor', icon: Car, color: 'bg-green-50 text-green-600' },
  { id: 'dog_grooming', label: 'Dog Groomer', icon: Dog, color: 'bg-amber-50 text-amber-600' },
  { id: 'pet_services', label: 'Pet Services', icon: Dog, color: 'bg-lime-50 text-lime-600' },
  { id: 'photography', label: 'Photographer', icon: Camera, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'music', label: 'Music Teacher', icon: Music, color: 'bg-fuchsia-50 text-fuchsia-600' },
  { id: 'tutoring', label: 'Tutor / Coach', icon: BookOpen, color: 'bg-sky-50 text-sky-600' },
  { id: 'tattoo', label: 'Tattoo Artist', icon: Brush, color: 'bg-gray-100 text-gray-700' },
  { id: 'cafe', label: 'Café / Coffee Shop', icon: Coffee, color: 'bg-yellow-50 text-yellow-700' },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils, color: 'bg-red-50 text-red-600' },
  { id: 'food_truck', label: 'Food Truck', icon: Utensils, color: 'bg-orange-50 text-orange-600' },
  { id: 'cleaning', label: 'Cleaning Services', icon: Home, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'handyman', label: 'Handyman', icon: Wrench, color: 'bg-slate-100 text-slate-600' },
  { id: 'other', label: 'Other', icon: Sparkles, color: 'bg-gray-50 text-gray-600' },
];

const TEAM_ROLES = [
  'Owner', 'Manager', 'Senior Stylist', 'Stylist', 'Junior Stylist', 
  'Therapist', 'Trainer', 'Instructor', 'Assistant', 'Receptionist', 'Other'
];

const OnboardingWizardPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState({
    businessType: '',
    customBusinessType: '',
    address: '',
    postcode: '',
    city: '',
    teamMembers: []
  });

  const [newMember, setNewMember] = useState({ name: '', role: 'Stylist' });

  const steps = [
    { title: 'Business Type', subtitle: 'What type of business do you run?' },
    { title: 'Location', subtitle: 'Where is your business located?' },
    { title: 'Team', subtitle: 'Add your team members' },
  ];

  const handleNext = () => {
    if (currentStep === 0 && !data.businessType) {
      toast.error('Please select a business type');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const addTeamMember = () => {
    if (!newMember.name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    setData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { ...newMember, id: Date.now() }]
    }));
    setNewMember({ name: '', role: 'Stylist' });
  };

  const removeTeamMember = (id) => {
    setData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== id)
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save onboarding data
      await api.post('/business/onboarding', {
        business_type: data.businessType === 'other' ? data.customBusinessType : data.businessType,
        address: data.address,
        postcode: data.postcode,
        city: data.city,
        team_members: data.teamMembers.map(m => ({ name: m.name, role: m.role }))
      });

      // Clear new signup flag
      sessionStorage.removeItem('new_signup');
      
      toast.success('Welcome to Rezvo!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save settings');
      // Still navigate on error
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
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

      {/* Progress Indicator */}
      <div className="px-6 mb-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-teal-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pb-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Step Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-500">{steps[currentStep].subtitle}</p>
          </div>

          {/* Step Content */}
          {currentStep === 0 && (
            /* Business Type Selection */
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {BUSINESS_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = data.businessType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setData(prev => ({ ...prev, businessType: type.id }))}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                      data-testid={`business-type-${type.id}`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${type.color} flex items-center justify-center mb-2`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-teal-700' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-teal-500 absolute top-2 right-2" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {data.businessType === 'other' && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700">Specify your business type</Label>
                  <Input
                    placeholder="e.g., Life Coach"
                    value={data.customBusinessType}
                    onChange={(e) => setData(prev => ({ ...prev, customBusinessType: e.target.value }))}
                    className="mt-2 h-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            /* Location Details */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="123 High Street"
                    value={data.address}
                    onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
                    className="h-14 pl-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500"
                    data-testid="wizard-address-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">City</Label>
                  <Input
                    placeholder="London"
                    value={data.city}
                    onChange={(e) => setData(prev => ({ ...prev, city: e.target.value }))}
                    className="h-14 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500"
                    data-testid="wizard-city-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Postcode</Label>
                  <Input
                    placeholder="SW1A 1AA"
                    value={data.postcode}
                    onChange={(e) => setData(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                    className="h-14 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500"
                    data-testid="wizard-postcode-input"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            /* Team Members */
            <div className="space-y-4">
              {/* Add Member Form */}
              <div className="p-4 bg-white rounded-2xl border-2 border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-teal-600" />
                  <span className="font-medium text-gray-900">Add Team Member</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    className="flex-1 h-12 bg-gray-50 border-0 rounded-xl"
                    data-testid="team-member-name"
                  />
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                    className="h-12 px-3 bg-gray-50 border-0 rounded-xl text-gray-700"
                  >
                    {TEAM_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <Button
                    onClick={addTeamMember}
                    size="icon"
                    className="h-12 w-12 bg-teal-500 hover:bg-teal-600 rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Team List */}
              {data.teamMembers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">{data.teamMembers.length} team member{data.teamMembers.length !== 1 ? 's' : ''}</p>
                  {data.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-teal-700 font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTeamMember(member.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {data.teamMembers.length === 0 && (
                <p className="text-center text-gray-400 py-8">
                  No team members added yet. You can add them later too.
                </p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 mt-10">
            {currentStep > 0 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 h-14 border-2 border-gray-200 rounded-2xl font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-semibold shadow-lg shadow-teal-500/30"
              data-testid="wizard-next-btn"
            >
              {loading ? (
                'Saving...'
              ) : currentStep === steps.length - 1 ? (
                'Complete Setup'
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingWizardPage;
