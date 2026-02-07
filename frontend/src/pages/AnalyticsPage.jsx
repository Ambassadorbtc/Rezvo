import { useState, useEffect } from 'react';
import api, { formatPrice } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { TrendingUp, Calendar, Users, AlertTriangle, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [servicesData, setServicesData] = useState([]);

  useEffect(() => { loadAnalytics(); }, []);

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
    const headers = ['Date', 'Revenue'];
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
        <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-lg">
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
        <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-lg">
          <p className="text-navy-900 font-medium">{payload[0].payload.name}</p>
          <p className="text-teal-600">{payload[0].value} bookings</p>
        </div>
      );
    }
    return null;
  };

  const colors = ['#00BFA5', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444'];

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
      <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6" data-testid="analytics-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 anim-fade-up">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900">Analytics</h1>
            <p className="text-navy-400 mt-1">Track your business performance</p>
          </div>
          <Button variant="outline" onClick={exportCSV} className="border-gray-200 hover:bg-gray-50 rounded-full" data-testid="export-btn">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Grid — colored backgrounds */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { bg: 'bg-[#E8F5F3]', iconBg: 'bg-teal-500/20', Icon: TrendingUp, iconColor: 'text-teal-600', value: formatPrice(dashboard?.revenue_pence || 0), label: 'Total Revenue', valueColor: 'text-teal-600' },
            { bg: 'bg-[#FEF3E2]', iconBg: 'bg-amber-400/30', Icon: Calendar, iconColor: 'text-amber-600', value: dashboard?.total_bookings || 0, label: 'Total Bookings', valueColor: 'text-navy-900' },
            { bg: 'bg-[#D1FAE5]', iconBg: 'bg-emerald-400/20', Icon: Users, iconColor: 'text-emerald-600', value: dashboard?.completed_bookings || 0, label: 'Completed', valueColor: 'text-emerald-600' },
            { bg: 'bg-[#FEE2E2]', iconBg: 'bg-red-400/20', Icon: AlertTriangle, iconColor: 'text-red-500', value: `${dashboard?.no_show_rate || 0}%`, label: 'No-Show Rate', valueColor: 'text-red-500' },
          ].map((s, i) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5 anim-fade-up anim-d${i + 1}`} data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                <s.Icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div className={`text-2xl md:text-3xl font-bold font-display tabular-nums ${s.valueColor}`}>{s.value}</div>
              <div className="text-sm text-navy-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 anim-fade-up anim-d5" data-testid="revenue-chart">
          <h2 className="font-display text-lg font-bold text-navy-900 mb-4">Revenue (Last 30 Days)</h2>
          {revenueData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-navy-500">No revenue data yet</div>
          ) : (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => new Date(val).getDate()} />
                  <YAxis stroke="#9CA3AF" tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `£${(val / 100).toFixed(0)}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" stroke="#00BFA5" strokeWidth={3} dot={{ fill: '#00BFA5', strokeWidth: 0, r: 4 }} activeDot={{ fill: '#00BFA5', strokeWidth: 0, r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Services Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 anim-fade-up anim-d6" data-testid="services-chart">
          <h2 className="font-display text-lg font-bold text-navy-900 mb-4">Bookings by Service</h2>
          {servicesData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-navy-500">No services data yet</div>
          ) : (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" stroke="#9CA3AF" tick={{ fill: '#6B7280', fontSize: 12 }} width={120} />
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
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
