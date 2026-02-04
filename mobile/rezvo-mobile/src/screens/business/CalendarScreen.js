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
import api, { formatTime } from '../../lib/api';

const TEAL = '#00BFA5';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Generate week dates
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter bookings for selected date
  const dayBookings = bookings.filter(b => 
    new Date(b.datetime).toDateString() === selectedDate.toDateString()
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#627D98';
    }
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => {
          const newDate = new Date(selectedDate);
          newDate.setMonth(newDate.getMonth() - 1);
          setSelectedDate(newDate);
        }}>
          <Ionicons name="chevron-back" size={24} color="#0A1626" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => {
          const newDate = new Date(selectedDate);
          newDate.setMonth(newDate.getMonth() + 1);
          setSelectedDate(newDate);
        }}>
          <Ionicons name="chevron-forward" size={24} color="#0A1626" />
        </TouchableOpacity>
      </View>

      {/* Week View */}
      <View style={styles.weekContainer}>
        {weekDates.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          const hasBookings = bookings.some(b => new Date(b.datetime).toDateString() === date.toDateString());
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayCell, isSelected && styles.dayCellSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>{dayNames[index]}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dayTextSelected, isToday && !isSelected && styles.dayToday]}>
                {date.getDate()}
              </Text>
              {hasBookings && <View style={[styles.bookingDot, isSelected && styles.bookingDotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Day Schedule */}
      <ScrollView
        style={styles.scheduleContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
      >
        <Text style={styles.scheduleTitle}>
          {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        
        {dayBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#E2E8F0" />
            <Text style={styles.emptyText}>No bookings for this day</Text>
            <Text style={styles.emptySubtext}>Enjoy your free time!</Text>
          </View>
        ) : (
          dayBookings.sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={[styles.statusLine, { backgroundColor: getStatusColor(booking.status) }]} />
              <View style={styles.bookingContent}>
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingTime}>{formatTime(booking.datetime)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.serviceName}>{booking.service_name}</Text>
                <View style={styles.clientRow}>
                  <Ionicons name="person-outline" size={14} color="#627D98" />
                  <Text style={styles.clientName}>{booking.client_name}</Text>
                </View>
              </View>
            </View>
          ))
        )}
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
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 4,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayCellSelected: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  dayName: {
    fontSize: 11,
    color: '#627D98',
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  dayToday: {
    color: TEAL,
  },
  bookingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TEAL,
    marginTop: 4,
  },
  bookingDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  scheduleContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#627D98',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9FB3C8',
    marginTop: 4,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusLine: {
    width: 4,
  },
  bookingContent: {
    flex: 1,
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 4,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientName: {
    fontSize: 14,
    color: '#627D98',
  },
});
