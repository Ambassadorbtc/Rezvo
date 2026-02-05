import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useGlobalToast } from '../context/ToastContext';

const TEAL = '#00BFA5';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { showToast } = useGlobalToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('business');

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      showToast(error.response?.data?.detail || 'Invalid email or password', 'error');
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#0A1626" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* User Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, userType === 'client' && styles.toggleActive]}
              onPress={() => setUserType('client')}
            >
              <Ionicons 
                name="person-outline" 
                size={16} 
                color={userType === 'client' ? '#FFFFFF' : '#627D98'} 
              />
              <Text style={[styles.toggleText, userType === 'client' && styles.toggleTextActive]}>
                Client
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, userType === 'business' && styles.toggleActive]}
              onPress={() => setUserType('business')}
            >
              <Ionicons 
                name="briefcase-outline" 
                size={16} 
                color={userType === 'business' ? '#FFFFFF' : '#627D98'} 
              />
              <Text style={[styles.toggleText, userType === 'business' && styles.toggleTextActive]}>
                Business
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color="#9FB3C8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#C1C7CD"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={18} color="#9FB3C8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor="#C1C7CD"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={18} 
                    color="#9FB3C8" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign in</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginTop: 4,
    marginLeft: -8,
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#627D98',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F0E8',
    borderRadius: 10,
    padding: 3,
    marginBottom: 28,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toggleActive: {
    backgroundColor: TEAL,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#627D98',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 18,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0A1626',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: TEAL,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: TEAL,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 32,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#627D98',
  },
  signupLink: {
    fontSize: 14,
    color: TEAL,
    fontWeight: '600',
  },
});
