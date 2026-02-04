import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  Linking,
  Switch,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const TEAL = '#00BFA5';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shortLink, setShortLink] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const response = await api.get('/business');
      setBusiness(response.data);
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = async () => {
    try {
      const response = await api.post('/links/create');
      setShortLink(response.data);
      Alert.alert('Success', 'Share link created!');
    } catch (error) {
      Alert.alert('Error', 'Could not generate share link');
    }
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Link copied to clipboard');
  };

  const handleShare = async () => {
    const link = shortLink?.short_link || `https://rezvo.app/book/${business?.id}`;
    try {
      await Share.share({
        message: `Book with ${business?.name || 'us'} on Rezvo: ${link}`,
        title: business?.name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const openURL = (url) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TEAL} />
        </View>
      </SafeAreaView>
    );
  }

  const bookingLink = shortLink?.short_link || `https://rezvo.app/book/${business?.id}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Business Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileInitial}>{business?.name?.charAt(0) || 'B'}</Text>
          </View>
          <Text style={styles.businessName}>{business?.name || 'Your Business'}</Text>
          <Text style={styles.businessEmail}>{user?.email}</Text>
          <TouchableOpacity 
            style={styles.editProfileBtn}
            onPress={() => Alert.alert('Edit Profile', 'Navigate to edit business profile')}
          >
            <Ionicons name="create-outline" size={16} color={TEAL} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Share Link Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Booking Link</Text>
          <View style={styles.linkCard}>
            <View style={styles.linkRow}>
              <Ionicons name="link" size={20} color={TEAL} />
              <Text style={styles.linkText} numberOfLines={1}>{bookingLink}</Text>
            </View>
            <View style={styles.linkActions}>
              <TouchableOpacity 
                style={styles.linkBtn}
                onPress={() => copyToClipboard(bookingLink)}
              >
                <Ionicons name="copy-outline" size={18} color={TEAL} />
                <Text style={styles.linkBtnText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.linkBtn, styles.shareBtn]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
            {!shortLink && (
              <TouchableOpacity style={styles.generateBtn} onPress={generateShareLink}>
                <Ionicons name="flash" size={18} color={TEAL} />
                <Text style={styles.generateBtnText}>Generate Short Link</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Business Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Business Details', 'Edit your business name, address, and contact info')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="business-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Business Details</Text>
              <Text style={styles.menuSubtext}>Name, address, contact</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Working Hours', 'Set your business operating hours')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="time-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Working Hours</Text>
              <Text style={styles.menuSubtext}>Set availability</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Booking Settings', 'Configure booking rules and policies')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="calendar-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Booking Settings</Text>
              <Text style={styles.menuSubtext}>Rules & policies</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="notifications-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Push Notifications</Text>
              <Text style={styles.menuSubtext}>Get notified about bookings</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E2E8F0', true: TEAL }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Email Preferences', 'Configure email notification settings')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="mail-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Email Preferences</Text>
              <Text style={styles.menuSubtext}>Booking confirmations & reminders</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionBadge}>
              <Text style={styles.subscriptionBadgeText}>FREE TRIAL</Text>
            </View>
            <Text style={styles.subscriptionTitle}>You're on the Free Plan</Text>
            <Text style={styles.subscriptionDesc}>Upgrade to unlock unlimited bookings, analytics, and more.</Text>
            <TouchableOpacity 
              style={styles.upgradeBtn}
              onPress={() => Alert.alert('Upgrade', 'Subscription management coming soon!')}
            >
              <Ionicons name="rocket" size={18} color="#FFFFFF" />
              <Text style={styles.upgradeBtnText}>Upgrade to Pro - £4.99/mo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Help Centre', 'Browse FAQs and guides')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="help-circle-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Help Centre</Text>
              <Text style={styles.menuSubtext}>FAQs & guides</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => openURL('mailto:support@rezvo.app')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="chatbubble-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Contact Support</Text>
              <Text style={styles.menuSubtext}>support@rezvo.app</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Terms & Privacy', 'View our legal documents')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="document-text-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Terms & Privacy</Text>
              <Text style={styles.menuSubtext}>Legal information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Rezvo v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A1626',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1626',
    marginBottom: 4,
  },
  businessEmail: {
    fontSize: 14,
    color: '#627D98',
    marginBottom: 16,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F0E8',
    borderRadius: 20,
    gap: 6,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEAL,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9FB3C8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F5F0E8',
    borderRadius: 10,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#0A1626',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 12,
  },
  linkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F0E8',
    gap: 6,
  },
  linkBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAL,
  },
  shareBtn: {
    backgroundColor: TEAL,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TEAL,
    borderStyle: 'dashed',
    gap: 6,
  },
  generateBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEAL,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
  },
  menuSubtext: {
    fontSize: 13,
    color: '#9FB3C8',
    marginTop: 2,
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  subscriptionBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  subscriptionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1626',
    marginBottom: 8,
  },
  subscriptionDesc: {
    fontSize: 14,
    color: '#627D98',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  upgradeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9FB3C8',
    marginTop: 20,
  },
});
