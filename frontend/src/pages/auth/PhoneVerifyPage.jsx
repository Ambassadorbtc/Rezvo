import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Calendar, ArrowLeft, Phone, Loader2, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const PhoneVerifyPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationId, setVerificationId] = useState(null);
  
  const otpInputRefs = useRef([]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Format phone number display
  const formatPhoneDisplay = (num) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhoneNumber(value);
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const fullNumber = `${countryCode}${phoneNumber}`;
      const response = await api.post('/auth/send-otp', { phone: fullNumber });
      
      setVerificationId(response.data.verification_id);
      sessionStorage.setItem('signup_phone', fullNumber);
      setStep('otp');
      setResendTimer(60);
      toast.success('Verification code sent!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    if (pastedData.length === 6) {
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const fullNumber = `${countryCode}${phoneNumber}`;
      await api.post('/auth/verify-otp', { 
        phone: fullNumber, 
        code: otpCode,
        verification_id: verificationId 
      });
      
      // Store verified status and navigate
      sessionStorage.setItem('phone_verified', 'true');
      toast.success('Phone verified successfully!');
      navigate('/complete-profile');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      const fullNumber = `${countryCode}${phoneNumber}`;
      const response = await api.post('/auth/send-otp', { phone: fullNumber });
      setVerificationId(response.data.verification_id);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      toast.success('New code sent!');
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between">
          <Link 
            to={step === 'otp' ? '#' : '/get-started'} 
            onClick={step === 'otp' ? () => setStep('phone') : undefined}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Rezvo</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-teal-500 rounded-full" />
            <div className="flex-1 h-1 bg-gray-200 rounded-full" />
            <div className="flex-1 h-1 bg-gray-200 rounded-full" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Step 2 of 4</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {step === 'phone' ? (
            <>
              {/* Phone Input Step */}
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-teal-600" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
                Enter your phone number
              </h1>
              <p className="text-gray-500 mb-8 text-center">
                We'll send you a verification code
              </p>

              {/* Phone Input */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  {/* Country Code */}
                  <div className="w-24 relative">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full h-14 px-3 bg-white border-2 border-gray-100 rounded-xl text-gray-900 font-medium focus:border-teal-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+353">🇮🇪 +353</option>
                    </select>
                  </div>
                  
                  {/* Phone Number */}
                  <div className="flex-1 relative">
                    <Input
                      type="tel"
                      placeholder="7XXX XXX XXX"
                      value={formatPhoneDisplay(phoneNumber)}
                      onChange={handlePhoneChange}
                      className="w-full h-14 px-4 bg-white border-2 border-gray-100 rounded-xl text-lg font-medium focus:border-teal-500 focus:ring-0 tracking-wide"
                      data-testid="phone-input"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="send-otp-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* OTP Input Step */}
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
                Enter verification code
              </h1>
              <p className="text-gray-500 mb-8 text-center">
                Sent to {countryCode} {formatPhoneDisplay(phoneNumber)}
              </p>

              {/* OTP Inputs */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-gray-900 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    data-testid={`otp-input-${index}`}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otp.some(d => !d)}
                className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30 hover:shadow-xl transition-all disabled:opacity-50"
                data-testid="verify-otp-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              {/* Resend */}
              <div className="mt-6 text-center">
                {resendTimer > 0 ? (
                  <p className="text-gray-400 text-sm">
                    Resend code in <span className="font-semibold text-gray-600">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-teal-600 font-semibold text-sm hover:text-teal-700 flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resend Code
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PhoneVerifyPage;
