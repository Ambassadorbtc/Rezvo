import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api, { formatPrice } from '../../lib/api';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';

const categories = [
  { id: '1', name: 'Haircut', icon: '✂️' },
  { id: '2', name: 'Nails', icon: '💅' },
  { id: '3', name: 'Fitness', icon: '💪' },
  { id: '4', name: 'Beauty', icon: '💄' },
  { id: '5', name: 'Massage', icon: '💆' },
  { id: '6', name: 'More', icon: '•••' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = async () => {
    try {
      const response = await api.get('/businesses/public');
      setBusinesses(response.data || []);
    } catch (error) {
      console.log('No public businesses yet');
      // Mock data for demo
      setBusinesses([
        {
          id: '1',
          name: "Sarah's Hair Studio",
          tagline: 'Professional hairdressing in Manchester',
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
          rating: 4.9,
          reviews: 127,
          services: [{ price_pence: 3500 }],
        },
        {
          id: '2',
          name: 'FitLife PT',
          tagline: 'Personal training sessions',
          image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
          rating: 4.8,
          reviews: 89,
          services: [{ price_pence: 5000 }],
        },
        {
          id: '3',
          name: 'Glamour Nails',
          tagline: 'Nail art and treatments',
          image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80',
          rating: 5.0,
          reviews: 234,
          services: [{ price_pence: 2500 }],
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBusinesses();
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBusiness = ({ item }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => navigation.navigate('BusinessDetail', { business: item })}
    >
      <Image source={{ uri: item.image }} style={styles.businessImage} />
      <View style={styles.businessInfo}>
        <Text style={styles.businessName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.businessTagline} numberOfLines={1}>{item.tagline}</Text>
        <View style={styles.businessMeta}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
          {item.services?.[0]?.price_pence && (
            <Text style={styles.priceText}>
              From {formatPrice(item.services[0].price_pence)}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
            </Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'there'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services or businesses..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Get 20% Off</Text>
            <Text style={styles.promoSubtitle}>Your first booking</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80' }}
            style={styles.promoImage}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Top Rated */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {businesses.map((business) => (
            <View key={business.id}>
              {renderBusiness({ item: business })}
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: 2,
  },
  userName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  notificationIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  promoBanner: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    height: 140,
  },
  promoContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.surface,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: typography.sizes.base,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.md,
  },
  promoButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  promoImage: {
    width: 140,
    height: '100%',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  categoriesList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  categoryCard: {
    width: 80,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    color: colors.text,
  },
  businessCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  businessImage: {
    width: 100,
    height: 100,
  },
  businessInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  businessName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  businessTagline: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 14,
    color: '#F59E0B',
    marginRight: 2,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginRight: 2,
  },
  reviewsText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  priceText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  bookButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: typography.sizes.sm,
  },
});
