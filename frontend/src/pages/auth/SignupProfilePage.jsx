import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar, ArrowLeft, User, Building2, MapPin, Hash, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

// Alternating business images
const BUSINESS_IMAGES = [
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800', // Barbershop
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', // Spa/massage
  'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=800', // Nail salon
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', // Gym
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', // Hair stylist
];

const SignupProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentImageIndex] = useState(Math.floor(Math.random() * BUSINESS_IMAGES.length));
  
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    address: '',
    postcode: ''
  });

  // Check if auth method was selected
  useEffect(() => {
    const authMethod = sessionStorage.getItem('auth_method');
    if (!authMethod) {
      navigate('/signup');
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    // Validation
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.businessName.trim()) {
      toast.error('Please enter your business name');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your business address');
      return;
    }
    if (!formData.postcode.trim()) {
      toast.error('Please enter your postcode');
      return;
    }

    // Store profile data
    sessionStorage.setItem('signup_profile', JSON.stringify(formData));
    
    // Navigate to phone verification
    navigate('/signup/verify-phone');
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
            Tell us about your business
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            We'll use this information to set up your booking page and help customers find you.
          </p>
          
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-8 h-1.5 bg-teal-500 rounded-full" />
              <div className="w-8 h-1.5 bg-teal-500 rounded-full" />
              <div className="w-8 h-1.5 bg-white/30 rounded-full" />
              <div className="w-8 h-1.5 bg-white/30 rounded-full" />
            </div>
            <span className="text-sm text-white/60">Step 2 of 4</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <button 
            onClick={() => navigate('/signup')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Rezvo</span>
          </Link>
          
          <div className="w-16" />
        </header>

        {/* Progress for mobile */}
        <div className="px-6 lg:hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-gray-200 rounded-full" />
            <div className="flex-1 h-1 bg-gray-200 rounded-full" />
          </div>
          <p className="text-xs text-gray-400">Step 2 of 4</p>
        </div>

        {/* Form Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Your business details
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Help us personalize your experience
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

              {/* Street Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Street Address</Label>
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

              {/* Postcode */}
              <div className="space-y-2">
                <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">Postcode</Label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="postcode"
                    placeholder="SW1A 1AA"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
                    className="h-14 pl-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0 uppercase"
                    maxLength={8}
                    data-testid="postcode-input"
                  />
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={loading}
                className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30 mt-4"
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignupProfilePage;
