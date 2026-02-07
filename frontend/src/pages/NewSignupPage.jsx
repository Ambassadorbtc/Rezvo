import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const TEAL = '#00BFA5';
const NAVY = '#0A1626';
const CREAM = '#FDFBF7';

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
  { id: 'teal', color: TEAL },
  { id: 'blue', color: '#3B82F6' },
  { id: 'purple', color: '#8B5CF6' },
  { id: 'pink', color: '#EC4899' },
  { id: 'orange', color: '#F59E0B' },
  { id: 'navy', color: NAVY },
];

export default function NewSignupPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [verificationId, setVerificationId] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [googleData, setGoogleData] = useState(null);
  const [businessType, setBusinessType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [themeColor, setThemeColor] = useState(TEAL);
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(false);
  
  // OTP input refs
  const otpRefs = useRef([]);
  
  // Success overlay
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');

  const fullPhone = `${countryCode}${phone.replace(/\s/g, '')}`;

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
      setStep(3);
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
      setStep(4); // Go to Google auth or skip to business type
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
      setError('New code sent!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = () => {
    // Load Google Identity Services
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In is not available');
    }
  };

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setShowOverlay(true);
    setOverlayMessage('Connecting Google...');
    try {
      const result = await api.post('/auth/google-signup', {
        google_token: response.credential,
      });
      setGoogleData(result.data);
      setTimeout(() => {
        setShowOverlay(false);
        setStep(5);
      }, 1500);
    } catch (err) {
      setShowOverlay(false);
      setError(err.response?.data?.detail || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // Complete Registration
  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      const registrationData = {
        phone: fullPhone,
        verification_id: verificationId,
        first_name: firstName,
        last_name: lastName,
        business_name: businessName,
        business_type: businessType,
        address: address,
        city: city,
        postcode: postcode,
        theme_color: themeColor,
        notifications_enabled: notifications,
        location_enabled: location,
      };

      if (googleData) {
        registrationData.google_token = googleData.token;
        registrationData.google_id = googleData.google_id;
        registrationData.email = googleData.email;
        registrationData.auth_method = 'google';
      }

      const response = await api.post('/auth/register-with-otp', registrationData);
      
      // Save auth token
      localStorage.setItem('rezvo_token', response.data.access_token);
      localStorage.setItem('rezvo_user', JSON.stringify(response.data.user));
      updateUser(response.data.user);
      
      setStep(8); // Success page
    } catch (err) {
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
    
    // Auto-focus next input
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
    if (otpCode.every(d => d !== '') && otpCode.length === 6) {
      handleVerifyOtp();
    }
  }, [otpCode]);

  // Progress bar
  const progress = Math.min((step / 7) * 100, 100);

  return (
    <div style={styles.container}>
      {/* Page content based on step */}
      <div style={styles.page}>
        {/* Left Panel */}
        <div style={styles.left}>
          <div style={styles.orb1}></div>
          <div style={styles.orb2}></div>
          
          {step === 1 && (
            <>
              <img src="/showcase/rezi-wave.png" alt="Rezi" style={styles.foxLarge} />
              <h2 style={styles.leftTitle}>Local bookings,<br/><span style={{color: TEAL}}>faff-free.</span></h2>
              <p style={styles.leftSubtitle}>The smart reservation platform that helps you discover, book, and enjoy the best local spots.</p>
            </>
          )}
          
          {(step === 2 || step === 4 || step === 6) && (
            <>
              <img src="/showcase/rezi-peek.png" alt="Rezi" style={styles.foxBorder} />
              <h2 style={styles.leftTitle}>
                {step === 2 && <>Quick verification,<br/><span style={{color: TEAL}}>then we're in.</span></>}
                {step === 4 && <>Almost there!<br/><span style={{color: TEAL}}>One more step.</span></>}
                {step === 6 && <>Make it<br/><span style={{color: TEAL}}>yours.</span></>}
              </h2>
              <p style={styles.leftSubtitle}>
                {step === 2 && 'We just need to verify your number. Takes 10 seconds.'}
                {step === 4 && 'Connect your Google account for a seamless sign-in experience.'}
                {step === 6 && 'Your booking page should look like you. Pick a theme, set your details.'}
              </p>
            </>
          )}
          
          {(step === 3 || step === 5 || step === 7) && (
            <>
              <h2 style={styles.leftTitle}>
                {step === 3 && <>Check your<br/><span style={{color: TEAL}}>messages! 📱</span></>}
                {step === 5 && <>What's your<br/><span style={{color: TEAL}}>vibe?</span></>}
                {step === 7 && <>Final<br/><span style={{color: TEAL}}>touches!</span></>}
              </h2>
              <p style={styles.leftSubtitle}>
                {step === 3 && 'We\'ve sent a 6-digit code to your phone. Enter it to continue.'}
                {step === 5 && 'Tell us about your business so we can set things up perfectly for you.'}
                {step === 7 && 'Just a couple of optional settings to tailor your experience.'}
              </p>
              <img src="/showcase/rezi-thumbsup.png" alt="Rezi" style={styles.foxBottom} />
            </>
          )}
          
          {step === 8 && (
            <>
              <img src="/showcase/rezi-celebrate.png" alt="Rezi" style={styles.foxLarge} />
              <h2 style={styles.leftTitle}>You're all set,<br/><span style={{color: TEAL}}>{firstName || 'friend'}! 🎉</span></h2>
              <p style={styles.leftSubtitle}>Your booking page is live. Share it with the world and watch your calendar fill up.</p>
            </>
          )}
        </div>

        {/* Right Panel */}
        <div style={styles.right}>
          {step > 1 && step < 8 && (
            <button style={styles.backBtn} onClick={() => setStep(step - 1)}>←</button>
          )}
          
          {(step === 4 || step === 5) && (
            <button style={styles.skipBtn} onClick={() => setStep(step + 1)}>Skip for now</button>
          )}
          
          <div style={styles.logo}>
            <div style={styles.logoBox}>R</div>
            <span style={styles.logoText}>Rezvo</span>
          </div>
          
          {step > 1 && step < 8 && (
            <div style={styles.progressBar}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  ...styles.progressDot,
                  backgroundColor: i <= Math.ceil(step/2) ? TEAL : '#E2E8F0',
                  flex: i <= Math.ceil(step/2) ? 1.5 : 1,
                }}></div>
              ))}
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          {/* Step 1: Welcome */}
          {step === 1 && (
            <>
              <img src="/showcase/rezi-wave.png" alt="Rezi" style={{width: 140, height: 140, marginBottom: 16}} />
              <h1 style={styles.title}>Hey there! <span style={{color: TEAL}}>I'm Rezi.</span></h1>
              <p style={styles.subtitle}>I'll help you set up your booking page in under a minute. No faff, I promise.</p>
              <button style={styles.btnPrimary} onClick={() => setStep(2)}>Let's go! →</button>
              <button style={styles.btnSecondary} onClick={() => navigate('/login')}>I already have an account</button>
              <p style={styles.trust}>🛡 SECURE · NO SPAM · FREE FOREVER</p>
            </>
          )}

          {/* Step 2: Phone */}
          {step === 2 && (
            <>
              <h1 style={styles.title}>What's your number?</h1>
              <p style={styles.subtitle}>We'll send you a quick code to verify</p>
              <div style={styles.fieldRow}>
                <div style={{...styles.field, maxWidth: 90}}>
                  <label style={styles.label}>Country</label>
                  <input 
                    type="text" 
                    value={countryCode} 
                    onChange={e => setCountryCode(e.target.value)}
                    style={{...styles.input, textAlign: 'center'}}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Phone number</label>
                  <input 
                    type="tel" 
                    placeholder="7700 900 000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
              <button style={styles.btnPrimary} onClick={handleSendOtp} disabled={loading}>
                {loading ? 'Sending...' : 'Send code →'}
              </button>
              <p style={styles.smallText}>We'll text you a 6-digit code. Standard rates may apply.</p>
            </>
          )}

          {/* Step 3: OTP */}
          {step === 3 && (
            <>
              <h1 style={styles.title}>Enter the code</h1>
              <p style={styles.subtitle}>Sent to {countryCode} {phone.substring(0,4)} ••• •••</p>
              <div style={styles.otpRow}>
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
                    style={{
                      ...styles.otpInput,
                      borderColor: digit ? TEAL : '#E2E8F0',
                      backgroundColor: digit ? '#F0FDF9' : CREAM,
                    }}
                  />
                ))}
              </div>
              <button style={styles.linkBtn} onClick={handleResendOtp} disabled={loading}>
                Resend code
              </button>
              <button style={styles.btnPrimary} onClick={handleVerifyOtp} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify →'}
              </button>
            </>
          )}

          {/* Step 4: Google Auth */}
          {step === 4 && (
            <>
              <h1 style={styles.title}>One more thing</h1>
              <p style={styles.subtitle}>Connect Google for a seamless experience</p>
              <button style={styles.googleBtn} onClick={handleGoogleSignIn}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <div style={styles.divider}><span>or</span></div>
              <button style={styles.btnSecondary} onClick={() => setStep(5)}>Continue with email</button>
            </>
          )}

          {/* Step 5: Business Type */}
          {step === 5 && (
            <>
              <h1 style={{...styles.title, fontSize: 22}}>What type of business do you run?</h1>
              <p style={styles.subtitle}>This helps us personalize your booking page</p>
              <div style={styles.typeGrid}>
                {BUSINESS_TYPES.map(type => (
                  <div
                    key={type.id}
                    style={{
                      ...styles.typeCard,
                      borderColor: businessType === type.id ? TEAL : '#E2E8F0',
                      backgroundColor: businessType === type.id ? '#E8F5F3' : '#fff',
                    }}
                    onClick={() => setBusinessType(type.id)}
                  >
                    <span style={styles.typeEmoji}>{type.emoji}</span>
                    <span style={styles.typeName}>{type.label}</span>
                  </div>
                ))}
              </div>
              <button style={styles.btnPrimary} onClick={() => setStep(6)}>That's me! →</button>
            </>
          )}

          {/* Step 6: Profile */}
          {step === 6 && (
            <div style={{overflowY: 'auto', maxHeight: '70vh'}}>
              <h1 style={{...styles.title, fontSize: 22}}>Build your profile</h1>
              <p style={styles.subtitle}>How do you want to appear to customers?</p>
              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>First name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Last name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} style={styles.input} />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Business name</label>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} style={styles.input} placeholder="Jake's Barbers" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Business address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={styles.input} placeholder="123 High Street" />
              </div>
              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>City</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} style={styles.input} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Postcode</label>
                  <input type="text" value={postcode} onChange={e => setPostcode(e.target.value)} style={styles.input} />
                </div>
              </div>
              <label style={styles.label}>Theme accent</label>
              <div style={styles.colorRow}>
                {THEME_COLORS.map(c => (
                  <div
                    key={c.id}
                    style={{
                      ...styles.colorDot,
                      backgroundColor: c.color,
                      borderColor: themeColor === c.color ? NAVY : 'transparent',
                      transform: themeColor === c.color ? 'scale(1.15)' : 'scale(1)',
                    }}
                    onClick={() => setThemeColor(c.color)}
                  />
                ))}
              </div>
              <button style={styles.btnPrimary} onClick={() => setStep(7)}>Looks great! →</button>
            </div>
          )}

          {/* Step 7: Permissions */}
          {step === 7 && (
            <>
              <h1 style={styles.title}>Final touches</h1>
              <p style={styles.subtitle}>Help us tailor your experience.</p>
              <div style={styles.permHeader}>
                <span>PERMISSIONS</span>
                <span style={{fontSize: 9, color: '#9FB3C8'}}>Optional</span>
              </div>
              <div style={styles.permCard}>
                <div style={{...styles.permIcon, backgroundColor: '#DBEAFE'}}>🔔</div>
                <div style={styles.permInfo}>
                  <h4 style={styles.permTitle}>Notifications</h4>
                  <p style={styles.permDesc}>Instant updates on bookings & reminders</p>
                </div>
                <div 
                  style={{...styles.toggle, backgroundColor: notifications ? TEAL : '#E2E8F0'}}
                  onClick={() => setNotifications(!notifications)}
                >
                  <div style={{...styles.toggleDot, transform: notifications ? 'translateX(20px)' : 'translateX(0)'}}></div>
                </div>
              </div>
              <div style={styles.permCard}>
                <div style={{...styles.permIcon, backgroundColor: '#EDE9FE'}}>📍</div>
                <div style={styles.permInfo}>
                  <h4 style={styles.permTitle}>Location Services</h4>
                  <p style={styles.permDesc}>Show your business to nearby customers</p>
                </div>
                <div 
                  style={{...styles.toggle, backgroundColor: location ? TEAL : '#E2E8F0'}}
                  onClick={() => setLocation(!location)}
                >
                  <div style={{...styles.toggleDot, transform: location ? 'translateX(20px)' : 'translateX(0)'}}></div>
                </div>
              </div>
              <div style={{flex: 1, minHeight: 40}}></div>
              <button style={styles.btnPrimary} onClick={handleComplete} disabled={loading}>
                {loading ? 'Setting up...' : 'Finish Setup ✓'}
              </button>
            </>
          )}

          {/* Step 8: Success */}
          {step === 8 && (
            <>
              <h1 style={styles.title}>Welcome home!</h1>
              <p style={styles.subtitle}>Your booking page is live and ready for customers.</p>
              <div style={styles.statRow}>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>0:28</div>
                  <div style={styles.statLabel}>Setup time</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>Live</div>
                  <div style={styles.statLabel}>Booking page</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>∞</div>
                  <div style={styles.statLabel}>Potential</div>
                </div>
              </div>
              <button style={styles.btnPrimary} onClick={() => navigate('/dashboard')}>
                Go to Dashboard →
              </button>
              <button style={{...styles.btnSecondary, borderColor: TEAL, color: TEAL}}>
                📤 Share my booking link
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Overlay */}
      {showOverlay && (
        <div style={styles.overlay}>
          <div style={styles.overlayRing}></div>
          <div style={styles.overlayCircle}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 style={styles.overlayTitle}>{overlayMessage}</h3>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: CREAM,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  page: {
    minHeight: '100vh',
    display: 'flex',
  },
  left: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    position: 'relative',
    overflow: 'visible',
    background: 'linear-gradient(135deg, #E8F5F3 0%, #D1FAE5 50%, #C6F7E9 100%)',
  },
  orb1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: TEAL,
    opacity: 0.12,
    top: -100,
    right: -100,
  },
  orb2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: '#8B5CF6',
    opacity: 0.12,
    bottom: -80,
    left: -60,
  },
  foxLarge: { width: 320, height: 320, position: 'relative', zIndex: 10 },
  foxBorder: { position: 'absolute', right: -90, top: 50, width: 220, height: 220, zIndex: 20 },
  foxBottom: { position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', width: 280, height: 280, zIndex: 10 },
  leftTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 'clamp(32px, 4vw, 48px)',
    fontWeight: 800,
    textAlign: 'center',
    lineHeight: 1.1,
    marginTop: 24,
    color: NAVY,
  },
  leftSubtitle: {
    color: '#627D98',
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 400,
    lineHeight: 1.6,
  },
  right: {
    width: 520,
    minWidth: 520,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 56px',
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'visible',
  },
  backBtn: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 12,
    border: '2px solid #E2E8F0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 18,
    color: '#627D98',
  },
  skipBtn: {
    position: 'absolute',
    top: 30,
    right: 32,
    color: '#9FB3C8',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  logoBox: {
    width: 36,
    height: 36,
    background: TEAL,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
  },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 20,
  },
  progressBar: {
    display: 'flex',
    gap: 6,
    width: '100%',
    maxWidth: 320,
    height: 4,
    marginBottom: 28,
  },
  progressDot: {
    height: 4,
    borderRadius: 2,
    transition: 'all 0.5s',
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 6,
    textAlign: 'center',
    color: NAVY,
  },
  subtitle: {
    color: '#627D98',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
  },
  btnPrimary: {
    width: '100%',
    maxWidth: 380,
    padding: 16,
    borderRadius: 16,
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    background: TEAL,
    color: '#fff',
    marginTop: 8,
  },
  btnSecondary: {
    width: '100%',
    maxWidth: 380,
    padding: 16,
    borderRadius: 16,
    border: '2px solid #E2E8F0',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    background: '#fff',
    color: NAVY,
    marginTop: 10,
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 380,
    padding: 16,
    borderRadius: 16,
    border: '2px solid #E2E8F0',
    background: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 380,
    margin: '16px 0',
    color: '#9FB3C8',
    fontSize: 12,
    fontWeight: 600,
  },
  field: {
    width: '100%',
    maxWidth: 380,
    marginBottom: 14,
  },
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    width: '100%',
    maxWidth: 380,
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#627D98',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 14,
    border: '2px solid #E2E8F0',
    fontSize: 15,
    background: CREAM,
    outline: 'none',
  },
  otpRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
  },
  otpInput: {
    width: 54,
    height: 64,
    borderRadius: 14,
    border: '2px solid #E2E8F0',
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    outline: 'none',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: TEAL,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 12,
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    width: '100%',
    maxWidth: 440,
    marginBottom: 16,
    maxHeight: 300,
    overflowY: 'auto',
  },
  typeCard: {
    padding: '10px 4px',
    borderRadius: 12,
    border: '2px solid #E2E8F0',
    background: '#fff',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  typeEmoji: { fontSize: 20, display: 'block', marginBottom: 2 },
  typeName: { fontWeight: 600, fontSize: 9, lineHeight: 1.2 },
  colorRow: {
    display: 'flex',
    gap: 10,
    margin: '10px 0 20px',
    width: '100%',
    maxWidth: 380,
  },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '3px solid transparent',
  },
  permHeader: {
    width: '100%',
    maxWidth: 380,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: NAVY,
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
  },
  permCard: {
    background: CREAM,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 380,
  },
  permIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  permInfo: { flex: 1 },
  permTitle: { fontSize: 14, fontWeight: 700, margin: 0 },
  permDesc: { fontSize: 11, color: '#627D98', marginTop: 1, marginBottom: 0 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.3s',
    flexShrink: 0,
  },
  toggleDot: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    transition: 'transform 0.3s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statRow: {
    display: 'flex',
    gap: 14,
    width: '100%',
    maxWidth: 380,
    marginBottom: 24,
  },
  statCard: {
    background: CREAM,
    borderRadius: 16,
    padding: 16,
    textAlign: 'center',
    flex: 1,
    border: '1px solid #E2E8F0',
  },
  statValue: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    color: TEAL,
  },
  statLabel: { fontSize: 10, color: '#627D98', marginTop: 2 },
  trust: {
    color: '#9FB3C8',
    fontSize: 10,
    fontWeight: 600,
    marginTop: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  smallText: {
    color: '#9FB3C8',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
    padding: '8px 16px',
    background: '#FEF2F2',
    borderRadius: 8,
    width: '100%',
    maxWidth: 380,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: TEAL,
  },
  overlayRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    border: '3px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
  },
  overlayCircle: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 800,
    marginTop: 24,
    fontFamily: "'Space Grotesk', sans-serif",
  },
};
