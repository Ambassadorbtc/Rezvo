import SEO from '../../components/seo/SEO'
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, Share2, Star, Utensils, MapPin, PoundSterling, 
  Clock, Phone, Globe, ChevronRight, Leaf, Wine, 
  Sprout, Award, Accessibility, UtensilsCrossed 
} from 'lucide-react';
import Navbar from '../../components/directory/Navbar';
import RezvoFooter from '../../components/directory/RezvoFooter';
import BookingWidget from '../../components/directory/BookingWidget';
import RestaurantCard from '../../components/directory/RestaurantCard';
import NotifyMeModal from '../../components/directory/NotifyMeModal';
import api from '../../utils/api';

const HIGHLIGHT_ICONS = {
  seasonal: Leaf,
  wine: Wine,
  vegan: Sprout,
  award: Award,
  accessible: Accessibility,
  private_dining: UtensilsCrossed
};

export default function ListingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarListings, setSimilarListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  useEffect(() => {
    loadListing();
  }, [slug]);

  const loadListing = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/directory/listings/${slug}`);
      setListing(response.listing);
      setReviews(response.reviews || []);
      setSimilarListings(response.similar || []);
    } catch (error) {
      console.error('Failed to load listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = (bookingData) => {
    navigate(`/booking/${slug}?date=${bookingData.date}&time=${bookingData.time}&guests=${bookingData.guests}`);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing?.name,
        text: `Check out ${listing?.name} on Rezvo`,
        url: window.location.href
      });
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-gold fill-gold" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-gold fill-gold opacity-50" />);
    }
    while (stars.length < 5) {
      stars.push(<Star key={`empty-${stars.length}`} className="w-4 h-4 text-border" />);
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-forest border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-black text-forest mb-4">Listing not found</h2>
            <button
              onClick={() => navigate('/search')}
              className="bg-forest text-white font-bold px-8 py-3 rounded-full hover:bg-sage transition-all"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <SEO
        title={listing.name || 'Restaurant'}
        description={listing.description || `Book a table at ${listing.name || 'this venue'} on Rezvo. Real-time availability, instant confirmation.`}
        path={`/restaurant/${slug}`}
        type="restaurant"
        schema={{
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": listing.name,
          "address": { "@type": "PostalAddress", "addressLocality": listing.city },
          "url": `https://rezvo.co.uk/restaurant/${slug}`
        }}
      />
      <Navbar />

      <section className="pt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-muted mb-4">
            <button onClick={() => navigate('/')} className="hover:text-forest transition-colors">
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <button onClick={() => navigate(`/search?city=${listing.city?.toLowerCase()}`)} className="hover:text-forest transition-colors">
              {listing.city}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-forest font-semibold">{listing.name}</span>
          </div>
        </div>

        <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={listing.photos?.[0] || listing.photo || '/images/placeholder-restaurant.png'}
            alt={listing.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-darker/60 via-transparent to-transparent"></div>

          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
            >
              <Heart className={`w-6 h-6 ${isSaved ? 'text-coral fill-coral' : 'text-forest'}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
            >
              <Share2 className="w-6 h-6 text-forest" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                {listing.is_registered && (
                  <div className="bg-mint text-forest px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide">
                    Book Now
                  </div>
                )}
                {listing.rating && (
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <Star className="text-gold w-4 h-4 fill-gold" />
                    <span className="text-forest font-bold">{listing.rating}</span>
                    {listing.review_count && (
                      <span className="text-muted text-sm">({listing.review_count} reviews)</span>
                    )}
                  </div>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white mb-3 drop-shadow-lg">
                {listing.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Utensils className="text-mint w-4 h-4" />
                  <span className="font-medium">{listing.cuisine || listing.vertical}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="text-mint w-4 h-4" />
                  <span className="font-medium">
                    {listing.neighbourhood || listing.city}, {listing.city}
                  </span>
                </div>
                {listing.price_category && (
                  <div className="flex items-center gap-2">
                    <PoundSterling className="text-mint w-4 h-4" />
                    <span className="font-medium">
                      {listing.price_category} • Average {listing.avg_price || '£45'} per person
                    </span>
                  </div>
                )}
              </div>

              {listing.booking_stats?.today_count && (
                <p className="text-white/80 text-sm mt-3">
                  Booked <span className="font-bold text-white">{listing.booking_stats.today_count} times</span> today
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {listing.is_registered && (
        <section className="sticky top-20 z-40 bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <BookingWidget
              listing={listing}
              onBooking={handleBooking}
              availableSlots={listing.available_slots}
            />
          </div>
        </section>
      )}

      <section className="py-12 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {listing.description && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-3xl font-heading font-black text-forest mb-4 flex items-center gap-3">
                    <Utensils className="text-mint w-7 h-7" />
                    About
                  </h2>
                  <div className="text-muted leading-relaxed space-y-4">
                    {listing.description.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {listing.highlights && listing.highlights.length > 0 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-3xl font-heading font-black text-forest mb-6 flex items-center gap-3">
                    <Star className="text-mint w-7 h-7" />
                    Highlights
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listing.highlights.map((highlight, idx) => {
                      const IconComponent = HIGHLIGHT_ICONS[highlight.icon] || Star;
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-pale-green rounded-full flex items-center justify-center flex-shrink-0">
                            <IconComponent className="text-forest w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-forest mb-1">{highlight.title}</h4>
                            <p className="text-sm text-muted">{highlight.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {listing.photos && listing.photos.length > 1 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-3xl font-heading font-black text-forest mb-6 flex items-center gap-3">
                    <Star className="text-mint w-7 h-7" />
                    Photos
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {listing.photos.slice(0, 6).map((photo, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden">
                        <img
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          src={photo}
                          alt={`${listing.name} photo ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  {listing.photos.length > 6 && (
                    <button className="w-full mt-4 bg-off-white text-forest font-bold py-3 rounded-xl hover:bg-border transition-all">
                      View All {listing.photos.length} Photos
                    </button>
                  )}
                </div>
              )}

              {reviews.length > 0 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-heading font-black text-forest flex items-center gap-3">
                      <Star className="text-gold w-7 h-7 fill-gold" />
                      Reviews
                    </h2>
                    <div className="text-right">
                      <div className="text-3xl font-heading font-black text-forest">
                        {listing.rating || '4.8'}
                      </div>
                      <div className="text-sm text-muted">{listing.review_count || reviews.length} reviews</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.slice(0, 3).map((review, idx) => (
                      <div key={idx} className={idx > 0 ? 'border-t border-border pt-6' : ''}>
                        <div className="flex items-start gap-4 mb-3">
                          <img
                            src={review.avatar || '/images/avatars-avatar-1.jpg'}
                            alt={review.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-forest">{review.name}</h4>
                              <span className="text-sm text-muted">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-muted text-sm leading-relaxed">{review.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviews.length > 3 && (
                    <button className="w-full mt-6 bg-off-white text-forest font-bold py-3 rounded-xl hover:bg-border transition-all">
                      Read All Reviews
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-32">
                <h3 className="font-heading font-black text-forest text-xl mb-4">Quick Info</h3>

                <div className="space-y-4">
                  {listing.opening_hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="text-mint w-5 h-5 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-forest mb-2">Opening Hours</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(listing.opening_hours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="text-muted capitalize">{day}</span>
                              <span className="font-semibold text-forest">{hours}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {listing.address && (
                    <div className="border-t border-border pt-4 flex items-start gap-3">
                      <MapPin className="text-mint w-5 h-5 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-forest mb-1">Address</h4>
                        <p className="text-sm text-muted mb-2">
                          {listing.address.street}<br />
                          {listing.address.city}<br />
                          {listing.address.postcode}
                        </p>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(listing.address.full)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-mint font-semibold hover:text-forest transition-colors"
                        >
                          Get Directions →
                        </a>
                      </div>
                    </div>
                  )}

                  {listing.phone && (
                    <div className="border-t border-border pt-4 flex items-start gap-3">
                      <Phone className="text-mint w-5 h-5 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-forest mb-1">Contact</h4>
                        <p className="text-sm text-muted mb-1">{listing.phone}</p>
                        {listing.email && (
                          <a
                            href={`mailto:${listing.email}`}
                            className="text-sm text-mint font-semibold hover:text-forest transition-colors"
                          >
                            {listing.email}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {listing.website && (
                    <div className="border-t border-border pt-4 flex items-start gap-3">
                      <Globe className="text-mint w-5 h-5 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-forest mb-1">Website</h4>
                        <a
                          href={listing.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-mint font-semibold hover:text-forest transition-colors"
                        >
                          Visit website →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {listing.location && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-heading font-black text-forest text-xl mb-4">Location</h3>
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-border">
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      Map placeholder
                    </div>
                  </div>
                  <p className="text-sm text-muted mb-3">{listing.location.description}</p>
                  <button className="w-full bg-forest text-white font-bold py-3 rounded-xl hover:bg-sage transition-all">
                    Open in Maps
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {similarListings.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-forest mb-8">
              Similar Venues Nearby
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.slice(0, 3).map((similar, idx) => (
                <RestaurantCard
                  key={similar._id || idx}
                  listing={similar}
                  onNotifyMe={setSelectedListing}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <RezvoFooter />

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
