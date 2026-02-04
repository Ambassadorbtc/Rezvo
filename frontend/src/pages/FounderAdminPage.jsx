import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
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
  RefreshCw,
  TrendingUp,
  Activity,
  Eye,
  Trash2,
  Ban,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { format } from 'date-fns';

const FounderAdminPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, businessesRes, logsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/businesses').catch(() => ({ data: [] })),
        api.get('/admin/logs').catch(() => ({ data: { logs: [] } }))
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setBusinesses(businessesRes.data || []);
      setErrorLogs(logsRes.data?.logs || []);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1626] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00BFA5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1626]">
      {/* Header */}
      <header className="bg-[#1A2B3C] border-b border-[#2A3B4C]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00BFA5] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Rezvo Admin</h1>
              <p className="text-sm text-gray-400">Founder Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <div className="text-right">
              <p className="text-sm text-white">{user?.email}</p>
              <p className="text-xs text-[#00BFA5]">Founder</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#2A3B4C] pb-4">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'businesses', label: 'Businesses', icon: Building2 },
            { id: 'logs', label: 'Error Logs', icon: AlertTriangle },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id 
                ? 'bg-[#00BFA5] text-white rounded-full' 
                : 'text-gray-400 hover:text-white hover:bg-[#1A2B3C] rounded-full'}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-[#1A2B3C] border-[#2A3B4C] rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#00BFA5]/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#00BFA5]" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{stats?.total_users || users.length}</p>
                      <p className="text-sm text-gray-400">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A2B3C] border-[#2A3B4C] rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{stats?.total_businesses || businesses.length}</p>
                      <p className="text-sm text-gray-400">Businesses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A2B3C] border-[#2A3B4C] rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{stats?.total_bookings || 0}</p>
                      <p className="text-sm text-gray-400">Bookings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A2B3C] border-[#2A3B4C] rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{errorLogs.filter(l => !l.resolved).length}</p>
                      <p className="text-sm text-gray-400">Open Errors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-[#1A2B3C] border-[#2A3B4C] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00BFA5]" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0A1626] rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">API Status</span>
                      <span className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        Online
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-[#0A1626] rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Database</span>
                      <span className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        Connected
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-[#0A1626] rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Email Service</span>
                      <span className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1A2B3C] border-[#2A3B4C] text-white placeholder:text-gray-500 rounded-xl"
                />
              </div>
              <span className="text-gray-400">{filteredUsers.length} users</span>
            </div>

            <Card className="bg-[#1A2B3C] border-[#2A3B4C] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0A1626]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">User</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3B4C]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#0A1626]/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#00BFA5] flex items-center justify-center text-white font-bold">
                              {u.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{u.name || u.email?.split('@')[0]}</p>
                              <p className="text-sm text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.role === 'admin' || u.role === 'founder' 
                              ? 'bg-purple-500/20 text-purple-400'
                              : u.role === 'business'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {u.created_at ? format(new Date(u.created_at), 'd MMM yyyy') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1A2B3C] border-[#2A3B4C] text-white placeholder:text-gray-500 rounded-xl"
                />
              </div>
              <span className="text-gray-400">{filteredBusinesses.length} businesses</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBusinesses.map((b) => (
                <Card key={b.id} className="bg-[#1A2B3C] border-[#2A3B4C] rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#00BFA5] flex items-center justify-center text-white font-bold">
                          {b.name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{b.name}</h3>
                        <p className="text-sm text-gray-400">{b.tagline || 'No tagline'}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#2A3B4C] flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Created {b.created_at ? format(new Date(b.created_at), 'd MMM yyyy') : '-'}
                      </span>
                      <Button variant="ghost" size="sm" className="text-[#00BFA5]">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Error Logs</h2>
              <span className="text-sm text-gray-400">
                {errorLogs.filter(l => !l.resolved).length} unresolved
              </span>
            </div>

            {errorLogs.length === 0 ? (
              <Card className="bg-[#1A2B3C] border-[#2A3B4C] rounded-2xl">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-white font-medium">No errors logged</p>
                  <p className="text-gray-400 text-sm">The system is running smoothly</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {errorLogs.map((log) => (
                  <Card 
                    key={log.id} 
                    className={`border rounded-2xl ${
                      log.resolved 
                        ? 'bg-[#1A2B3C]/50 border-[#2A3B4C]' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            log.resolved ? 'bg-gray-500/20' : 'bg-red-500/20'
                          }`}>
                            {log.resolved 
                              ? <CheckCircle className="w-5 h-5 text-gray-400" />
                              : <AlertTriangle className="w-5 h-5 text-red-400" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-white">{log.type}</p>
                            <p className="text-sm text-gray-400">{log.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {log.timestamp ? format(new Date(log.timestamp), 'd MMM yyyy, HH:mm') : '-'}
                            </p>
                          </div>
                        </div>
                        {!log.resolved && (
                          <Button
                            size="sm"
                            onClick={() => resolveError(log.id)}
                            className="bg-[#00BFA5] hover:bg-[#00A896] text-white rounded-full"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                      {log.stack && (
                        <details className="mt-3">
                          <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
                            View stack trace
                          </summary>
                          <pre className="mt-2 p-3 bg-[#0A1626] rounded-lg text-xs text-gray-400 overflow-x-auto">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
};

export default FounderAdminPage;
