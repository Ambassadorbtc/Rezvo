import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Calendar, Scissors, User, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const formatPrice = (pence) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100);
};

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  const doSearch = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/search?q=' + encodeURIComponent(searchQuery));
      setResults(res.data);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ bookings: [], services: [], customers: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const goTo = (path) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  const hasResults = results && (results.bookings?.length > 0 || results.services?.length > 0 || results.customers?.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search bookings, services, customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 outline-none text-lg bg-transparent"
            data-testid="search-input"
          />
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" data-testid="search-close-btn">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {!loading && query.length < 2 && (
            <div className="text-center py-8">
              <Search className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500">Type to search...</p>
            </div>
          )}
          
          {!loading && query.length >= 2 && !hasResults && (
            <div className="text-center py-8">
              <p className="text-gray-500">No results found</p>
            </div>
          )}
          
          {!loading && hasResults && (
            <div className="space-y-4">
              {results.bookings?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Bookings</h3>
                  {results.bookings.map((b, i) => (
                    <button 
                      key={`booking-${i}`} 
                      onClick={() => goTo('/bookings')} 
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left"
                    >
                      <Calendar className="w-5 h-5 text-teal-500" />
                      <div className="flex-1">
                        <p className="font-medium">{b.client_name}</p>
                        <p className="text-sm text-gray-500">{b.service_name}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
              
              {results.services?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Services</h3>
                  {results.services.map((s, i) => (
                    <button 
                      key={`service-${i}`} 
                      onClick={() => goTo('/services')} 
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left"
                    >
                      <Scissors className="w-5 h-5 text-purple-500" />
                      <div className="flex-1">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-sm text-gray-500">{formatPrice(s.price_pence)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
              
              {results.customers?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Customers</h3>
                  {results.customers.map((c, i) => (
                    <button 
                      key={`customer-${i}`} 
                      onClick={() => goTo('/bookings')} 
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left"
                    >
                      <User className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-gray-500">{c.email}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
