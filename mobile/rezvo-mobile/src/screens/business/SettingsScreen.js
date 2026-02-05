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
  TextInput,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api, { formatPrice } from '../../lib/api';

const TEAL = '#00BFA5';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Modals
  const [showBusinessDetails, setShowBusinessDetails] = useState(false);
  const [showWorkingHours, setShowWorkingHours] = useState(false);
  const [showBookingSettings, setShowBookingSettings] = useState(false);
  
  // Edit form
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const response = await api.get('/business');
      setBusiness(response.data);
      setEditName(response.data?.name || '');
      setEditTagline(response.data?.tagline || '');
      setEditDescription(response.data?.description || '');
      setEditPhone(response.data?.phone || '');
      setEditEmail(response.data?.email || '');
      setEditAddress(response.data?.address || '');
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessDetails = async () => {
    setSaving(true);
    try {
      await api.patch('/business', {
        name: editName,
        tagline: editTagline,
        description: editDescription,
        phone: editPhone,
        email: editEmail,
        address: editAddress,
      });
      setShowBusinessDetails(false);
      fetchBusiness();
      showToast('Business details updated!');
    } catch (error) {
      showToast('Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    // Custom toast-like feedback without native Alert
  };

  // Custom Toast Component
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleCopyLink = async (text) => {
    await Clipboard.setStringAsync(text);
    showToast('Link copied to clipboard!');
  };

  const handleShare = async () => {
    const link = `https://rezvo.app/book/${business?.id}`;
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

  const bookingLink = `rezvo.app/book/${business?.id?.slice(0, 8) || 'demo'}`;

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
            onPress={() => setShowBusinessDetails(true)}
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
                onPress={() => copyToClipboard(`https://${bookingLink}`)}
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
          </View>
        </View>

        {/* Business Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowBusinessDetails(true)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="business-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Business Details</Text>
              <Text style={styles.menuSubtext}>{business?.name || 'Not set'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Team')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="people-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Team Members</Text>
              <Text style={styles.menuSubtext}>Manage your staff</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowWorkingHours(true)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="time-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Working Hours</Text>
              <Text style={styles.menuSubtext}>Mon-Fri, 9:00 - 17:00</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setShowBookingSettings(true)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="calendar-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Booking Settings</Text>
              <Text style={styles.menuSubtext}>Auto-confirm enabled</Text>
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
            <TouchableOpacity style={styles.upgradeBtn}>
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
            onPress={() => navigation.navigate('HelpCentre')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="help-circle-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Help Centre</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="chatbubble-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('TermsPrivacy')}
          >
            <View style={styles.menuIcon}>
              <Ionicons name="document-text-outline" size={20} color={TEAL} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>Terms & Privacy</Text>
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
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Business Details Modal */}
      <Modal
        visible={showBusinessDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBusinessDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Business Details</Text>
              <TouchableOpacity onPress={() => setShowBusinessDetails(false)}>
                <Ionicons name="close" size={24} color="#627D98" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your business name"
                  placeholderTextColor="#9FB3C8"
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tagline</Text>
                <TextInput
                  style={styles.input}
                  placeholder="A short description"
                  placeholderTextColor="#9FB3C8"
                  value={editTagline}
                  onChangeText={setEditTagline}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>About</Text>
                <TextInput
                  style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                  placeholder="Tell customers about your business"
                  placeholderTextColor="#9FB3C8"
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+44 7123 456789"
                  placeholderTextColor="#9FB3C8"
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="business@email.com"
                  placeholderTextColor="#9FB3C8"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
                  placeholder="123 High Street, London"
                  placeholderTextColor="#9FB3C8"
                  value={editAddress}
                  onChangeText={setEditAddress}
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelModalBtn}
                onPress={() => setShowBusinessDetails(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveModalBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveBusinessDetails}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveModalBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Working Hours Modal */}
      <Modal
        visible={showWorkingHours}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWorkingHours(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Working Hours</Text>
              <TouchableOpacity onPress={() => setShowWorkingHours(false)}>
                <Ionicons name="close" size={24} color="#627D98" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                <View key={day} style={styles.dayRow}>
                  <Text style={styles.dayName}>{day}</Text>
                  <View style={styles.dayHours}>
                    {index < 5 ? (
                      <Text style={styles.hoursText}>09:00 - 17:00</Text>
                    ) : (
                      <Text style={styles.closedText}>Closed</Text>
                    )}
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.saveModalBtn}
                onPress={() => setShowWorkingHours(false)}
              >
                <Text style={styles.saveModalBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Booking Settings Modal */}
      <Modal
        visible={showBookingSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking Settings</Text>
              <TouchableOpacity onPress={() => setShowBookingSettings(false)}>
                <Ionicons name="close" size={24} color="#627D98" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-confirm bookings</Text>
                  <Text style={styles.settingDesc}>Automatically confirm new bookings</Text>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: '#E2E8F0', true: TEAL }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Allow cancellations</Text>
                  <Text style={styles.settingDesc}>Let customers cancel bookings</Text>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: '#E2E8F0', true: TEAL }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Send reminders</Text>
                  <Text style={styles.settingDesc}>Email customers 24h before</Text>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: '#E2E8F0', true: TEAL }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Buffer time</Text>
                  <Text style={styles.settingDesc}>Time between appointments</Text>
                </View>
                <Text style={styles.settingValue}>15 min</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.saveModalBtn}
                onPress={() => setShowBookingSettings(false)}
              >
                <Text style={styles.saveModalBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1626',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A1626',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0A1626',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#627D98',
  },
  saveModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: TEAL,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveModalBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0E8',
  },
  dayName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#0A1626',
  },
  dayHours: {
    marginRight: 12,
  },
  hoursText: {
    fontSize: 14,
    color: '#627D98',
  },
  closedText: {
    fontSize: 14,
    color: '#9FB3C8',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0E8',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A1626',
  },
  settingDesc: {
    fontSize: 13,
    color: '#9FB3C8',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: TEAL,
  },
});
