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
    const statusInterval = setInterval(fetchLiveChatStatus, 30000);
    // Poll for conversations every 10 seconds
    const convInterval = setInterval(fetchConversations, 10000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(convInterval);
    };
  }, []);

  useEffect(() => {
    // Start pulse animation when online
    if (liveChatStatus.is_online) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
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

  const handleEmailPress = async () => {
    // Open email client
    const emailSubject = subject || 'Support Request';
    const emailBody = message || '';
    const mailtoUrl = `mailto:support@rezvo.app?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    try {
      await Linking.openURL(mailtoUrl);
      
      // Also create a conversation in the system if there's content
      if (subject && message) {
        await api.post('/conversations', {
          content: `[Sent via Email]\n\n${message}`,
          subject: subject,
          recipient_type: 'support'
        });
        showToast('Email opened & message logged', 'success');
        setSubject('');
        setMessage('');
        fetchConversations();
      }
    } catch (error) {
      showToast('Could not open email app', 'error');
    }
  };

  const handleLiveChatPress = () => {
    // Navigate to SupportChat (the live chat window)
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
      
      showToast('Message sent!', 'success');
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
    if (isToday(date)) return format(date, 'HH:mm');
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0A1626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Options - Email & Live Chat */}
        <View style={styles.optionsRow}>
          {/* Email Card */}
          <TouchableOpacity style={styles.optionCard} onPress={handleEmailPress}>
            <View style={[styles.optionIcon, { backgroundColor: '#E8F5F3' }]}>
              <Ionicons name="mail-outline" size={24} color={TEAL} />
            </View>
            <Text style={styles.optionTitle}>Email</Text>
            <Text style={styles.optionValue}>support@rezvo.app</Text>
          </TouchableOpacity>
          
          {/* Live Chat Card */}
          <TouchableOpacity style={styles.optionCard} onPress={handleLiveChatPress}>
            <View style={[styles.optionIcon, { backgroundColor: liveChatStatus.is_online ? '#D1FAE5' : '#FEE2E2' }]}>
              <Ionicons 
                name="chatbubble-outline" 
                size={24} 
                color={liveChatStatus.is_online ? '#10B981' : '#EF4444'} 
              />
            </View>
            <View style={styles.liveChatTitleRow}>
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
            Average response time: <Text style={styles.responseBold}>Under 24 hours</Text>
          </Text>
        </View>

        {/* Past Messages Section */}
        {conversations.length > 0 && (
          <View style={styles.pastMessagesSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>PAST MESSAGES</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SupportChat')}>
                <Text style={styles.viewAllBtn}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.conversationsList}>
              {conversations.slice(0, 3).map((conv, index) => {
                const statusColor = getStatusColor(conv.status);
                return (
                  <TouchableOpacity 
                    key={conv.id}
                    style={[
                      styles.conversationItem,
                      index === conversations.slice(0, 3).length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => navigation.navigate('SupportChat', { conversation: conv })}
                  >
                    <View style={styles.convIcon}>
                      <Ionicons name="chatbubble" size={16} color={TEAL} />
                    </View>
                    <View style={styles.convContent}>
                      <View style={styles.convHeader}>
                        <Text style={styles.convSubject} numberOfLines={1}>
                          {conv.subject || 'Support Request'}
                        </Text>
                        <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
                          <Text style={[styles.statusText, { color: statusColor.text }]}>
                            {conv.status || 'Open'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.convPreview} numberOfLines={1}>
                        {conv.last_message_preview || conv.last_message || 'No messages'}
                      </Text>
                      <Text style={styles.convDate}>{formatDate(conv.last_message_at)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Send Us a Message Form */}
        <Text style={styles.sectionTitle}>SEND US A MESSAGE</Text>
        
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
            numberOfLines={5}
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
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Business Hours */}
        <Text style={styles.sectionTitle}>BUSINESS HOURS</Text>
        <View style={styles.hoursCard}>
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
    paddingVertical: 14,
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
    fontSize: 18,
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
    shadowRadius: 3,
    elevation: 2,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveChatTitleRow: {
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
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
  },
  optionValue: {
    fontSize: 12,
    color: '#627D98',
    marginTop: 2,
  },
  responseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F3',
    borderRadius: 10,
    padding: 12,
    gap: 10,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  viewAllBtn: {
    fontSize: 13,
    color: TEAL,
    fontWeight: '500',
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
  convIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  convContent: {
    flex: 1,
  },
  convHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  convSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  convPreview: {
    fontSize: 13,
    color: '#627D98',
    marginBottom: 2,
  },
  convDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
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
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  hoursDay: {
    fontSize: 14,
    color: '#627D98',
  },
  hoursTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A1626',
  },
});
