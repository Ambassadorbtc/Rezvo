import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { formatPrice, formatDate, formatTime } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Calendar, 
  PoundSterling, 
  Users, 
  Link2, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [analyticsRes, bookingsRes, businessRes, aiRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/bookings', { params: { date: new Date().toISOString().split('T')[0] } }),
        api.get('/business').catch(() => ({ data: null })),
        api.get('/ai/slot-suggestions').catch(() => ({ data: { suggestions: [] } })),
      ]);
      
      setAnalytics(analyticsRes.data);
      setTodayBookings(bookingsRes.data);
      setBusiness(businessRes.data);
      setAiSuggestions(aiRes.data.suggestions || []);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
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
      <div className="p-4 md:p-6 lg:p-8 space-y-6" data-testid="dashboard-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900">
              {business?.name ? `Welcome, ${business.name}` : 'Dashboard'}
            </h1>
            <p className="text-navy-500 mt-1">Here's what's happening today</p>
          </div>
          <Link to="/share">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-button hover:shadow-button-hover btn-press" data-testid="dashboard-share-btn">
              <Link2 className="w-4 h-4 mr-2" />
              Get booking link
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white rounded-2xl shadow-card border-0 hover-lift" data-testid="stat-today-bookings">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <div className="text-3xl font-bold font-display text-navy-900 tabular-nums">{analytics?.today_bookings || 0}</div>
              <div className="text-sm text-navy-500 mt-1">Today's bookings</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-card border-0 hover-lift" data-testid="stat-revenue">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <PoundSterling className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-3xl font-bold font-display text-emerald-600 tabular-nums">
                {formatPrice(analytics?.revenue_pence || 0)}
              </div>
              <div className="text-sm text-navy-500 mt-1">Total revenue</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-card border-0 hover-lift" data-testid="stat-total-bookings">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold font-display text-navy-900 tabular-nums">{analytics?.total_bookings || 0}</div>
              <div className="text-sm text-navy-500 mt-1">Total bookings</div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-card border-0 hover-lift" data-testid="stat-show-rate">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <div className="text-3xl font-bold font-display text-teal-600 tabular-nums">
                {100 - (analytics?.no_show_rate || 0)}%
              </div>
              <div className="text-sm text-navy-500 mt-1">Show rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="md:col-span-2 bg-white rounded-2xl shadow-card border-0" data-testid="today-schedule">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading font-semibold text-navy-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Today's schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-navy-500">No bookings today</p>
                  <Link to="/share" className="text-teal-600 text-sm hover:underline mt-2 inline-block">
                    Share your booking link →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-cream"
                      data-testid={`booking-${booking.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold font-display tabular-nums text-teal-600">
                          {formatTime(booking.datetime)}
                        </div>
                        <div>
                          <div className="font-medium text-navy-900">{booking.client_name}</div>
                          <div className="text-sm text-navy-500">{booking.service_name}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </div>
                    </div>
                  ))}
                  {todayBookings.length > 5 && (
                    <Link to="/bookings" className="block text-center text-teal-600 text-sm hover:underline py-2">
                      View all {todayBookings.length} bookings →
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-white rounded-2xl shadow-card border-0" data-testid="ai-suggestions">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading font-semibold text-navy-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Smart tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiSuggestions.length === 0 ? (
                <p className="text-navy-500 text-sm">No suggestions yet. Keep booking!</p>
              ) : (
                <ul className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-3 rounded-xl bg-purple-50 text-sm text-navy-700"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/bookings">
            <Card className="bg-white rounded-2xl shadow-card border-0 hover-lift cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span className="font-medium text-navy-700">View bookings</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/services">
            <Card className="bg-white rounded-2xl shadow-card border-0 hover-lift cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-navy-700">Manage services</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/calendar">
            <Card className="bg-white rounded-2xl shadow-card border-0 hover-lift cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-coral-500" />
                <span className="font-medium text-navy-700">Calendar</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/analytics">
            <Card className="bg-white rounded-2xl shadow-card border-0 hover-lift cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-navy-700">Analytics</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
