import { useState, useEffect } from 'react';
import api, { formatPrice } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { TrendingUp, Calendar, Users, AlertTriangle, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [servicesData, setServicesData] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [dashboardRes, revenueRes, servicesRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/revenue?period=30days'),
        api.get('/analytics/services'),
      ]);
      
      setDashboard(dashboardRes.data);
      setRevenueData(revenueRes.data.data || []);
      setServicesData(servicesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Revenue (£)'];
    const rows = revenueData.map(d => [d.date, (d.revenue / 100).toFixed(2)]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rezvo-revenue.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-card">
          <p className="text-navy-500 text-sm">{label}</p>
          <p className="text-teal-600 font-bold">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-card">
          <p className="text-navy-900 font-medium">{payload[0].payload.name}</p>
          <p className="text-teal-600">{payload[0].value} bookings</p>
        </div>
      );
    }
    return null;
  };

  const colors = ['#00BFA5', '#FF6B6B', '#7C3AED', '#10B981', '#F59E0B'];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6" data-testid="analytics-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900">Analytics</h1>
            <p className="text-navy-500 mt-1">Track your business performance</p>
          </div>
          <Button
            variant="outline"
            onClick={exportCSV}
            className="border-gray-200 hover:bg-gray-50 rounded-full"
            data-testid="export-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="stat-total-revenue">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold font-display tabular-nums text-teal-600">
                {formatPrice(dashboard?.revenue_pence || 0)}
              </div>
              <div className="text-sm text-navy-500 mt-1">Total Revenue</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="stat-total-bookings">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-coral-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-coral-500" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold font-display tabular-nums text-navy-900">
                {dashboard?.total_bookings || 0}
              </div>
              <div className="text-sm text-navy-500 mt-1">Total Bookings</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="stat-completed">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold font-display tabular-nums text-emerald-600">
                {dashboard?.completed_bookings || 0}
              </div>
              <div className="text-sm text-navy-500 mt-1">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="stat-noshow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold font-display tabular-nums text-red-500">
                {dashboard?.no_show_rate || 0}%
              </div>
              <div className="text-sm text-navy-500 mt-1">No-Show Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="revenue-chart">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-navy-900">Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-navy-500">
                No revenue data yet
              </div>
            ) : (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(val) => new Date(val).getDate()}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(val) => `£${(val / 100).toFixed(0)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#00BFA5" 
                      strokeWidth={3}
                      dot={{ fill: '#00BFA5', strokeWidth: 0, r: 4 }}
                      activeDot={{ fill: '#00BFA5', strokeWidth: 0, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Chart */}
        <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="services-chart">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-navy-900">Bookings by Service</CardTitle>
          </CardHeader>
          <CardContent>
            {servicesData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-navy-500">
                No services data yet
              </div>
            ) : (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={servicesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      width={120}
                    />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="bookings" radius={[0, 8, 8, 0]}>
                      {servicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
