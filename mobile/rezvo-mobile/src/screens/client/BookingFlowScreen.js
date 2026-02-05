import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { formatPrice } from '../../lib/api';
import { useGlobalToast } from '../../context/ToastContext';

const TEAL = '#00BFA5';

export default function BookingFlowScreen({ navigation, route }) {
  const { showToast } = useGlobalToast();
  const { businessId, serviceId, serviceName, price, duration } = route.params;
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Generate time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const formatDateDisplay = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()]
    };
  };

  const handleConfirmBooking = async () => {
    if (!clientName || !clientEmail || !clientPhone) {
      showToast('Please fill in all contact details', 'error');
      return;
    }

    setLoading(true);
    try {
      const bookingDate = new Date(selectedDate);
      const [hours, mins] = selectedTime.split(':');
      bookingDate.setHours(parseInt(hours), parseInt(mins), 0, 0);

      const response = await api.post('/public/bookings', {
        service_id: serviceId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        datetime_iso: bookingDate.toISOString(),
        notes: notes
      });

      showToast('Booking confirmed! Check your email for confirmation.', 'success');
      navigation.popToTop();
    } catch (error) {
      showToast(error.response?.data?.detail || 'Could not complete booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (step > 1) setStep(step - 1);
          else navigation.goBack();
        }}>
          <Ionicons name="arrow-back" size={24} color="#0A1626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Service Info */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceIcon}>
            <Ionicons name="cut" size={24} color={TEAL} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{serviceName}</Text>
            <Text style={styles.serviceDetails}>{duration} min • {formatPrice(price)}</Text>
          </View>
        </View>

        {/* Step 1: Select Date */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.datesRow}>
                {dates.map((date, index) => {
                  const d = formatDateDisplay(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>{d.day}</Text>
                      <Text style={[styles.dateNum, isSelected && styles.dateTextSelected]}>{d.date}</Text>
                      <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{d.month}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={[styles.stepTitle, { marginTop: 24 }]}>Select Time</Text>
            <View style={styles.timesGrid}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeSlot, selectedTime === time && styles.timeSlotSelected]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.continueBtn, (!selectedDate || !selectedTime) && styles.continueBtnDisabled]}
              disabled={!selectedDate || !selectedTime}
              onPress={() => setStep(2)}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#627D98" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#9FB3C8"
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#627D98" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9FB3C8"
                  value={clientEmail}
                  onChangeText={setClientEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#627D98" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone"
                  placeholderTextColor="#9FB3C8"
                  value={clientPhone}
                  onChangeText={setClientPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingVertical: 12 }]}>
                <TextInput
                  style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                  placeholder="Any special requests..."
                  placeholderTextColor="#9FB3C8"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.continueBtn, (!clientName || !clientEmail || !clientPhone) && styles.continueBtnDisabled]}
              disabled={!clientName || !clientEmail || !clientPhone}
              onPress={() => setStep(3)}
            >
              <Text style={styles.continueBtnText}>Review Booking</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirm Booking</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryValue}>{serviceName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date</Text>
                <Text style={styles.summaryValue}>
                  {selectedDate?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Time</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{duration} minutes</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(price)}</Text>
              </View>
            </View>

            <View style={styles.contactSummary}>
              <Text style={styles.contactSummaryTitle}>Contact Details</Text>
              <Text style={styles.contactSummaryText}>{clientName}</Text>
              <Text style={styles.contactSummaryText}>{clientEmail}</Text>
              <Text style={styles.contactSummaryText}>{clientPhone}</Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
              onPress={handleConfirmBooking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A1626',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: TEAL,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  serviceDetails: {
    fontSize: 14,
    color: '#627D98',
    marginTop: 2,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 16,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  dateCard: {
    width: 70,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateCardSelected: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  dateDay: {
    fontSize: 13,
    color: '#627D98',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1626',
  },
  dateMonth: {
    fontSize: 13,
    color: '#627D98',
    marginTop: 4,
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeSlotSelected: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A1626',
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  continueBtn: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 24,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A1626',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 12,
    fontSize: 16,
    color: '#0A1626',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#627D98',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A1626',
  },
  summaryTotal: {
    borderBottomWidth: 0,
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: TEAL,
  },
  contactSummary: {
    backgroundColor: '#F5F0E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  contactSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 8,
  },
  contactSummaryText: {
    fontSize: 14,
    color: '#627D98',
    marginBottom: 2,
  },
  confirmBtn: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
