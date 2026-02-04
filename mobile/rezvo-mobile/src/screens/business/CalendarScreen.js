import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const mockBookings = [
  { id: '1', day: 2, hour: 10, client: 'Emma Watson', service: 'Haircut', duration: 1 },
  { id: '2', day: 2, hour: 14, client: 'John Smith', service: 'Beard Trim', duration: 0.5 },
  { id: '3', day: 3, hour: 11, client: 'Sarah Connor', service: 'Colouring', duration: 2 },
  { id: '4', day: 4, hour: 9, client: 'Mike Brown', service: 'Full Treatment', duration: 2.5 },
];

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const today = new Date();

  const getBookingsForDay = (dayIndex) => {
    return mockBookings.filter((b) => b.day === dayIndex);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'day' && styles.toggleBtnActive]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[styles.toggleText, viewMode === 'day' && styles.toggleTextActive]}>
              Day
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navIcon}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Week Days Header */}
      <View style={styles.weekHeader}>
        {weekDates.map((date, index) => {
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayHeader, isSelected && styles.dayHeaderSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                {DAYS[index]}
              </Text>
              <View style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                <Text style={[
                  styles.dayNumberText,
                  isToday && styles.dayNumberTextToday,
                  isSelected && styles.dayNumberTextSelected,
                ]}>
                  {date.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarGrid}>
          {/* Time Labels */}
          <View style={styles.timeColumn}>
            {HOURS.map((hour) => (
              <View key={hour} style={styles.timeSlot}>
                <Text style={styles.timeLabel}>
                  {hour.toString().padStart(2, '0')}:00
                </Text>
              </View>
            ))}
          </View>

          {/* Day Columns */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.daysContainer}>
              {weekDates.map((date, dayIndex) => (
                <View key={dayIndex} style={styles.dayColumn}>
                  {HOURS.map((hour) => (
                    <View key={hour} style={styles.hourSlot}>
                      {/* Bookings */}
                      {getBookingsForDay(dayIndex)
                        .filter((b) => b.hour === hour)
                        .map((booking) => (
                          <TouchableOpacity
                            key={booking.id}
                            style={[
                              styles.bookingBlock,
                              { height: booking.duration * 60 },
                            ]}
                          >
                            <Text style={styles.bookingClient} numberOfLines={1}>
                              {booking.client}
                            </Text>
                            <Text style={styles.bookingService} numberOfLines={1}>
                              {booking.service}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Add Booking FAB */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    padding: 4,
  },
  toggleBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  toggleBtnActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  toggleText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.text,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.lg,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  navIcon: {
    fontSize: 20,
    color: colors.text,
  },
  monthTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dayHeaderSelected: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.lg,
  },
  dayName: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 4,
  },
  dayNameSelected: {
    color: colors.primary,
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberToday: {
    backgroundColor: colors.primary,
  },
  dayNumberText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text,
  },
  dayNumberTextToday: {
    color: colors.surface,
  },
  dayNumberTextSelected: {
    color: colors.primary,
  },
  calendarScroll: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: 56,
    paddingTop: spacing.xs,
  },
  timeSlot: {
    height: 60,
    justifyContent: 'flex-start',
    paddingTop: 2,
    paddingRight: spacing.sm,
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  daysContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  dayColumn: {
    width: 80,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
  },
  hourSlot: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    position: 'relative',
  },
  bookingBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    overflow: 'hidden',
  },
  bookingClient: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.surface,
  },
  bookingService: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl + 80,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.surface,
    fontWeight: '300',
  },
});
