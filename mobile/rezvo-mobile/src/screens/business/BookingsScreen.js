import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate, formatTime, formatPrice } from '../../lib/api';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

const tabs = ['Upcoming', 'Pending', 'Past'];

const mockBookings = [
  { id: '1', client: 'Emma Watson', service: 'Haircut & Style', datetime_iso: new Date(Date.now() + 86400000).toISOString(), status: 'confirmed', price_pence: 3500 },
  { id: '2', client: 'John Smith', service: 'Beard Trim', datetime_iso: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'pending', price_pence: 1500 },
  { id: '3', client: 'Sarah Connor', service: 'Hair Colouring', datetime_iso: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'confirmed', price_pence: 7500 },
  { id: '4', client: 'Mike Brown', service: 'Full Treatment', datetime_iso: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'completed', price_pence: 9500 },
  { id: '5', client: 'Lisa Johnson', service: 'Classic Haircut', datetime_iso: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'completed', price_pence: 2500 },
];

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const getFilteredBookings = () => {
    const now = new Date();
    return mockBookings.filter((booking) => {
      const bookingDate = new Date(booking.datetime_iso);
      switch (activeTab) {
        case 'Upcoming':
          return bookingDate >= now && booking.status === 'confirmed';
        case 'Pending':
          return booking.status === 'pending';
        case 'Past':
          return bookingDate < now || booking.status === 'completed';
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'completed':
        return colors.primary;
      default:
        return colors.textMuted;
    }
  };

  const renderBooking = ({ item }) => (
    <TouchableOpacity style={styles.bookingCard}>
      <View style={styles.bookingLeft}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{new Date(item.datetime_iso).getDate()}</Text>
          <Text style={styles.dateMonth}>
            {new Date(item.datetime_iso).toLocaleDateString('en-GB', { month: 'short' })}
          </Text>
        </View>
      </View>
      
      <View style={styles.bookingCenter}>
        <Text style={styles.clientName}>{item.client}</Text>
        <Text style={styles.serviceName}>{item.service}</Text>
        <Text style={styles.bookingTime}>{formatTime(item.datetime_iso)}</Text>
      </View>
      
      <View style={styles.bookingRight}>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.priceText}>{formatPrice(item.price_pence)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={getFilteredBookings()}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(false)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No bookings</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'Pending'
                ? 'No pending confirmations'
                : `No ${activeTab.toLowerCase()} bookings`}
            </Text>
          </View>
        }
      />
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.navy,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.surface,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  bookingLeft: {
    marginRight: spacing.md,
  },
  dateBox: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.surface,
  },
  dateMonth: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  bookingCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  serviceName: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: 2,
  },
  bookingTime: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  bookingRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priceText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
  },
});
