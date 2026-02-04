import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { formatPrice } from '../../lib/api';

const TEAL = '#00BFA5';

const TEAM_COLORS = [
  '#00BFA5', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#F97316'
];

export default function TeamScreen({ navigation }) {
  const [members, setMembers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('staff');
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0]);
  const [selectedServices, setSelectedServices] = useState([]);

  const fetchData = async () => {
    try {
      const [membersRes, servicesRes] = await Promise.all([
        api.get('/team-members'),
        api.get('/services')
      ]);
      setMembers(membersRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole('staff');
    setSelectedColor(TEAM_COLORS[members.length % TEAM_COLORS.length]);
    setSelectedServices([]);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setName(member.name);
    setEmail(member.email || '');
    setPhone(member.phone || '');
    setRole(member.role);
    setSelectedColor(member.color || TEAL);
    setSelectedServices(member.service_ids || []);
    setShowEditModal(true);
  };

  const handleAddMember = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setSaving(true);
    try {
      await api.post('/team-members', {
        name,
        email: email || null,
        phone: phone || null,
        role,
        color: selectedColor,
        service_ids: selectedServices,
      });
      setShowAddModal(false);
      fetchData();
      Alert.alert('Success', 'Team member added');
    } catch (error) {
      Alert.alert('Error', 'Could not add team member');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/team-members/${selectedMember.id}`, {
        name,
        email: email || null,
        phone: phone || null,
        role,
        color: selectedColor,
        service_ids: selectedServices,
      });
      setShowEditModal(false);
      fetchData();
      Alert.alert('Success', 'Team member updated');
    } catch (error) {
      Alert.alert('Error', 'Could not update team member');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = () => {
    Alert.alert(
      'Delete Team Member',
      `Are you sure you want to remove ${selectedMember.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/team-members/${selectedMember.id}`);
              setShowEditModal(false);
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Could not delete team member');
            }
          }
        },
      ]
    );
  };

  const toggleService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const MemberForm = ({ onSave, onClose, isEdit = false }) => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{isEdit ? 'Edit Team Member' : 'Add Team Member'}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#627D98" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalBody}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Team member name"
            placeholderTextColor="#9FB3C8"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            placeholderTextColor="#9FB3C8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="+44 7123 456789"
            placeholderTextColor="#9FB3C8"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Role</Text>
          <View style={styles.roleOptions}>
            {['staff', 'manager', 'admin'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleOption, role === r && styles.selectedRoleOption]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.roleOptionText, role === r && styles.selectedRoleOptionText]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Calendar Color</Text>
          <View style={styles.colorOptions}>
            {TEAM_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorOption
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Can Perform Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCheckbox,
                  selectedServices.includes(service.id) && styles.selectedServiceCheckbox
                ]}
                onPress={() => toggleService(service.id)}
              >
                <View style={[
                  styles.checkbox,
                  selectedServices.includes(service.id) && styles.checkedBox
                ]}>
                  {selectedServices.includes(service.id) && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.modalFooter}>
        {isEdit && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteMember}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={onSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>{isEdit ? 'Update' : 'Add'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0A1626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
        contentContainerStyle={styles.content}
      >
        {members.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>No team members yet</Text>
            <Text style={styles.emptySubtitle}>Add your first team member to get started</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add Team Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          members.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.memberCard}
              onPress={() => openEditModal(member)}
            >
              <View style={[styles.avatar, { backgroundColor: member.color || TEAL }]}>
                <Text style={styles.avatarText}>{member.name?.charAt(0)}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
                {member.email && (
                  <Text style={styles.memberEmail}>{member.email}</Text>
                )}
              </View>
              <View style={styles.memberStats}>
                <Text style={styles.statValue}>{member.bookings_completed || 0}</Text>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C1C7CD" />
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <MemberForm 
            onSave={handleAddMember}
            onClose={() => setShowAddModal(false)}
          />
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <MemberForm 
            onSave={handleUpdateMember}
            onClose={() => setShowEditModal(false)}
            isEdit={true}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
    textAlign: 'center',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#627D98',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9FB3C8',
    marginTop: 4,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  memberRole: {
    fontSize: 13,
    color: TEAL,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#9FB3C8',
    marginTop: 2,
  },
  memberStats: {
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A1626',
  },
  statLabel: {
    fontSize: 11,
    color: '#9FB3C8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A1626',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A1626',
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
  roleOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
  },
  selectedRoleOption: {
    backgroundColor: TEAL,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#627D98',
  },
  selectedRoleOptionText: {
    color: '#FFFFFF',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#0A1626',
  },
  servicesGrid: {
    gap: 10,
  },
  serviceCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  selectedServiceCheckbox: {
    borderColor: TEAL,
    backgroundColor: '#E8F5F3',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  serviceName: {
    fontSize: 15,
    color: '#0A1626',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  deleteBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#627D98',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: TEAL,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
