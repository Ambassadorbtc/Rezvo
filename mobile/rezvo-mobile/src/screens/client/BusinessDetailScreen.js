import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatPrice } from '../../lib/api';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

const { width } = Dimensions.get('window');

const mockServices = [
  { id: '1', name: 'Classic Haircut', duration_min: 30, price_pence: 2500 },
  { id: '2', name: 'Haircut & Style', duration_min: 45, price_pence: 3500 },
  { id: '3', name: 'Hair Colouring', duration_min: 90, price_pence: 7500 },
  { id: '4', name: 'Beard Trim', duration_min: 20, price_pence: 1500 },
  { id: '5', name: 'Full Treatment', duration_min: 120, price_pence: 9500 },
];

const mockPhotos = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
  'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&q=80',
];

export default function BusinessDetailScreen({ route, navigation }) {
  const { business } = route.params;
  const [selectedService, setSelectedService] = useState(null);

  const handleBookNow = () => {
    if (selectedService) {
      navigation.navigate('BookingFlow', { business, service: selectedService });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Image
            source={{ uri: business.image || mockPhotos[0] }}
            style={styles.coverImage}
          />
          <View style={styles.headerOverlay} />
          <SafeAreaView style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.headerButtonIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <Text style={styles.headerButtonIcon}>♡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Text style={styles.headerButtonIcon}>↗</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Business Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <View style={styles.infoMain}>
              <Text style={styles.businessName}>{business.name}</Text>
              <Text style={styles.businessTagline}>{business.tagline}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingText}>{business.rating || '4.9'}</Text>
              <Text style={styles.reviewCount}>({business.reviews || 127})</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>🌐</Text>
              </View>
              <Text style={styles.quickActionText}>Website</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>💬</Text>
              </View>
              <Text style={styles.quickActionText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>📞</Text>
              </View>
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>📍</Text>
              </View>
              <Text style={styles.quickActionText}>Direction</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Text style={styles.quickActionEmoji}>↗</Text>
              </View>
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Gallery */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photo Gallery</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockPhotos}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.galleryImage} />
            )}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryList}
          />
        </View>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
          </View>
          <View style={styles.servicesList}>
            {mockServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  selectedService?.id === service.id && styles.serviceCardSelected,
                ]}
                onPress={() => setSelectedService(service)}
              >
                <View style={styles.serviceCheckbox}>
                  {selectedService?.id === service.id && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDuration}>{service.duration_min} min</Text>
                </View>
                <Text style={styles.servicePrice}>{formatPrice(service.price_pence)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Built with a minimal and stylish layout, the experience feels premium, 
            user-friendly and professional. We pride ourselves on delivering 
            exceptional service to all our clients.
          </Text>
        </View>

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          {selectedService && (
            <>
              <Text style={styles.selectedServiceName}>{selectedService.name}</Text>
              <Text style={styles.selectedServicePrice}>
                {formatPrice(selectedService.price_pence)}
              </Text>
            </>
          )}
        </View>
        <TouchableOpacity
          style={[styles.bookButton, !selectedService && styles.bookButtonDisabled]}
          onPress={handleBookNow}
          disabled={!selectedService}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerImage: {
    height: 280,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonIcon: {
    fontSize: 18,
    color: colors.text,
  },
  infoSection: {
    backgroundColor: colors.surface,
    marginTop: -24,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  infoMain: {
    flex: 1,
    marginRight: spacing.md,
  },
  businessName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  businessTagline: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  ratingStar: {
    fontSize: 16,
    color: '#F59E0B',
    marginRight: 4,
  },
  ratingText: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.text,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionEmoji: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  section: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  galleryList: {
    gap: spacing.sm,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
  },
  servicesList: {
    gap: spacing.sm,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  serviceCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  checkIcon: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  servicePrice: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.primary,
  },
  aboutText: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  priceInfo: {
    flex: 1,
  },
  selectedServiceName: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: 2,
  },
  selectedServicePrice: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  bookButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  bookButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.surface,
  },
});
