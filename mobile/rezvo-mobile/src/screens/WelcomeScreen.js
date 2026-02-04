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
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.5, 1]}
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
              The smarter way to manage appointments{'\n'}for your business
            </Text>

            {/* CTA Buttons */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>Get Started Free</Text>
              <View style={styles.btnArrow}>
                <Ionicons name="arrow-forward" size={18} color={TEAL} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>I already have an account</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Quick Actions */}
          <View style={styles.bottomSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue as</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.9}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="person-outline" size={22} color={TEAL} />
                </View>
                <View style={styles.quickActionTextContainer}>
                  <Text style={styles.quickActionTitle}>Client</Text>
                  <Text style={styles.quickActionSub}>Book appointments</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9FB3C8" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.9}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5F3' }]}>
                  <Ionicons name="briefcase-outline" size={22} color={TEAL} />
                </View>
                <View style={styles.quickActionTextContainer}>
                  <Text style={styles.quickActionTitle}>Business</Text>
                  <Text style={styles.quickActionSub}>Manage bookings</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9FB3C8" />
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
    paddingTop: 56,
    paddingBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  headlineContainer: {
    marginBottom: 16,
  },
  headline: {
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 52,
    letterSpacing: -1,
  },
  headlineAccent: {
    fontSize: 44,
    fontWeight: '700',
    color: TEAL,
    lineHeight: 52,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    marginBottom: 28,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 28,
    gap: 12,
    marginBottom: 14,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0A1626',
  },
  btnArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  secondaryBtnText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  bottomSection: {
    gap: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  quickActions: {
    gap: 10,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 14,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
  },
  quickActionSub: {
    fontSize: 13,
    color: '#627D98',
    marginTop: 1,
  },
});
