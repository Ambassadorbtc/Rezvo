import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import { useGlobalToast } from '../../context/ToastContext';
import api from '../../lib/api';

const TEAL = '#00BFA5';

export default function ShareLinkScreen({ navigation }) {
  const { user } = useAuth();
  const { showToast } = useGlobalToast();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const qrRef = useRef(null);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      const response = await api.get('/business/me');
      setBusiness(response.data);
      // Generate share URL
      const baseUrl = 'https://rezvo.app';
      setShareUrl(`${baseUrl}/book/${response.data.id}`);
    } catch (error) {
      showToast('Failed to load business info', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(shareUrl);
    showToast('Link copied to clipboard!', 'success');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Book an appointment with ${business?.name || 'us'}! ${shareUrl}`,
        url: shareUrl,
        title: `Book with ${business?.name}`,
      });
    } catch (error) {
      showToast('Failed to share', 'error');
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(`Book an appointment with ${business?.name}! ${shareUrl}`);
    // This would open WhatsApp - in a real app you'd use Linking
    showToast('WhatsApp share coming soon!', 'info');
  };

  const handleShareSMS = () => {
    showToast('SMS share coming soon!', 'info');
  };

  const handleShareEmail = () => {
    showToast('Email share coming soon!', 'info');
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0A1626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Booking Link</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* QR Code Card */}
        <View style={styles.qrCard}>
          <Text style={styles.businessName}>{business?.name}</Text>
          <Text style={styles.tagline}>{business?.tagline || 'Scan to book an appointment'}</Text>
          
          <View style={styles.qrContainer}>
            {shareUrl ? (
              <QRCode
                value={shareUrl}
                size={200}
                color="#0A1626"
                backgroundColor="#FFFFFF"
                ref={qrRef}
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code-outline" size={100} color="#E2E8F0" />
              </View>
            )}
          </View>

          <Text style={styles.urlText} numberOfLines={1}>{shareUrl}</Text>
          
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
            <Ionicons name="copy-outline" size={18} color={TEAL} />
            <Text style={styles.copyButtonText}>Copy Link</Text>
          </TouchableOpacity>
        </View>

        {/* Share Options */}
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share via</Text>
          
          <View style={styles.shareGrid}>
            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
              <View style={[styles.shareIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="share-social" size={24} color="#2196F3" />
              </View>
              <Text style={styles.shareLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleShareWhatsApp}>
              <View style={[styles.shareIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </View>
              <Text style={styles.shareLabel}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleShareSMS}>
              <View style={[styles.shareIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="chatbubble" size={24} color="#FF9800" />
              </View>
              <Text style={styles.shareLabel}>SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleShareEmail}>
              <View style={[styles.shareIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="mail" size={24} color="#E91E63" />
              </View>
              <Text style={styles.shareLabel}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color={TEAL} />
            <Text style={styles.tipText}>
              Print your QR code and display it at your business location for easy customer access.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="link-outline" size={20} color={TEAL} />
            <Text style={styles.tipText}>
              Add your booking link to your Instagram bio, website, or business cards.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A1626',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  businessName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A1626',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#627D98',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  urlText: {
    fontSize: 12,
    color: '#9FB3C8',
    marginBottom: 16,
    maxWidth: '90%',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: TEAL,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAL,
  },
  shareSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 12,
  },
  shareGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareOption: {
    alignItems: 'center',
    flex: 1,
  },
  shareIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 12,
    color: '#627D98',
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#627D98',
    lineHeight: 20,
  },
});
