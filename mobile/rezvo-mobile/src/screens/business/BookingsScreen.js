import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { formatPrice } from '../../lib/api';

const TEAL = '#00BFA5';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle-outline' },
  completed: { label: 'Completed', color: '#3B82F6', bg: '#DBEAFE', icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
};

export default function BookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
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

  const handleStatusChange = async (booking, newStatus) => {
    Alert.alert(
      `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} Booking`,
      `Are you sure you want to ${newStatus} this booking?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: async () => {
            try {
              await api.patch(`/bookings/${booking.id}`, { status: newStatus });
              fetchBookings();
            } catch (error) {
              Alert.alert('Error', 'Could not update booking');
            }
          }
        },
      ]
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const groupedBookings = filteredBookings.reduce((groups, booking) => {
    const date = formatDate(booking.datetime);
    if (!groups[date]) groups[date] = [];
    groups[date].push(booking);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedBookings);

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

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
        <View>
          <Text style={styles.headerTitle}>Bookings</Text>
          <Text style={styles.headerSubtitle}>{bookings.length} total appointments</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity 
          style={[styles.statCard, filter === 'pending' && styles.statCardActive]}
          onPress={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
        >
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={18} color="#F59E0B" />
          </View>
          <Text style={styles.statCount}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, filter === 'confirmed' && styles.statCardActive]}
          onPress={() => setFilter(filter === 'confirmed' ? 'all' : 'confirmed')}
        >
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
          </View>
          <Text style={styles.statCount}>{confirmedCount}</Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, filter === 'all' && styles.statCardActive]}
          onPress={() => setFilter('all')}
        >
          <View style={[styles.statIcon, { backgroundColor: '#E8F5F3' }]}>
            <Ionicons name="calendar-outline" size={18} color={TEAL} />
          </View>
          <Text style={styles.statCount}>{bookings.length}</Text>
          <Text style={styles.statLabel}>All</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySubtitle}>
              Share your booking link to start{'\n'}receiving appointments
            </Text>
          </View>
        ) : (
          sortedDates.map(date => (
            <View key={date}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{date}</Text>
                <View style={styles.dateLine} />
              </View>
              
              {groupedBookings[date].map((booking) => {
                const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                
                return (
                  <View key={booking.id} style={styles.bookingCard}>
                    {/* Time Badge */}
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeText}>{formatTime(booking.datetime)}</Text>
                    </View>

                    {/* Main Content */}
                    <View style={styles.cardContent}>
                      {/* Client Row */}
                      <View style={styles.clientRow}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {booking.client_name?.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.clientInfo}>
                          <Text style={styles.clientName}>{booking.client_name}</Text>
                          <Text style={styles.serviceName}>{booking.service_name}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                          <Ionicons name={status.icon} size={12} color={status.color} />
                          <Text style={[styles.statusText, { color: status.color }]}>
                            {status.label}
                          </Text>
                        </View>
                      </View>

                      {/* Price Row */}
                      <View style={styles.priceRow}>
                        <View style={styles.priceInfo}>
                          <Text style={styles.priceLabel}>Service fee</Text>
                          <Text style={styles.priceValue}>{formatPrice(booking.price_pence)}</Text>
                        </View>
                        
                        {booking.duration_min && (
                          <View style={styles.durationInfo}>
                            <Ionicons name="time-outline" size={14} color="#9FB3C8" />
                            <Text style={styles.durationText}>{booking.duration_min} min</Text>
                          </View>
                        )}
                      </View>

                      {/* Actions */}
                      {booking.status === 'pending' && (
                        <View style={styles.actions}>
                          <TouchableOpacity 
                            style={styles.confirmBtn}
                            onPress={() => handleStatusChange(booking, 'confirmed')}
                          >
                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                            <Text style={styles.confirmBtnText}>Confirm</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.declineBtn}
                            onPress={() => handleStatusChange(booking, 'cancelled')}
                          >
                            <Ionicons name="close" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      )}

                      {booking.status === 'confirmed' && (
                        <TouchableOpacity 
                          style={styles.completeBtn}
                          onPress={() => handleStatusChange(booking, 'completed')}
                        >
                          <Ionicons name="checkmark-done" size={18} color="#3B82F6" />
                          <Text style={styles.completeBtnText}>Mark as Complete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0A1626',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9FB3C8',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statCardActive: {
    borderColor: TEAL,
    backgroundColor: '#F0FDF9',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A1626',
  },
  statLabel: {
    fontSize: 12,
    color: '#9FB3C8',
    fontWeight: '500',
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#627D98',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9FB3C8',
    textAlign: 'center',
    lineHeight: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 14,
    gap: 12,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#627D98',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#0A1626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  timeBadge: {
    backgroundColor: TEAL,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 12,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardContent: {
    padding: 16,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0A1626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 13,
    color: '#627D98',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F5F0E8',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#9FB3C8',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1626',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    color: '#9FB3C8',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F5F0E8',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TEAL,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  declineBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    marginTop: 14,
  },
  completeBtnText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
});
