import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar, ArrowLeft, Phone, Mail, Loader2, Check, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState(null); // 'phone' | 'email'
  const [step, setStep] = useState('choose'); // 'choose' | 'phone' | 'email' | 'otp' | 'emailCode' | 'newPassword'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationId, setVerificationId] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const otpInputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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
      const response = await api.post('/auth/forgot-password/send-otp', { phone: fullNumber });
      
      setVerificationId(response.data.verification_id);
      setStep('otp');
      setResendTimer(60);
      toast.success('Verification code sent!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No account found with this phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('emailCode');
      setResendTimer(60);
      toast.success('Reset code sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-reset-code', { email, code });
      setResetToken(response.data.reset_token);
      toast.success('Code verified!');
      setStep('newPassword');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
      await api.post('/auth/forgot-password/verify-otp', { 
        phone: fullNumber, 
        code: otpCode,
        verification_id: verificationId 
      });
      
      toast.success('Code verified!');
      setStep('newPassword');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (passwords.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (passwords.password !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (method === 'phone') {
        const fullNumber = `${countryCode}${phoneNumber}`;
        await api.post('/auth/forgot-password/reset', { 
          phone: fullNumber, 
          verification_id: verificationId,
          new_password: passwords.password
        });
      } else {
        await api.post('/auth/reset-password', { 
          token: resetToken,
          new_password: passwords.password
        });
      }
      
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      const fullNumber = `${countryCode}${phoneNumber}`;
      const response = await api.post('/auth/forgot-password/send-otp', { phone: fullNumber });
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

  const getBackAction = () => {
    if (step === 'otp') return () => setStep('phone');
    if (step === 'newPassword') return () => setStep('otp');
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between">
          <Link 
            to={step === 'phone' ? '/login' : '#'}
            onClick={step !== 'phone' ? getBackAction() : undefined}
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
            <div className={`flex-1 h-1 rounded-full ${step !== 'phone' ? 'bg-teal-500' : 'bg-teal-500'}`} />
            <div className={`flex-1 h-1 rounded-full ${step === 'otp' || step === 'newPassword' ? 'bg-teal-500' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-1 rounded-full ${step === 'newPassword' ? 'bg-teal-500' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {step === 'phone' && (
            <>
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
                Reset your password
              </h1>
              <p className="text-gray-500 mb-8 text-center">
                Enter your phone number and we'll send you a code
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-24">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full h-14 px-3 bg-white border-2 border-gray-100 rounded-xl text-gray-900 font-medium focus:border-teal-500 focus:outline-none"
                    >
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+353">🇮🇪 +353</option>
                    </select>
                  </div>
                  <Input
                    type="tel"
                    placeholder="7XXX XXX XXX"
                    value={formatPhoneDisplay(phoneNumber)}
                    onChange={handlePhoneChange}
                    className="flex-1 h-14 px-4 bg-white border-2 border-gray-100 rounded-xl text-lg font-medium focus:border-teal-500 tracking-wide"
                    data-testid="forgot-phone-input"
                  />
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30"
                  data-testid="forgot-send-otp-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Code'
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-teal-600" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
                Enter verification code
              </h1>
              <p className="text-gray-500 mb-8 text-center">
                Sent to {countryCode} {formatPhoneDisplay(phoneNumber)}
              </p>

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
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-gray-900 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:outline-none"
                    data-testid={`forgot-otp-${index}`}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otp.some(d => !d)}
                className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30"
                data-testid="forgot-verify-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

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

          {step === 'newPassword' && (
            <>
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 text-center">
                Create new password
              </h1>
              <p className="text-gray-500 mb-8 text-center">
                Enter your new password below
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={passwords.password}
                      onChange={(e) => setPasswords(p => ({ ...p, password: e.target.value }))}
                      className="h-14 px-4 pr-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500"
                      data-testid="new-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="h-14 px-4 pr-12 bg-white border-2 border-gray-100 rounded-xl focus:border-teal-500"
                      data-testid="confirm-new-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-teal-500/30"
                  data-testid="reset-password-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
