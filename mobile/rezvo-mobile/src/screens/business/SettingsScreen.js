import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

const menuSections = [
  {
    title: 'Business',
    items: [
      { id: 'profile', icon: '🏪', label: 'Business Profile', subtitle: 'Name, logo, contact' },
      { id: 'availability', icon: '⏰', label: 'Availability', subtitle: 'Working hours' },
      { id: 'payment', icon: '💳', label: 'Payment Setup', subtitle: 'Dojo integration' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { id: 'reminders', icon: '📧', label: 'Email Reminders', subtitle: 'Client notifications' },
      { id: 'push', icon: '🔔', label: 'Push Notifications', subtitle: 'Booking alerts' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'account', icon: '👤', label: 'Account Details', subtitle: 'Email, password' },
      { id: 'billing', icon: '💷', label: 'Billing', subtitle: 'Subscription & invoices' },
      { id: 'help', icon: '❓', label: 'Help & Support', subtitle: 'FAQs, contact' },
    ],
  },
];

export default function SettingsScreen({ navigation }) {
  const { user, logout, switchUserType } = useAuth();

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

  const handleSwitchToClient = () => {
    Alert.alert(
      'Switch to Client Mode',
      'Do you want to switch to booking appointments?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', onPress: () => switchUserType('client') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Business Info Card */}
        <View style={styles.businessCard}>
          <View style={styles.businessAvatar}>
            <Text style={styles.businessInitial}>
              {user?.business_name?.[0] || user?.email?.[0]?.toUpperCase() || 'B'}
            </Text>
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>
              {user?.business_name || 'Your Business'}
            </Text>
            <Text style={styles.businessEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Switch Mode */}
        <TouchableOpacity style={styles.switchModeCard} onPress={handleSwitchToClient}>
          <View style={styles.switchModeIcon}>
            <Text style={styles.switchModeEmoji}>📱</Text>
          </View>
          <View style={styles.switchModeContent}>
            <Text style={styles.switchModeTitle}>Switch to Client Mode</Text>
            <Text style={styles.switchModeSubtitle}>Book appointments as a customer</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuContainer}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index === section.items.length - 1 && styles.menuItemLast,
                  ]}
                >
                  <View style={styles.menuIcon}>
                    <Text style={styles.menuEmoji}>{item.icon}</Text>
                  </View>
                  <View style={styles.menuContent}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Rezvo Business v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  businessAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  businessInitial: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.surface,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  businessEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 16,
  },
  switchModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  switchModeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  switchModeEmoji: {
    fontSize: 22,
  },
  switchModeContent: {
    flex: 1,
  },
  switchModeTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.surface,
    marginBottom: 2,
  },
  switchModeSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  chevron: {
    fontSize: 22,
    color: colors.textLight,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
    marginLeft: spacing.xl,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuEmoji: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  logoutButton: {
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  logoutText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
});
