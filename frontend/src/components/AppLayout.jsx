import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Link2, 
  BarChart3,
  Scissors,
  LogOut,
  Menu,
  X,
  Shield,
  UsersRound,
  Search
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import api from '../lib/api';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  // Keyboard shortcut (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get('/search?q=' + encodeURIComponent(searchQuery));
        setSearchResults(res.data);
      } catch (err) {
        setSearchResults({ bookings: [], services: [], customers: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchNavigate = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
    navigate(path);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/bookings', label: 'Bookings', icon: Users },
    { path: '/team', label: 'Team', icon: UsersRound },
    { path: '/services', label: 'Services', icon: Scissors },
    { path: '/share', label: 'Booking Page', icon: Link2 },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-heading text-navy-900">Rezvo</span>
          </Link>
        </div>

        {/* Search Button - Dropdown Style */}
        <div className="p-4 border-b border-gray-100 relative">
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-navy-400 hover:bg-gray-100 hover:text-navy-600 transition-all"
              data-testid="search-trigger-btn"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd className="ml-auto text-xs bg-white px-2 py-1 rounded border border-gray-200">⌘K</kbd>
            </button>
            
            {/* Search Dropdown */}
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search bookings, services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 outline-none text-sm bg-transparent"
                    data-testid="search-input"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults(null); }} className="p-1 hover:bg-gray-100 rounded">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searchLoading && (
                    <div className="flex justify-center py-6">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!searchLoading && searchQuery.length < 2 && (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500">Type to search...</p>
                    </div>
                  )}
                  {!searchLoading && searchQuery.length >= 2 && searchResults && (
                    <div className="p-2">
                      {searchResults.bookings?.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">Bookings</h3>
                          {searchResults.bookings.slice(0, 4).map((b, i) => (
                            <button key={i} onClick={() => handleSearchNavigate('/bookings')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left">
                              <Calendar className="w-4 h-4 text-teal-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{b.client_name}</p>
                                <p className="text-xs text-gray-500 truncate">{b.service_name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.services?.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">Services</h3>
                          {searchResults.services.slice(0, 4).map((s, i) => (
                            <button key={i} onClick={() => handleSearchNavigate('/services')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left">
                              <Scissors className="w-4 h-4 text-purple-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{s.name}</p>
                                <p className="text-xs text-gray-500">£{(s.price_pence / 100).toFixed(2)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.customers?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">Customers</h3>
                          {searchResults.customers.slice(0, 4).map((c, i) => (
                            <button key={i} onClick={() => handleSearchNavigate('/bookings')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left">
                              <Users className="w-4 h-4 text-blue-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{c.name}</p>
                                <p className="text-xs text-gray-500 truncate">{c.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {(!searchResults.bookings?.length && !searchResults.services?.length && !searchResults.customers?.length) && (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-500">No results found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          {/* Admin Link */}
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 border-t border-gray-100 pt-6 ${
              isActive('/admin')
                ? 'bg-purple-50 text-purple-700'
                : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
            }`}
            data-testid="nav-admin"
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Admin Panel</span>
          </Link>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-navy-900 truncate">{user?.email}</div>
              <div className="text-xs text-navy-500">Free Trial</div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-navy-500 hover:text-navy-900 hover:bg-gray-50"
            onClick={logout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold font-heading text-navy-900">Rezvo</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-navy-700"
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-lg">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-navy-600 hover:bg-gray-50 hover:text-navy-900 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-lg">Log out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:h-screen pt-16 md:pt-0 pb-20 md:pb-0 bg-cream">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'text-teal-600'
                  : 'text-navy-400 hover:text-navy-600'
              }`}
              data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>

    </div>
  );
};

export default AppLayout;
