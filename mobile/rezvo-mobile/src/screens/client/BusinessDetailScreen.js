import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { formatPrice } from '../../lib/api';

const TEAL = '#00BFA5';

export default function BusinessDetailScreen({ navigation, route }) {
  const { businessId } = route.params;
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessDetails();
  }, [businessId]);

  const fetchBusinessDetails = async () => {
    try {
      const [bizRes, svcRes] = await Promise.all([
        api.get(`/public/business/${businessId}`),
        api.get(`/public/business/${businessId}/services`)
      ]);
      setBusiness(bizRes.data);
      setServices(svcRes.data || []);
    } catch (error) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Book with ${business?.name} on Rezvo: https://rezvo.app/book/${businessId}`,
        title: business?.name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
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

  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E2E8F0" />
          <Text style={styles.errorText}>Business not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A1626" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="heart-outline" size={24} color="#0A1626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#0A1626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Business Info */}
        <View style={styles.businessCard}>
          <View style={styles.businessLogo}>
            <Ionicons name="storefront" size={48} color={TEAL} />
          </View>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessTagline}>{business.tagline || 'Professional services'}</Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={18} color="#F59E0B" />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.reviewCount}>(124 reviews)</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#627D98" />
            <Text style={styles.infoText}>{business.address || 'Location not specified'}</Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          
          {services.length === 0 ? (
            <View style={styles.emptyServices}>
              <Text style={styles.emptyText}>No services available</Text>
            </View>
          ) : (
            services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => navigation.navigate('BookingFlow', { 
                  businessId, 
                  serviceId: service.id,
                  serviceName: service.name,
                  price: service.price_pence,
                  duration: service.duration_min
                })}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDesc}>{service.description || `${service.duration_min} minutes`}</Text>
                  <View style={styles.serviceMeta}>
                    <Text style={styles.servicePrice}>{formatPrice(service.price_pence)}</Text>
                    <View style={styles.dot} />
                    <Ionicons name="time-outline" size={14} color="#627D98" />
                    <Text style={styles.serviceDuration}>{service.duration_min} min</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.bookBtn}
                  onPress={() => navigation.navigate('BookingFlow', { 
                    businessId, 
                    serviceId: service.id,
                    serviceName: service.name,
                    price: service.price_pence,
                    duration: service.duration_min
                  })}
                >
                  <Text style={styles.bookBtnText}>Book</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              {business.description || 'This business provides professional services. Contact them for more information about their offerings.'}
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactCard}>
            {business.phone && (
              <TouchableOpacity style={styles.contactRow}>
                <Ionicons name="call-outline" size={20} color={TEAL} />
                <Text style={styles.contactText}>{business.phone}</Text>
              </TouchableOpacity>
            )}
            {business.instagram && (
              <TouchableOpacity style={styles.contactRow}>
                <Ionicons name="logo-instagram" size={20} color={TEAL} />
                <Text style={styles.contactText}>@{business.instagram}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#627D98',
    marginTop: 16,
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: TEAL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  businessCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  businessLogo: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0A1626',
    marginBottom: 4,
  },
  businessTagline: {
    fontSize: 15,
    color: '#627D98',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#627D98',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#627D98',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 12,
  },
  emptyServices: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#627D98',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1626',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    color: '#627D98',
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: TEAL,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  serviceDuration: {
    fontSize: 13,
    color: '#627D98',
    marginLeft: 4,
  },
  bookBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aboutText: {
    fontSize: 14,
    color: '#627D98',
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#0A1626',
  },
});
