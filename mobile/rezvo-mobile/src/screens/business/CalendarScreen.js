import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { formatPrice } from '../../lib/api';

const { width } = Dimensions.get('window');
const TEAL = '#00BFA5';
const HOUR_HEIGHT = 80;
const TIME_COLUMN_WIDTH = 50;
const MIN_COLUMN_WIDTH = 140;

const SERVICE_COLORS = [
  '#00BFA5', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F97316'
];

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [bookings, setBookings] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingDetail, setShowBookingDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const scrollViewRef = useRef(null);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTime, setSelectedTime] = useState('10:00');

  // Hours from 6am to 10pm (22:00)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const fetchData = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [bookingsRes, membersRes, servicesRes] = await Promise.all([
        api.get(`/bookings?date=${dateStr}`).catch(() => ({ data: [] })),
        api.get('/team-members').catch(() => ({ data: [] })),
        api.get('/services').catch(() => ({ data: [] }))
      ]);
      
      setBookings(bookingsRes.data || []);
      setTeamMembers(membersRes.data || []);
      setServices(servicesRes.data || []);
      
      if (!selectedService && servicesRes.data?.length > 0) {
        setSelectedService(servicesRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    setTimeout(() => {
      // Scroll to show 8am at the top (2 hours from 6am start)
      scrollViewRef.current?.scrollTo({ y: HOUR_HEIGHT * 2, animated: false });
    }, 100);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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

  const getMonthDates = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const dates = [];
    // Add previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      dates.push({ date: d, isCurrentMonth: false });
    }
    // Add current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Add next month padding
    const remaining = 42 - dates.length;
    for (let i = 1; i <= remaining; i++) {
      dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getServiceColor = (serviceId) => {
    const index = services.findIndex(s => s.id === serviceId);
    return SERVICE_COLORS[index % SERVICE_COLORS.length];
  };

  const getMemberBookings = (memberId) => {
    return bookings.filter(b => 
      b.team_member_id === memberId || 
      (!b.team_member_id && memberId === 'unassigned')
    );
  };

  const getBookingsForDate = (date) => {
    return bookings.filter(b => 
      new Date(b.datetime).toDateString() === date.toDateString()
    );
  };

  const parseTime = (dateStr) => {
    if (!dateStr) return { hours: 0, minutes: 0 };
    const date = new Date(dateStr);
    return { hours: date.getHours(), minutes: date.getMinutes() };
  };

  const getBookingPosition = (booking) => {
    const { hours, minutes } = parseTime(booking.datetime);
    const top = (hours - 8) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
    const height = (booking.duration_min / 60) * HOUR_HEIGHT;
    return { top, height: Math.max(height, 30) };
  };

  const formatBookingTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  // Double tap handler for adding booking
  const handleTimeSlotPress = (hour, memberId = null) => {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    setSelectedTime(time);
    setSelectedMember(memberId ? teamMembers.find(m => m.id === memberId) : null);
    openAddModal();
  };

  const openAddModal = () => {
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setSelectedService(services[0] || null);
    if (!selectedMember) {
      setSelectedMember(teamMembers[0] || null);
    }
    setShowAddModal(true);
  };

  const handleAddBooking = async () => {
    if (!clientName || !clientEmail || !selectedService) {
      showToast('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await api.post('/bookings/with-team', {
        service_id: selectedService.id,
        team_member_id: selectedMember?.id || null,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        datetime_iso: bookingDate.toISOString(),
        notes: ''
      });

      setShowAddModal(false);
      fetchData();
      showToast('Booking created successfully!');
    } catch (error) {
      showToast('Could not create booking');
    } finally {
      setSaving(false);
    }
  };

  const formatDateHeader = (date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const changeDate = (amount) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + amount);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (amount * 7));
    } else {
      newDate.setDate(newDate.getDate() + amount);
    }
    setSelectedDate(newDate);
  };

  const columnCount = Math.max(teamMembers.length, 1);
  const columnWidth = Math.max((width - TIME_COLUMN_WIDTH - 20) / columnCount, MIN_COLUMN_WIDTH);

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
      {/* Toast */}
      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Date Navigation */}
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={24} color="#0A1626" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.todayBtn}
            onPress={() => setSelectedDate(new Date())}
          >
            <Text style={styles.dateText}>
              {viewMode === 'month' 
                ? selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                : formatDateHeader(selectedDate)
              }
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={24} color="#0A1626" />
          </TouchableOpacity>
        </View>

        {/* View Mode Tabs */}
        <View style={styles.viewTabs}>
          {['day', 'week', 'month'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.viewTab, viewMode === mode && styles.activeViewTab]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[styles.viewTabText, viewMode === mode && styles.activeViewTabText]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Week Strip - Only for Day/Week view */}
      {viewMode !== 'month' && (
        <View style={styles.weekContainer}>
          {weekDates.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const dayBookings = getBookingsForDate(date);
            
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayItem, isSelected && styles.selectedDay]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayName, isSelected && styles.selectedDayText]}>
                  {dayNames[index]}
                </Text>
                <View style={[
                  styles.dayNumber,
                  isSelected && styles.selectedDayNumber,
                  isToday && !isSelected && styles.todayNumber
                ]}>
                  <Text style={[
                    styles.dayNumberText,
                    isSelected && styles.selectedDayNumberText,
                    isToday && !isSelected && styles.todayNumberText
                  ]}>
                    {date.getDate()}
                  </Text>
                </View>
                {dayBookings.length > 0 && !isSelected && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <ScrollView
          ref={scrollViewRef}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
          }
          showsVerticalScrollIndicator={false}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.gridContainer}
          >
            <View style={styles.calendarGrid}>
              {/* Time Column */}
              <View style={styles.timeColumn}>
                {/* Empty header space */}
                <View style={styles.teamHeaderCell} />
                {hours.map((hour) => (
                  <View key={hour} style={styles.timeSlot}>
                    <Text style={styles.timeText}>
                      {hour.toString().padStart(2, '0')}:00
                    </Text>
                  </View>
                ))}
              </View>

              {/* Team Member Columns or Single Column */}
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <View key={member.id} style={[styles.dayColumn, { width: columnWidth }]}>
                    {/* Team Member Header - Part of the grid */}
                    <TouchableOpacity 
                      style={[styles.teamHeaderCell, { borderBottomWidth: 3, borderBottomColor: member.color || TEAL }]}
                      onPress={() => navigation.navigate('Team', { selectedMemberId: member.id })}
                    >
                      <View style={[styles.memberAvatar, { backgroundColor: member.color || TEAL }]}>
                        {member.avatar_url ? (
                          <Image source={{ uri: member.avatar_url }} style={styles.memberAvatarImg} />
                        ) : (
                          <Text style={styles.memberInitial}>{member.name?.charAt(0)}</Text>
                        )}
                      </View>
                      <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                    </TouchableOpacity>
                    
                    {/* Hour grid lines */}
                    {hours.map((hour) => (
                      <Pressable 
                        key={hour} 
                        style={styles.hourLine}
                        onPress={() => handleTimeSlotPress(hour, member.id)}
                      />
                    ))}
                    
                    {getMemberBookings(member.id).map((booking) => {
                        const { top, height } = getBookingPosition(booking);
                        const color = getServiceColor(booking.service_id);
                        const teamMember = teamMembers.find(m => m.id === booking.team_member_id);
                        return (
                          <TouchableOpacity
                            key={booking.id}
                            style={[
                              styles.bookingBlock,
                              { top, height, backgroundColor: color + '15' }
                            ]}
                            onPress={() => setShowBookingDetail(booking)}
                          >
                            {/* Colored top bar */}
                            <View style={[styles.bookingTopBar, { backgroundColor: color }]} />
                            <View style={styles.bookingContent}>
                              <Text style={[styles.bookingTime, { color }]}>
                                {formatBookingTime(booking.datetime)}
                              </Text>
                              <Text style={styles.bookingClient} numberOfLines={1}>
                                {booking.client_name}
                              </Text>
                              {height > 50 && (
                                <Text style={styles.bookingService} numberOfLines={1}>
                                  {booking.service_name}
                                </Text>
                              )}
                              {height > 65 && teamMember && (
                                <View style={styles.bookingTeamRow}>
                                  <View style={[styles.bookingTeamAvatar, { backgroundColor: teamMember.color || color }]}>
                                    {teamMember.avatar_url ? (
                                      <Image source={{ uri: teamMember.avatar_url }} style={styles.bookingTeamAvatarImg} />
                                    ) : (
                                      <Text style={styles.bookingTeamInitial}>{teamMember.name?.charAt(0)}</Text>
                                    )}
                                  </View>
                                  <Text style={styles.bookingTeamName} numberOfLines={1}>{teamMember.name}</Text>
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))
                ) : (
                  <View style={[styles.dayColumn, { width: width - TIME_COLUMN_WIDTH - 40 }]}>
                    {hours.map((hour) => (
                      <Pressable 
                        key={hour} 
                        style={styles.hourLine}
                        onPress={() => handleTimeSlotPress(hour)}
                      />
                    ))}
                    
                    {bookings.map((booking) => {
                      const { top, height } = getBookingPosition(booking);
                      const color = getServiceColor(booking.service_id);
                      const teamMember = teamMembers.find(m => m.id === booking.team_member_id);
                      return (
                        <TouchableOpacity
                          key={booking.id}
                          style={[
                            styles.bookingBlock,
                            { top, height, backgroundColor: color + '15' }
                          ]}
                          onPress={() => setShowBookingDetail(booking)}
                        >
                          {/* Colored top bar */}
                          <View style={[styles.bookingTopBar, { backgroundColor: color }]} />
                          <View style={styles.bookingContent}>
                            <Text style={[styles.bookingTime, { color }]}>
                              {formatBookingTime(booking.datetime)}
                            </Text>
                            <Text style={styles.bookingClient} numberOfLines={1}>
                              {booking.client_name}
                            </Text>
                            {height > 50 && (
                              <Text style={styles.bookingService} numberOfLines={1}>
                                {booking.service_name}
                              </Text>
                            )}
                            {height > 65 && teamMember && (
                              <View style={styles.bookingTeamRow}>
                                <View style={[styles.bookingTeamAvatar, { backgroundColor: teamMember.color || color }]}>
                                  {teamMember.avatar_url ? (
                                    <Image source={{ uri: teamMember.avatar_url }} style={styles.bookingTeamAvatarImg} />
                                  ) : (
                                    <Text style={styles.bookingTeamInitial}>{teamMember.name?.charAt(0)}</Text>
                                  )}
                                </View>
                                <Text style={styles.bookingTeamName} numberOfLines={1}>{teamMember.name}</Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* WEEK VIEW - Redesigned */}
      {viewMode === 'week' && (
        <ScrollView 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />}
          style={styles.weekViewContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Week days as horizontal scrollable cards */}
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dayBookings = getBookingsForDate(date);
            
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.weekDayCard, isToday && styles.weekDayCardToday]}
                onPress={() => { setSelectedDate(date); setViewMode('day'); }}
                activeOpacity={0.7}
              >
                {/* Day header */}
                <View style={styles.weekDayCardHeader}>
                  <View style={[styles.weekDayBadge, isToday && styles.weekDayBadgeToday]}>
                    <Text style={[styles.weekDayBadgeName, isToday && styles.weekDayBadgeNameToday]}>
                      {dayNames[index]}
                    </Text>
                    <Text style={[styles.weekDayBadgeDate, isToday && styles.weekDayBadgeDateToday]}>
                      {date.getDate()}
                    </Text>
                  </View>
                  <View style={styles.weekDayMeta}>
                    <Text style={styles.weekDayCount}>
                      {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#9FB3C8" />
                  </View>
                </View>
                
                {/* Bookings list */}
                {dayBookings.length > 0 ? (
                  <View style={styles.weekBookingsList}>
                    {dayBookings.slice(0, 3).map((booking) => {
                      const color = getServiceColor(booking.service_id);
                      const member = teamMembers.find(m => m.id === booking.team_member_id);
                      return (
                        <TouchableOpacity 
                          key={booking.id} 
                          style={[styles.weekBookingCard, { borderLeftColor: color }]}
                          onPress={() => setShowBookingDetail(booking)}
                        >
                          <View style={styles.weekBookingMain}>
                            <View style={styles.weekBookingInfo}>
                              <Text style={[styles.weekBookingTime, { color }]}>
                                {formatBookingTime(booking.datetime)}
                              </Text>
                              <Text style={styles.weekBookingClient} numberOfLines={1}>
                                {booking.client_name}
                              </Text>
                              <Text style={styles.weekBookingService} numberOfLines={1}>
                                {booking.service_name}
                              </Text>
                            </View>
                            {member && (
                              <View style={[styles.weekBookingAvatar, { backgroundColor: member.color || TEAL }]}>
                                {member.avatar_url ? (
                                  <Image source={{ uri: member.avatar_url }} style={styles.weekBookingAvatarImg} />
                                ) : (
                                  <Text style={styles.weekBookingAvatarText}>{member.name?.charAt(0)}</Text>
                                )}
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    {dayBookings.length > 3 && (
                      <Text style={styles.weekMoreText}>+{dayBookings.length - 3} more</Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.weekEmptyState}>
                    <Ionicons name="calendar-outline" size={20} color="#D1D5DB" />
                    <Text style={styles.weekEmptyText}>No bookings</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <ScrollView 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />}
          style={styles.monthContainer}
        >
          <View style={styles.monthHeader}>
            {dayNames.map((day) => (
              <View key={day} style={styles.monthDayHeader}>
                <Text style={styles.monthDayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.monthGrid}>
            {monthDates.map((item, index) => {
              const isToday = item.date.toDateString() === new Date().toDateString();
              const isSelected = item.date.toDateString() === selectedDate.toDateString();
              const dayBookings = getBookingsForDate(item.date);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.monthDay,
                    !item.isCurrentMonth && styles.monthDayOther,
                    isToday && styles.monthDayToday,
                    isSelected && styles.monthDaySelected,
                  ]}
                  onPress={() => { setSelectedDate(item.date); setViewMode('day'); }}
                >
                  <Text style={[
                    styles.monthDayText,
                    !item.isCurrentMonth && styles.monthDayTextOther,
                    isToday && styles.monthDayTextToday,
                    isSelected && styles.monthDayTextSelected,
                  ]}>
                    {item.date.getDate()}
                  </Text>
                  {dayBookings.length > 0 && (
                    <View style={styles.monthBookingDots}>
                      {dayBookings.slice(0, 3).map((b, i) => (
                        <View key={i} style={[styles.monthDot, { backgroundColor: getServiceColor(b.service_id) }]} />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Booking Detail Modal */}
      <Modal
        visible={!!showBookingDetail}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowBookingDetail(null)}
      >
        <Pressable style={styles.detailOverlay} onPress={() => setShowBookingDetail(null)}>
          <View style={styles.detailContent}>
            {showBookingDetail && (
              <>
                <View style={[styles.detailHeader, { backgroundColor: getServiceColor(showBookingDetail.service_id) }]}>
                  <Ionicons name="calendar" size={24} color="#FFF" />
                </View>
                <View style={styles.detailBody}>
                  <Text style={styles.detailClientName}>{showBookingDetail.client_name}</Text>
                  <Text style={styles.detailService}>{showBookingDetail.service_name}</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={18} color="#627D98" />
                    <Text style={styles.detailText}>{formatBookingTime(showBookingDetail.datetime)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={18} color="#627D98" />
                    <Text style={styles.detailText}>{formatPrice(showBookingDetail.price_pence)}</Text>
                  </View>
                  {showBookingDetail.client_email && (
                    <View style={styles.detailRow}>
                      <Ionicons name="mail-outline" size={18} color="#627D98" />
                      <Text style={styles.detailText}>{showBookingDetail.client_email}</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.detailCloseBtn} onPress={() => setShowBookingDetail(null)}>
                  <Text style={styles.detailCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Add Booking Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Booking</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#627D98" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Client Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter client name"
                  placeholderTextColor="#9FB3C8"
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="client@email.com"
                  placeholderTextColor="#9FB3C8"
                  value={clientEmail}
                  onChangeText={setClientEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+44 7123 456789"
                  placeholderTextColor="#9FB3C8"
                  value={clientPhone}
                  onChangeText={setClientPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {teamMembers.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Assign To</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {teamMembers.map((member) => (
                      <TouchableOpacity
                        key={member.id}
                        style={[
                          styles.memberOption,
                          selectedMember?.id === member.id && styles.selectedMemberOption
                        ]}
                        onPress={() => setSelectedMember(member)}
                      >
                        <View style={[styles.memberOptionAvatar, { backgroundColor: member.color || TEAL }]}>
                          <Text style={styles.memberOptionInitial}>{member.name?.charAt(0)}</Text>
                        </View>
                        <Text style={[
                          styles.memberOptionName,
                          selectedMember?.id === member.id && styles.selectedMemberOptionText
                        ]} numberOfLines={1}>
                          {member.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {services.map((service, index) => (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceOption,
                        selectedService?.id === service.id && { 
                          backgroundColor: SERVICE_COLORS[index % SERVICE_COLORS.length],
                          borderColor: SERVICE_COLORS[index % SERVICE_COLORS.length]
                        }
                      ]}
                      onPress={() => setSelectedService(service)}
                    >
                      <Text style={[
                        styles.serviceOptionName,
                        selectedService?.id === service.id && styles.selectedServiceOptionText
                      ]}>
                        {service.name}
                      </Text>
                      <Text style={[
                        styles.serviceOptionPrice,
                        selectedService?.id === service.id && styles.selectedServiceOptionText
                      ]}>
                        {formatPrice(service.price_pence)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        selectedTime === time && styles.selectedTimeOption
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        selectedTime === time && styles.selectedTimeOptionText
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleAddBooking}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Create Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toast: { position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: '#0A1626', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, zIndex: 1000 },
  toastText: { color: '#FFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0A1626' },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: TEAL, justifyContent: 'center', alignItems: 'center' },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  todayBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  dateText: { fontSize: 16, fontWeight: '600', color: '#0A1626' },
  viewTabs: { flexDirection: 'row', backgroundColor: '#F5F0E8', borderRadius: 12, padding: 4, marginBottom: 12 },
  viewTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeViewTab: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  viewTabText: { fontSize: 14, fontWeight: '600', color: '#627D98' },
  activeViewTabText: { color: TEAL },
  weekContainer: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 16, marginBottom: 12 },
  dayItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  selectedDay: { borderRadius: 12 },
  dayName: { fontSize: 11, color: '#9FB3C8', marginBottom: 6, fontWeight: '500' },
  selectedDayText: { color: TEAL, fontWeight: '600' },
  dayNumber: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  selectedDayNumber: { backgroundColor: TEAL },
  todayNumber: { borderWidth: 2, borderColor: TEAL },
  dayNumberText: { fontSize: 15, fontWeight: '500', color: '#0A1626' },
  selectedDayNumberText: { color: '#FFF' },
  todayNumberText: { color: TEAL },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: TEAL, marginTop: 4 },
  teamHeaderCell: { height: 70, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  teamHeader: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row' },
  teamColumn: { alignItems: 'center', paddingVertical: 8 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 4, overflow: 'hidden' },
  memberAvatarImg: { width: 36, height: 36, borderRadius: 18 },
  memberInitial: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  memberName: { fontSize: 12, color: '#627D98', fontWeight: '500' },
  gridContainer: { paddingHorizontal: 16 },
  calendarGrid: { flexDirection: 'row' },
  timeColumn: { width: TIME_COLUMN_WIDTH },
  timeSlot: { height: HOUR_HEIGHT, justifyContent: 'flex-start' },
  timeText: { fontSize: 11, color: '#9FB3C8', marginTop: -6 },
  dayColumn: { position: 'relative', borderLeftWidth: 1, borderLeftColor: '#E2E8F0', backgroundColor: '#FFF' },
  hourLine: { height: HOUR_HEIGHT, borderBottomWidth: 1, borderBottomColor: '#F5F0E8' },
  // Premium booking block styles
  bookingBlock: { position: 'absolute', left: 4, right: 4, borderRadius: 10, overflow: 'hidden' },
  bookingTopBar: { height: 3, width: '100%' },
  bookingContent: { padding: 6, flex: 1 },
  bookingTime: { fontSize: 10, fontWeight: '700' },
  bookingClient: { fontSize: 12, fontWeight: '700', color: '#0A1626', marginTop: 2 },
  bookingService: { fontSize: 10, color: '#627D98', marginTop: 1 },
  bookingTeamRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  bookingTeamAvatar: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bookingTeamAvatarImg: { width: 16, height: 16, borderRadius: 8 },
  bookingTeamInitial: { color: '#FFF', fontSize: 8, fontWeight: '600' },
  bookingTeamName: { fontSize: 9, color: '#627D98', fontWeight: '500', flex: 1 },
  // Week view - Redesigned card layout
  weekViewContainer: { flex: 1, paddingHorizontal: 16 },
  weekDayCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  weekDayCardToday: { borderWidth: 2, borderColor: TEAL },
  weekDayCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F0E8' },
  weekDayBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekDayBadgeToday: {},
  weekDayBadgeName: { fontSize: 14, fontWeight: '600', color: '#627D98', textTransform: 'uppercase' },
  weekDayBadgeNameToday: { color: TEAL },
  weekDayBadgeDate: { fontSize: 24, fontWeight: '700', color: '#0A1626' },
  weekDayBadgeDateToday: { color: TEAL },
  weekDayMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  weekDayCount: { fontSize: 13, color: '#9FB3C8', fontWeight: '500' },
  weekBookingsList: { padding: 12, gap: 8 },
  weekBookingCard: { backgroundColor: '#F9FAFB', borderRadius: 10, borderLeftWidth: 3, padding: 12, flexDirection: 'row', alignItems: 'center' },
  weekBookingMain: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekBookingInfo: { flex: 1 },
  weekBookingTime: { fontSize: 11, fontWeight: '700' },
  weekBookingClient: { fontSize: 14, fontWeight: '600', color: '#0A1626', marginTop: 2 },
  weekBookingService: { fontSize: 12, color: '#627D98', marginTop: 1 },
  weekBookingAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 12, overflow: 'hidden' },
  weekBookingAvatarImg: { width: 32, height: 32, borderRadius: 16 },
  weekBookingAvatarText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  weekMoreText: { fontSize: 12, color: TEAL, fontWeight: '600', textAlign: 'center', paddingVertical: 4 },
  weekEmptyState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 8 },
  weekEmptyText: { fontSize: 13, color: '#D1D5DB', fontWeight: '500' },
  // Month view
  monthContainer: { flex: 1, paddingHorizontal: 16 },
  monthHeader: { flexDirection: 'row', backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingVertical: 12 },
  monthDayHeader: { flex: 1, alignItems: 'center' },
  monthDayHeaderText: { fontSize: 12, fontWeight: '600', color: '#9FB3C8', textTransform: 'uppercase' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#FFF', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  monthDay: { width: '14.28%', height: 60, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#E2E8F0' },
  monthDayOther: { backgroundColor: '#F9FAFB' },
  monthDayToday: { backgroundColor: '#E8F5F3' },
  monthDaySelected: { backgroundColor: TEAL },
  monthDayText: { fontSize: 14, fontWeight: '500', color: '#0A1626' },
  monthDayTextOther: { color: '#9FB3C8' },
  monthDayTextToday: { color: TEAL, fontWeight: '700' },
  monthDayTextSelected: { color: '#FFF', fontWeight: '700' },
  monthBookingDots: { flexDirection: 'row', marginTop: 4, gap: 2 },
  monthDot: { width: 6, height: 6, borderRadius: 3 },
  // Detail Modal
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  detailContent: { backgroundColor: '#FFF', borderRadius: 20, width: '100%', maxWidth: 320, overflow: 'hidden' },
  detailHeader: { padding: 24, alignItems: 'center' },
  detailBody: { padding: 20 },
  detailClientName: { fontSize: 20, fontWeight: '700', color: '#0A1626', textAlign: 'center' },
  detailService: { fontSize: 14, color: '#627D98', textAlign: 'center', marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  detailText: { fontSize: 14, color: '#0A1626' },
  detailCloseBtn: { backgroundColor: '#F5F0E8', paddingVertical: 16, alignItems: 'center' },
  detailCloseBtnText: { fontSize: 16, fontWeight: '600', color: '#627D98' },
  // Add Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FDFBF7', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0A1626' },
  modalBody: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#0A1626', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0A1626' },
  memberOption: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFF', borderRadius: 12, marginRight: 10, borderWidth: 2, borderColor: 'transparent', minWidth: 80 },
  selectedMemberOption: { borderColor: TEAL, backgroundColor: '#E8F5F3' },
  memberOptionAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  memberOptionInitial: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  memberOptionName: { fontSize: 12, fontWeight: '500', color: '#627D98', maxWidth: 70 },
  selectedMemberOptionText: { color: TEAL },
  serviceOption: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  serviceOptionName: { fontSize: 14, fontWeight: '500', color: '#0A1626' },
  serviceOptionPrice: { fontSize: 12, color: '#627D98', marginTop: 2 },
  selectedServiceOptionText: { color: '#FFF' },
  timeOption: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFF', borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  selectedTimeOption: { backgroundColor: TEAL, borderColor: TEAL },
  timeOptionText: { fontSize: 14, fontWeight: '500', color: '#0A1626' },
  selectedTimeOptionText: { color: '#FFF' },
  modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 50, backgroundColor: '#F5F0E8', alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#627D98' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 50, backgroundColor: TEAL, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
