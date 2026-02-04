import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Alert,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
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

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const response = await api.get('/business/me');
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

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
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
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Business Profile */}
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileInitial}>{business?.name?.charAt(0) || 'B'}</Text>
          </View>
          <Text style={styles.businessName}>{business?.name || 'Your Business'}</Text>
          <Text style={styles.businessEmail}>{user?.email}</Text>
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

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="business-outline" size={20} color={TEAL} />
            </View>
            <Text style={styles.menuText}>Business Details</Text>
            <Ionicons name="chevron-forward" size={20} color="#E2E8F0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="time-outline" size={20} color={TEAL} />
            </View>
            <Text style={styles.menuText}>Working Hours</Text>
            <Ionicons name="chevron-forward" size={20} color="#E2E8F0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="notifications-outline" size={20} color={TEAL} />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#E2E8F0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="card-outline" size={20} color={TEAL} />
            </View>
            <Text style={styles.menuText}>Subscription</Text>
            <Ionicons name="chevron-forward" size={20} color="#E2E8F0" />
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="help-circle-outline" size={20} color={TEAL} />
            </View>
            <Text style={styles.menuText}>Help & FAQ</Text>
            <Ionicons name="chevron-forward" size={20} color="#E2E8F0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="chatbubble-outline" size={20} color={TEAL} />
            </View>
            <Text style={styles.menuText}>Contact Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#E2E8F0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="document-text-outline" size={20} color={TEAL} />
            </View>
            <Text style={styles.menuText}>Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#E2E8F0" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
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
    fontSize: 24,
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
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#627D98',
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0A1626',
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
    marginTop: 16,
  },
});
