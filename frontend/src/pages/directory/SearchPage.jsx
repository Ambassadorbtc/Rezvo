import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Map, SlidersHorizontal } from 'lucide-react';
import Navbar from '../../components/directory/Navbar';
import Footer from '../../components/directory/Footer';
import SearchBar from '../../components/directory/SearchBar';
import SearchFilters from '../../components/directory/SearchFilters';
import RestaurantCard from '../../components/directory/RestaurantCard';
import NotifyMeModal from '../../components/directory/NotifyMeModal';
import { CardSkeleton } from '../../components/directory/SkeletonLoader';
import api from '../../utils/api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const [filters, setFilters] = useState({
    sort: 'recommended',
    cuisines: [],
    priceRanges: [],
    ratings: [],
    distances: [],
    availableNow: true,
    showAll: false
  });

  useEffect(() => {
    loadSearchResults();
  }, [searchParams, filters]);

  const loadSearchResults = async () => {
    try {
      setIsLoading(true);
      const params = {
        q: searchParams.get('q') || '',
        city: searchParams.get('city') || '',
        category: searchParams.get('category') || '',
        vertical: searchParams.get('vertical') || '',
        date: searchParams.get('date') || '',
        time: searchParams.get('time') || '',
        guests: searchParams.get('guests') || '',
        sort: filters.sort,
        cuisines: filters.cuisines.join(','),
        price: filters.priceRanges.join(','),
        rating: filters.ratings.length > 0 ? Math.min(...filters.ratings.map(r => parseFloat(r))) : '',
        available: filters.availableNow ? 'true' : ''
      };

      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== '')
      ).toString();

      const response = await api.get(`/directory/search?${queryString}`);
      setListings(response.listings || []);
      setTotalResults(response.total || 0);
    } catch (error) {
      console.error('Failed to load search results:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (params.query) newSearchParams.set('q', params.query);
    if (params.date) newSearchParams.set('date', params.date);
    if (params.time) newSearchParams.set('time', params.time);
    if (params.guests) newSearchParams.set('guests', params.guests);
    setSearchParams(newSearchParams);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      sort: 'recommended',
      cuisines: [],
      priceRanges: [],
      ratings: [],
      distances: [],
      availableNow: true,
      showAll: false
    });
  };

  const handleNotifyMe = (listing) => {
    setSelectedListing(listing);
    setShowNotifyModal(true);
  };

  const city = searchParams.get('city') || 'your area';
  const time = searchParams.get('time') || '19:00';
  const date = searchParams.get('date') || 'tonight';

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <section className="pt-24 pb-6 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar onSearch={handleSearch} className="shadow-none border-2 border-border" />
        </div>
      </section>

      <section className="py-6 bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-black text-forest mb-2">
                Available Now in {city.charAt(0).toUpperCase() + city.slice(1)}
              </h1>
              <p className="text-muted font-medium">
                Showing {totalResults} results for {date} at {time}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-4 py-2.5 bg-white border-2 rounded-lg font-semibold text-sm transition-all ${
                  showMap ? 'border-mint bg-pale-green' : 'border-border hover:border-mint'
                }`}
              >
                <Map className="text-forest w-5 h-5" />
                <span>Map View</span>
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-border rounded-lg hover:border-mint transition-all font-semibold text-sm lg:hidden"
              >
                <SlidersHorizontal className="text-forest w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <SearchFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearFilters}
              />
            </div>

            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-border rounded-full flex items-center justify-center mx-auto mb-6">
                    <Map className="w-10 h-10 text-muted" />
                  </div>
                  <h3 className="text-2xl font-heading font-black text-forest mb-2">
                    No results found
                  </h3>
                  <p className="text-muted mb-6">
                    Try adjusting your filters or search criteria
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="bg-forest text-white font-bold px-8 py-3 rounded-full hover:bg-sage transition-all"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {listings.map((listing, index) => (
                      <RestaurantCard
                        key={listing._id || index}
                        listing={listing}
                        onNotifyMe={handleNotifyMe}
                      />
                    ))}
                  </div>

                  {listings.length >= 12 && (
                    <div className="text-center">
                      <button className="bg-white text-forest font-bold px-8 py-4 rounded-full border-2 border-forest hover:bg-forest hover:text-white transition-all shadow-md">
                        Load more results
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {showNotifyModal && selectedListing && (
        <NotifyMeModal
          listing={selectedListing}
          onClose={() => setShowNotifyModal(false)}
          onSuccess={() => console.log('Notification registered')}
        />
      )}
    </div>
  );
}
