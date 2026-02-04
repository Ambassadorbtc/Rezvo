import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';

const TEAL = '#00BFA5';

export default function SearchScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || null);

  const categories = ['All', 'Hair', 'Nails', 'Spa', 'Barber', 'Beauty', 'Massage'];

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/public/businesses');
      let results = response.data || [];
      
      // Filter by search query
      if (searchQuery) {
        results = results.filter(b => 
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.tagline && b.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      setBusinesses(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [searchQuery, selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#627D98" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses or services..."
            placeholderTextColor="#9FB3C8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#627D98" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryPill,
              (selectedCategory === cat || (cat === 'All' && !selectedCategory)) && styles.categoryPillActive
            ]}
            onPress={() => setSelectedCategory(cat === 'All' ? null : cat)}
          >
            <Text style={[
              styles.categoryPillText,
              (selectedCategory === cat || (cat === 'All' && !selectedCategory)) && styles.categoryPillTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <ScrollView style={styles.results}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={TEAL} />
          </View>
        ) : businesses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>{businesses.length} businesses found</Text>
            {businesses.map((business) => (
              <TouchableOpacity
                key={business.id}
                style={styles.businessCard}
                onPress={() => navigation.navigate('BusinessDetail', { businessId: business.id })}
              >
                <View style={styles.businessImage}>
                  <Ionicons name="storefront" size={32} color={TEAL} />
                </View>
                <View style={styles.businessInfo}>
                  <Text style={styles.businessName}>{business.name}</Text>
                  <Text style={styles.businessTagline}>{business.tagline || 'Professional services'}</Text>
                  <View style={styles.businessMeta}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.rating}>4.8</Text>
                    <View style={styles.dot} />
                    <Ionicons name="location-outline" size={14} color="#627D98" />
                    <Text style={styles.distance}>0.5 mi</Text>
                  </View>
                </View>
                <View style={styles.bookBtn}>
                  <Text style={styles.bookBtnText}>Book</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0A1626',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#627D98',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  results: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 14,
    color: '#627D98',
    marginVertical: 12,
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
  emptySubtext: {
    fontSize: 14,
    color: '#9FB3C8',
    marginTop: 4,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  businessImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessInfo: {
    flex: 1,
    marginLeft: 14,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 4,
  },
  businessTagline: {
    fontSize: 13,
    color: '#627D98',
    marginBottom: 6,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A1626',
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  distance: {
    fontSize: 13,
    color: '#627D98',
    marginLeft: 4,
  },
  bookBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
