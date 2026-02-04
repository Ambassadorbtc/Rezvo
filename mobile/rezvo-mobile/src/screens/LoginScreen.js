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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const TEAL = '#00BFA5';

export default function LoginScreen({ navigation, route }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(route.params?.userType || 'business');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, userType);
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.detail || 'Invalid email or password'
      );
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#0A1626" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* User Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, userType === 'client' && styles.toggleActive]}
              onPress={() => setUserType('client')}
            >
              <Ionicons 
                name="person" 
                size={18} 
                color={userType === 'client' ? '#FFFFFF' : TEAL} 
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
                name="briefcase" 
                size={18} 
                color={userType === 'business' ? '#FFFFFF' : TEAL} 
              />
              <Text style={[styles.toggleText, userType === 'business' && styles.toggleTextActive]}>
                Business
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#627D98" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#9FB3C8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#627D98" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9FB3C8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#627D98" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
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
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logo: {
    width: 56,
    height: 56,
    backgroundColor: TEAL,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A1626',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#627D98',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F0E8',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  toggleActive: {
    backgroundColor: TEAL,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEAL,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#0A1626',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#627D98',
  },
  signupLink: {
    fontSize: 15,
    color: TEAL,
    fontWeight: '600',
  },
});
