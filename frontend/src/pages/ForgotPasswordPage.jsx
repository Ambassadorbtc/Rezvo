import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const TEAL = '#00BFA5';
const NAVY = '#0A1626';
const CREAM = '#FDFBF7';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: new password, 4: success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [verificationId, setVerificationId] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const otpRefs = useRef([]);
  const fullPhone = `${countryCode}${phone.replace(/\s/g, '')}`;

  // Send OTP for password reset
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/forgot-password/send-otp', { phone: fullPhone });
      setVerificationId(response.data.verification_id);
      setStep(2);
      setSuccess('Code sent to your phone!');
    } catch (err) {
      setError(err.response?.data?.detail || 'No account found with this phone number');
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
      await api.post('/auth/forgot-password/verify-otp', {
        phone: fullPhone,
        verification_id: verificationId,
        code: code
      });
      setStep(3);
      setSuccess('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password/reset', {
        phone: fullPhone,
        verification_id: verificationId,
        new_password: newPassword
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
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
    if (otpCode.every(d => d !== '') && otpCode.length === 6 && step === 2) {
      handleVerifyOtp();
    }
  }, [otpCode]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoBox}>R</div>
          <span style={styles.logoText}>Rezvo</span>
        </div>

        {step < 4 && (
          <button style={styles.backBtn} onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)}>
            ← Back
          </button>
        )}

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {/* Step 1: Enter Phone */}
        {step === 1 && (
          <>
            <img src="/showcase/rezi-wave.png" alt="Rezi" style={styles.fox} />
            <h1 style={styles.title}>Forgot your password?</h1>
            <p style={styles.subtitle}>No worries! Enter your phone number and we'll send you a reset code.</p>
            
            <div style={styles.fieldRow}>
              <div style={{...styles.field, maxWidth: 80}}>
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
              {loading ? 'Sending...' : 'Send reset code →'}
            </button>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <>
            <img src="/showcase/rezi-thumbsup.png" alt="Rezi" style={styles.fox} />
            <h1 style={styles.title}>Check your phone!</h1>
            <p style={styles.subtitle}>Enter the 6-digit code we sent to {countryCode} {phone.substring(0,4)} •••</p>
            
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
            
            <button style={styles.linkBtn} onClick={handleSendOtp} disabled={loading}>
              Resend code
            </button>
            
            <button style={styles.btnPrimary} onClick={handleVerifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify code →'}
            </button>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <img src="/showcase/rezi-peek.png" alt="Rezi" style={styles.fox} />
            <h1 style={styles.title}>Create new password</h1>
            <p style={styles.subtitle}>Choose a strong password for your account</p>
            
            <div style={styles.field}>
              <label style={styles.label}>New password</label>
              <input 
                type="password" 
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.field}>
              <label style={styles.label}>Confirm password</label>
              <input 
                type="password" 
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={styles.input}
              />
            </div>
            
            <button style={styles.btnPrimary} onClick={handleResetPassword} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password →'}
            </button>
          </>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <>
            <img src="/showcase/rezi-celebrate.png" alt="Rezi" style={styles.fox} />
            <h1 style={styles.title}>Password reset!</h1>
            <p style={styles.subtitle}>Your password has been successfully reset. You can now log in with your new password.</p>
            
            <button style={styles.btnPrimary} onClick={() => navigate('/login')}>
              Go to Login →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: CREAM,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: '48px 40px',
    maxWidth: 440,
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
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
    color: NAVY,
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: 'none',
    border: 'none',
    color: '#627D98',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  fox: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 8,
    textAlign: 'center',
    color: NAVY,
  },
  subtitle: {
    color: '#627D98',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 1.5,
  },
  fieldRow: {
    display: 'flex',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  field: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#627D98',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 14,
    border: '2px solid #E2E8F0',
    fontSize: 15,
    background: CREAM,
    outline: 'none',
    boxSizing: 'border-box',
  },
  otpRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
  },
  otpInput: {
    width: 48,
    height: 58,
    borderRadius: 12,
    border: '2px solid #E2E8F0',
    fontSize: 22,
    fontWeight: 700,
    textAlign: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    outline: 'none',
  },
  btnPrimary: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    background: TEAL,
    color: '#fff',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: TEAL,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 16,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    padding: '10px 16px',
    background: '#FEF2F2',
    borderRadius: 10,
    width: '100%',
  },
  success: {
    color: '#059669',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    padding: '10px 16px',
    background: '#ECFDF5',
    borderRadius: 10,
    width: '100%',
  },
};
