import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { formatPrice } from '../../lib/api';

const TEAL = '#00BFA5';

export default function ServicesScreen() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setPrice((service.price_pence / 100).toString());
      setDuration(service.duration_min.toString());
      setDescription(service.description || '');
    } else {
      setEditingService(null);
      setName('');
      setPrice('');
      setDuration('');
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name || !price || !duration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name,
        price_pence: Math.round(parseFloat(price) * 100),
        duration_min: parseInt(duration),
        description,
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, data);
      } else {
        await api.post('/services', data);
      }

      setShowModal(false);
      fetchServices();
      Alert.alert('Success', editingService ? 'Service updated' : 'Service created');
    } catch (error) {
      Alert.alert('Error', 'Could not save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/services/${service.id}`);
              fetchServices();
              Alert.alert('Success', 'Service deleted');
            } catch (error) {
              Alert.alert('Error', 'Could not delete service');
            }
          }
        },
      ]
    );
  };

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cut-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptySubtext}>Add your first service to start accepting bookings</Text>
            <TouchableOpacity style={styles.addServiceBtn} onPress={() => openModal()}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addServiceBtnText}>Add Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIcon}>
                  <Ionicons name="cut" size={24} color={TEAL} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDesc}>
                    {service.description || `${service.duration_min} minute service`}
                  </Text>
                </View>
              </View>

              <View style={styles.serviceMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={16} color="#627D98" />
                  <Text style={styles.metaText}>{formatPrice(service.price_pence)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#627D98" />
                  <Text style={styles.metaText}>{service.duration_min} min</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.editBtn}
                  onPress={() => openModal(service)}
                >
                  <Ionicons name="create-outline" size={18} color={TEAL} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(service)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Edit Service' : 'New Service'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#627D98" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Haircut"
                  placeholderTextColor="#9FB3C8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Price (£) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="25.00"
                    placeholderTextColor="#9FB3C8"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>Duration (min) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30"
                    placeholderTextColor="#9FB3C8"
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                  placeholder="Describe your service..."
                  placeholderTextColor="#9FB3C8"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelModalBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingService ? 'Update' : 'Create'}
                  </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#627D98',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9FB3C8',
    marginTop: 4,
    textAlign: 'center',
  },
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  addServiceBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  serviceDesc: {
    fontSize: 13,
    color: '#627D98',
    marginTop: 2,
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#627D98',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0E8',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  editBtnText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 10,
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
    marginBottom: 16,
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
  inputRow: {
    flexDirection: 'row',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
  },
  cancelModalBtnText: {
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
