import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { formatPrice } from '../../lib/api';

const { width } = Dimensions.get('window');
const TEAL = '#00BFA5';

export default function AnalyticsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});
  const [bookings, setBookings] = useState([]);
  const [period, setPeriod] = useState('month');

  const fetchAnalytics = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/business/stats').catch(() => ({ data: {} })),
        api.get('/bookings').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data || {});
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // Calculate analytics from bookings
  const getAnalytics = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentBookings = bookings.filter(b => new Date(b.datetime) >= thirtyDaysAgo);
    const weekBookings = bookings.filter(b => new Date(b.datetime) >= sevenDaysAgo);
    
    const totalRevenue = recentBookings.reduce((sum, b) => sum + (b.price_pence || 0), 0);
    const avgBookingValue = recentBookings.length > 0 ? totalRevenue / recentBookings.length : 0;
    
    const confirmedCount = recentBookings.filter(b => b.status === 'confirmed').length;
    const completionRate = recentBookings.length > 0 ? (confirmedCount / recentBookings.length) * 100 : 0;
    
    // Group by service
    const serviceStats = {};
    recentBookings.forEach(b => {
      if (!serviceStats[b.service_name]) {
        serviceStats[b.service_name] = { count: 0, revenue: 0 };
      }
      serviceStats[b.service_name].count++;
      serviceStats[b.service_name].revenue += b.price_pence || 0;
    });
    
    const topServices = Object.entries(serviceStats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Bookings by day for chart
    const dailyData = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toLocaleDateString('en-GB', { weekday: 'short' });
      dailyData[key] = 0;
    }
    
    weekBookings.forEach(b => {
      const key = new Date(b.datetime).toLocaleDateString('en-GB', { weekday: 'short' });
      if (dailyData[key] !== undefined) {
        dailyData[key]++;
      }
    });
    
    return {
      totalRevenue,
      avgBookingValue,
      totalBookings: recentBookings.length,
      completionRate,
      topServices,
      dailyData,
      weekTotal: weekBookings.length,
    };
  };

  const analytics = getAnalytics();
  const maxDaily = Math.max(...Object.values(analytics.dailyData), 1);

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
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={TEAL} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#0A1626" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'year'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.activePeriodBtn]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.activePeriodText]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricCardLarge]}>
            <View style={[styles.metricIcon, { backgroundColor: '#E8F5F3' }]}>
              <Ionicons name="cash-outline" size={24} color={TEAL} />
            </View>
            <Text style={styles.metricLabel}>Revenue</Text>
            <Text style={styles.metricValue}>{formatPrice(analytics.totalRevenue)}</Text>
            <View style={styles.metricTrend}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.metricLabel}>Bookings</Text>
            <Text style={styles.metricValueSmall}>{analytics.totalBookings}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEF3E2' }]}>
              <Ionicons name="wallet-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.metricLabel}>Avg Value</Text>
            <Text style={styles.metricValueSmall}>{formatPrice(analytics.avgBookingValue)}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#22C55E" />
            </View>
            <Text style={styles.metricLabel}>Completion</Text>
            <Text style={styles.metricValueSmall}>{analytics.completionRate.toFixed(0)}%</Text>
          </View>
        </View>

        {/* Weekly Bookings Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {Object.entries(analytics.dailyData).map(([day, count]) => (
                <View key={day} style={styles.chartBarWrapper}>
                  <View style={styles.barLabelTop}>
                    <Text style={styles.barCount}>{count}</Text>
                  </View>
                  <View style={[styles.chartBar, { height: Math.max((count / maxDaily) * 120, 4) }]} />
                  <Text style={styles.barLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.chartSummary}>
            <Text style={styles.chartSummaryText}>
              <Text style={styles.chartHighlight}>{analytics.weekTotal}</Text> bookings this week
            </Text>
          </View>
        </View>

        {/* Top Services */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Top Services</Text>
          {analytics.topServices.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No service data yet</Text>
            </View>
          ) : (
            analytics.topServices.map((service, index) => (
              <View key={index} style={styles.serviceRow}>
                <View style={styles.serviceRank}>
                  <Text style={styles.serviceRankText}>{index + 1}</Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceStats}>
                    {service.count} bookings • {formatPrice(service.revenue)}
                  </Text>
                </View>
                <View style={styles.serviceProgress}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${(service.count / analytics.topServices[0].count) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0A1626' },
  periodSelector: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#F5F0E8', borderRadius: 12, padding: 4, marginBottom: 20 },
  periodBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activePeriodBtn: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  periodText: { fontSize: 14, fontWeight: '600', color: '#627D98' },
  activePeriodText: { color: TEAL },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  metricCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, width: (width - 44) / 2, borderWidth: 1, borderColor: '#E2E8F0' },
  metricCardLarge: { width: width - 32, marginBottom: 4 },
  metricIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  metricLabel: { fontSize: 13, color: '#627D98', marginBottom: 4 },
  metricValue: { fontSize: 28, fontWeight: '700', color: '#0A1626' },
  metricValueSmall: { fontSize: 22, fontWeight: '700', color: '#0A1626' },
  metricTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  trendText: { fontSize: 13, fontWeight: '600', color: '#10B981' },
  chartSection: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0A1626', marginBottom: 16 },
  chartContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  chartBarWrapper: { alignItems: 'center', flex: 1 },
  barLabelTop: { marginBottom: 4 },
  barCount: { fontSize: 12, fontWeight: '600', color: '#0A1626' },
  chartBar: { width: 28, backgroundColor: TEAL, borderRadius: 6 },
  barLabel: { marginTop: 8, fontSize: 11, color: '#627D98', fontWeight: '500' },
  chartSummary: { marginTop: 16, alignItems: 'center' },
  chartSummaryText: { fontSize: 14, color: '#627D98' },
  chartHighlight: { fontWeight: '700', color: TEAL },
  servicesSection: { marginTop: 24, paddingHorizontal: 20 },
  emptyState: { backgroundColor: '#FFF', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  emptyText: { fontSize: 14, color: '#627D98' },
  serviceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  serviceRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F5F3', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceRankText: { fontSize: 13, fontWeight: '700', color: TEAL },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#0A1626' },
  serviceStats: { fontSize: 12, color: '#627D98', marginTop: 2 },
  serviceProgress: { width: 60, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: TEAL, borderRadius: 3 },
});
