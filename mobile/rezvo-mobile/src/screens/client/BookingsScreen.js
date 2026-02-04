import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { formatDate, formatTime, formatPrice } from '../../lib/api';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

const tabs = ['Upcoming', 'Past', 'Cancelled'];

export default function BookingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/client');
      setBookings(response.data || []);
    } catch (error) {
      console.log('Using mock bookings');
      // Mock data for demo
      setBookings([
        {
          id: '1',
          business_name: "Sarah's Hair Studio",
          service_name: 'Haircut & Style',
          datetime_iso: new Date(Date.now() + 86400000 * 2).toISOString(),
          status: 'confirmed',
          price_pence: 3500,
        },
        {
          id: '2',
          business_name: 'FitLife PT',
          service_name: 'Personal Training Session',
          datetime_iso: new Date(Date.now() + 86400000 * 5).toISOString(),
          status: 'pending',
          price_pence: 5000,
        },
        {
          id: '3',
          business_name: 'Glamour Nails',
          service_name: 'Gel Manicure',
          datetime_iso: new Date(Date.now() - 86400000 * 7).toISOString(),
          status: 'completed',
          price_pence: 2500,
        },
        {
          id: '4',
          business_name: 'Zen Massage',
          service_name: 'Deep Tissue Massage',
          datetime_iso: new Date(Date.now() - 86400000 * 14).toISOString(),
          status: 'cancelled',
          price_pence: 6000,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.datetime_iso);
      switch (activeTab) {
        case 'Upcoming':
          return bookingDate >= now && booking.status !== 'cancelled';
        case 'Past':
          return bookingDate < now && booking.status !== 'cancelled';
        case 'Cancelled':
          return booking.status === 'cancelled';
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
      case 'cancelled':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const renderBooking = ({ item }) => (
    <TouchableOpacity style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>
            {new Date(item.datetime_iso).getDate()}
          </Text>
          <Text style={styles.dateMonth}>
            {new Date(item.datetime_iso).toLocaleDateString('en-GB', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.businessName}>{item.business_name}</Text>
          <Text style={styles.serviceName}>{item.service_name}</Text>
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
      </View>
      {activeTab === 'Upcoming' && (
        <View style={styles.bookingActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonOutline]}>
            <Text style={[styles.actionButtonText, styles.actionButtonTextOutline]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
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
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'Upcoming'
                ? 'Book your first appointment to get started'
                : `You don't have any ${activeTab.toLowerCase()} bookings`}
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateBox: {
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dateDay: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.surface,
  },
  dateMonth: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  bookingInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  serviceName: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  bookingRight: {
    alignItems: 'flex-end',
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
  bookingActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.surface,
  },
  actionButtonTextOutline: {
    color: colors.textMuted,
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
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
