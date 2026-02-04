import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Home, Search, Calendar, User, LayoutDashboard, Settings, Scissors, Bell, Star, MapPin, Clock, Check, Smartphone, X, Menu, Share2, QrCode, BarChart3, Users, CreditCard, MessageSquare, HelpCircle, LogOut, Plus, Filter, MoreVertical, Mail, Lock, Phone, ArrowRight, Eye, EyeOff, Package } from 'lucide-react';

// Mobile App Simulator with Complete Auth Flow
const MobilePreview = () => {
  const [userType, setUserType] = useState('client');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const codeInputs = useRef([]);

  const toast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleLogin = () => {
    if (email && password) {
      setIsLoggedIn(true);
      setCurrentScreen(userType === 'client' ? 'home' : 'dashboard');
      toast('Welcome back! 👋');
    }
  };

  const handleSignup = () => {
    if (name && email && password) {
      setCurrentScreen('phone-verify');
    }
  };

  const handlePhoneVerify = () => {
    if (phone) {
      setCurrentScreen('security-code');
      toast('Code sent to your phone');
    }
  };

  const handleVerifyCode = () => {
    const code = verificationCode.join('');
    if (code.length === 6) {
      setCurrentScreen('signup-success');
    }
  };

  const handleCodeChange = (value, index) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  const navigate = (screen) => setCurrentScreen(screen);

  // ==================== AUTH SCREENS ====================

  // 1. Welcome Screen
  const WelcomeScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="h-[50%] relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80" alt="Salon" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFBF7]" />
      </div>
      <div className="flex-1 px-5 -mt-8 relative z-10 flex flex-col">
        <div className="flex justify-center gap-1.5 mb-4">
          <div className="w-8 h-2 rounded-full bg-[#00BFA5]" />
          <div className="w-2 h-2 rounded-full bg-[#00BFA5]/30" />
          <div className="w-2 h-2 rounded-full bg-[#00BFA5]/30" />
        </div>
        <h1 className="text-2xl font-bold text-[#0A1626] text-center leading-tight">
          Book Your Appointments<br/>Effortlessly
        </h1>
        <p className="text-sm text-[#627D98] text-center mt-2 mb-5">
          Find skilled professionals near you and book with just a few taps.
        </p>
        <button onClick={() => navigate('signup')} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform">
          Get Started
        </button>
        <p className="text-center text-sm text-[#627D98] mt-3">
          Already have an account? <button onClick={() => navigate('login')} className="text-[#00BFA5] font-semibold">Sign in</button>
        </p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => { setUserType('client'); navigate('signup'); }} className="flex-1 py-2.5 rounded-xl border-2 border-[#E2E8F0] text-sm font-semibold text-[#0A1626] active:bg-[#F5F0E8] transition-colors">
            📱 Book Services
          </button>
          <button onClick={() => { setUserType('business'); navigate('signup'); }} className="flex-1 py-2.5 rounded-xl bg-[#1A2B3C] text-white text-sm font-semibold active:bg-[#0A1626] transition-colors">
            💼 For Business
          </button>
        </div>
      </div>
    </div>
  );

  // 2. Sign In Screen
  const SignInScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 pt-3">
      <button onClick={() => navigate('welcome')} className="w-10 h-10 flex items-center justify-center -ml-2 mb-4">
        <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
      </button>
      
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-11 h-11 rounded-xl bg-[#00BFA5] flex items-center justify-center shadow-lg shadow-[#00BFA5]/30">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <span className="text-2xl font-bold text-[#0A1626]">Rezvo</span>
      </div>
      
      <h1 className="text-3xl font-bold text-[#0A1626] mb-1">Sign In</h1>
      <p className="text-[#627D98] mb-6">Welcome back! Please enter your details.</p>
      
      <div className="space-y-4 mb-4">
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter your password"
              className="w-full pl-12 pr-12 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="w-5 h-5 text-[#9FB3C8]" /> : <Eye className="w-5 h-5 text-[#9FB3C8]" />}
            </button>
          </div>
        </div>
        <button onClick={() => navigate('forgot-password')} className="text-sm text-[#00BFA5] font-semibold">Forgot password?</button>
      </div>

      <button onClick={handleLogin} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
        Sign In <ArrowRight className="w-5 h-5" />
      </button>
      
      <p className="text-center text-sm text-[#627D98] mt-4">
        Don't have an account? <button onClick={() => navigate('signup')} className="text-[#00BFA5] font-semibold">Sign up</button>
      </p>
    </div>
  );

  // 3. Sign Up Screen
  const SignUpScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 pt-3 overflow-y-auto">
      <button onClick={() => navigate('login')} className="w-10 h-10 flex items-center justify-center -ml-2 mb-4">
        <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
      </button>
      
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-11 h-11 rounded-xl bg-[#00BFA5] flex items-center justify-center shadow-lg shadow-[#00BFA5]/30">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <span className="text-2xl font-bold text-[#0A1626]">Rezvo</span>
      </div>
      
      <h1 className="text-3xl font-bold text-[#0A1626] mb-1">Sign Up</h1>
      <p className="text-[#627D98] mb-6">Create your account to get started.</p>
      
      <div className="space-y-4 mb-4">
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
            <input 
              type="text" 
              placeholder="Enter your full name"
              className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Create a password"
              className="w-full pl-12 pr-12 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="w-5 h-5 text-[#9FB3C8]" /> : <Eye className="w-5 h-5 text-[#9FB3C8]" />}
            </button>
          </div>
          <p className="text-xs text-[#9FB3C8] mt-1.5">Must be at least 8 characters</p>
        </div>
      </div>

      <button onClick={handleSignup} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
        Continue <ArrowRight className="w-5 h-5" />
      </button>
      
      <p className="text-center text-sm text-[#627D98] mt-4 mb-4">
        Already have an account? <button onClick={() => navigate('login')} className="text-[#00BFA5] font-semibold">Sign in</button>
      </p>
    </div>
  );

  // 4. Phone Verification Screen
  const PhoneVerifyScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 pt-3">
      <button onClick={() => navigate('signup')} className="w-10 h-10 flex items-center justify-center -ml-2 mb-6">
        <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
      </button>
      
      <div className="w-16 h-16 rounded-full bg-[#E8F5F3] flex items-center justify-center mx-auto mb-6">
        <Phone className="w-8 h-8 text-[#00BFA5]" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#0A1626] text-center mb-2">Verify Your Phone</h1>
      <p className="text-[#627D98] text-center mb-6">We'll send a verification code to your phone number.</p>
      
      <div className="mb-6">
        <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
          <input 
            type="tel" 
            placeholder="+44 7123 456789"
            className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handlePhoneVerify} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform">
        Send Code
      </button>
      
      <button onClick={() => navigate('security-code')} className="text-center text-sm text-[#627D98] mt-4">
        Skip for now
      </button>
    </div>
  );

  // 5. Security Code Screen
  const SecurityCodeScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 pt-3">
      <button onClick={() => navigate('phone-verify')} className="w-10 h-10 flex items-center justify-center -ml-2 mb-6">
        <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
      </button>
      
      <div className="w-16 h-16 rounded-full bg-[#E8F5F3] flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-[#00BFA5]" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#0A1626] text-center mb-2">Enter Code</h1>
      <p className="text-[#627D98] text-center mb-6">
        We sent a 6-digit code to<br/><span className="text-[#0A1626] font-semibold">{phone || '+44 7*** ***89'}</span>
      </p>
      
      <div className="flex justify-center gap-2 mb-6">
        {verificationCode.map((digit, i) => (
          <input
            key={i}
            ref={(el) => codeInputs.current[i] = el}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(e.target.value.slice(-1), i)}
            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl bg-white focus:outline-none transition-colors ${
              digit ? 'border-[#00BFA5] bg-[#E8F5F3]' : 'border-[#E2E8F0]'
            }`}
          />
        ))}
      </div>

      <button onClick={handleVerifyCode} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform">
        Verify Code
      </button>
      
      <p className="text-center text-sm text-[#627D98] mt-4">
        Didn't receive code? <button className="text-[#00BFA5] font-semibold">Resend in 30s</button>
      </p>
    </div>
  );

  // 6. Forgot Password Screen
  const ForgotPasswordScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 pt-3">
      <button onClick={() => navigate('login')} className="w-10 h-10 flex items-center justify-center -ml-2 mb-6">
        <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
      </button>
      
      <div className="w-16 h-16 rounded-full bg-[#E8F5F3] flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-[#00BFA5]" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#0A1626] text-center mb-2">Forgot Password?</h1>
      <p className="text-[#627D98] text-center mb-6">No worries! Enter your email and we'll send you a reset code.</p>
      
      <div className="mb-6">
        <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
          <input 
            type="email" 
            placeholder="Enter your email"
            className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <button onClick={() => navigate('mail-confirm')} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform">
        Send Reset Code
      </button>
      
      <p className="text-center text-sm text-[#627D98] mt-4">
        Remember your password? <button onClick={() => navigate('login')} className="text-[#00BFA5] font-semibold">Sign in</button>
      </p>
    </div>
  );

  // 7. Mail Confirm Screen (Code Sent)
  const MailConfirmScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 pt-3">
      <button onClick={() => navigate('forgot-password')} className="w-10 h-10 flex items-center justify-center -ml-2 mb-6">
        <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
      </button>
      
      <div className="w-16 h-16 rounded-full bg-[#E8F5F3] flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8 text-[#00BFA5]" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#0A1626] text-center mb-2">Check Your Email</h1>
      <p className="text-[#627D98] text-center mb-6">
        We've sent a reset code to<br/><span className="text-[#0A1626] font-semibold">{email || 'your@email.com'}</span>
      </p>
      
      <div className="flex justify-center gap-2 mb-6">
        {verificationCode.map((digit, i) => (
          <input
            key={i}
            ref={(el) => codeInputs.current[i] = el}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(e.target.value.slice(-1), i)}
            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl bg-white focus:outline-none transition-colors ${
              digit ? 'border-[#00BFA5] bg-[#E8F5F3]' : 'border-[#E2E8F0]'
            }`}
          />
        ))}
      </div>

      <button onClick={() => navigate('reset-password')} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform">
        Verify Code
      </button>
      
      <p className="text-center text-sm text-[#627D98] mt-4">
        Didn't receive email? <button className="text-[#00BFA5] font-semibold">Resend</button>
      </p>
    </div>
  );

  // 8. Reset Password Screen
  const ResetPasswordScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 pt-3">
      <button onClick={() => navigate('mail-confirm')} className="w-10 h-10 flex items-center justify-center -ml-2 mb-6">
        <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
      </button>
      
      <div className="w-16 h-16 rounded-full bg-[#E8F5F3] flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-[#00BFA5]" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#0A1626] text-center mb-2">Reset Password</h1>
      <p className="text-[#627D98] text-center mb-6">Create a strong new password for your account.</p>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter new password"
              className="w-full pl-12 pr-12 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="w-5 h-5 text-[#9FB3C8]" /> : <Eye className="w-5 h-5 text-[#9FB3C8]" />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Confirm new password"
              className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="bg-[#F5F0E8] rounded-xl p-3">
          <p className="text-xs text-[#627D98] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00BFA5]" /> At least 8 characters
          </p>
          <p className="text-xs text-[#627D98] flex items-center gap-2 mt-1">
            <Check className="w-4 h-4 text-[#9FB3C8]" /> Passwords match
          </p>
        </div>
      </div>

      <button onClick={() => navigate('reset-success')} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform">
        Reset Password
      </button>
    </div>
  );

  // 9. Password Reset Success Screen
  const ResetSuccessScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 justify-center items-center">
      <div className="w-24 h-24 rounded-full bg-[#00BFA5] flex items-center justify-center mb-6 shadow-lg shadow-[#00BFA5]/30">
        <Check className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#0A1626] text-center mb-2">Password Reset!</h1>
      <p className="text-[#627D98] text-center mb-8">
        Your password has been reset successfully.<br/>You can now sign in with your new password.
      </p>
      
      <button onClick={() => navigate('login')} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
        Sign In <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  // 10. Signup Success Screen
  const SignupSuccessScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 justify-center items-center">
      <div className="w-24 h-24 rounded-full bg-[#00BFA5] flex items-center justify-center mb-6 shadow-lg shadow-[#00BFA5]/30">
        <Check className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#0A1626] text-center mb-2">Account Created!</h1>
      <p className="text-[#627D98] text-center mb-8">
        Welcome to Rezvo! Your account has been<br/>created successfully.
      </p>
      
      <button onClick={() => { setIsLoggedIn(true); navigate(userType === 'client' ? 'home' : 'dashboard'); }} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
        Get Started <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  // Bottom Navigation Components
  const ClientBottomNav = ({ active, navigate }) => (
    <div className="flex-shrink-0 bg-white border-t border-[#E2E8F0] px-4 py-2">
      <div className="flex justify-between items-center">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'search', icon: Search, label: 'Search' },
          { id: 'bookings', icon: Calendar, label: 'Bookings' },
          { id: 'profile', icon: User, label: 'Profile' },
        ].map(({ id, icon: Icon, label }) => (
          <button 
            key={id}
            onClick={() => navigate(id)}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${active === id ? 'text-[#00BFA5]' : 'text-[#627D98]'}`}
          >
            <Icon className={`w-5 h-5 ${active === id ? 'fill-[#00BFA5]/20' : ''}`} />
            <span className="text-xs font-medium mt-0.5">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const BusinessBottomNav = ({ active, navigate }) => (
    <div className="flex-shrink-0 bg-white border-t border-[#E2E8F0] px-4 py-2">
      <div className="flex justify-between items-center">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
          { id: 'calendar', icon: Calendar, label: 'Calendar' },
          { id: 'bookings', icon: Clock, label: 'Bookings' },
          { id: 'services', icon: Scissors, label: 'Services' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map(({ id, icon: Icon, label }) => (
          <button 
            key={id}
            onClick={() => navigate('biz-' + id)}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${active === id ? 'text-[#00BFA5]' : 'text-[#627D98]'}`}
          >
            <Icon className={`w-5 h-5 ${active === id ? 'fill-[#00BFA5]/20' : ''}`} />
            <span className="text-[10px] font-medium mt-0.5">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Client Home Screen
  const ClientHomeScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-[#627D98]">Good morning</p>
            <p className="text-xl font-bold text-[#0A1626]">{name || 'User'} 👋</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#0A1626]" />
          </button>
        </div>
        <div className="bg-gradient-to-r from-[#00BFA5] to-[#00A896] rounded-2xl p-4 flex">
          <div className="flex-1 z-10">
            <p className="text-xl font-bold text-white">Get 20% Off</p>
            <p className="text-white/80 text-sm mb-2">Your first booking</p>
            <button className="bg-white text-[#00BFA5] text-sm font-semibold px-4 py-1.5 rounded-full">Book Now</button>
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 overflow-auto">
        <p className="font-semibold text-[#0A1626] mb-2">Popular Categories</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['✂️ Haircut', '💅 Nails', '💪 Fitness', '💄 Beauty'].map((cat, i) => (
            <button key={i} className="flex-shrink-0 bg-white rounded-xl py-2 px-4 text-sm font-medium text-[#0A1626] border border-[#E2E8F0]">{cat}</button>
          ))}
        </div>
        <p className="font-semibold text-[#0A1626] mt-3 mb-2">Top Rated</p>
        {[
          { name: "Sarah's Hair Studio", rating: 4.9, price: 25 },
          { name: 'FitLife PT', rating: 4.8, price: 50 },
          { name: 'Glamour Nails', rating: 5.0, price: 30 },
        ].map((biz, i) => (
          <div key={i} className="bg-white rounded-xl p-3 mb-2 border border-[#E2E8F0]">
            <p className="font-semibold text-sm text-[#0A1626]">{biz.name}</p>
            <div className="flex justify-between items-center mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-[#0A1626]">{biz.rating}</span>
              </div>
              <span className="text-xs font-bold text-[#00BFA5]">From £{biz.price}</span>
            </div>
          </div>
        ))}
      </div>
      <ClientBottomNav active="home" navigate={navigate} />
    </div>
  );

  // Business Dashboard Screen
  const BusinessDashboardScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-[#627D98]">Your Business</p>
            <p className="text-xl font-bold text-[#0A1626]">Dashboard 📊</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#0A1626]" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'Today', value: '5', icon: Calendar, color: '#00BFA5' },
            { label: 'Revenue', value: '£350', icon: CreditCard, color: '#3B82F6' },
            { label: 'Total', value: '128', icon: Users, color: '#8B5CF6' },
            { label: 'Rating', value: '4.9', icon: Star, color: '#F59E0B' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-[#E2E8F0]">
              <stat.icon className="w-5 h-5 mb-1" style={{ color: stat.color }} />
              <p className="text-xl font-bold text-[#0A1626]">{stat.value}</p>
              <p className="text-xs text-[#627D98]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 px-4 overflow-auto">
        <p className="font-semibold text-[#0A1626] mb-2">Today's Schedule</p>
        {[
          { time: '09:00', client: 'Emma Wilson', service: 'Haircut' },
          { time: '10:30', client: 'James Brown', service: 'Beard Trim' },
          { time: '14:00', client: 'Sophie Taylor', service: 'Hair Color' },
        ].map((booking, i) => (
          <div key={i} className="bg-white rounded-xl p-3 mb-2 border border-[#E2E8F0] flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#E8F5F3] flex items-center justify-center">
              <span className="text-sm font-bold text-[#00BFA5]">{booking.time}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#0A1626]">{booking.client}</p>
              <p className="text-xs text-[#627D98]">{booking.service}</p>
            </div>
            <Check className="w-5 h-5 text-[#00BFA5]" />
          </div>
        ))}
      </div>
      <BusinessBottomNav active="dashboard" navigate={navigate} />
    </div>
  );

  // Business Calendar Screen
  const BusinessCalendarScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-[#0A1626]">Calendar</h1>
          <button className="w-10 h-10 rounded-full bg-[#00BFA5] flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <button key={i} className={`flex-1 min-w-[40px] py-2 rounded-lg text-center ${i === 2 ? 'bg-[#00BFA5] text-white' : 'bg-white text-[#0A1626]'}`}>
              <p className="text-xs">{day}</p>
              <p className="text-sm font-bold">{10 + i}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 px-4 overflow-auto">
        {[
          { time: '09:00', client: 'Emma W.', service: 'Haircut', color: '#00BFA5' },
          { time: '10:30', client: 'James B.', service: 'Beard Trim', color: '#3B82F6' },
          { time: '14:00', client: 'Sophie T.', service: 'Hair Color', color: '#8B5CF6' },
        ].map((booking, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <p className="text-xs text-[#627D98] w-10">{booking.time}</p>
            <div className="flex-1 rounded-lg p-2 border-l-4" style={{ backgroundColor: booking.color + '20', borderLeftColor: booking.color }}>
              <p className="font-semibold text-sm text-[#0A1626]">{booking.client}</p>
              <p className="text-xs text-[#627D98]">{booking.service}</p>
            </div>
          </div>
        ))}
      </div>
      <BusinessBottomNav active="calendar" navigate={navigate} />
    </div>
  );

  // Settings Screen
  const SettingsScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-xl font-bold text-[#0A1626] mb-3">Settings</h1>
        <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#00BFA5] flex items-center justify-center text-white text-xl font-bold">
            {name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#0A1626]">{name || 'User Name'}</p>
            <p className="text-sm text-[#627D98]">{email || 'user@example.com'}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 overflow-auto">
        {[
          { icon: User, label: 'Profile', sub: 'Manage your details' },
          { icon: Users, label: 'Team', sub: 'Manage team members' },
          { icon: Bell, label: 'Notifications', sub: 'Push & email alerts' },
          { icon: Share2, label: 'Share Link', sub: 'Get your booking link' },
          { icon: HelpCircle, label: 'Help & Support', sub: 'Get help' },
        ].map(({ icon: Icon, label, sub }, i) => (
          <button key={i} className="w-full bg-white rounded-xl p-3 mb-2 border border-[#E2E8F0] flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-[#E8F5F3] flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#00BFA5]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#0A1626]">{label}</p>
              <p className="text-xs text-[#627D98]">{sub}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#C1C7CD]" />
          </button>
        ))}
        <button onClick={() => { setIsLoggedIn(false); navigate('welcome'); }} className="w-full bg-red-50 rounded-xl p-3 mt-2 flex items-center gap-3">
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-sm text-red-500">Log Out</span>
        </button>
      </div>
      <BusinessBottomNav active="settings" navigate={navigate} />
    </div>
  );

  // Screen Router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome': return <WelcomeScreen />;
      case 'login': return <SignInScreen />;
      case 'signup': return <SignUpScreen />;
      case 'phone-verify': return <PhoneVerifyScreen />;
      case 'security-code': return <SecurityCodeScreen />;
      case 'forgot-password': return <ForgotPasswordScreen />;
      case 'mail-confirm': return <MailConfirmScreen />;
      case 'reset-password': return <ResetPasswordScreen />;
      case 'reset-success': return <ResetSuccessScreen />;
      case 'signup-success': return <SignupSuccessScreen />;
      case 'home': return <ClientHomeScreen />;
      case 'dashboard': return <BusinessDashboardScreen />;
      case 'biz-dashboard': return <BusinessDashboardScreen />;
      case 'biz-calendar': return <BusinessCalendarScreen />;
      case 'biz-settings': return <SettingsScreen />;
      default: return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1626] via-[#1A2B3C] to-[#0A1626] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00BFA5] flex items-center justify-center">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Rezvo Mobile App</h1>
          </div>
          <p className="text-[#9FB3C8] text-lg">Interactive Mobile App Preview</p>
          
          {/* Expo Version Badge */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/10 rounded-full">
            <Smartphone className="w-4 h-4 text-[#00BFA5]" />
            <span className="text-white text-sm">Expo SDK 52 • React Native</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
          {/* Phone Frame */}
          <div className="relative">
            <div className="w-[320px] h-[680px] bg-black rounded-[3rem] p-3 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-7 bg-white z-50 flex items-center justify-between px-6">
                  <span className="text-xs font-semibold text-[#0A1626]">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 border border-[#0A1626] rounded-sm relative">
                      <div className="absolute inset-0.5 bg-[#0A1626] rounded-sm" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>
                
                {/* Screen Content */}
                <div className="pt-7 h-full">
                  {renderScreen()}
                </div>
                
                {/* Home Indicator */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Screen Navigator */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Menu className="w-5 h-5" /> Screen Navigator
            </h3>
            
            <div className="mb-4">
              <p className="text-[#9FB3C8] text-xs uppercase mb-2">Auth Flow</p>
              <div className="flex flex-wrap gap-2">
                {['welcome', 'login', 'signup', 'phone-verify', 'security-code', 'forgot-password', 'mail-confirm', 'reset-password', 'reset-success'].map((screen) => (
                  <button
                    key={screen}
                    onClick={() => navigate(screen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentScreen === screen
                        ? 'bg-[#00BFA5] text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {screen.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-[#9FB3C8] text-xs uppercase mb-2">Client Screens</p>
              <div className="flex flex-wrap gap-2">
                {['home', 'search', 'bookings', 'profile'].map((screen) => (
                  <button
                    key={screen}
                    onClick={() => { setUserType('client'); setIsLoggedIn(true); navigate(screen); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentScreen === screen
                        ? 'bg-[#00BFA5] text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {screen.charAt(0).toUpperCase() + screen.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-[#9FB3C8] text-xs uppercase mb-2">Business Screens</p>
              <div className="flex flex-wrap gap-2">
                {['dashboard', 'calendar', 'bookings', 'services', 'settings'].map((screen) => (
                  <button
                    key={screen}
                    onClick={() => { setUserType('business'); setIsLoggedIn(true); navigate('biz-' + screen); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentScreen === 'biz-' + screen
                        ? 'bg-[#00BFA5] text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {screen.charAt(0).toUpperCase() + screen.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Expo Info */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-[#9FB3C8] text-xs uppercase mb-2">Test on Device</p>
              <a 
                href="/expo-test" 
                target="_blank"
                className="flex items-center gap-2 bg-[#00BFA5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00A896] transition-colors"
              >
                <QrCode className="w-4 h-4" />
                Open Expo QR Code
              </a>
              <p className="text-[#9FB3C8] text-xs mt-2">
                Scan with Expo Go app to test on your phone
              </p>
            </div>
          </div>
        </div>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0A1626] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
            <Check className="w-5 h-5 text-[#00BFA5]" />
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePreview;
