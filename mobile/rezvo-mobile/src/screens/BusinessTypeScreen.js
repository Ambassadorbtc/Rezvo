import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useGlobalToast } from '../context/ToastContext';
import api from '../lib/api';

const TEAL = '#00BFA5';

const BUSINESS_TYPES = [
  { id: 'hairdresser', label: 'Hairdresser', icon: 'cut-outline', color: '#EC4899' },
  { id: 'barber', label: 'Barber Shop', icon: 'cut-outline', color: '#3B82F6' },
  { id: 'beauty', label: 'Beauty Salon', icon: 'sparkles-outline', color: '#A855F7' },
  { id: 'nails', label: 'Nail Technician', icon: 'brush-outline', color: '#F43F5E' },
  { id: 'lashes', label: 'Lash & Brow', icon: 'sparkles-outline', color: '#8B5CF6' },
  { id: 'massage', label: 'Massage Therapist', icon: 'heart-outline', color: '#EF4444' },
  { id: 'personal_trainer', label: 'Personal Trainer', icon: 'barbell-outline', color: '#F97316' },
  { id: 'yoga', label: 'Yoga Instructor', icon: 'heart-outline', color: '#14B8A6' },
  { id: 'physiotherapy', label: 'Physiotherapist', icon: 'medkit-outline', color: '#06B6D4' },
  { id: 'driving', label: 'Driving Instructor', icon: 'car-outline', color: '#22C55E' },
  { id: 'dog_grooming', label: 'Dog Groomer', icon: 'paw-outline', color: '#F59E0B' },
  { id: 'pet_services', label: 'Pet Services', icon: 'paw-outline', color: '#84CC16' },
  { id: 'photography', label: 'Photographer', icon: 'camera-outline', color: '#6366F1' },
  { id: 'music', label: 'Music Teacher', icon: 'musical-notes-outline', color: '#D946EF' },
  { id: 'tutoring', label: 'Tutor / Coach', icon: 'book-outline', color: '#0EA5E9' },
  { id: 'tattoo', label: 'Tattoo Artist', icon: 'brush-outline', color: '#6B7280' },
  { id: 'cafe', label: 'Café / Coffee Shop', icon: 'cafe-outline', color: '#EAB308' },
  { id: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline', color: '#EF4444' },
  { id: 'food_truck', label: 'Food Truck', icon: 'restaurant-outline', color: '#F97316' },
  { id: 'cleaning', label: 'Cleaning Services', icon: 'home-outline', color: '#10B981' },
  { id: 'handyman', label: 'Handyman', icon: 'construct-outline', color: '#64748B' },
  { id: 'other', label: 'Other', icon: 'sparkles-outline', color: '#9CA3AF' },
];

export default function BusinessTypeScreen({ navigation }) {
  const { checkAuth } = useAuth();
  const { showToast } = useGlobalToast();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [customType, setCustomType] = useState('');

  const handleComplete = async () => {
    if (!selectedType) {
      showToast('Please select a business type', 'error');
      return;
    }

    if (selectedType === 'other' && !customType.trim()) {
      showToast('Please specify your business type', 'error');
      return;
    }

    setLoading(true);
    try {
      const businessType = selectedType === 'other' ? customType : selectedType;
      
      await api.post('/business/onboarding', {
        business_type: businessType,
        team_members: []
      });

      showToast('Business type saved!', 'success');
      
      // Navigate to onboarding wizard for location and team setup
      navigation.navigate('OnboardingWizard');
      
    } catch (error) {
      showToast('Failed to save settings', 'error');
      // Still try to proceed to onboarding
      navigation.navigate('OnboardingWizard');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Skip to onboarding wizard
    navigation.navigate('OnboardingWizard');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#0A1626" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.logoName}>rezvo</Text>
        </View>
        
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>Final step</Text>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>What type of business do you run?</Text>
        <Text style={styles.subtitle}>This helps us personalize your booking page</Text>
      </View>

      {/* Business Type Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {BUSINESS_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  isSelected && styles.typeCardSelected
                ]}
                onPress={() => setSelectedType(type.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${type.color}15` }]}>
                  <Ionicons name={type.icon} size={22} color={type.color} />
                </View>
                <Text style={[
                  styles.typeLabel,
                  isSelected && styles.typeLabelSelected
                ]}>
                  {type.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Type Input */}
        {selectedType === 'other' && (
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Specify your business type (e.g., Life Coach)"
              placeholderTextColor="#9FB3C8"
              value={customType}
              onChangeText={setCustomType}
            />
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedType || loading) && styles.buttonDisabled
          ]}
          onPress={handleComplete}
          disabled={!selectedType || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Complete Setup</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  skipText: {
    fontSize: 14,
    color: '#627D98',
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: TEAL,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#9FB3C8',
    marginTop: 8,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A1626',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#627D98',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  typeCardSelected: {
    borderColor: TEAL,
    backgroundColor: '#F0FDFA',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  typeLabelSelected: {
    color: '#0D9488',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customInputContainer: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  customInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0A1626',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 16,
    backgroundColor: '#FDFBF7',
  },
  continueButton: {
    backgroundColor: TEAL,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
