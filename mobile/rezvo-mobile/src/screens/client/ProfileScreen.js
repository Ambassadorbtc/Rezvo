import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ToastContext';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

const menuItems = [
  { id: 'account', icon: '👤', label: 'Account Settings', subtitle: 'Update your profile' },
  { id: 'notifications', icon: '🔔', label: 'Notifications', subtitle: 'Manage alerts' },
  { id: 'payment', icon: '💳', label: 'Payment Methods', subtitle: 'Cards and billing' },
  { id: 'favorites', icon: '❤️', label: 'Favorites', subtitle: 'Saved businesses' },
  { id: 'history', icon: '📜', label: 'Booking History', subtitle: 'View past bookings' },
  { id: 'help', icon: '❓', label: 'Help & Support', subtitle: 'FAQs and contact' },
  { id: 'privacy', icon: '🔒', label: 'Privacy & Security', subtitle: 'Data and permissions' },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { showConfirm } = useConfirm();

  const handleLogout = () => {
    showConfirm(
      'Log out',
      'Are you sure you want to log out?',
      logout
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Text style={styles.editAvatarIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
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

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Rezvo v1.0.0</Text>
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
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '700',
    color: colors.surface,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  editAvatarIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  editProfileButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
  },
  editProfileText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  switchModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  switchModeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  switchModeEmoji: {
    fontSize: 24,
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
  menuContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
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
    fontSize: 20,
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
  chevron: {
    fontSize: 24,
    color: colors.textLight,
  },
  logoutButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.error,
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
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
});
