import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import './NewSignupPage.css';

const BUSINESS_TYPES = [
  { id: 'hairdresser', label: 'Hairdresser', emoji: '✂️' },
  { id: 'barber', label: 'Barber Shop', emoji: '💈' },
  { id: 'beauty', label: 'Beauty Salon', emoji: '💅' },
  { id: 'nails', label: 'Nail Tech', emoji: '💄' },
  { id: 'lashes', label: 'Lash & Brow', emoji: '👁️' },
  { id: 'massage', label: 'Massage', emoji: '💆' },
  { id: 'personal_trainer', label: 'Personal Trainer', emoji: '💪' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'physiotherapy', label: 'Physiotherapy', emoji: '🏥' },
  { id: 'driving', label: 'Driving', emoji: '🚗' },
  { id: 'dog_grooming', label: 'Dog Groomer', emoji: '🐕' },
  { id: 'pet_services', label: 'Pet Services', emoji: '🐾' },
  { id: 'photography', label: 'Photographer', emoji: '📸' },
  { id: 'music', label: 'Music Teacher', emoji: '🎵' },
  { id: 'tutoring', label: 'Tutor / Coach', emoji: '📚' },
  { id: 'tattoo', label: 'Tattoo Artist', emoji: '🎨' },
  { id: 'cleaning', label: 'Cleaning', emoji: '🧹' },
  { id: 'handyman', label: 'Handyman', emoji: '🔧' },
  { id: 'other', label: 'Other', emoji: '🎯' },
];

const THEME_COLORS = [
  { id: 'teal', color: '#00BFA5' },
  { id: 'blue', color: '#3B82F6' },
  { id: 'purple', color: '#8B5CF6' },
  { id: 'pink', color: '#EC4899' },
  { id: 'orange', color: '#F59E0B' },
  { id: 'navy', color: '#0A1626' },
];

