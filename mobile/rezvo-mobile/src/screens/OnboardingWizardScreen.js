import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useGlobalToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');
const TEAL = '#00BFA5';

const BUSINESS_TYPES = [
  { id: 'hairdresser', label: 'Hairdresser', icon: 'cut-outline', color: '#EC4899' },
  { id: 'barber', label: 'Barber Shop', icon: 'cut-outline', color: '#3B82F6' },
  { id: 'beauty', label: 'Beauty Salon', icon: 'sparkles-outline', color: '#A855F7' },
  { id: 'nails', label: 'Nail Technician', icon: 'hand-left-outline', color: '#F43F5E' },
  { id: 'lashes', label: 'Lash & Brow', icon: 'eye-outline', color: '#8B5CF6' },
  { id: 'massage', label: 'Massage Therapist', icon: 'body-outline', color: '#EF4444' },
  { id: 'personal_trainer', label: 'Personal Trainer', icon: 'barbell-outline', color: '#F97316' },
  { id: 'yoga', label: 'Yoga Instructor', icon: 'fitness-outline', color: '#14B8A6' },
  { id: 'physiotherapy', label: 'Physiotherapist', icon: 'medical-outline', color: '#06B6D4' },
  { id: 'driving', label: 'Driving Instructor', icon: 'car-outline', color: '#22C55E' },
  { id: 'dog_grooming', label: 'Dog Groomer', icon: 'paw-outline', color: '#F59E0B' },
  { id: 'pet_services', label: 'Pet Services', icon: 'paw-outline', color: '#84CC16' },
  { id: 'photography', label: 'Photographer', icon: 'camera-outline', color: '#6366F1' },
  { id: 'music', label: 'Music Teacher', icon: 'musical-notes-outline', color: '#D946EF' },
  { id: 'tutoring', label: 'Tutor / Coach', icon: 'book-outline', color: '#0EA5E9' },
  { id: 'tattoo', label: 'Tattoo Artist', icon: 'brush-outline', color: '#64748B' },
  { id: 'cleaning', label: 'Cleaning Services', icon: 'home-outline', color: '#10B981' },
  { id: 'handyman', label: 'Handyman', icon: 'build-outline', color: '#475569' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', color: '#6B7280' },
];

const TEAM_ROLES = [
  'Owner', 'Manager', 'Senior Stylist', 'Stylist', 'Junior Stylist',
  'Therapist', 'Trainer', 'Instructor', 'Assistant', 'Receptionist', 'Other'
];

export default function OnboardingWizardScreen({ navigation }) {
  const { showToast } = useGlobalToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    businessType: '',
    address: '',
    postcode: '',
    city: '',
    teamMembers: []
  });

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Stylist');

  const steps = [
    { title: 'Business Type', subtitle: 'What type of business do you run?' },
    { title: 'Location', subtitle: 'Where is your business located?' },
    { title: 'Team', subtitle: 'Add your team members (optional)' },
  ];

  const handleNext = () => {
    if (currentStep === 0 && !data.businessType) {
      showToast('Please select a business type');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update business profile
      await api.put('/business', {
        business_type: data.businessType,
        address: `${data.address}, ${data.city}, ${data.postcode}`.trim().replace(/^,|,$/g, ''),
      });

      // Add team members if any
      for (const member of data.teamMembers) {
        try {
          await api.post('/team', {
            name: member.name,
            role: member.role,
          });
        } catch (e) {
          console.log('Could not add team member:', member.name);
        }
      }

      // Mark onboarding as complete
      await api.post('/user/complete-onboarding');

      showToast('Setup complete! Welcome to Rezvo');
      navigation.reset({
        index: 0,
        routes: [{ name: 'BusinessTabs' }],
      });
    } catch (error) {
      showToast('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = () => {
    if (!newMemberName.trim()) {
      showToast('Please enter a name');
      return;
    }
    setData({
      ...data,
      teamMembers: [...data.teamMembers, { name: newMemberName.trim(), role: newMemberRole }]
    });
    setNewMemberName('');
  };

  const removeTeamMember = (index) => {
    const updated = [...data.teamMembers];
    updated.splice(index, 1);
    setData({ ...data, teamMembers: updated });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stepContent}>
            <View style={styles.typeGrid}>
              {BUSINESS_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    data.businessType === type.id && styles.typeCardSelected
                  ]}
                  onPress={() => setData({ ...data, businessType: type.id })}
                >
                  <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
                    <Ionicons name={type.icon} size={24} color={type.color} />
                  </View>
                  <Text style={[
                    styles.typeLabel,
                    data.businessType === type.id && styles.typeLabelSelected
                  ]}>{type.label}</Text>
                  {data.businessType === type.id && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        );

      case 1:
        return (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Address</Text>
              <TextInput
                style={styles.input}
                placeholder="123 High Street"
                placeholderTextColor="#9FB3C8"
                value={data.address}
                onChangeText={(text) => setData({ ...data, address: text })}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="London"
                  placeholderTextColor="#9FB3C8"
                  value={data.city}
                  onChangeText={(text) => setData({ ...data, city: text })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Postcode</Text>
                <TextInput
                  style={styles.input}
                  placeholder="SW1A 1AA"
                  placeholderTextColor="#9FB3C8"
                  value={data.postcode}
                  onChangeText={(text) => setData({ ...data, postcode: text })}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.tipBox}>
              <Ionicons name="information-circle-outline" size={20} color={TEAL} />
              <Text style={styles.tipText}>This address will be shown on your booking page</Text>
            </View>
          </KeyboardAvoidingView>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            {/* Add Member Form */}
            <View style={styles.addMemberForm}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Team Member Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Smith"
                  placeholderTextColor="#9FB3C8"
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                />
              </View>
              
              <TouchableOpacity style={styles.addMemberBtn} onPress={addTeamMember}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Role Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleSelector}>
              {TEAM_ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleChip,
                    newMemberRole === role && styles.roleChipSelected
                  ]}
                  onPress={() => setNewMemberRole(role)}
                >
                  <Text style={[
                    styles.roleChipText,
                    newMemberRole === role && styles.roleChipTextSelected
                  ]}>{role}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Team Members List */}
            <Text style={styles.sectionTitle}>
              {data.teamMembers.length > 0 ? `Team (${data.teamMembers.length})` : 'No team members yet'}
            </Text>
            
            <ScrollView style={styles.membersList}>
              {data.teamMembers.map((member, index) => (
                <View key={index} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>{member.name[0]}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeTeamMember(index)}>
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={20} color={TEAL} />
              <Text style={styles.tipText}>You can always add more team members later in Settings</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {currentStep > 0 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#0A1626" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.logoName}>rezvo</Text>
        </View>
        
        <TouchableOpacity onPress={handleComplete} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentStep + 1) / steps.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {currentStep + 1} of {steps.length}</Text>
      </View>

      {/* Step Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{steps[currentStep].title}</Text>
        <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
      </View>

      {/* Step Content */}
      {renderStepContent()}

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueBtnText}>
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
              </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
    backgroundColor: TEAL,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A1626',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    color: '#627D98',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: TEAL,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#9FB3C8',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#627D98',
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 100,
  },
  typeCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  typeCardSelected: {
    borderColor: TEAL,
    backgroundColor: '#F0FDFA',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  typeLabelSelected: {
    color: '#0D9488',
  },
  checkBadge: {
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0A1626',
  },
  inputRow: {
    flexDirection: 'row',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#0D9488',
    lineHeight: 18,
  },
  addMemberForm: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  addMemberBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleSelector: {
    marginBottom: 20,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  roleChipSelected: {
    backgroundColor: TEAL,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#627D98',
  },
  roleChipTextSelected: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 12,
  },
  membersList: {
    flex: 1,
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A1626',
  },
  memberRole: {
    fontSize: 13,
    color: '#627D98',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  continueBtn: {
    backgroundColor: TEAL,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
