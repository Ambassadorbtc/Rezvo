import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { formatPrice, formatTime } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { 
  Calendar, Users, Link2, TrendingUp, Clock, Sparkles,
  Scissors, Settings, BarChart3, Share2, ChevronRight, Bell
} from 'lucide-react';
import { toast } from 'sonner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [business, setBusiness] = useState(null);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [analyticsRes, bookingsRes, businessRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/bookings', { params: { date: new Date().toISOString().split('T')[0] } }),
        api.get('/business').catch(() => ({ data: null })),
      ]);
      setAnalytics(analyticsRes.data);
      setTodayBookings(bookingsRes.data);
      setBusiness(businessRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6" data-testid="dashboard-page">

        {/* Header */}
        <div className="flex items-center justify-between anim-fade-up">
          <div>
            <p className="text-navy-400 text-sm font-medium">Welcome back</p>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-navy-900 mt-0.5">
              {business?.name || 'Your Business'}
            </h1>
          </div>
          <Link to="/support" className="relative w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors" data-testid="header-notifications-btn">
            <Bell className="w-5 h-5 text-navy-700" />
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/calendar', bg: 'bg-[#E8F5F3]', iconBg: 'bg-teal-500/20', Icon: Calendar, iconColor: 'text-teal-600', value: analytics?.today_bookings || 0, label: 'Today' },
            { to: '/bookings', bg: 'bg-[#FEF3E2]', iconBg: 'bg-amber-400/30', Icon: Clock, iconColor: 'text-amber-600', value: analytics?.total_bookings || 0, label: 'Total bookings' },
            { to: '/analytics', bg: 'bg-[#EDE9FE]', iconBg: 'bg-purple-400/20', Icon: Users, iconColor: 'text-purple-600', value: `${100 - (analytics?.no_show_rate || 0)}%`, label: 'Show rate' },
            { to: '/analytics', bg: 'bg-[#DBEAFE]', iconBg: 'bg-blue-400/20', Icon: TrendingUp, iconColor: 'text-blue-600', value: formatPrice(analytics?.revenue_pence || 0), label: 'Revenue' },
          ].map((s, i) => (
            <Link key={s.label} to={s.to} className={`group anim-fade-up anim-d${i + 1}`}>
              <div className={`${s.bg} rounded-2xl p-5 transition-all group-hover:shadow-lg group-hover:scale-[1.02]`}>
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                  <s.Icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <div className="text-3xl font-bold font-display text-navy-900">{s.value}</div>
                <div className="text-sm text-navy-500 mt-1">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Revenue Banner */}
        <div className="bg-white rounded-2xl p-6 flex items-center justify-between border border-gray-100 anim-fade-up anim-d5">
          <div>
            <p className="text-sm text-navy-400 font-medium">This Month</p>
            <p className="text-4xl font-bold font-display text-navy-900 mt-1">{formatPrice(analytics?.revenue_pence || 0)}</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-emerald-500" />
          </div>
        </div>

        {/* Share CTA */}
        <Link to="/share" className="block group anim-fade-up anim-d6" data-testid="share-cta-card">
          <div className="bg-teal-500 rounded-2xl p-5 flex items-center gap-4 transition-all group-hover:bg-teal-600 group-hover:shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-base">Share Your Booking Link</p>
              <p className="text-white/75 text-sm mt-0.5">Let customers book directly</p>
            </div>
            <ChevronRight className="w-6 h-6 text-white/80" />
          </div>
        </Link>

        {/* Schedule + Quick Actions */}
        <div className="grid lg:grid-cols-5 gap-6 anim-fade-up anim-d7">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-navy-900">Today's Schedule</h2>
              <Link to="/calendar" className="text-teal-500 text-sm font-semibold hover:text-teal-600 transition-colors">See all</Link>
            </div>
            {todayBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-navy-500 font-medium">No bookings today</p>
                <p className="text-navy-300 text-sm mt-1">Share your link to get more bookings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayBookings.slice(0, 5).map((booking, i) => (
                  <div key={booking.id} className={`bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow anim-slide-right anim-d${i + 1}`} data-testid={`booking-row-${booking.id}`}>
                    <div className="w-14 text-center border-r border-gray-100 pr-4 flex-shrink-0">
                      <p className="text-sm font-bold text-teal-600 font-display">{formatTime(booking.datetime)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900 truncate">{booking.client_name}</p>
                      <p className="text-sm text-navy-400 truncate">{booking.service_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{booking.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold font-display text-navy-900">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { to: '/services', bg: 'bg-[#EDE9FE]', Icon: Scissors, color: 'text-purple-600', label: 'Services' },
                { to: '/calendar', bg: 'bg-[#DBEAFE]', Icon: Calendar, color: 'text-blue-600', label: 'Calendar' },
                { to: '/settings', bg: 'bg-[#FEE2E2]', Icon: Settings, color: 'text-red-500', label: 'Settings' },
                { to: '/analytics', bg: 'bg-[#D1FAE5]', Icon: BarChart3, color: 'text-emerald-600', label: 'Analytics' },
                { to: '/bookings', bg: 'bg-[#FEF3E2]', Icon: Users, color: 'text-amber-600', label: 'Bookings' },
                { to: '/team', bg: 'bg-[#E0E7FF]', Icon: Users, color: 'text-indigo-600', label: 'Team' },
              ].map((a, i) => (
                <Link key={a.label} to={a.to} className={`group anim-scale-in anim-d${i + 1}`}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all group-hover:scale-[1.03]">
                    <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center`}>
                      <a.Icon className={`w-5 h-5 ${a.color}`} />
                    </div>
                    <span className="text-xs font-medium text-navy-500">{a.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 anim-fade-up anim-d8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-navy-900 text-sm">Smart Tips</h3>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-purple-50 text-sm text-navy-600">Your busiest day is Saturday. Consider adding more slots.</div>
                <div className="p-3 rounded-xl bg-teal-50 text-sm text-navy-600">Share your booking link on social media to get more customers.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