export default function NewSignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  
  // Check for step parameter from Google auth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    if (stepParam) {
      setStep(parseInt(stepParam, 10));
      // Check if coming from Google auth
      if (sessionStorage.getItem('auth_method') === 'google') {
        setIsGoogleAuth(true);
        const googleEmail = sessionStorage.getItem('google_user_email');
        const googleName = sessionStorage.getItem('google_user_name');
        if (googleEmail) setEmail(googleEmail);
        if (googleName) {
          const names = googleName.split(' ');
          setFirstName(names[0] || '');
          setLastName(names.slice(1).join(' ') || '');
        }
      }
    }
  }, [location]);
  
  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [verificationId, setVerificationId] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [businessType, setBusinessType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [themeColor, setThemeColor] = useState('#00BFA5');
  const [notifications, setNotifications] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  
  // OTP input refs
  const otpRefs = useRef([]);
  
  // Overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');

  const fullPhone = `${countryCode}${phone.replace(/\s/g, '')}`;

  // Navigate to step
  const goToStep = (newStep) => {
    setError('');
    setStep(newStep);
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/send-otp', { phone: fullPhone });
      setVerificationId(response.data.verification_id);
      goToStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', {
        phone: fullPhone,
        verification_id: verificationId,
        code: code
      });
      goToStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/send-otp', { phone: fullPhone });
      setVerificationId(response.data.verification_id);
      setOtpCode(['', '', '', '', '', '']);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In via Emergent Auth
  const handleGoogleSignIn = () => {
    setShowOverlay(true);
    setOverlayMessage('Connecting Google...');
    
    // Store signup state
    sessionStorage.setItem('signup_user_type', 'business');
    sessionStorage.setItem('auth_method', 'google');
    sessionStorage.setItem('signup_phone', fullPhone);
    sessionStorage.setItem('signup_verification_id', verificationId);
    sessionStorage.setItem('signup_profile', JSON.stringify({
      businessType,
      firstName,
      lastName,
      businessName,
      address,
      city,
      postcode,
      themeColor,
    }));
    
    // Short delay to show the overlay, then redirect
    setTimeout(() => {
      const redirectUrl = window.location.origin + '/auth-callback';
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    }, 1500);
  };

  // Complete Registration
  const handleComplete = async () => {
    // For Google auth, we don't need password
    if (!isGoogleAuth) {
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (!verificationId) {
        setError('Please verify your phone number first');
        return;
      }
    }
    
    if (!businessName) {
      setError('Please enter your business name');
      return;
    }
    
    setLoading(true);
    setError('');
    setShowOverlay(true);
    setOverlayMessage('Creating your account...');
    
    try {
      // For Google auth users, they're already logged in, just need to update profile
      if (isGoogleAuth) {
        // Update user profile
        await api.put('/users/me', {
          full_name: `${firstName} ${lastName}`.trim(),
          business_name: businessName,
          address: address ? `${address}, ${city} ${postcode}`.trim() : null,
          business_type: businessType,
        });
        
        // Create/update business
        try {
          await api.post('/businesses', {
            name: businessName,
            type: businessType,
            address: address,
            city: city,
            postcode: postcode,
            theme_color: themeColor,
          });
        } catch (e) {
          // Business might already exist, try update
          console.log('Business creation note:', e);
        }
        
        setOverlayMessage('All set!');
        setTimeout(() => {
          setShowOverlay(false);
          goToStep(8);
        }, 1500);
      } else {
        // Email registration
        const registrationData = {
          email: email,
          password: password,
          full_name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
          business_name: businessName,
          address: address ? `${address}, ${city} ${postcode}`.trim() : null,
          phone: fullPhone,
          auth_method: 'email'
        };

        const response = await api.post('/auth/register', registrationData);
      
        // Save auth token
        localStorage.setItem('rezvo_token', response.data.token);
        
        // Fetch user data after registration
        const userResponse = await api.get('/users/me');
        localStorage.setItem('rezvo_user', JSON.stringify(userResponse.data));
        updateUser(userResponse.data);
      
        setOverlayMessage('Account created!');
        setTimeout(() => {
          setShowOverlay(false);
          goToStep(8);
        }, 1500);
      }
    } catch (err) {
      setShowOverlay(false);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (step === 3 && otpCode.every(d => d !== '') && otpCode.length === 6) {
      handleVerifyOtp();
    }
  }, [otpCode, step]);

  // Select business type
  const selectType = (id) => {
    setBusinessType(id);
  };

  // Select theme color
  const selectColor = (color) => {
    setThemeColor(color);
  };

  // Get page class
  const getPageClass = (pageNum) => {
    if (pageNum === step) return 'page on';
    if (pageNum < step) return 'page off';
    return 'page';
  };

  return (
    <div className="signup-container">
      {/* ═══ PAGE 1: WELCOME ═══ */}
      <div className={getPageClass(1)} id="p1">
        <div className="left">
          <div className="orb o1"></div>
          <div className="orb o2"></div>
          <img src="/showcase/rezi-wave.png" className="fox fox-bounce" style={{width: 320, height: 320}} data-d="1" alt="Rezi" />
          <h2 className="d" data-d="2">Local bookings,<br/><span className="tl">faff-free.</span></h2>
          <p data-d="3">The smart reservation platform that helps you discover, book, and enjoy the best local spots.</p>
          <div className="testimonial" data-d="4">
            <div className="stars">★★★★★</div>
            <q>Setting up was actually fun. I didn't think that was possible for business software.</q>
            <div className="who">Mike T. <span className="role">from The Daily Grind</span></div>
          </div>
        </div>
        <div className="right">
          <div className="logo" data-d="1">
            <div className="logo-box">R</div>
            <span className="logo-text">Rezvo</span>
          </div>
          <img src="/showcase/rezi-wave.png" style={{width: 140, height: 140}} className="fox fox-bounce" data-d="2" alt="Rezi" />
          <h1 className="d form-title" data-d="3">Hey there! <span style={{color: 'var(--t)'}}>I'm Rezi.</span></h1>
          <p className="form-sub" data-d="3">I'll help you set up your booking page in under a minute. No faff, I promise.</p>
          <button className="btn btn-p" data-d="4" onClick={() => goToStep(2)}>Let's go! →</button>
          <button className="btn btn-o mt" data-d="5" onClick={() => navigate('/login')}>I already have an account</button>
          <div className="trust" data-d="6">🛡 SECURE · NO SPAM · FREE FOREVER</div>
        </div>
      </div>

      {/* ═══ PAGE 2: PHONE ═══ */}
      <div className={getPageClass(2)} id="p2">
        <div className="left">
          <div className="orb o1"></div>
          <div className="orb o2"></div>
          <h2 className="d" data-d="2">Quick verification,<br/><span className="tl">then we're in.</span></h2>
          <p data-d="3">We just need to verify your number. Takes 10 seconds.</p>
        </div>
        <div className="right">
          <img src="/showcase/rezi-peek.png" className="fox-border-peek fox-border-anim" style={{width: 220, height: 220}} data-d="1" alt="Rezi" />
          <div className="back" onClick={() => goToStep(1)}>←</div>
          <div className="logo"><div className="logo-box">R</div><span className="logo-text">Rezvo</span></div>
          <div className="prog" data-d="1"><div className="b a"></div><div className="b"></div><div className="b"></div><div className="b"></div></div>
          <h1 className="d form-title" data-d="2">What's your number?</h1>
          <p className="form-sub" data-d="2">We'll send you a quick code to verify</p>
          {error && <div className="error-msg" data-d="2">{error}</div>}
          <div className="field-row" data-d="3">
            <div className="field" style={{maxWidth: 90}}>
              <label>Country</label>
              <input value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{textAlign: 'center'}} />
            </div>
            <div className="field">
              <label>Phone number</label>
              <input type="tel" placeholder="7700 900 000" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-p" data-d="4" onClick={handleSendOtp} disabled={loading}>
            {loading ? 'Sending...' : 'Send code →'}
          </button>
          <p style={{color: '#9FB3C8', fontSize: 11, marginTop: 10, textAlign: 'center'}} data-d="5">We'll text you a 6-digit code. Standard rates may apply.</p>
        </div>
      </div>

      {/* ═══ PAGE 3: OTP ═══ */}
      <div className={getPageClass(3)} id="p3">
        <div className="left" style={{position: 'relative'}}>
          <div className="orb o1"></div>
          <div className="orb o2"></div>
          <h2 className="d" data-d="2">Check your<br/><span className="tl">messages! 📱</span></h2>
          <p data-d="3">We've sent a 6-digit code to your phone. Enter it to continue.</p>
          <img src="/showcase/rezi-thumbsup.png" className="fox fox-popup" style={{width: 280, height: 280, position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)'}} data-d="1" alt="Rezi" />
        </div>
        <div className="right">
          <div className="back" onClick={() => goToStep(2)}>←</div>
          <div className="logo"><div className="logo-box">R</div><span className="logo-text">Rezvo</span></div>
          <div className="prog" data-d="1"><div className="b a"></div><div className="b a"></div><div className="b"></div><div className="b"></div></div>
          <h1 className="d form-title" data-d="2">Enter the code</h1>
          <p className="form-sub" data-d="2">Sent to {countryCode} {phone.substring(0,4)} ••• •••</p>
          {error && <div className="error-msg" data-d="2">{error}</div>}
          <div className="otp-r" data-d="3">
            {otpCode.map((digit, idx) => (
              <input
                key={idx}
                ref={el => otpRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(idx, e)}
                className={`otp-b ${digit ? 'f' : ''}`}
              />
            ))}
          </div>
          <button style={{background: 'none', border: 'none', color: 'var(--t)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12}} data-d="4" onClick={handleResendOtp} disabled={loading}>
            Resend code
          </button>
          <button className="btn btn-p" data-d="5" onClick={handleVerifyOtp} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify →'}
          </button>
        </div>
      </div>

      {/* ═══ PAGE 4: GOOGLE AUTH ═══ */}
      <div className={getPageClass(4)} id="p4">
        <div className="left">
          <div className="orb o1"></div>
          <div className="orb o2"></div>
          <h2 className="d" data-d="2">Almost there!<br/><span className="tl">One more step.</span></h2>
          <p data-d="3">Connect your Google account for a seamless sign-in experience.</p>
        </div>
        <div className="right">
          <img src="/showcase/rezi-peek.png" className="fox-border-peek fox-border-anim" style={{width: 220, height: 220}} data-d="1" alt="Rezi" />
          <div className="back" onClick={() => goToStep(3)}>←</div>
          <button className="skip" onClick={() => goToStep(5)}>Skip for now</button>
          <div className="logo"><div className="logo-box">R</div><span className="logo-text">Rezvo</span></div>
          <div className="prog" data-d="1"><div className="b a"></div><div className="b a"></div><div className="b a"></div><div className="b"></div></div>
          <h1 className="d form-title" data-d="2">One more thing</h1>
          <p className="form-sub" data-d="2">Connect Google for a seamless experience</p>
          <button className="g-btn" data-d="3" onClick={handleGoogleSignIn}>
            <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <div className="divider"><span>or</span></div>
          <button className="btn btn-o" data-d="4" onClick={() => goToStep(5)}>Continue with email</button>
        </div>
      </div>

      {/* ═══ PAGE 5: BUSINESS TYPE ═══ */}
      <div className={getPageClass(5)} id="p5">
        <div className="left" style={{position: 'relative'}}>
          <div className="orb o1"></div>
          <div className="orb o2"></div>
          <h2 className="d" data-d="2">What's your<br/><span className="tl">vibe?</span></h2>
          <p data-d="3">Tell us about your business so we can set things up perfectly for you.</p>
          <img src="/showcase/rezi-thumbsup.png" className="fox fox-popup" style={{width: 280, height: 280, position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)'}} data-d="1" alt="Rezi" />
        </div>
        <div className="right" style={{overflowY: 'auto', paddingBottom: 100}}>
          <div className="back" onClick={() => goToStep(4)}>←</div>
          <button className="skip" onClick={() => goToStep(6)}>Skip for now</button>
          <div className="logo"><div className="logo-box">R</div><span className="logo-text">Rezvo</span></div>
          <div className="prog" data-d="1"><div className="b a"></div><div className="b a"></div><div className="b a"></div><div className="b"></div></div>
          <h1 className="d form-title" data-d="2" style={{fontSize: 22}}>What type of business do you run?</h1>
          <p className="form-sub" data-d="2" style={{marginBottom: 16}}>This helps us personalize your booking page</p>
          <div className="tg" data-d="3" style={{gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 440}}>
            {BUSINESS_TYPES.map(type => (
              <div
                key={type.id}
                className={`tc ${businessType === type.id ? 'se' : ''}`}
                onClick={() => selectType(type.id)}
              >
                <span className="em">{type.emoji}</span>
                <span className="nm">{type.label}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-p" data-d="4" onClick={() => goToStep(6)} style={{marginTop: 16}}>That's me! →</button>
        </div>
      </div>

      {/* ═══ PAGE 6: PROFILE ═══ */}
      <div className={getPageClass(6)} id="p6">
        <div className="left">
          <div className="orb o1"></div>
          <div className="orb o2"></div>
          <h2 className="d" data-d="2">Make it<br/><span className="tl">yours.</span></h2>
          <p data-d="3">Your booking page should look like you. Pick a theme, set your details.</p>
          <div className="testimonial" data-d="4">
            <div className="stars">★★★★★</div>
            <q>Businesses with customized profiles get <strong>40% more bookings</strong> in their first week.</q>
            <div className="who">Pro Tip</div>
          </div>
        </div>
        <div className="right" style={{overflowY: 'auto'}}>
          <img src="/showcase/rezi-peek.png" className="fox-border-peek fox-border-anim" style={{width: 220, height: 220}} data-d="1" alt="Rezi" />
          <div className="back" onClick={() => goToStep(5)}>←</div>
          <div className="logo"><div className="logo-box">R</div><span className="logo-text">Rezvo</span></div>
          <div className="prog" data-d="1"><div className="b a"></div><div className="b a"></div><div className="b a"></div><div className="b a"></div></div>
          <h1 className="d form-title" data-d="2" style={{fontSize: 24}}>Build your profile</h1>
          <p className="form-sub" data-d="2">How do you want to appear to customers?</p>
          {error && <div className="error-msg" data-d="2">{error}</div>}
          <div className="field-row" data-d="3">
            <div className="field"><label>First name</label><input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jake" /></div>
            <div className="field"><label>Last name</label><input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Williams" /></div>
          </div>
          {!isGoogleAuth && (
            <>
              <div className="field" data-d="3">
                <label>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jake@example.com" />
              </div>
              <div className="field" data-d="3">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
              </div>
            </>
          )}
          {isGoogleAuth && email && (
            <div className="field" data-d="3">
              <label>Email (from Google)</label>
              <input type="email" value={email} disabled style={{opacity: 0.7, cursor: 'not-allowed'}} />
            </div>
          )}
          <div className="field" data-d="4"><label>Business name</label><input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Jake's Barbers" /></div>
          <div className="field" data-d="4"><label>Business address</label><input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 High Street" /></div>
          <div className="field-row" data-d="5">
            <div className="field"><label>City</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="London" /></div>
            <div className="field"><label>Postcode</label><input value={postcode} onChange={e => setPostcode(e.target.value)} placeholder="E1 6AN" /></div>
          </div>
          <label data-d="6" style={{fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#627D98', width: '100%', maxWidth: 380, textAlign: 'left'}}>Theme accent</label>
          <div className="colors" data-d="6">
            {THEME_COLORS.map(c => (
              <div
                key={c.id}
                className={`cd ${themeColor === c.color ? 'se' : ''}`}
                style={{backgroundColor: c.color}}
                onClick={() => selectColor(c.color)}
              />
            ))}
          </div>
          <button className="btn btn-p" data-d="7" onClick={() => goToStep(7)}>Looks great! →</button>
        </div>
      </div>

      {/* ═══ PAGE 7: PERMISSIONS ═══ */}
      <div className={getPageClass(7)} id="p7">
        <div className="left" style={{position: 'relative'}}>
          <div className="orb o1"></div>
          <div className="orb o2"></div>
          <h2 className="d" data-d="2">Final<br/><span className="tl">touches!</span></h2>
          <p data-d="3">Just a couple of optional settings to tailor your experience.</p>
          <img src="/showcase/rezi-thumbsup.png" className="fox fox-popup" style={{width: 280, height: 280, position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)'}} data-d="1" alt="Rezi" />
        </div>
        <div className="right">
          <div className="back" onClick={() => goToStep(6)}>←</div>
          <div className="logo"><div className="logo-box">R</div><span className="logo-text">Rezvo</span></div>
          <div className="prog" data-d="1"><div className="b a"></div><div className="b a"></div><div className="b a"></div><div className="b a"></div></div>
          <h1 className="d form-title" data-d="2">Final touches</h1>
          <p className="form-sub" data-d="2">Help us tailor your experience.</p>
          {error && <div className="error-msg" data-d="2">{error}</div>}
          <div style={{width: '100%', maxWidth: 380, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--n)', marginBottom: 10, display: 'flex', justifyContent: 'space-between'}} data-d="3">
            PERMISSIONS <span style={{fontWeight: 500, fontSize: 9, color: '#9FB3C8', textTransform: 'none', letterSpacing: 0}}>Optional</span>
          </div>
          <div className="pc" data-d="4">
            <div className="ic" style={{background: '#DBEAFE'}}>🔔</div>
            <div className="inf"><h4>Notifications</h4><p>Instant updates on bookings & reminders</p></div>
            <div className={`tgl ${notifications ? 'on' : ''}`} onClick={() => setNotifications(!notifications)}></div>
          </div>
          <div className="pc" data-d="5">
            <div className="ic" style={{background: '#EDE9FE'}}>📍</div>
            <div className="inf"><h4>Location Services</h4><p>Show your business to nearby customers</p></div>
            <div className={`tgl ${locationEnabled ? 'on' : ''}`} onClick={() => setLocationEnabled(!locationEnabled)}></div>
          </div>
          <div style={{flex: 1, minHeight: 40}}></div>
          {error && <div className="error-msg" style={{marginBottom: 12}}>{error}</div>}
          <button className="btn btn-p" data-d="6" onClick={handleComplete} disabled={loading}>
            {loading ? 'Setting up...' : 'Finish Setup ✓'}
          </button>
        </div>
      </div>

      {/* ═══ PAGE 8: SUCCESS ═══ */}
      <div className={getPageClass(8)} id="p8">
        <div className="left success-left">
          <div className="orb o1"></div>
          <div className="orb o2"></div>
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="cf" 
              style={{
                left: `${Math.random() * 100}%`,
                width: 8,
                height: 8,
                background: ['#00BFA5', '#8B5CF6', '#3B82F6', '#EC4899'][i % 4],
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
          <img src="/showcase/rezi-celebrate.png" className="fox fox-bounce" style={{width: 320, height: 320}} data-d="1" alt="Rezi" />
          <h2 className="d" data-d="2">You're all set,<br/><span className="tl">{firstName || 'friend'}! 🎉</span></h2>
          <p data-d="3">Your booking page is live. Share it with the world and watch your calendar fill up.</p>
        </div>
        <div className="right">
          <div className="logo" data-d="1"><div className="logo-box">R</div><span className="logo-text">Rezvo</span></div>
          <h1 className="d form-title" data-d="2">Welcome home!</h1>
          <p className="form-sub" data-d="2">Your booking page is live and ready for customers.</p>
          <div className="stat-row" data-d="3">
            <div className="stat-card"><div className="v">0:28</div><div className="l">Setup time</div></div>
            <div className="stat-card"><div className="v">Live</div><div className="l">Booking page</div></div>
            <div className="stat-card"><div className="v">∞</div><div className="l">Potential</div></div>
          </div>
          <button className="btn btn-p" data-d="4" onClick={() => navigate('/dashboard')}>Go to Dashboard →</button>
          <button className="btn btn-o mt" data-d="5" style={{borderColor: 'var(--t)', color: 'var(--t)'}}>📤 Share my booking link</button>
        </div>
      </div>

      {/* ═══ SUCCESS OVERLAY ═══ */}
      <div className={`ov ${showOverlay ? 'show' : ''}`}>
        <div className="ring"></div>
        <div className="circ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h3>{overlayMessage}</h3>
        <p>Please wait...</p>
      </div>
    </div>
  );
}
