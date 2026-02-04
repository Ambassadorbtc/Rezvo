import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { formatPrice } from '../../lib/api';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

const mockServices = [
  { id: '1', name: 'Classic Haircut', duration_min: 30, price_pence: 2500, deposit_required: false },
  { id: '2', name: 'Haircut & Style', duration_min: 45, price_pence: 3500, deposit_required: true, deposit_amount_pence: 1000 },
  { id: '3', name: 'Hair Colouring', duration_min: 90, price_pence: 7500, deposit_required: true, deposit_amount_pence: 2500 },
  { id: '4', name: 'Beard Trim', duration_min: 20, price_pence: 1500, deposit_required: false },
  { id: '5', name: 'Full Treatment', duration_min: 120, price_pence: 9500, deposit_required: true, deposit_amount_pence: 3000 },
];

export default function ServicesScreen({ navigation }) {
  const [services, setServices] = useState(mockServices);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      if (response.data?.length > 0) {
        setServices(response.data);
      }
    } catch (error) {
      console.log('Using mock services');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDeleteService = (serviceId) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setServices(services.filter((s) => s.id !== serviceId));
          },
        },
      ]
    );
  };

  const renderService = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIcon}>
          <Text style={styles.serviceEmoji}>✂️</Text>
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceDuration}>{item.duration_min} minutes</Text>
        </View>
        <Text style={styles.servicePrice}>{formatPrice(item.price_pence)}</Text>
      </View>

      {item.deposit_required && (
        <View style={styles.depositBadge}>
          <Text style={styles.depositText}>
            Deposit required: {formatPrice(item.deposit_amount_pence)}
          </Text>
        </View>
      )}

      <View style={styles.serviceActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDelete]}
          onPress={() => handleDeleteService(item.id)}
        >
          <Text style={styles.actionBtnTextDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchServices();
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✂️</Text>
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptyText}>
              Add your first service to start taking bookings
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Add Service</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.surface,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  servicePrice: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  depositBadge: {
    marginTop: spacing.md,
    backgroundColor: `${colors.warning}15`,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  depositText: {
    fontSize: typography.sizes.sm,
    color: colors.warning,
    fontWeight: '500',
  },
  serviceActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  actionBtnDelete: {
    backgroundColor: `${colors.error}10`,
  },
  actionBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  actionBtnTextDelete: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  emptyButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.surface,
  },
});
