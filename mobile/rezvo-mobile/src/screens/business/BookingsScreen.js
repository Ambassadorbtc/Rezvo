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
  all: { label: 'All', color: '#627D98', bg: '#F5F0E8' },
  pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7' },
  confirmed: { label: 'Confirmed', color: '#16A34A', bg: '#DCFCE7' },
  completed: { label: 'Completed', color: '#3B82F6', bg: '#DBEAFE' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
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
      `${newStatus === 'confirmed' ? 'Confirm' : newStatus === 'cancelled' ? 'Cancel' : 'Update'} Booking`,
      `Are you sure you want to ${newStatus === 'confirmed' ? 'confirm' : newStatus === 'cancelled' ? 'cancel' : 'update'} this booking?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: async () => {
            try {
              await api.patch(`/bookings/${booking.id}`, { status: newStatus });
              fetchBookings();
              Alert.alert('Success', `Booking ${newStatus}`);
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

  // Group by date
  const groupedBookings = filteredBookings.reduce((groups, booking) => {
    const date = new Date(booking.datetime).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(booking);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedBookings).sort((a, b) => new Date(a) - new Date(b));

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
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredBookings.length}</Text>
          </View>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterChip,
              filter === key && { backgroundColor: TEAL }
            ]}
            onPress={() => setFilter(key)}
          >
            <Text style={[
              styles.filterText,
              filter === key && { color: '#FFFFFF' }
            ]}>
              {config.label}
            </Text>
            {key !== 'all' && (
              <View style={[
                styles.filterCount,
                filter === key && { backgroundColor: 'rgba(255,255,255,0.3)' }
              ]}>
                <Text style={[
                  styles.filterCountText,
                  filter === key && { color: '#FFFFFF' }
                ]}>
                  {bookings.filter(b => b.status === key).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
        contentContainerStyle={styles.listContainer}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' ? 'Share your link to get bookings' : `No ${filter} bookings`}
            </Text>
          </View>
        ) : (
          sortedDates.map(date => (
            <View key={date}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
              {groupedBookings[date].map((booking) => (
                <View key={booking.id} style={styles.bookingCard}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.timeContainer}>
                      <Ionicons name="time-outline" size={16} color={TEAL} />
                      <Text style={styles.timeText}>{formatTime(booking.datetime)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[booking.status]?.bg }]}>
                      <Text style={[styles.statusText, { color: STATUS_CONFIG[booking.status]?.color }]}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>

                  {/* Client Info */}
                  <View style={styles.clientSection}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{booking.client_name?.charAt(0)}</Text>
                    </View>
                    <View style={styles.clientInfo}>
                      <Text style={styles.clientName}>{booking.client_name}</Text>
                      <Text style={styles.clientEmail}>{booking.client_email}</Text>
                    </View>
                  </View>

                  {/* Service & Price */}
                  <View style={styles.serviceRow}>
                    <View style={styles.serviceInfo}>
                      <Ionicons name="cut-outline" size={16} color="#627D98" />
                      <Text style={styles.serviceName}>{booking.service_name}</Text>
                    </View>
                    <Text style={styles.price}>{formatPrice(booking.price_pence)}</Text>
                  </View>

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <View style={styles.actions}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.confirmBtn]}
                        onPress={() => handleStatusChange(booking, 'confirmed')}
                      >
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        <Text style={styles.confirmBtnText}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.cancelBtn]}
                        onPress={() => handleStatusChange(booking, 'cancelled')}
                      >
                        <Ionicons name="close" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {booking.status === 'confirmed' && (
                    <View style={styles.actions}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.completeBtn]}
                        onPress={() => handleStatusChange(booking, 'completed')}
                      >
                        <Ionicons name="checkmark-done" size={18} color="#3B82F6" />
                        <Text style={styles.completeBtnText}>Mark Complete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A1626',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: TEAL,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#627D98',
  },
  filterCount: {
    backgroundColor: '#F5F0E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#627D98',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#627D98',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9FB3C8',
    marginTop: 4,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9FB3C8',
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEAL,
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
  clientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0E8',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAL,
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
  },
  clientEmail: {
    fontSize: 13,
    color: '#627D98',
    marginTop: 2,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceName: {
    fontSize: 14,
    color: '#627D98',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A1626',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F0E8',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: TEAL,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelBtn: {
    width: 48,
    backgroundColor: '#FEE2E2',
  },
  completeBtn: {
    flex: 1,
    backgroundColor: '#DBEAFE',
  },
  completeBtnText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
});
