import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalToast } from '../context/ToastContext';
import api from '../services/api';

const TEAL = '#00BFA5';

export default function PhoneVerifyScreen({ navigation, route }) {
  const { showToast } = useGlobalToast();
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

  const formatPhoneDisplay = (num) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (text) => {
    const value = text.replace(/\D/g, '').slice(0, 11);
    setPhoneNumber(value);
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }

    setLoading(true);
    try {
      const fullNumber = `${countryCode}${phoneNumber}`;
      const response = await api.post('/auth/send-otp', { phone: fullNumber });
      
      setVerificationId(response.data.verification_id);
      setStep('otp');
      setResendTimer(60);
      showToast('Verification code sent!', 'success');
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to send code', 'error');
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

  const handleKeyPress = (index, key) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter the complete 6-digit code', 'error');
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
      
      showToast('Phone verified successfully!', 'success');
      navigation.navigate('CompleteProfile', { 
        phone: fullNumber,
        verificationId: verificationId 
      });
    } catch (error) {
      showToast(error.response?.data?.detail || 'Invalid verification code', 'error');
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
      showToast('New code sent!', 'success');
    } catch (error) {
      showToast('Failed to resend code', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => step === 'otp' ? setStep('phone') : navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={22} color="#0A1626" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>R</Text>
              </View>
              <Text style={styles.logoName}>rezvo</Text>
            </View>
            
            <View style={{ width: 40 }} />
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
            <Text style={styles.progressText}>Step 2 of 4</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {step === 'phone' ? (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="call-outline" size={32} color={TEAL} />
                </View>
                
                <Text style={styles.title}>Enter your phone number</Text>
                <Text style={styles.subtitle}>We'll send you a verification code</Text>

                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.countryFlag}>🇬🇧</Text>
                    <Text style={styles.countryCode}>{countryCode}</Text>
                  </View>
                  
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="7XXX XXX XXX"
                    placeholderTextColor="#9FB3C8"
                    value={formatPhoneDisplay(phoneNumber)}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.primaryButton, (loading || phoneNumber.length < 10) && styles.buttonDisabled]}
                  onPress={handleSendOtp}
                  disabled={loading || phoneNumber.length < 10}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={[styles.iconContainer, { backgroundColor: '#E8FDF5' }]}>
                  <Ionicons name="checkmark-circle-outline" size={32} color="#10B981" />
                </View>
                
                <Text style={styles.title}>Enter verification code</Text>
                <Text style={styles.subtitle}>Sent to {countryCode} {formatPhoneDisplay(phoneNumber)}</Text>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      style={[styles.otpInput, digit && styles.otpInputFilled]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(index, value.replace(/\D/g, ''))}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                <TouchableOpacity 
                  style={[styles.primaryButton, (loading || otp.some(d => !d)) && styles.buttonDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={loading || otp.some(d => !d)}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendTimer}>Resend code in {resendTimer}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                      <View style={styles.resendButton}>
                        <Ionicons name="refresh-outline" size={16} color={TEAL} />
                        <Text style={styles.resendText}>Resend Code</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: TEAL,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#9FB3C8',
    marginTop: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E8F7F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#627D98',
    textAlign: 'center',
    marginBottom: 32,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 6,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A1626',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '500',
    color: '#0A1626',
    letterSpacing: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
  },
  otpInputFilled: {
    borderColor: TEAL,
    backgroundColor: '#E8F7F5',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: TEAL,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendContainer: {
    marginTop: 24,
  },
  resendTimer: {
    fontSize: 14,
    color: '#9FB3C8',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAL,
  },
});
