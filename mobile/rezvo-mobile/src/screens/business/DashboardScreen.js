import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api, { formatPrice } from '../../lib/api';

const TEAL = '#00BFA5';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ today_count: 0, pending_count: 0, revenue_pence: 0 });
  const [business, setBusiness] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const [statsRes, businessRes, bookingsRes] = await Promise.all([
        api.get('/business/stats').catch(() => ({ data: { today_count: 0, pending_count: 0, revenue_pence: 0 } })),
        api.get('/business').catch(() => ({ data: null })),
        api.get('/bookings').catch(() => ({ data: [] }))
      ]);
      
      setStats(statsRes.data || { today_count: 0, pending_count: 0, revenue_pence: 0 });
      setBusiness(businessRes.data);
      
      // Filter today's bookings
      const today = new Date().toDateString();
      const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      const todaysBookings = bookingsData.filter(b => 
        b && b.datetime && new Date(b.datetime).toDateString() === today
      ).slice(0, 5); // Show max 5
      setTodayBookings(todaysBookings);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Book with ${business?.name || 'us'} on Rezvo: https://rezvo.app/book/${business?.id}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.businessName}>{business?.name || 'Your Business'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => {/* TODO: Add notifications screen */}}
          >
            <Ionicons name="notifications-outline" size={24} color="#0A1626" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: '#E8F5F3' }]}
              onPress={() => navigation.navigate('Analytics')}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar-outline" size={20} color={TEAL} />
              </View>
              <Text style={styles.statValue}>{stats?.today_count || 0}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: '#FEF3E2' }]}
              onPress={() => navigation.navigate('Bookings')}
            >
              <View style={[styles.statIconContainer, { backgroundColor: '#FDE68A' }]}>
                <Ionicons name="time-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{stats?.pending_count || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.revenueCard}
            onPress={() => navigation.navigate('Analytics')}
          >
            <View style={styles.revenueLeft}>
              <Text style={styles.revenueLabel}>This Month</Text>
              <Text style={styles.revenueValue}>{formatPrice(stats?.revenue_pence || 0)}</Text>
            </View>
            <View style={styles.revenueTrend}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Share Link Card */}
        <TouchableOpacity style={styles.shareCard} onPress={handleShare}>
          <View style={styles.shareIconContainer}>
            <Ionicons name="share-social" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.shareContent}>
            <Text style={styles.shareTitle}>Share Your Booking Link</Text>
            <Text style={styles.shareSubtitle}>Let customers book directly</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Today's Schedule */}
        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {todayBookings.length === 0 ? (
            <View style={styles.emptySchedule}>
              <Ionicons name="calendar-outline" size={48} color="#E2E8F0" />
              <Text style={styles.emptyTitle}>No bookings today</Text>
              <Text style={styles.emptySubtitle}>Share your link to get more bookings</Text>
            </View>
          ) : (
            todayBookings.map((booking, index) => (
              <TouchableOpacity 
                key={booking.id || index} 
                style={styles.bookingCard}
                onPress={() => navigation.navigate('Bookings')}
              >
                <View style={styles.bookingTime}>
                  <Text style={styles.timeText}>{formatTime(booking.datetime)}</Text>
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.clientName}>{booking.client_name}</Text>
                  <Text style={styles.serviceName}>{booking.service_name}</Text>
                </View>
                <View style={[styles.statusBadge, { 
                  backgroundColor: booking.status === 'confirmed' ? '#DCFCE7' : 
                                   booking.status === 'pending' ? '#FEF3C7' : '#F3F4F6'
                }]}>
                  <Text style={[styles.statusText, {
                    color: booking.status === 'confirmed' ? '#16A34A' : 
                           booking.status === 'pending' ? '#D97706' : '#6B7280'
                  }]}>{booking.status}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Services')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="cut" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.quickActionLabel}>Services</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Calendar')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="calendar" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionLabel}>Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="settings" size={22} color="#EF4444" />
            </View>
            <Text style={styles.quickActionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#627D98',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,191,165,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A1626',
  },
  statLabel: {
    fontSize: 14,
    color: '#627D98',
    marginTop: 4,
  },
  revenueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  revenueLeft: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#627D98',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0A1626',
  },
  revenueTrend: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
  },
  shareIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareContent: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scheduleSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1626',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
    color: TEAL,
  },
  emptySchedule: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#627D98',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9FB3C8',
    marginTop: 4,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingTime: {
    width: 56,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAL,
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
  },
  serviceName: {
    fontSize: 13,
    color: '#627D98',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#627D98',
  },
});
