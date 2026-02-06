import React, { useState } from 'react';
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useGlobalToast } from '../context/ToastContext';
import api from '../lib/api';

const TEAL = '#00BFA5';

export default function CompleteProfileScreen({ navigation, route }) {
  const { login } = useAuth();
  const { showToast } = useGlobalToast();
  const { phone, verificationId } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState(null); // null | 'email'
  
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    address: '',
    postcode: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleSignup = async () => {
    if (!formData.fullName.trim() || !formData.businessName.trim()) {
      showToast('Please fill in your name and business name first', 'error');
      return;
    }
    
    setGoogleLoading(true);
    try {
      // Store form data for after Google auth callback
      // In a real app, you'd use deep linking to handle the callback
      const webAuthUrl = 'https://micro-biz-book.preview.emergentagent.com/auth-callback';
      const googleAuthUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(webAuthUrl)}`;
      
      // Open Google auth in browser
      const supported = await Linking.canOpenURL(googleAuthUrl);
      if (supported) {
        await Linking.openURL(googleAuthUrl);
      } else {
        showToast('Cannot open Google authentication', 'error');
      }
    } catch (error) {
      showToast('Failed to open Google authentication', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!formData.businessName.trim()) {
      showToast('Please enter your business name', 'error');
      return;
    }
    if (!formData.address.trim()) {
      showToast('Please enter your business address', 'error');
      return;
    }
    if (!formData.postcode.trim()) {
      showToast('Please enter your postcode', 'error');
      return;
    }
    if (!formData.email.trim()) {
      showToast('Please enter your email', 'error');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `${formData.address}, ${formData.postcode}`;
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        business_name: formData.businessName,
        address: fullAddress,
        postcode: formData.postcode,
        phone: phone,
        auth_method: 'email'
      });

      showToast('Account created! Now select your business type', 'success');
      
      // Store token temporarily and navigate to BusinessType screen
      if (response.data?.token) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('rezvo_token', response.data.token);
      }
      
      // Navigate to Business Type selection
      navigation.navigate('BusinessType');
      
    } catch (error) {
      showToast(error.response?.data?.detail || 'Failed to create account', 'error');
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => authMethod ? setAuthMethod(null) : navigation.goBack()}
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
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressText}>Step 3 of 4</Text>
          </View>

          {/* Verified Badge */}
          <View style={styles.verifiedBadge}>
            <View style={styles.verifiedIcon}>
              <Ionicons name="checkmark" size={14} color="#10B981" />
            </View>
            <Text style={styles.verifiedText}>Phone Verified</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Complete your profile</Text>
            <Text style={styles.subtitle}>Tell us about yourself and your business</Text>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color="#9FB3C8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="John Smith"
                    placeholderTextColor="#C1C7CD"
                    value={formData.fullName}
                    onChangeText={(v) => handleInputChange('fullName', v)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Business Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="storefront-outline" size={18} color="#9FB3C8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Smith's Barbershop"
                    placeholderTextColor="#C1C7CD"
                    value={formData.businessName}
                    onChangeText={(v) => handleInputChange('businessName', v)}
                  />
                </View>
              </View>

              {/* Street Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Street Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={18} color="#9FB3C8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="123 High Street, London"
                    placeholderTextColor="#C1C7CD"
                    value={formData.address}
                    onChangeText={(v) => handleInputChange('address', v)}
                  />
                </View>
              </View>

              {/* Postcode */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Postcode</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color="#9FB3C8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="SW1A 1AA"
                    placeholderTextColor="#C1C7CD"
                    value={formData.postcode}
                    onChangeText={(v) => handleInputChange('postcode', v.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={8}
                  />
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {!authMethod ? (
                <>
                  {/* Google Button */}
                  <TouchableOpacity 
                    style={[styles.authButton, styles.googleButton]}
                    onPress={handleGoogleSignup}
                    disabled={googleLoading || !formData.fullName || !formData.businessName}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color="#0A1626" size="small" />
                    ) : (
                      <>
                        <View style={styles.googleIconContainer}>
                          <Text style={styles.googleIcon}>G</Text>
                        </View>
                        <Text style={styles.authButtonText}>Continue with Google</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Email Button */}
                  <TouchableOpacity 
                    style={styles.authButton}
                    onPress={() => setAuthMethod('email')}
                    disabled={!formData.fullName || !formData.businessName}
                  >
                    <Ionicons name="mail-outline" size={20} color="#0A1626" />
                    <Text style={styles.authButtonText}>Continue with Email</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Email Form */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={18} color="#9FB3C8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="john@example.com"
                        placeholderTextColor="#C1C7CD"
                        value={formData.email}
                        onChangeText={(v) => handleInputChange('email', v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={18} color="#9FB3C8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Min. 8 characters"
                        placeholderTextColor="#C1C7CD"
                        value={formData.password}
                        onChangeText={(v) => handleInputChange('password', v)}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="lock-closed-outline" size={18} color="#9FB3C8" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Re-enter password"
                        placeholderTextColor="#C1C7CD"
                        value={formData.confirmPassword}
                        onChangeText={(v) => handleInputChange('confirmPassword', v)}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryButton, loading && styles.buttonDisabled]}
                    onPress={handleEmailSignup}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Create Account</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.backToOptions}
                    onPress={() => setAuthMethod(null)}
                  >
                    <Text style={styles.backToOptionsText}>← Back to options</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
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
    paddingBottom: 24,
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E8FDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  verifiedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  content: {
    flex: 1,
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
    marginBottom: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0A1626',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0A1626',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#9FB3C8',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    gap: 10,
    marginBottom: 12,
  },
  googleButton: {
    borderColor: '#E2E8F0',
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
  },
  primaryButton: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backToOptions: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backToOptionsText: {
    fontSize: 14,
    color: '#627D98',
  },
});
