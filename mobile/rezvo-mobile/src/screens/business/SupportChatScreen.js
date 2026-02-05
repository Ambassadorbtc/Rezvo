import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useGlobalToast } from '../../context/ToastContext';
import { format, isToday, isYesterday } from 'date-fns';

const TEAL = '#00BFA5';

export default function SupportChatScreen({ navigation, route }) {
  const { user } = useAuth();
  const { showToast } = useGlobalToast();
  const flatListRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(route?.params?.conversation || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(res.data || []);
      // Scroll to bottom after loading
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleStartConversation = async () => {
    if (!newMessage.trim()) {
      showToast('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/conversations', {
        content: newMessage,
        subject: newSubject || 'Support Request',
        recipient_type: 'support'
      });
      
      setNewMessage('');
      setNewSubject('');
      setShowNewTicket(false);
      await fetchConversations();
      
      // Select the newly created conversation
      const newConv = { 
        id: res.data.conversation_id, 
        subject: newSubject || 'Support Request',
        status: 'open',
        created_at: new Date().toISOString()
      };
      setSelectedConversation(newConv);
      await fetchMessages(res.data.conversation_id);
      
      showToast('Support ticket created!');
    } catch (error) {
      showToast('Failed to create ticket');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await api.post(`/conversations/${selectedConversation.id}/messages`, {
        content: newMessage
      });
      
      setNewMessage('');
      await fetchMessages(selectedConversation.id);
      await fetchConversations();
    } catch (error) {
      showToast('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const formatTime = (dateStr) => {
    return format(new Date(dateStr), 'HH:mm');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return { bg: '#FEF3C7', text: '#D97706' };
      case 'resolved': return { bg: '#D1FAE5', text: '#059669' };
      case 'closed': return { bg: '#E5E7EB', text: '#6B7280' };
      default: return { bg: '#FEF3C7', text: '#D97706' };
    }
  };

  // Render conversation list
  if (!selectedConversation && !showNewTicket) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#0A1626" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support</Text>
          <TouchableOpacity 
            onPress={() => setShowNewTicket(true)}
            style={styles.newBtn}
          >
            <Ionicons name="add" size={22} color={TEAL} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={TEAL} />
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={48} color={TEAL} />
            </View>
            <Text style={styles.emptyTitle}>No support tickets</Text>
            <Text style={styles.emptyText}>Create a ticket to get help from our team</Text>
            <TouchableOpacity 
              style={styles.createBtn}
              onPress={() => setShowNewTicket(true)}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.createBtnText}>New Ticket</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchConversations(); }}
                tintColor={TEAL}
              />
            }
            renderItem={({ item }) => {
              const statusColor = getStatusColor(item.status);
              return (
                <TouchableOpacity 
                  style={styles.conversationItem}
                  onPress={() => setSelectedConversation(item)}
                >
                  <View style={styles.convIcon}>
                    <Ionicons name="chatbubble" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.convContent}>
                    <View style={styles.convHeader}>
                      <Text style={styles.convSubject} numberOfLines={1}>
                        {item.subject || 'Support Request'}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                        <Text style={[styles.statusText, { color: statusColor.text }]}>
                          {item.status || 'open'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.convMessage} numberOfLines={1}>
                      {item.last_message || 'No messages'}
                    </Text>
                    <Text style={styles.convDate}>
                      {item.last_message_at ? formatDate(item.last_message_at) : formatDate(item.created_at)}
                    </Text>
                  </View>
                  {item.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread_count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    );
  }

  // Render new ticket form
  if (showNewTicket) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowNewTicket(false)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#0A1626" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Ticket</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.newTicketForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of your issue"
              placeholderTextColor="#9FB3C8"
              value={newSubject}
              onChangeText={setNewSubject}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue in detail..."
              placeholderTextColor="#9FB3C8"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, sending && styles.submitBtnDisabled]}
            onPress={handleStartConversation}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Submit Ticket</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render chat view
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedConversation(null)} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0A1626" />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedConversation?.subject || 'Support'}
          </Text>
          <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusColor(selectedConversation?.status).bg }]}>
            <Text style={[styles.statusTextSmall, { color: getStatusColor(selectedConversation?.status).text }]}>
              {selectedConversation?.status || 'open'}
            </Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchMessages(selectedConversation.id); }}
              tintColor={TEAL}
            />
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            // Own messages: NOT admin AND sender matches current user
            const isOwn = !item.is_admin && (item.sender_id === user?.id || item.sender_id === user?.sub);
            
            return (
              <View style={[styles.messageRow, isOwn ? styles.messageRowOwn : styles.messageRowOther]}>
                {!isOwn && (
                  <View style={styles.avatarSupport}>
                    <Ionicons name="headset" size={14} color="#FFFFFF" />
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther
                ]}>
                  {!isOwn && (
                    <Text style={styles.senderName}>Support Team</Text>
                  )}
                  <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesText}>No messages yet</Text>
            </View>
          }
        />

        {/* Input Area */}
        {selectedConversation?.status !== 'closed' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor="#9FB3C8"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, (!newMessage.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        )}

        {selectedConversation?.status === 'closed' && (
          <View style={styles.closedNotice}>
            <Text style={styles.closedText}>This ticket is closed</Text>
          </View>
        )}
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0A1626',
    maxWidth: 200,
  },
  newBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  chatHeaderInfo: {
    flex: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1626',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#627D98',
    textAlign: 'center',
    marginBottom: 20,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0E8',
  },
  convIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEAL,
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
    gap: 8,
    marginBottom: 4,
  },
  convSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
    flex: 1,
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
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  statusTextSmall: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  convMessage: {
    fontSize: 13,
    color: '#627D98',
    marginBottom: 4,
  },
  convDate: {
    fontSize: 11,
    color: '#9FB3C8',
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  newTicketForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0A1626',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0A1626',
  },
  textArea: {
    height: 140,
    paddingTop: 12,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  avatarSupport: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleOwn: {
    backgroundColor: TEAL,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: TEAL,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#0A1626',
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 10,
    color: '#9FB3C8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMessagesText: {
    fontSize: 14,
    color: '#9FB3C8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F5F0E8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0A1626',
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  closedNotice: {
    paddingVertical: 14,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
  },
  closedText: {
    fontSize: 13,
    color: '#627D98',
  },
});
