import { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, Scissors, User, Clock, ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import api, { formatPrice, formatDateTime } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ bookings: [], services: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setResults({ bookings: [], services: [], customers: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
          setResults(res.data);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ bookings: [], services: [], customers: [] });
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = (type, item) => {
    onClose();
    if (type === 'booking') {
      navigate('/bookings');
    } else if (type === 'service') {
      navigate('/services');
    } else if (type === 'customer') {
      navigate('/bookings');
    }
  };

  const hasResults = results.bookings.length > 0 || results.services.length > 0 || results.customers.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search bookings, services, customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 shadow-none focus-visible:ring-0 text-lg placeholder:text-gray-400"
            data-testid="search-input"
          />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#00BFA5] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-12 px-6">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">Start typing to search...</p>
              <p className="text-sm text-gray-400 mt-1">Search across bookings, services, and customers</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-12 px-6">
              <p className="text-gray-500">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Bookings */}
              {results.bookings.length > 0 && (
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Bookings
                  </h3>
                  <div className="space-y-1">
                    {results.bookings.map((booking, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleResultClick('booking', booking)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        data-testid={`search-result-booking-${idx}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#00BFA5]/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-[#00BFA5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#0A1626] truncate">{booking.client_name}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {booking.service_name} • {booking.datetime ? formatDateTime(booking.datetime) : 'No date'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {results.services.length > 0 && (
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Services
                  </h3>
                  <div className="space-y-1">
                    {results.services.map((service, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleResultClick('service', service)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        data-testid={`search-result-service-${idx}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Scissors className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#0A1626] truncate">{service.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(service.price_pence)} • {service.duration_min} min
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {results.customers.length > 0 && (
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Customers
                  </h3>
                  <div className="space-y-1">
                    {results.customers.map((customer, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleResultClick('customer', customer)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                        data-testid={`search-result-customer-${idx}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#0A1626] truncate">{customer.name}</p>
                          <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">ESC</kbd> to close</span>
          <span>Search powered by Rezvo</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
