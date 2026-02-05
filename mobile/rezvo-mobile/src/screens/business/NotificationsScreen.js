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
import api from '../../lib/api';
import { useGlobalToast } from '../../context/ToastContext';

const TEAL = '#00BFA5';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showSuccess, showError } = useGlobalToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Get bookings, conversations, and other notifications
      const [bookingsRes, conversationsRes] = await Promise.all([
        api.get('/bookings').catch(() => ({ data: [] })),
        api.get('/conversations').catch(() => ({ data: [] }))
      ]);
      
      const notifs = [];
      
      // Add pending booking notifications
      const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      const pendingBookings = bookings.filter(b => b.status === 'pending');
      pendingBookings.forEach(b => {
        notifs.push({
          id: `booking-${b.id}`,
          type: 'booking',
          title: 'New Booking Request',
          message: `${b.client_name} requested ${b.service_name}`,
          time: b.created_at || b.datetime,
          read: false,
          icon: 'calendar',
          color: '#3B82F6',
          action: () => navigation.navigate('Bookings')
        });
      });
      
      // Add support message notifications
      const conversations = Array.isArray(conversationsRes.data) ? conversationsRes.data : [];
      conversations.filter(c => c.unread_count > 0).forEach(c => {
        notifs.push({
          id: `support-${c.id}`,
          type: 'support',
          title: 'Support Message',
          message: c.last_message?.substring(0, 50) + '...' || 'New message',
          time: c.last_message_at,
          read: false,
          icon: 'chatbubble',
          color: '#8B5CF6'
        });
      });
      
      // Add some sample notifications if empty
      if (notifs.length === 0) {
        notifs.push({
          id: 'welcome',
          type: 'system',
          title: 'Welcome to Rezvo!',
          message: 'Your account is set up and ready to receive bookings.',
          time: new Date().toISOString(),
          read: true,
          icon: 'sparkles',
          color: TEAL
        });
      }
      
      // Sort by time
      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showSuccess('All notifications marked as read');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#0A1626" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity 
              key={notif.id}
              style={[styles.notificationCard, !notif.read && styles.unreadCard]}
              onPress={notif.action}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: notif.color + '20' }]}>
                <Ionicons name={notif.icon} size={22} color={notif.color} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
                <Text style={styles.notifTime}>{formatTime(notif.time)}</Text>
              </View>
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
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1626',
    marginLeft: 12,
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAL,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1626',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F0FDF9',
    borderLeftWidth: 3,
    borderLeftColor: TEAL,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEAL,
    marginLeft: 8,
  },
  notifMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
