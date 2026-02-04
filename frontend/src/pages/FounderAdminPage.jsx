import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api, { formatPrice } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Users, 
  Building2, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Trash2,
  Ban,
  Shield,
  LayoutDashboard,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  DollarSign,
  PoundSterling,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Plus,
  Mail,
  Phone,
  MapPin,
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { format, startOfMonth } from 'date-fns';

const CHART_COLORS = ['#00BFA5', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

// Simple placeholder charts until Babel plugin issue is resolved
const WeeklyChart = ({ data }) => {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  const maxBookings = Math.max(...data.map(d => d.bookings), 1);
  
  return (
    <div className="h-64 flex items-end gap-2 pt-4">
      {data.map((day, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all hover:from-teal-600 hover:to-teal-500"
            style={{ height: `${Math.max((day.bookings / maxBookings) * 180, 8)}px` }}
            title={`${day.bookings} bookings`}
          />
          <span className="text-xs text-gray-500">{day.date}</span>
        </div>
      ))}
    </div>
  );
};

const StatusChart = ({ data }) => {
  if (!data) {
    return (
      <div className="h-52 flex items-center justify-center">
        <p className="text-gray-400">No data yet</p>
      </div>
    );
  }
  
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(data);
  
  return (
    <div className="h-52 flex flex-col justify-center gap-3 px-2">
      {entries.map(([status, count], i) => (
        <div key={status} className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
          <span className="text-sm capitalize flex-1">{status}</span>
          <span className="text-sm font-medium">{count}</span>
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all" 
              style={{ width: `${(count / total) * 100}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const TopServicesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center">
        <p className="text-gray-400">No bookings yet</p>
      </div>
    );
  }
  
  const maxCount = Math.max(...data.map(s => s.bookings), 1);
  
  return (
    <div className="h-52 flex flex-col justify-center gap-2">
      {data.slice(0, 5).map((service, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm w-24 truncate" title={service.name}>{service.name}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-teal-500 rounded-lg flex items-center justify-end px-2 transition-all"
              style={{ width: `${(service.bookings / maxCount) * 100}%` }}
            >
              <span className="text-xs text-white font-medium">{service.bookings}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const FounderAdminPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [businessPage, setBusinessPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, businessesRes, logsRes, bookingsRes, analyticsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/businesses').catch(() => ({ data: [] })),
        api.get('/admin/logs').catch(() => ({ data: { logs: [] } })),
        api.get('/bookings').catch(() => ({ data: [] })),
        api.get('/admin/analytics').catch(() => ({ data: null }))
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setBusinesses(businessesRes.data || []);
      setErrorLogs(logsRes.data?.logs || []);
      setBookings(bookingsRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to load admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveError = async (logId) => {
    try {
      await api.patch(`/admin/logs/${logId}/resolve`);
      toast.success('Error marked as resolved');
      loadData();
    } catch (error) {
      toast.error('Failed to resolve error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBusinesses = businesses.filter(b => 
    b.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const paginatedBusinesses = filteredBusinesses.slice((businessPage - 1) * itemsPerPage, businessPage * itemsPerPage);
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const totalBusinessPages = Math.ceil(filteredBusinesses.length / itemsPerPage);

  // Calculate growth metrics
  const thisMonthUsers = users.filter(u => {
    const created = new Date(u.created_at);
    return created >= startOfMonth(new Date());
  }).length;

  const thisMonthBookings = bookings.filter(b => {
    const created = new Date(b.datetime);
    return created >= startOfMonth(new Date());
  }).length;

  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.price_pence || 0), 0);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'businesses', label: 'Businesses', icon: Building2 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'logs', label: 'Error Logs', icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00BFA5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00BFA5] to-[#00A896] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0A1626]">Rezvo Admin</h1>
              <p className="text-xs text-gray-500">Founder Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-[#00BFA5] text-white shadow-md shadow-[#00BFA5]/20' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.id === 'logs' && errorLogs.filter(l => !l.resolved).length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {errorLogs.filter(l => !l.resolved).length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#00BFA5] flex items-center justify-center text-white font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0A1626] truncate">{user?.email}</p>
                <p className="text-xs text-[#00BFA5]">Founder</p>
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full mt-3 border-gray-200 text-gray-600 rounded-xl">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-[#0A1626] capitalize">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadData} className="border-gray-200 text-gray-600 rounded-lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 rounded-lg">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Total Users</p>
                        <p className="text-3xl font-bold text-[#0A1626] mt-1">{stats?.total_users || users.length}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-emerald-500 font-medium">+{thisMonthUsers} this month</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-[#00BFA5]/10 flex items-center justify-center">
                        <Users className="w-7 h-7 text-[#00BFA5]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Businesses</p>
                        <p className="text-3xl font-bold text-[#0A1626] mt-1">{stats?.total_businesses || businesses.length}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-emerald-500 font-medium">Active</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                        <p className="text-3xl font-bold text-[#0A1626] mt-1">{stats?.total_bookings || bookings.length}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-emerald-500 font-medium">+{thisMonthBookings} this month</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                        <Calendar className="w-7 h-7 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Platform Revenue</p>
                        <p className="text-3xl font-bold text-[#0A1626] mt-1">{formatPrice(totalRevenue)}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-emerald-500 font-medium">Growing</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <PoundSterling className="w-7 h-7 text-amber-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Activity Chart */}
                <Card className="lg:col-span-2 bg-white rounded-2xl shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-[#0A1626]">Weekly Overview</CardTitle>
                    <CardDescription>Bookings and user signups over the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WeeklyChart data={analytics?.daily} />
                  </CardContent>
                </Card>

                {/* Booking Status */}
                <Card className="bg-white rounded-2xl shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-[#0A1626]">Booking Status</CardTitle>
                    <CardDescription>Distribution of booking statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StatusChart data={analytics?.status_breakdown} />
                  </CardContent>
                </Card>
              </div>

              {/* Top Services & Platform Health */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Top Services */}
                <Card className="bg-white rounded-2xl shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-[#0A1626]">Top Services</CardTitle>
                    <CardDescription>Most booked services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TopServicesChart data={analytics?.top_services} />
                  </CardContent>
                </Card>

                {/* Platform Health */}
                <Card className="lg:col-span-2 bg-white rounded-2xl shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-[#0A1626]">Platform Health</CardTitle>
                    <CardDescription>System status overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="font-medium text-[#0A1626]">API Status</span>
                          </div>
                          <span className="text-sm text-emerald-600 font-medium">Online</span>
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="font-medium text-[#0A1626]">Database</span>
                          </div>
                          <span className="text-sm text-emerald-600 font-medium">Connected</span>
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="font-medium text-[#0A1626]">Email Service</span>
                          </div>
                          <span className="text-sm text-emerald-600 font-medium">Active</span>
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${errorLogs.filter(l => !l.resolved).length > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {errorLogs.filter(l => !l.resolved).length > 0 ? (
                              <AlertTriangle className="w-5 h-5 text-amber-500" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            )}
                            <span className="font-medium text-[#0A1626]">Open Errors</span>
                          </div>
                          <span className={`text-sm font-medium ${errorLogs.filter(l => !l.resolved).length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {errorLogs.filter(l => !l.resolved).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <Card className="bg-white rounded-2xl shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-[#0A1626]">Recent Users</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')} className="text-[#00BFA5]">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00BFA5] to-[#00A896] flex items-center justify-center text-white font-bold text-sm">
                              {u.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-[#0A1626] text-sm">{u.email}</p>
                              <p className="text-xs text-gray-500">{u.role}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {u.created_at ? format(new Date(u.created_at), 'd MMM') : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Businesses */}
                <Card className="bg-white rounded-2xl shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-[#0A1626]">Recent Businesses</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('businesses')} className="text-[#00BFA5]">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {businesses.slice(0, 5).map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            {b.logo_url ? (
                              <img src={b.logo_url} alt={b.name} className="w-10 h-10 rounded-xl object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {b.name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[#0A1626] text-sm">{b.name}</p>
                              <p className="text-xs text-gray-500">{b.tagline || 'No tagline'}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users by email..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setUserPage(1); }}
                    className="pl-11 bg-white border-gray-200 rounded-xl h-11"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{filteredUsers.length} users found</span>
                </div>
              </div>

              <Card className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00BFA5] to-[#00A896] flex items-center justify-center text-white font-bold">
                                {u.email?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-[#0A1626]">{u.name || u.email?.split('@')[0]}</p>
                                <p className="text-sm text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              u.role === 'admin' || u.role === 'founder' 
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'business' || u.role === 'owner'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {u.created_at ? format(new Date(u.created_at), 'd MMM yyyy') : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-emerald-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Active</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#00BFA5]">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {totalUserPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Showing {(userPage - 1) * itemsPerPage + 1} to {Math.min(userPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        disabled={userPage === 1}
                        className="border-gray-200 rounded-lg"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600 px-2">Page {userPage} of {totalUserPages}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                        disabled={userPage === totalUserPages}
                        className="border-gray-200 rounded-lg"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Businesses Tab */}
          {activeTab === 'businesses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setBusinessPage(1); }}
                    className="pl-11 bg-white border-gray-200 rounded-xl h-11"
                  />
                </div>
                <span className="text-sm text-gray-500">{filteredBusinesses.length} businesses found</span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBusinesses.map((b) => (
                  <Card key={b.id} className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {b.logo_url ? (
                          <img src={b.logo_url} alt={b.name} className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00BFA5] to-[#00A896] flex items-center justify-center text-white font-bold text-xl">
                            {b.name?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#0A1626] truncate">{b.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{b.tagline || 'No tagline set'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Created</p>
                            <p className="font-medium text-[#0A1626]">
                              {b.created_at ? format(new Date(b.created_at), 'd MMM yyyy') : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 border-gray-200 text-gray-600 rounded-lg hover:border-[#00BFA5] hover:text-[#00BFA5]">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalBusinessPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setBusinessPage(p => Math.max(1, p - 1))}
                    disabled={businessPage === 1}
                    className="border-gray-200 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 px-4">Page {businessPage} of {totalBusinessPages}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setBusinessPage(p => Math.min(totalBusinessPages, p + 1))}
                    disabled={businessPage === totalBusinessPages}
                    className="border-gray-200 rounded-lg"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <Card className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#0A1626]">All Bookings</CardTitle>
                      <CardDescription>{bookings.length} total bookings on the platform</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.slice(0, 20).map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-[#0A1626]">{booking.client_name}</p>
                              <p className="text-sm text-gray-500">{booking.client_email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{booking.service_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {booking.datetime ? format(new Date(booking.datetime), 'd MMM yyyy, HH:mm') : '-'}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#0A1626]">
                            {formatPrice(booking.price_pence)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                              booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Error Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#0A1626]">System Error Logs</h3>
                  <p className="text-sm text-gray-500">{errorLogs.filter(l => !l.resolved).length} unresolved errors</p>
                </div>
              </div>

              {errorLogs.length === 0 ? (
                <Card className="bg-white rounded-2xl shadow-sm border-0">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0A1626] mb-2">All Clear!</h3>
                    <p className="text-gray-500">No errors have been logged. The system is running smoothly.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {errorLogs.map((log) => (
                    <Card 
                      key={log.id} 
                      className={`rounded-2xl shadow-sm border-0 ${
                        log.resolved 
                          ? 'bg-gray-50' 
                          : 'bg-white border-l-4 border-l-red-500'
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              log.resolved ? 'bg-gray-200' : 'bg-red-100'
                            }`}>
                              {log.resolved 
                                ? <CheckCircle className="w-5 h-5 text-gray-500" />
                                : <AlertTriangle className="w-5 h-5 text-red-500" />
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  log.resolved ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-700'
                                }`}>
                                  {log.type || 'Error'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {log.timestamp ? format(new Date(log.timestamp), 'd MMM yyyy, HH:mm:ss') : '-'}
                                </span>
                              </div>
                              <p className="mt-2 font-medium text-[#0A1626]">{log.message}</p>
                              {log.stack && (
                                <details className="mt-3">
                                  <summary className="text-sm text-[#00BFA5] cursor-pointer hover:underline">
                                    View stack trace
                                  </summary>
                                  <pre className="mt-2 p-4 bg-gray-900 rounded-xl text-xs text-gray-300 overflow-x-auto">
                                    {log.stack}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                          {!log.resolved && (
                            <Button
                              onClick={() => resolveError(log.id)}
                              className="bg-[#00BFA5] hover:bg-[#00A896] text-white rounded-xl flex-shrink-0"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Toaster />
    </div>
  );
};

export default FounderAdminPage;
