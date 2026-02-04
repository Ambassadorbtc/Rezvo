import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api, { formatPrice } from '../../lib/api';

const TEAL = '#00BFA5';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/business/stats'),
        api.get('/bookings')
      ]);
      setStats(statsRes.data);
      // Filter today's bookings
      const today = new Date().toDateString();
      const todaysBookings = (bookingsRes.data || []).filter(b => 
        new Date(b.datetime).toDateString() === today
      );
      setTodayBookings(todaysBookings);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
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
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}</Text>
            <Text style={styles.businessName}>{user?.business_name || 'Your Business'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#0A1626" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5F3' }]}>
            <Ionicons name="calendar" size={24} color={TEAL} />
            <Text style={styles.statValue}>{stats?.today_bookings || 0}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{stats?.pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="cash" size={24} color="#6366F1" />
            <Text style={styles.statValue}>{formatPrice((stats?.revenue || 0) * 100)}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
            <Ionicons name="people" size={24} color="#EC4899" />
            <Text style={styles.statValue}>{stats?.total_clients || 0}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Calendar')}>
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5F3' }]}>
                <Ionicons name="calendar" size={22} color={TEAL} />
              </View>
              <Text style={styles.actionText}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Services')}>
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="cut" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Settings')}>
              <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="share-social" size={22} color="#6366F1" />
              </View>
              <Text style={styles.actionText}>Share Link</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {todayBookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={40} color="#E2E8F0" />
              <Text style={styles.emptyText}>No bookings today</Text>
            </View>
          ) : (
            todayBookings.slice(0, 3).map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingTime}>
                  <Text style={styles.timeText}>
                    {new Date(booking.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingService}>{booking.service_name}</Text>
                  <Text style={styles.bookingClient}>{booking.client_name}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: booking.status === 'confirmed' ? '#10B981' : '#F59E0B' }]} />
              </View>
            ))
          )}
        </View>
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
    fontSize: 15,
    color: '#627D98',
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
    marginTop: 4,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#627D98',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: TEAL,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0A1626',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 15,
    color: '#627D98',
    marginTop: 12,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingTime: {
    backgroundColor: '#F5F0E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingService: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
  },
  bookingClient: {
    fontSize: 13,
    color: '#627D98',
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
