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
      case 'confirmed': return 'bg-success/20 text-success';
      case 'pending': return 'bg-warning/20 text-warning';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      default: return 'bg-white/10 text-white/60';
    }
  };

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
      <div className="p-4 md:p-6 space-y-6" data-testid="dashboard-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {business?.name ? `Welcome, ${business.name}` : 'Dashboard'}
            </h1>
            <p className="text-white/50 mt-1">Here's what's happening today</p>
          </div>
          <Link to="/share">
            <Button className="bg-gradient-blaze hover:opacity-90 text-white rounded-full btn-press" data-testid="dashboard-share-btn">
              <Link2 className="w-4 h-4 mr-2" />
              Get Booking Link
            </Button>
          </Link>
        </div>

        {/* Stats Grid - Bento Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-obsidian-paper border-white/5 card-hover" data-testid="stat-today-bookings">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blaze/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blaze" />
                </div>
              </div>
              <div className="text-3xl font-bold tabular-nums">{analytics?.today_bookings || 0}</div>
              <div className="text-sm text-white/50">Today's Bookings</div>
            </CardContent>
          </Card>

          <Card className="bg-obsidian-paper border-white/5 card-hover" data-testid="stat-revenue">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 flex items-center justify-center">
                  <PoundSterling className="w-5 h-5 text-accent-teal" />
                </div>
              </div>
              <div className="text-3xl font-bold tabular-nums text-accent-teal">
                {formatPrice(analytics?.revenue_pence || 0)}
              </div>
              <div className="text-sm text-white/50">Total Revenue</div>
            </CardContent>
          </Card>

          <Card className="bg-obsidian-paper border-white/5 card-hover" data-testid="stat-total-bookings">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-purple" />
                </div>
              </div>
              <div className="text-3xl font-bold tabular-nums">{analytics?.total_bookings || 0}</div>
              <div className="text-sm text-white/50">Total Bookings</div>
            </CardContent>
          </Card>

          <Card className="bg-obsidian-paper border-white/5 card-hover" data-testid="stat-show-rate">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="text-3xl font-bold tabular-nums text-success">
                {100 - (analytics?.no_show_rate || 0)}%
              </div>
              <div className="text-sm text-white/50">Show Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="md:col-span-2 bg-obsidian-paper border-white/5" data-testid="today-schedule">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blaze" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">No bookings today</p>
                  <Link to="/share" className="text-blaze text-sm hover:underline mt-2 inline-block">
                    Share your booking link →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-obsidian border border-white/5"
                      data-testid={`booking-${booking.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold tabular-nums text-blaze">
                          {formatTime(booking.datetime)}
                        </div>
                        <div>
                          <div className="font-medium">{booking.client_name}</div>
                          <div className="text-sm text-white/50">{booking.service_name}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </div>
                    </div>
                  ))}
                  {todayBookings.length > 5 && (
                    <Link to="/bookings" className="block text-center text-blaze text-sm hover:underline py-2">
                      View all {todayBookings.length} bookings →
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-obsidian-paper border-white/5" data-testid="ai-suggestions">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-purple" />
                AI Coach
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiSuggestions.length === 0 ? (
                <p className="text-white/50 text-sm">No suggestions yet. Keep booking!</p>
              ) : (
                <ul className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-3 rounded-xl bg-obsidian border border-white/5 text-sm text-white/70"
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
            <Card className="bg-obsidian-paper border-white/5 card-hover cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blaze" />
                <span className="font-medium">View Bookings</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/services">
            <Card className="bg-obsidian-paper border-white/5 card-hover cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-accent-teal" />
                <span className="font-medium">Manage Services</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/calendar">
            <Card className="bg-obsidian-paper border-white/5 card-hover cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent-purple" />
                <span className="font-medium">Calendar</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/analytics">
            <Card className="bg-obsidian-paper border-white/5 card-hover cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="font-medium">Analytics</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
