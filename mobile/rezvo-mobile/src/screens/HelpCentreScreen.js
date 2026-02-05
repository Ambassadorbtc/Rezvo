import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TEAL = '#00BFA5';

const FAQ_ITEMS = [
  {
    question: 'How do I create a booking?',
    answer: 'Go to the Calendar tab and tap the + button. Fill in the client details, select a service and time, then tap "Create Booking".'
  },
  {
    question: 'How do I add a new service?',
    answer: 'Navigate to the Services tab and tap "Add Service". Enter the service name, duration, and price, then save.'
  },
  {
    question: 'How do I share my booking link?',
    answer: 'Go to Settings > Share Link. You can copy your unique booking URL or share it directly via social media.'
  },
  {
    question: 'How do I manage my team?',
    answer: 'In Settings, tap "Team Members" to add, edit, or remove team members. You can assign services and set calendar colors for each member.'
  },
  {
    question: 'Can I sync with Google Calendar?',
    answer: 'Google Calendar sync is coming soon! You\'ll be able to automatically sync all bookings with your Google Calendar.'
  },
  {
    question: 'How do I upgrade to Pro?',
    answer: 'Tap "Upgrade to Pro" in the Settings page. Pro gives you unlimited bookings, advanced analytics, and priority support for just £4.99/month.'
  },
];

export default function HelpCentreScreen({ navigation }) {
  const [expandedIndex, setExpandedIndex] = React.useState(null);

  const handleQuickAction = (action) => {
    switch(action) {
      case 'getting-started':
        // Show getting started FAQ
        setExpandedIndex(0);
        break;
      case 'bookings':
        // Navigate to calendar with booking creation
        navigation.navigate('Calendar');
        break;
      case 'team':
        // Navigate to team settings
        navigation.navigate('Team');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0A1626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Centre</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#9FB3C8" />
          <Text style={styles.searchPlaceholder}>Search for help...</Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Help</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('getting-started')}>
            <View style={[styles.quickIcon, { backgroundColor: '#E8F5F3' }]}>
              <Ionicons name="play-circle-outline" size={22} color={TEAL} />
            </View>
            <Text style={styles.quickText}>Getting Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('bookings')}>
            <View style={[styles.quickIcon, { backgroundColor: '#FEF3E2' }]}>
              <Ionicons name="calendar-outline" size={22} color="#F59E0B" />
            </View>
            <Text style={styles.quickText}>Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction('team')}>
            <View style={[styles.quickIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="people-outline" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.quickText}>Team</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
            onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Ionicons 
                name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#9FB3C8" 
              />
            </View>
            {expandedIndex === index && (
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact */}
        <View style={styles.contactCard}>
          <Ionicons name="chatbubbles-outline" size={28} color={TEAL} />
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSubtitle}>Our support team is here to assist you</Text>
          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <Text style={styles.contactBtnText}>Contact Support</Text>
          </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    gap: 10,
  },
  searchPlaceholder: {
    color: '#9FB3C8',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#627D98',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0A1626',
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A1626',
    flex: 1,
    paddingRight: 12,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#627D98',
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F0E8',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
    marginTop: 12,
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#627D98',
    marginTop: 4,
  },
  contactBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
