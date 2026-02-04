import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const TEAL = '#00BFA5';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.4, 1]}
          style={styles.gradient}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>R</Text>
            </View>
            <Text style={styles.logoText}>rezvo</Text>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <View style={styles.headlineContainer}>
              <Text style={styles.headline}>Your time,</Text>
              <Text style={styles.headline}>beautifully</Text>
              <Text style={styles.headlineAccent}>booked.</Text>
            </View>
            
            <Text style={styles.subtitle}>
              The smarter way to manage{'\n'}appointments for your business
            </Text>

            {/* CTA Buttons */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color={TEAL} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Sign in</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Quick Actions */}
          <View style={styles.bottomSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>continue as</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.9}
              >
                <Ionicons name="person-outline" size={18} color={TEAL} />
                <Text style={styles.quickActionText}>Client</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.9}
              >
                <Ionicons name="briefcase-outline" size={18} color={TEAL} />
                <Text style={styles.quickActionText}>Business</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 28,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  headlineContainer: {
    marginBottom: 12,
  },
  headline: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  headlineAccent: {
    fontSize: 36,
    fontWeight: '700',
    color: TEAL,
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    gap: 8,
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryBtnText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  bottomSection: {
    gap: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dividerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
  },
});
