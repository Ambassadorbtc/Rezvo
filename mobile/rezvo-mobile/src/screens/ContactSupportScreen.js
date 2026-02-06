import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalToast } from '../context/ToastContext';
import api from '../lib/api';
import { format, isToday, isYesterday } from 'date-fns';

const TEAL = '#00BFA5';

export default function ContactSupportScreen({ navigation }) {
  const { showToast } = useGlobalToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [liveChatStatus, setLiveChatStatus] = useState({ is_online: false });
  
  // Flashing animation for online indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchConversations();
    fetchLiveChatStatus();
    
    // Poll for live chat status every 30 seconds
    const interval = setInterval(fetchLiveChatStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Start pulse animation when online
    if (liveChatStatus.is_online) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [liveChatStatus.is_online]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchLiveChatStatus = async () => {
    try {
      const res = await api.get('/support/live-chat-status');
      setLiveChatStatus(res.data);
    } catch (error) {
      console.error('Error fetching live chat status:', error);
    }
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@rezvo.app?subject=' + encodeURIComponent(subject || 'Support Request'));
  };

  const handleLiveChatPress = () => {
    navigation.navigate('SupportChat');
  };

  const handleSubmit = async () => {
    if (!subject || !message) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/conversations', {
        content: message,
        subject: subject,
        recipient_type: 'support'
      });
      
      showToast('Message sent! Opening chat...', 'success');
      setSubject('');
      setMessage('');
      
      // Navigate to the chat with the new conversation
      navigation.navigate('SupportChat', {
        conversation: {
          id: res.data.conversation_id,
          subject: subject,
          status: 'open',
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return { bg: '#FEF3C7', text: '#D97706' };
      case 'resolved': return { bg: '#D1FAE5', text: '#059669' };
      case 'closed': return { bg: '#E5E7EB', text: '#6B7280' };
      default: return { bg: '#FEF3C7', text: '#D97706' };
    }
  };

  const renderConversation = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => navigation.navigate('SupportChat', { conversation: item })}
      >
        <View style={styles.conversationIcon}>
          <Ionicons name="chatbubble" size={18} color={TEAL} />
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationSubject} numberOfLines={1}>
              {item.subject || 'Support Request'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {item.status || 'Open'}
              </Text>
            </View>
          </View>
          <Text style={styles.conversationPreview} numberOfLines={1}>
            {item.last_message_preview || item.last_message || 'No messages yet'}
          </Text>
          <Text style={styles.conversationDate}>{formatDate(item.last_message_at)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9FB3C8" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0A1626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.optionCard} onPress={handleEmailPress}>
            <View style={[styles.optionIcon, { backgroundColor: '#E8F5F3' }]}>
              <Ionicons name="mail-outline" size={22} color={TEAL} />
            </View>
            <Text style={styles.optionTitle}>Email</Text>
            <Text style={styles.optionValue}>support@rezvo.app</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionCard} onPress={handleLiveChatPress}>
            <View style={[styles.optionIcon, { backgroundColor: liveChatStatus.is_online ? '#E8F5F3' : '#FEE2E2' }]}>
              <Ionicons 
                name="chatbubble-outline" 
                size={22} 
                color={liveChatStatus.is_online ? TEAL : '#EF4444'} 
              />
            </View>
            <View style={styles.liveChatHeader}>
              <Text style={styles.optionTitle}>Live Chat</Text>
              <Animated.View 
                style={[
                  styles.statusDot, 
                  { 
                    backgroundColor: liveChatStatus.is_online ? '#10B981' : '#EF4444',
                    opacity: liveChatStatus.is_online ? pulseAnim : 1
                  }
                ]} 
              />
            </View>
            <Text style={[styles.optionValue, { color: liveChatStatus.is_online ? '#10B981' : '#EF4444' }]}>
              {liveChatStatus.is_online ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Response Time */}
        <View style={styles.responseCard}>
          <Ionicons name="time-outline" size={18} color={TEAL} />
          <Text style={styles.responseText}>
            {liveChatStatus.is_online 
              ? 'We\'re online! Get instant support.' 
              : 'Average response time: '}
            {!liveChatStatus.is_online && <Text style={styles.responseBold}>Under 24 hours</Text>}
          </Text>
        </View>

        {/* Past Messages Section */}
        <View style={styles.pastMessagesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Past Messages</Text>
            {conversations.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('SupportChat')}>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {loadingConversations ? (
            <ActivityIndicator size="small" color={TEAL} style={{ marginTop: 16 }} />
          ) : conversations.length === 0 ? (
            <View style={styles.emptyMessages}>
              <Ionicons name="chatbubbles-outline" size={32} color="#9FB3C8" />
              <Text style={styles.emptyText}>No previous conversations</Text>
            </View>
          ) : (
            <View style={styles.conversationsList}>
              {conversations.slice(0, 3).map((item) => (
                <React.Fragment key={item.id}>
                  {renderConversation({ item })}
                </React.Fragment>
              ))}
              {conversations.length > 3 && (
                <TouchableOpacity 
                  style={styles.showMoreBtn}
                  onPress={() => navigation.navigate('SupportChat')}
                >
                  <Text style={styles.showMoreText}>
                    Show {conversations.length - 3} more conversations
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={TEAL} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* New Message Form */}
        <Text style={styles.sectionTitle}>Send a New Message</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="What's this about?"
            placeholderTextColor="#9FB3C8"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your issue or question..."
            placeholderTextColor="#9FB3C8"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Send Message</Text>
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Business Hours */}
        <View style={styles.hoursCard}>
          <Text style={styles.hoursTitle}>Business Hours</Text>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Monday - Friday</Text>
            <Text style={styles.hoursTime}>9:00 AM - 6:00 PM GMT</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Saturday - Sunday</Text>
            <Text style={styles.hoursTime}>Closed</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0A1626',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 2,
  },
  optionValue: {
    fontSize: 12,
    color: '#627D98',
  },
  responseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F3',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 24,
  },
  responseText: {
    fontSize: 13,
    color: '#0A1626',
    flex: 1,
  },
  responseBold: {
    fontWeight: '600',
    color: TEAL,
  },
  pastMessagesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 13,
    color: TEAL,
    fontWeight: '500',
  },
  emptyMessages: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#627D98',
  },
  conversationsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  conversationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  conversationSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  conversationPreview: {
    fontSize: 13,
    color: '#627D98',
    marginBottom: 2,
  },
  conversationDate: {
    fontSize: 11,
    color: '#9FB3C8',
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 4,
  },
  showMoreText: {
    fontSize: 13,
    color: TEAL,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334E68',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0A1626',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  hoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  hoursDay: {
    fontSize: 13,
    color: '#627D98',
  },
  hoursTime: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0A1626',
  },
});
