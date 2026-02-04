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
import api, { formatPrice, formatDate, formatTime } from '../../lib/api';

const TEAL = '#00BFA5';

export default function BookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      case 'completed': return '#627D98';
      default: return '#627D98';
    }
  };

  const filteredBookings = bookings.filter(b => {
    const bookingDate = new Date(b.datetime);
    const now = new Date();
    if (activeTab === 'upcoming') {
      return bookingDate >= now && b.status !== 'cancelled';
    } else {
      return bookingDate < now || b.status === 'cancelled';
    }
  });

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'upcoming' 
                ? 'Book your first appointment to get started'
                : 'Your past bookings will appear here'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.bookButtonText}>Find Services</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <TouchableOpacity key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.businessIcon}>
                  <Ionicons name="storefront" size={24} color={TEAL} />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.serviceName}>{booking.service_name}</Text>
                  <Text style={styles.businessName}>Business Name</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {booking.status}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#627D98" />
                  <Text style={styles.detailText}>{formatDate(booking.datetime)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#627D98" />
                  <Text style={styles.detailText}>{formatTime(booking.datetime)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="cash-outline" size={16} color="#627D98" />
                  <Text style={styles.detailText}>{formatPrice(booking.price_pence)}</Text>
                </View>
              </View>

              {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                <View style={styles.bookingActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="create-outline" size={18} color={TEAL} />
                    <Text style={styles.actionText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                    <Ionicons name="close-outline" size={18} color="#EF4444" />
                    <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#627D98',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#627D98',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9FB3C8',
    marginTop: 4,
    textAlign: 'center',
  },
  bookButton: {
    marginTop: 24,
    backgroundColor: TEAL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  businessName: {
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
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#627D98',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F0E8',
    gap: 6,
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEAL,
  },
  cancelText: {
    color: '#EF4444',
  },
});
