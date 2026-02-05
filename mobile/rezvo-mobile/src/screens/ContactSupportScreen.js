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
import { useGlobalToast } from '../context/ToastContext';
import api from '../lib/api';

const TEAL = '#00BFA5';

export default function ContactSupportScreen({ navigation }) {
  const { showToast } = useGlobalToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    console.log('[ContactSupport] Creating new ticket:', { subject, message: message.substring(0, 30) });
    setLoading(true);
    try {
      // Create real support conversation via API
      const res = await api.post('/conversations', {
        content: message,
        subject: subject,
        recipient_type: 'support'
      });
      
      console.log('[ContactSupport] Ticket created:', res.data);
      showToast('Message sent! Opening chat...', 'success');
      
      // Navigate to SupportChat with the new conversation
      navigation.replace('SupportChat', {
        conversation: {
          id: res.data.conversation_id,
          subject: subject,
          status: 'open',
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[ContactSupport] Error creating ticket:', error.response?.data || error.message);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
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
          <TouchableOpacity style={styles.optionCard}>
            <View style={[styles.optionIcon, { backgroundColor: '#E8F5F3' }]}>
              <Ionicons name="mail-outline" size={22} color={TEAL} />
            </View>
            <Text style={styles.optionTitle}>Email</Text>
            <Text style={styles.optionValue}>support@rezvo.app</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('SupportChat')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#E8F5F3' }]}>
              <Ionicons name="chatbubble-outline" size={22} color={TEAL} />
            </View>
            <Text style={styles.optionTitle}>Live Chat</Text>
            <Text style={[styles.optionValue, { color: TEAL }]}>Open Chat →</Text>
          </TouchableOpacity>
        </View>

        {/* Response Time */}
        <View style={styles.responseCard}>
          <Ionicons name="time-outline" size={18} color={TEAL} />
          <Text style={styles.responseText}>Average response time: <Text style={styles.responseBold}>Under 24 hours</Text></Text>
        </View>

        {/* Contact Form */}
        <Text style={styles.sectionTitle}>Send us a message</Text>
        
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
              <Ionicons name="send" size={16} color="#FFFFFF" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  content: {
    paddingHorizontal: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 14,
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
    gap: 8,
    marginBottom: 24,
  },
  responseText: {
    fontSize: 13,
    color: '#0A1626',
  },
  responseBold: {
    fontWeight: '600',
    color: TEAL,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#627D98',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0A1626',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0A1626',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  hoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0E8',
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
