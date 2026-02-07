import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { formatPrice, formatDate, formatTime } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { 
  Calendar, 
  PoundSterling, 
  Users, 
  Link2, 
  TrendingUp,
  Clock,
  Sparkles,
  Scissors,
  Settings,
  BarChart3,
  Share2,
  ChevronRight,
  Bell,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

const DashboardPageTest = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

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
      <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6" data-testid="dashboard-page-test">

        {/* Header — warm greeting like mobile */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-navy-400 text-sm font-medium">Welcome back</p>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-navy-900 mt-0.5">
              {business?.name || 'Your Business'}
            </h1>
          </div>
          <Link
            to="/support"
            className="relative w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            data-testid="header-notifications-btn"
          >
            <Bell className="w-5 h-5 text-navy-700" />
          </Link>
        </div>

        {/* Stat Cards — colored backgrounds like mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/calendar" className="group">
            <div className="bg-[#E8F5F3] rounded-2xl p-5 transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-3xl font-bold font-display text-navy-900">{analytics?.today_bookings || 0}</div>
              <div className="text-sm text-navy-500 mt-1">Today</div>
            </div>
          </Link>

          <Link to="/bookings" className="group">
            <div className="bg-[#FEF3E2] rounded-2xl p-5 transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-bold font-display text-navy-900">{analytics?.total_bookings || 0}</div>
              <div className="text-sm text-navy-500 mt-1">Total bookings</div>
            </div>
          </Link>

          <Link to="/analytics" className="group">
            <div className="bg-[#EDE9FE] rounded-2xl p-5 transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-xl bg-purple-400/20 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold font-display text-navy-900">
                {100 - (analytics?.no_show_rate || 0)}%
              </div>
              <div className="text-sm text-navy-500 mt-1">Show rate</div>
            </div>
          </Link>

          <Link to="/analytics" className="group">
            <div className="bg-[#DBEAFE] rounded-2xl p-5 transition-all group-hover:shadow-lg group-hover:scale-[1.02]">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold font-display text-navy-900">
                {formatPrice(analytics?.revenue_pence || 0)}
              </div>
              <div className="text-sm text-navy-500 mt-1">Revenue</div>
            </div>
          </Link>
        </div>

        {/* Revenue Banner — white card with trend icon like mobile */}
        <div className="bg-white rounded-2xl p-6 flex items-center justify-between border border-gray-100">
          <div>
            <p className="text-sm text-navy-400 font-medium">This Month</p>
            <p className="text-4xl font-bold font-display text-navy-900 mt-1">
              {formatPrice(analytics?.revenue_pence || 0)}
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-emerald-500" />
          </div>
        </div>

        {/* Share CTA — bold teal card like mobile */}
        <Link to="/share" className="block group" data-testid="share-cta-card">
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

        {/* Two Column: Schedule + Quick Actions */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Today's Schedule — left, larger */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-navy-900">Today's Schedule</h2>
              <Link to="/calendar" className="text-teal-500 text-sm font-semibold hover:text-teal-600 transition-colors">
                See all
              </Link>
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
                {todayBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                    data-testid={`booking-row-${booking.id}`}
                  >
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
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions — right column, colored icons like mobile */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold font-display text-navy-900">Quick Actions</h2>

            <div className="grid grid-cols-3 gap-3">
              <Link to="/services" className="group">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all group-hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-navy-500">Services</span>
                </div>
              </Link>

              <Link to="/calendar" className="group">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all group-hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-2xl bg-[#DBEAFE] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-navy-500">Calendar</span>
                </div>
              </Link>

              <Link to="/settings" className="group">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all group-hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] flex items-center justify-center">
                    <Settings className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-xs font-medium text-navy-500">Settings</span>
                </div>
              </Link>

              <Link to="/analytics" className="group">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all group-hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-navy-500">Analytics</span>
                </div>
              </Link>

              <Link to="/bookings" className="group">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all group-hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-2xl bg-[#FEF3E2] flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-navy-500">Bookings</span>
                </div>
              </Link>

              <Link to="/team" className="group">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all group-hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-2xl bg-[#E0E7FF] flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-xs font-medium text-navy-500">Team</span>
                </div>
              </Link>
            </div>

            {/* AI Tips card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-navy-900 text-sm">Smart Tips</h3>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-purple-50 text-sm text-navy-600">
                  Your busiest day is Saturday. Consider adding more slots.
                </div>
                <div className="p-3 rounded-xl bg-teal-50 text-sm text-navy-600">
                  Share your booking link on social media to get more customers.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default DashboardPageTest;
