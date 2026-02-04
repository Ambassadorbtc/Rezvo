import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../../lib/theme';
import { formatPrice } from '../../lib/api';

const mockBusinesses = [
  {
    id: '1',
    name: "Sarah's Hair Studio",
    tagline: 'Professional hairdressing',
    category: 'Haircut',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
    rating: 4.9,
    reviews: 127,
    distance: '0.5 mi',
    price_from: 3500,
  },
  {
    id: '2',
    name: 'FitLife PT',
    tagline: 'Personal training sessions',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    rating: 4.8,
    reviews: 89,
    distance: '1.2 mi',
    price_from: 5000,
  },
  {
    id: '3',
    name: 'Glamour Nails',
    tagline: 'Nail art and treatments',
    category: 'Nails',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80',
    rating: 5.0,
    reviews: 234,
    distance: '0.8 mi',
    price_from: 2500,
  },
  {
    id: '4',
    name: 'Zen Massage',
    tagline: 'Relaxation & deep tissue',
    category: 'Massage',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80',
    rating: 4.7,
    reviews: 156,
    distance: '2.1 mi',
    price_from: 6000,
  },
];

const filters = ['All', 'Haircut', 'Nails', 'Fitness', 'Beauty', 'Massage'];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredBusinesses = mockBusinesses.filter((business) => {
    const matchesSearch = 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || business.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const renderBusiness = ({ item }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => navigation.navigate('BusinessDetail', { business: item })}
    >
      <Image source={{ uri: item.image }} style={styles.businessImage} />
      <View style={styles.heartButton}>
        <Text style={styles.heartIcon}>♡</Text>
      </View>
      <View style={styles.businessContent}>
        <View style={styles.businessHeader}>
          <Text style={styles.businessName}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.businessTagline}>{item.tagline}</Text>
        <View style={styles.businessFooter}>
          <Text style={styles.distanceText}>{item.distance}</Text>
          <Text style={styles.priceText}>From {formatPrice(item.price_from)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for services or businesses..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <FlatList
        data={filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === item && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(item)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === item && styles.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersList}
      />

      {/* Results */}
      <FlatList
        data={filteredBusinesses}
        renderItem={renderBusiness}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
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
  clearIcon: {
    fontSize: 16,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  filtersList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.surface,
  },
  resultsList: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  businessCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  businessImage: {
    width: '100%',
    height: 160,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 18,
    color: colors.secondary,
  },
  businessContent: {
    padding: spacing.lg,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  businessName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  ratingStar: {
    fontSize: 12,
    color: '#F59E0B',
    marginRight: 2,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  businessTagline: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  priceText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.primary,
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
  },
});
