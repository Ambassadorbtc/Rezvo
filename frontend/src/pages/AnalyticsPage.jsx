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
    // Create CSV from revenue data
    const headers = ['Date', 'Revenue (£)'];
    const rows = revenueData.map(d => [d.date, (d.revenue / 100).toFixed(2)]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quickslot-revenue.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-obsidian-paper border border-white/10 p-3 rounded-lg shadow-lg">
          <p className="text-white/50 text-sm">{label}</p>
          <p className="text-accent-teal font-bold">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-obsidian-paper border border-white/10 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium">{payload[0].payload.name}</p>
          <p className="text-blaze">{payload[0].value} bookings</p>
        </div>
      );
    }
    return null;
  };

  const colors = ['#FF6600', '#2DD4BF', '#A855F7', '#22C55E', '#EAB308'];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blaze border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6" data-testid="analytics-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-white/50 mt-1">Track your business performance</p>
          </div>
          <Button
            variant="outline"
            onClick={exportCSV}
            className="border-white/10 hover:bg-white/5"
            data-testid="export-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-obsidian-paper border-white/5" data-testid="stat-total-revenue">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-teal" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold tabular-nums text-accent-teal">
                {formatPrice(dashboard?.revenue_pence || 0)}
              </div>
              <div className="text-sm text-white/50">Total Revenue</div>
            </CardContent>
          </Card>

          <Card className="bg-obsidian-paper border-white/5" data-testid="stat-total-bookings">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blaze/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blaze" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold tabular-nums">
                {dashboard?.total_bookings || 0}
              </div>
              <div className="text-sm text-white/50">Total Bookings</div>
            </CardContent>
          </Card>

          <Card className="bg-obsidian-paper border-white/5" data-testid="stat-completed">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold tabular-nums text-success">
                {dashboard?.completed_bookings || 0}
              </div>
              <div className="text-sm text-white/50">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-obsidian-paper border-white/5" data-testid="stat-noshow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold tabular-nums text-destructive">
                {dashboard?.no_show_rate || 0}%
              </div>
              <div className="text-sm text-white/50">No-Show Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="bg-obsidian-paper border-white/5" data-testid="revenue-chart">
          <CardHeader>
            <CardTitle className="text-lg">Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-white/50">
                No revenue data yet
              </div>
            ) : (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#71717A"
                      tick={{ fill: '#71717A', fontSize: 12 }}
                      tickFormatter={(val) => new Date(val).getDate()}
                    />
                    <YAxis 
                      stroke="#71717A"
                      tick={{ fill: '#71717A', fontSize: 12 }}
                      tickFormatter={(val) => `£${(val / 100).toFixed(0)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2DD4BF" 
                      strokeWidth={2}
                      dot={{ fill: '#2DD4BF', strokeWidth: 0, r: 4 }}
                      activeDot={{ fill: '#2DD4BF', strokeWidth: 0, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Chart */}
        <Card className="bg-obsidian-paper border-white/5" data-testid="services-chart">
          <CardHeader>
            <CardTitle className="text-lg">Bookings by Service</CardTitle>
          </CardHeader>
          <CardContent>
            {servicesData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-white/50">
                No services data yet
              </div>
            ) : (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={servicesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" horizontal={false} />
                    <XAxis type="number" stroke="#71717A" tick={{ fill: '#71717A', fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#71717A"
                      tick={{ fill: '#71717A', fontSize: 12 }}
                      width={120}
                    />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
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
