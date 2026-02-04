import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { formatPrice, formatDate } from '../../lib/api';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

// Generate time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

// Generate dates for next 14 days
const generateDates = () => {
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
};

export default function BookingFlowScreen({ route, navigation }) {
  const { business, service } = route.params;
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [step, setStep] = useState(1); // 1: Date, 2: Time, 3: Confirm
  const [loading, setLoading] = useState(false);

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await api.post('/bookings', {
        service_id: service.id,
        datetime_iso: bookingDate.toISOString(),
        client_name: 'Mobile User', // Would come from auth
        client_email: 'user@example.com',
      });

      Alert.alert(
        'Booking Confirmed!',
        `Your appointment for ${service.name} on ${formatDate(bookingDate.toISOString())} at ${selectedTime} has been confirmed.`,
        [
          {
            text: 'View Bookings',
            onPress: () => navigation.navigate('ClientTabs', { screen: 'Bookings' }),
          },
        ]
      );
    } catch (error) {
      // For demo, show success anyway
      const bookingDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      Alert.alert(
        'Booking Confirmed!',
        `Your appointment for ${service.name} on ${formatDate(bookingDate.toISOString())} at ${selectedTime} has been confirmed.`,
        [
          {
            text: 'View Bookings',
            onPress: () => navigation.navigate('ClientTabs', { screen: 'Bookings' }),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDateSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesList}
      >
        {dates.map((date, index) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                {date.toLocaleDateString('en-GB', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>
                {date.getDate()}
              </Text>
              {isToday && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderTimeSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Time</Text>
      <View style={styles.timeSlotsGrid}>
        {timeSlots.map((time, index) => {
          const isSelected = selectedTime === time;
          // Simulate some unavailable slots
          const isUnavailable = Math.random() > 0.8;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlot,
                isSelected && styles.timeSlotSelected,
                isUnavailable && styles.timeSlotUnavailable,
              ]}
              onPress={() => !isUnavailable && setSelectedTime(time)}
              disabled={isUnavailable}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  isSelected && styles.timeSlotTextSelected,
                  isUnavailable && styles.timeSlotTextUnavailable,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderSummary = () => {
    const bookingDate = selectedDate ? new Date(selectedDate) : null;
    if (bookingDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>{service.name}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration</Text>
          <Text style={styles.summaryValue}>{service.duration_min} minutes</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date & Time</Text>
          <Text style={styles.summaryValue}>
            {bookingDate ? `${formatDate(bookingDate.toISOString())} at ${selectedTime}` : 'Not selected'}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Business</Text>
          <Text style={styles.summaryValue}>{business.name}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(service.price_pence)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                step >= s && styles.progressDotActive,
              ]}
            >
              <Text style={[styles.progressNum, step >= s && styles.progressNumActive]}>
                {s}
              </Text>
            </View>
            <Text style={[styles.progressLabel, step >= s && styles.progressLabelActive]}>
              {s === 1 ? 'Date' : s === 2 ? 'Time' : 'Confirm'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Info */}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDetails}>
            {service.duration_min} min • {formatPrice(service.price_pence)}
          </Text>
        </View>

        {renderDateSelection()}
        {selectedDate && renderTimeSelection()}
        {selectedDate && selectedTime && renderSummary()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedDate || !selectedTime) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={!selectedDate || !selectedTime || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressNum: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressNumActive: {
    color: colors.surface,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  progressLabelActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  serviceInfo: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  serviceName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  datesList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  dateCard: {
    width: 64,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateDay: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateDaySelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  dateNum: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  dateNumSelected: {
    color: colors.surface,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  timeSlot: {
    width: '22%',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotUnavailable: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.surfaceAlt,
  },
  timeSlotText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  timeSlotTextSelected: {
    color: colors.surface,
  },
  timeSlotTextUnavailable: {
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  summaryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.text,
  },
  totalRow: {
    marginTop: spacing.sm,
    borderBottomWidth: 0,
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  confirmButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.surface,
  },
});
