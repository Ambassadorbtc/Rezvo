import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Home, Search, Calendar, User, LayoutDashboard, Settings, Scissors, Bell, Star, MapPin, Clock, Check, Smartphone, Menu, Share2, QrCode, Users, CreditCard, LogOut, Plus, Mail, Lock, Phone, ArrowRight, Eye, EyeOff, TrendingUp, Grid } from 'lucide-react';

// Mobile App Simulator - Matches Actual Expo App
const MobilePreview = () => {
  const [userType, setUserType] = useState('business');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
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
      setCurrentScreen(userType === 'client' ? 'client-home' : 'biz-dashboard');
      toast('Welcome back! 👋');
    }
  };

  const handleSignup = () => {
    if (email && password) {
      setCurrentScreen('phone-verify');
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

  // ==================== WELCOME SCREEN (Premium Design) ====================
  const WelcomeScreen = () => (
    <div className="h-full relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90" />
      </div>
      
      <div className="relative h-full flex flex-col px-6 pt-12 pb-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00BFA5] flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">rezvo</span>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-end pb-5">
          <div className="mb-3">
            <p className="text-[34px] font-bold text-white leading-[40px] tracking-tight">Your time,</p>
            <p className="text-[34px] font-bold text-white leading-[40px] tracking-tight">beautifully</p>
            <p className="text-[34px] font-bold text-[#00BFA5] leading-[40px] tracking-tight">booked.</p>
          </div>
          
          <p className="text-sm text-white/60 leading-5 mb-5">
            The smarter way to manage<br/>appointments for your business
          </p>
          
          <button 
            onClick={() => navigate('signup')}
            className="w-full h-12 bg-white text-[#0A1626] rounded-3xl font-semibold text-[15px] flex items-center justify-center gap-2 mb-3"
          >
            Get Started
            <ArrowRight className="w-4 h-4 text-[#00BFA5]" />
          </button>
          
          <button 
            onClick={() => navigate('login')}
            className="text-center text-white/70 text-sm font-medium py-2"
          >
            Sign in
          </button>
        </div>
        
        {/* Bottom Quick Actions */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">continue as</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>
          
          <div className="flex gap-2.5">
            <button 
              onClick={() => { setUserType('client'); navigate('login'); }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/95 py-3 rounded-xl"
            >
              <User className="w-4 h-4 text-[#00BFA5]" />
              <span className="text-sm font-semibold text-[#0A1626]">Client</span>
            </button>
            <button 
              onClick={() => { setUserType('business'); navigate('signup'); }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/95 py-3 rounded-xl"
            >
              <LayoutDashboard className="w-4 h-4 text-[#00BFA5]" />
              <span className="text-sm font-semibold text-[#0A1626]">Business</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== LOGIN SCREEN ====================
  const LoginScreen = () => (
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
      
      <h1 className="text-3xl font-bold text-[#0A1626] mb-1">Welcome Back</h1>
      <p className="text-[#627D98] mb-5">Sign in to your account</p>
      
      {/* User Type Toggle */}
      <div className="flex bg-[#F5F0E8] rounded-xl p-1 mb-5">
        <button 
          onClick={() => setUserType('client')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${userType === 'client' ? 'bg-white shadow-md text-[#0A1626]' : 'text-[#627D98]'}`}
        >
          <User className="w-4 h-4" /> Client
        </button>
        <button 
          onClick={() => setUserType('business')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${userType === 'business' ? 'bg-white shadow-md text-[#0A1626]' : 'text-[#627D98]'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Business
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none"
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
              className="w-full pl-12 pr-12 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none"
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

      <button onClick={handleLogin} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30">
        Log in
      </button>
      
      <p className="text-center text-sm text-[#627D98] mt-4">
        Don't have an account? <button onClick={() => navigate('signup')} className="text-[#00BFA5] font-semibold">Sign up</button>
      </p>
    </div>
  );

  // ==================== SIGNUP SCREEN ====================
  const SignUpScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 pt-3 overflow-y-auto">
      <button onClick={() => navigate('welcome')} className="w-10 h-10 flex items-center justify-center -ml-2 mb-4">
        <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
      </button>
      
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-11 h-11 rounded-xl bg-[#00BFA5] flex items-center justify-center shadow-lg shadow-[#00BFA5]/30">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <span className="text-2xl font-bold text-[#0A1626]">Rezvo</span>
      </div>
      
      <h1 className="text-3xl font-bold text-[#0A1626] mb-1">Create Account</h1>
      <p className="text-[#627D98] mb-5">Sign up to get started</p>
      
      <div className="space-y-4 mb-4">
        {userType === 'business' && (
          <div>
            <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Business Name</label>
            <div className="relative">
              <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
              <input 
                type="text" 
                placeholder="Your business name"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          </div>
        )}
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9FB3C8]" />
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none"
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
              className="w-full pl-12 pr-12 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none"
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

      <button onClick={handleSignup} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 flex items-center justify-center gap-2">
        Continue <ArrowRight className="w-5 h-5" />
      </button>
      
      <p className="text-center text-sm text-[#627D98] mt-4 mb-4">
        Already have an account? <button onClick={() => navigate('login')} className="text-[#00BFA5] font-semibold">Sign in</button>
      </p>
    </div>
  );

  // ==================== PHONE VERIFY SCREEN ====================
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
            className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <button onClick={() => { toast('Code sent!'); navigate('security-code'); }} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30">
        Send Code
      </button>
      
      <button onClick={() => navigate('signup-success')} className="text-center text-sm text-[#627D98] mt-4">Skip for now</button>
    </div>
  );

  // ==================== SECURITY CODE SCREEN ====================
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
            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl bg-white focus:outline-none ${
              digit ? 'border-[#00BFA5] bg-[#E8F5F3]' : 'border-[#E2E8F0]'
            }`}
          />
        ))}
      </div>

      <button onClick={() => navigate('signup-success')} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30">
        Verify Code
      </button>
      
      <p className="text-center text-sm text-[#627D98] mt-4">
        Didn't receive code? <button className="text-[#00BFA5] font-semibold">Resend</button>
      </p>
    </div>
  );

  // ==================== FORGOT PASSWORD ====================
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
            className="w-full pl-12 pr-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <button onClick={() => navigate('reset-code')} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30">
        Send Reset Code
      </button>
      
      <p className="text-center text-sm text-[#627D98] mt-4">
        Remember your password? <button onClick={() => navigate('login')} className="text-[#00BFA5] font-semibold">Sign in</button>
      </p>
    </div>
  );

  // ==================== RESET SUCCESS ====================
  const SignupSuccessScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 justify-center items-center">
      <div className="w-24 h-24 rounded-full bg-[#00BFA5] flex items-center justify-center mb-6 shadow-lg shadow-[#00BFA5]/30">
        <Check className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-2xl font-bold text-[#0A1626] text-center mb-2">Account Created!</h1>
      <p className="text-[#627D98] text-center mb-8">
        Welcome to Rezvo! Your account has been<br/>created successfully.
      </p>
      
      <button onClick={() => { setIsLoggedIn(true); navigate(userType === 'client' ? 'client-home' : 'biz-dashboard'); }} className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 flex items-center justify-center gap-2">
        Get Started <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  // ==================== BUSINESS DASHBOARD (Matches Expo) ====================
  const BusinessDashboardScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-[#627D98]">Welcome back 👋</p>
            <p className="text-xl font-bold text-[#0A1626]">{businessName || 'Your Business'}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#0A1626]" />
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[#E8F5F3] rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl bg-[#00BFA5]/20 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-[#00BFA5]" />
            </div>
            <p className="text-2xl font-bold text-[#0A1626]">5</p>
            <p className="text-sm text-[#627D98]">Today</p>
          </div>
          <div className="bg-[#FEF3E2] rounded-2xl p-4">
            <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <p className="text-2xl font-bold text-[#0A1626]">2</p>
            <p className="text-sm text-[#627D98]">Pending</p>
          </div>
        </div>
        
        {/* Revenue Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] flex items-center mb-3">
          <div className="flex-1">
            <p className="text-sm text-[#627D98]">This Month</p>
            <p className="text-3xl font-bold text-[#0A1626]">£1,250</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#10B981]" />
          </div>
        </div>
        
        {/* Share Link */}
        <button className="w-full bg-[#00BFA5] rounded-2xl p-4 flex items-center">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mr-3">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-white">Share Your Booking Link</p>
            <p className="text-sm text-white/80">Let customers book directly</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {/* Today's Schedule */}
      <div className="flex-1 px-4 overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-[#0A1626]">Today's Schedule</p>
          <button className="text-sm text-[#00BFA5] font-semibold">See all</button>
        </div>
        
        {[
          { time: '09:00', client: 'Emma Wilson', service: 'Haircut', status: 'confirmed' },
          { time: '10:30', client: 'James Brown', service: 'Beard Trim', status: 'pending' },
          { time: '14:00', client: 'Sophie Taylor', service: 'Hair Color', status: 'confirmed' },
        ].map((booking, i) => (
          <div key={i} className="bg-white rounded-xl p-3 mb-2 border border-[#E2E8F0] flex items-center">
            <div className="w-14 pr-3 border-r border-[#E2E8F0]">
              <span className="text-sm font-semibold text-[#00BFA5]">{booking.time}</span>
            </div>
            <div className="flex-1 ml-3">
              <p className="font-semibold text-sm text-[#0A1626]">{booking.client}</p>
              <p className="text-xs text-[#627D98]">{booking.service}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
              {booking.status}
            </span>
          </div>
        ))}
        
        {/* Quick Actions */}
        <div className="flex gap-3 mt-4 mb-8">
          {[
            { icon: Scissors, label: 'Services', bg: '#EDE9FE', color: '#8B5CF6' },
            { icon: Calendar, label: 'Calendar', bg: '#DBEAFE', color: '#3B82F6' },
            { icon: Settings, label: 'Settings', bg: '#FEE2E2', color: '#EF4444' },
          ].map(({ icon: Icon, label, bg, color }, i) => (
            <button key={i} className="flex-1 bg-white rounded-2xl p-3 border border-[#E2E8F0] flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-xs font-medium text-[#627D98]">{label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <BusinessBottomNav active="dashboard" navigate={navigate} />
    </div>
  );

  // ==================== CLIENT HOME ====================
  const ClientHomeScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-[#627D98]">Good morning</p>
            <p className="text-xl font-bold text-[#0A1626]">{name || 'User'} 👋</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#0A1626]" />
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-[#00BFA5] to-[#00A896] rounded-2xl p-4 mb-3">
          <p className="text-xl font-bold text-white">Get 20% Off</p>
          <p className="text-white/80 text-sm mb-3">Your first booking</p>
          <button className="bg-white text-[#00BFA5] text-sm font-semibold px-4 py-1.5 rounded-full">Book Now</button>
        </div>
      </div>
      
      <div className="flex-1 px-4 overflow-auto">
        <p className="font-semibold text-[#0A1626] mb-2">Popular Categories</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {['✂️ Haircut', '💅 Nails', '💪 Fitness', '💄 Beauty'].map((cat, i) => (
            <button key={i} className="flex-shrink-0 bg-white rounded-xl py-2 px-4 text-sm font-medium text-[#0A1626] border border-[#E2E8F0]">{cat}</button>
          ))}
        </div>
        
        <p className="font-semibold text-[#0A1626] mb-2">Top Rated</p>
        {[
          { name: "Sarah's Hair Studio", rating: 4.9, price: 25 },
          { name: 'FitLife PT', rating: 4.8, price: 50 },
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

  // ==================== BOTTOM NAVS ====================
  const ClientBottomNav = ({ active, navigate }) => (
    <div className="flex-shrink-0 bg-white border-t border-[#E2E8F0] px-4 py-2">
      <div className="flex justify-between items-center">
        {[
          { id: 'client-home', icon: Home, label: 'Home' },
          { id: 'search', icon: Search, label: 'Search' },
          { id: 'bookings', icon: Calendar, label: 'Bookings' },
          { id: 'profile', icon: User, label: 'Profile' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => navigate(id)} className={`flex flex-col items-center py-1 px-3 ${active === id.replace('client-', '') ? 'text-[#00BFA5]' : 'text-[#627D98]'}`}>
            <Icon className="w-5 h-5" />
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
          { id: 'biz-dashboard', icon: Grid, label: 'Home' },
          { id: 'biz-calendar', icon: Calendar, label: 'Calendar' },
          { id: 'biz-bookings', icon: Clock, label: 'Bookings' },
          { id: 'biz-services', icon: Scissors, label: 'Services' },
          { id: 'biz-settings', icon: Settings, label: 'Settings' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => navigate(id)} className={`flex flex-col items-center py-1 px-2 ${active === id.replace('biz-', '') ? 'text-[#00BFA5]' : 'text-[#627D98]'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Screen Router
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome': return <WelcomeScreen />;
      case 'login': return <LoginScreen />;
      case 'signup': return <SignUpScreen />;
      case 'phone-verify': return <PhoneVerifyScreen />;
      case 'security-code': return <SecurityCodeScreen />;
      case 'forgot-password': return <ForgotPasswordScreen />;
      case 'signup-success': return <SignupSuccessScreen />;
      case 'client-home': return <ClientHomeScreen />;
      case 'biz-dashboard': return <BusinessDashboardScreen />;
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
          <p className="text-[#9FB3C8] text-lg">Interactive Preview - Matches Expo Build</p>
          
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/10 rounded-full">
            <Smartphone className="w-4 h-4 text-[#00BFA5]" />
            <span className="text-white text-sm">Expo SDK 52 • React Native 0.76</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
          {/* Phone Frame */}
          <div className="relative">
            <div className="w-[320px] h-[680px] bg-black rounded-[3rem] p-3 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-7 bg-black/5 z-50 flex items-center justify-between px-6">
                  <span className="text-xs font-semibold text-[#0A1626]">9:41</span>
                  <div className="w-4 h-2 border border-[#0A1626] rounded-sm relative">
                    <div className="absolute inset-0.5 bg-[#0A1626] rounded-sm" style={{ width: '70%' }} />
                  </div>
                </div>
                <div className="pt-7 h-full">{renderScreen()}</div>
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
                {['welcome', 'login', 'signup', 'phone-verify', 'security-code', 'forgot-password', 'signup-success'].map((screen) => (
                  <button
                    key={screen}
                    onClick={() => { setIsLoggedIn(false); navigate(screen); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentScreen === screen ? 'bg-[#00BFA5] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {screen.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-[#9FB3C8] text-xs uppercase mb-2">Client App</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setUserType('client'); setIsLoggedIn(true); navigate('client-home'); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${currentScreen === 'client-home' ? 'bg-[#00BFA5] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>Home</button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-[#9FB3C8] text-xs uppercase mb-2">Business App</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setUserType('business'); setIsLoggedIn(true); navigate('biz-dashboard'); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${currentScreen === 'biz-dashboard' ? 'bg-[#00BFA5] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>Dashboard</button>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-[#9FB3C8] text-xs uppercase mb-2">Test on Device</p>
              <a href="/expo-test" className="flex items-center gap-2 bg-[#00BFA5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00A896] transition-colors">
                <QrCode className="w-4 h-4" /> Open Expo QR Code
              </a>
              <p className="text-[#9FB3C8] text-xs mt-2">Scan with Expo Go app</p>
            </div>
          </div>
        </div>

        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0A1626] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
            <Check className="w-5 h-5 text-[#00BFA5]" /> {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePreview;
