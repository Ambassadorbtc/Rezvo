import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TEAL = '#00BFA5';

export default function TermsPrivacyScreen({ navigation }) {
  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0A1626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Legal Documents */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => openLink('https://rezvo-booking-1.preview.emergentagent.com/terms')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.linkTitle}>Terms of Service</Text>
                <Text style={styles.linkSubtitle}>Our terms and conditions</Text>
              </View>
            </View>
            <Ionicons name="open-outline" size={18} color="#9FB3C8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => openLink('https://rezvo-booking-1.preview.emergentagent.com/privacy')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#E8F5F3' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={TEAL} />
              </View>
              <View>
                <Text style={styles.linkTitle}>Privacy Policy</Text>
                <Text style={styles.linkSubtitle}>How we handle your data</Text>
              </View>
            </View>
            <Ionicons name="open-outline" size={18} color="#9FB3C8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => openLink('https://rezvo-booking-1.preview.emergentagent.com/cookies')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#FEF3E2' }]}>
                <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.linkTitle}>Cookie Policy</Text>
                <Text style={styles.linkSubtitle}>Our use of cookies</Text>
              </View>
            </View>
            <Ionicons name="open-outline" size={18} color="#9FB3C8" />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Ionicons name="information-circle" size={24} color={TEAL} />
          <Text style={styles.summaryTitle}>Data Protection Summary</Text>
          <View style={styles.summaryList}>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={16} color={TEAL} />
              <Text style={styles.summaryText}>Your data is encrypted and securely stored</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={16} color={TEAL} />
              <Text style={styles.summaryText}>We never sell your personal information</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={16} color={TEAL} />
              <Text style={styles.summaryText}>GDPR compliant data handling</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={16} color={TEAL} />
              <Text style={styles.summaryText}>You can request data deletion anytime</Text>
            </View>
          </View>
        </View>

        {/* Data Rights */}
        <Text style={styles.sectionTitle}>Your Data Rights</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <Ionicons name="download-outline" size={20} color="#627D98" />
              <Text style={styles.actionText}>Download My Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9FB3C8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete My Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9FB3C8" />
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Last updated: February 2026</Text>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0A1626',
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
  },
  linkSubtitle: {
    fontSize: 12,
    color: '#627D98',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F0E8',
    marginHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: '#E8F5F3',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
    marginTop: 10,
    marginBottom: 16,
  },
  summaryList: {
    alignSelf: 'stretch',
    gap: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 13,
    color: '#0A1626',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#627D98',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A1626',
  },
  versionText: {
    fontSize: 12,
    color: '#9FB3C8',
    textAlign: 'center',
    marginTop: 16,
  },
});
