import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
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
  Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import SearchModal from './SearchModal';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/bookings', label: 'Bookings', icon: Users },
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

        {/* Search Button */}
        <div className="px-4 pt-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
            data-testid="search-btn"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            <span className="text-sm text-gray-400 group-hover:text-gray-600 flex-1">Search...</span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] bg-white rounded border border-gray-200 text-gray-400">⌘K</kbd>
          </button>
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

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default AppLayout;
