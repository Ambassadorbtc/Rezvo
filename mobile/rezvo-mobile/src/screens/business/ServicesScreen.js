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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { formatPrice } from '../../lib/api';
import { useGlobalToast, useConfirm } from '../../context/ToastContext';

const TEAL = '#00BFA5';

export default function ServicesScreen() {
  const { showToast } = useGlobalToast();
  const { showConfirm } = useConfirm();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('service');
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [servicesRes, productsRes] = await Promise.all([
        api.get('/services'),
        api.get('/products')
      ]);
      setServices(servicesRes.data || []);
      setProducts(productsRes.data || []);
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

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setPrice((item.price_pence / 100).toString());
      setDescription(item.description || '');
      if (type === 'service') {
        setDuration(item.duration_min?.toString() || '');
      } else {
        setStockQuantity(item.stock_quantity?.toString() || '');
        setCategory(item.category || '');
      }
    } else {
      setEditingItem(null);
      setName('');
      setPrice('');
      setDuration('');
      setDescription('');
      setStockQuantity('');
      setCategory('');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name || !price) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (modalType === 'service' && !duration) {
      showToast('Duration is required for services', 'error');
      return;
    }

    setSaving(true);
    try {
      if (modalType === 'service') {
        const data = {
          name,
          price_pence: Math.round(parseFloat(price) * 100),
          duration_min: parseInt(duration),
          description,
        };
        if (editingItem) {
          await api.patch(`/services/${editingItem.id}`, data);
        } else {
          await api.post('/services', data);
        }
      } else {
        const data = {
          name,
          price_pence: Math.round(parseFloat(price) * 100),
          description,
          stock_quantity: stockQuantity ? parseInt(stockQuantity) : null,
          category: category || 'General',
        };
        if (editingItem) {
          await api.patch(`/products/${editingItem.id}`, data);
        } else {
          await api.post('/products', data);
        }
      }

      setShowModal(false);
      fetchData();
      showToast(editingItem ? 'Updated successfully' : 'Created successfully', 'success');
    } catch (error) {
      showToast('Could not save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item, type) => {
    showConfirm(
      `Delete ${type === 'service' ? 'Service' : 'Product'}`,
      `Are you sure you want to delete "${item.name}"?`,
      async () => {
        try {
          await api.delete(`/${type === 'service' ? 'services' : 'products'}/${item.id}`);
          fetchData();
          showToast('Deleted successfully', 'success');
        } catch (error) {
          showToast('Could not delete', 'error');
        }
      }
    );
  };

  const renderServiceCard = (service) => (
    <View key={service.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name="cut" size={24} color={TEAL} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{service.name}</Text>
          <Text style={styles.cardDesc}>
            {service.description || `${service.duration_min} minute service`}
          </Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
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
          onPress={() => openModal('service', service)}
        >
          <Ionicons name="create-outline" size={18} color={TEAL} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDelete(service, 'service')}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductCard = (product) => (
    <View key={product.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: '#EDE9FE' }]}>
          <Ionicons name="cube" size={24} color="#8B5CF6" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{product.name}</Text>
          <Text style={styles.cardDesc}>
            {product.description || product.category || 'Product'}
          </Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={16} color="#627D98" />
          <Text style={styles.metaText}>{formatPrice(product.price_pence)}</Text>
        </View>
        {product.stock_quantity !== null && (
          <View style={styles.metaItem}>
            <Ionicons name="layers-outline" size={16} color="#627D98" />
            <Text style={styles.metaText}>{product.stock_quantity} in stock</Text>
          </View>
        )}
        {product.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => openModal('product', product)}
        >
          <Ionicons name="create-outline" size={18} color={TEAL} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDelete(product, 'product')}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catalogue</Text>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => openModal(activeTab === 'services' ? 'service' : 'product')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={() => setActiveTab('services')}
        >
          <Ionicons 
            name="cut" 
            size={18} 
            color={activeTab === 'services' ? '#FFFFFF' : '#627D98'} 
          />
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
            Services ({services.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons 
            name="cube" 
            size={18} 
            color={activeTab === 'products' ? '#FFFFFF' : '#627D98'} 
          />
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Products ({products.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'services' ? (
          services.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cut-outline" size={64} color="#E2E8F0" />
              <Text style={styles.emptyTitle}>No services yet</Text>
              <Text style={styles.emptySubtext}>Add services to start accepting bookings</Text>
              <TouchableOpacity style={styles.addItemBtn} onPress={() => openModal('service')}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addItemBtnText}>Add Service</Text>
              </TouchableOpacity>
            </View>
          ) : (
            services.map(renderServiceCard)
          )
        ) : (
          products.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="#E2E8F0" />
              <Text style={styles.emptyTitle}>No products yet</Text>
              <Text style={styles.emptySubtext}>Add products to sell to your customers</Text>
              <TouchableOpacity style={[styles.addItemBtn, { backgroundColor: '#8B5CF6' }]} onPress={() => openModal('product')}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addItemBtnText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            products.map(renderProductCard)
          )
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
                {editingItem ? 'Edit' : 'New'} {modalType === 'service' ? 'Service' : 'Product'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#627D98" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={modalType === 'service' ? 'e.g. Haircut' : 'e.g. Hair Oil'}
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
                  {modalType === 'service' ? (
                    <>
                      <Text style={styles.inputLabel}>Duration (min) *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="30"
                        placeholderTextColor="#9FB3C8"
                        value={duration}
                        onChangeText={setDuration}
                        keyboardType="number-pad"
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.inputLabel}>Stock Qty</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="10"
                        placeholderTextColor="#9FB3C8"
                        value={stockQuantity}
                        onChangeText={setStockQuantity}
                        keyboardType="number-pad"
                      />
                    </>
                  )}
                </View>
              </View>

              {modalType === 'product' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Hair Care"
                    placeholderTextColor="#9FB3C8"
                    value={category}
                    onChangeText={setCategory}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                  placeholder="Describe your offering..."
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
                    {editingItem ? 'Update' : 'Create'}
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: '#F5F0E8',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: TEAL,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#627D98',
  },
  activeTabText: {
    color: '#FFFFFF',
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
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  addItemBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
  },
  cardDesc: {
    fontSize: 13,
    color: '#627D98',
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
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
  categoryBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#8B5CF6',
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
