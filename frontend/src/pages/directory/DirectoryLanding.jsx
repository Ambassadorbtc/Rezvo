import SEO from '../../components/seo/SEO'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Navbar from '../../components/directory/Navbar';
import RezvoFooter from '../../components/directory/RezvoFooter';
import SearchBar from '../../components/directory/SearchBar';
import CategoryCard from '../../components/directory/CategoryCard';
import CityCard from '../../components/directory/CityCard';
import RestaurantCard from '../../components/directory/RestaurantCard';
import NotifyMeModal from '../../components/directory/NotifyMeModal';
import FaqAccordion from '../../components/directory/FaqAccordion';
import { CardSkeleton } from '../../components/directory/SkeletonLoader';
import api from '../../utils/api';

const CATEGORIES = [
  { name: 'Fine Dining', image: '/images/dc39e35ff7-94eb05f4eb30c483299e.png' },
  { name: 'Casual Dining', image: '/images/98354993fc-f42d2bfca4b1d3804ebb.png' },
  { name: 'Bars & Pubs', image: '/images/59b790fbf0-aa7efa6ef8475c4d7124.png' },
  { name: 'Hair Salons', image: '/images/3c9c421393-25eecabc7968c01b48c8.png' },
  { name: 'Barbers', image: '/images/6f07a11cc9-87324486494705eeb696.png' },
  { name: 'Spas', image: '/images/847cc3be7e-6efd0dc56394e728e0b9.png' },
  { name: 'Cafés', image: '/images/2beec991c0-3a8592b0890fb24c4ca5.png' }
];

const CITIES = [
  { name: 'London', image: '/images/62f259c792-a17ba4200caefb66704b.png', count: 2847 },
  { name: 'Manchester', image: '/images/7fa038b7b4-a5b08c6b0294535e04db.png', count: 864 },
  { name: 'Birmingham', image: '/images/fe69eabde9-233c9c1d6ea41c9ee378.png', count: 623 },
  { name: 'Edinburgh', image: '/images/984e20e514-44f0fd30bcd8cff8f549.png', count: 542 },
  { name: 'Bristol', image: '/images/77e107e340-be6ae7c861cb438b9cec.png', count: 418 },
  { name: 'Liverpool', image: '/images/eee141d55a-16c396e9fdbc93827d64.png', count: 376 },
  { name: 'Leeds', image: '/images/c8f693eb05-e0508cbf6e78e7af6c10.png', count: 329 },
  { name: 'Glasgow', image: '/images/b354d258ba-94149af5d9aedd249268.png', count: 294 },
  { name: 'Brighton', image: '/images/aff837abc5-4bd9e9dda1da67a13f58.png', count: 267 },
  { name: 'Oxford', image: '/images/fdf3e0dde3-c774b80c5b2e5ab1ca7e.png', count: 213 },
  { name: 'Cambridge', image: '/images/632d6ae0c6-c64f6ee948a4ccd33c81.png', count: 189 },
  { name: 'Bath', image: '/images/ea4441d821-0c2abffb7a23c0d7b093.png', count: 156 }
];

export default function DirectoryLanding() {
  const navigate = useNavigate();
  const [trendingListings, setTrendingListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  useEffect(() => {
    loadTrendingListings();
  }, []);

  const loadTrendingListings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/directory/home');
      setTrendingListings(response.trending || []);
    } catch (error) {
      console.error('Failed to load trending listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params) => {
    const searchParams = new URLSearchParams();
    if (params.vertical) searchParams.set('vertical', params.vertical);
    if (params.query) searchParams.set('q', params.query);
    if (params.date) searchParams.set('date', params.date);
    if (params.time) searchParams.set('time', params.time);
    if (params.filter3) searchParams.set('filter3', params.filter3);
    navigate(`/search?${searchParams.toString()}`);
  };

  const handleNotifyMe = (listing) => {
    setSelectedListing(listing);
    setShowNotifyModal(true);
  };

  const handleNotifySuccess = () => {
    console.log('Notification registered successfully');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <SEO title="Discover & Book Local Favourites" description="Find and book the best independent restaurants, salons, barbers, and spas near you. Real-time availability, zero booking fees." path="/" schema={{ "@context": "https://schema.org", "@type": "WebSite", "name": "Rezvo", "url": "https://rezvo.co.uk", "potentialAction": { "@type": "SearchAction", "target": "https://rezvo.co.uk/search?q={search_term_string}", "query-input": "required name=search_term_string" }}} />

      <section className="pt-32 pb-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-black text-forest mb-6 leading-tight">
              Discover & Book<br />Local Favourites
            </h1>
            <p className="text-xl sm:text-2xl text-muted font-body font-medium max-w-3xl mx-auto">
              Reserve tables at independent restaurants, salons, barbers, and spas across the UK
            </p>
          </div>

          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-4xl sm:text-5xl font-heading font-black text-forest mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-muted font-medium">Explore local experiences across the UK</p>
          </div>

          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-6 -mx-4 px-4">
            {CATEGORIES.map((category, index) => (
              <CategoryCard
                key={index}
                category={category.name}
                image={category.image}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-4xl sm:text-5xl font-heading font-black text-forest mb-4">
              Trending Near You
            </h2>
            <p className="text-lg text-muted font-medium">Popular bookings in your area</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {isLoading ? (
              <>
                {[...Array(8)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </>
            ) : (
              trendingListings.map((listing, index) => (
                <RestaurantCard
                  key={listing._id || index}
                  listing={listing}
                  onNotifyMe={handleNotifyMe}
                />
              ))
            )}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/search')}
              className="bg-white text-forest font-bold px-8 py-4 rounded-full border-2 border-forest hover:bg-forest hover:text-white transition-all shadow-md"
            >
              Show more restaurants
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-4xl sm:text-5xl font-heading font-black text-forest mb-4">
              Browse by City
            </h2>
            <p className="text-lg text-muted font-medium">Discover bookable venues across the UK</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CITIES.map((city, index) => (
              <CityCard
                key={index}
                city={city.name}
                image={city.image}
                count={city.count}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-heading font-black text-forest mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted font-medium">
              Everything you need to know about booking with Rezvo
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      <RezvoFooter />

      {showNotifyModal && selectedListing && (
        <NotifyMeModal
          listing={selectedListing}
          onClose={() => setShowNotifyModal(false)}
          onSuccess={handleNotifySuccess}
        />
      )}
    </div>
  );
}
