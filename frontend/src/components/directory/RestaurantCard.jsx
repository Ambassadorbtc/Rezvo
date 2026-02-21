import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RestaurantCard({ listing, showTimeSlots = true, onNotifyMe }) {
  const navigate = useNavigate();
  const isRegistered = listing.is_registered || listing.isRegistered;

  const handleCardClick = () => {
    if (isRegistered) {
      navigate(`/restaurant/${listing.slug || listing._id}`);
    }
  };

  const handleTimeSlotClick = (time, e) => {
    e.stopPropagation();
    navigate(`/restaurant/${listing.slug || listing._id}?time=${time}`);
  };

  const handleNotifyClick = (e) => {
    e.stopPropagation();
    onNotifyMe?.(listing);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`listing-card bg-white rounded-2xl overflow-hidden shadow-md transition-all duration-300 ${
        isRegistered
          ? 'hover:shadow-xl cursor-pointer group'
          : 'border-2 border-dashed border-warm-border opacity-75 hover:opacity-90'
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          className={`w-full h-full object-cover ${
            isRegistered ? 'group-hover:scale-105 transition-transform duration-500' : 'grayscale'
          }`}
          src={listing.photo || listing.photos?.[0] || '/images/placeholder-restaurant.png'}
          alt={listing.name}
          loading="lazy"
        />
        
        {listing.rating && isRegistered && (
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star className="text-gold w-4 h-4 fill-gold" />
            <span className="text-forest font-bold text-sm">{listing.rating}</span>
          </div>
        )}

        <div className="absolute top-4 left-4">
          {isRegistered ? (
            <div className="bg-mint text-forest px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide">
              Book Now
            </div>
          ) : (
            <div className="bg-espresso text-white px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide">
              Not Yet on Rezvo
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-heading font-black text-forest mb-2">{listing.name}</h3>
        <p className="text-muted text-sm font-medium mb-3">
          {listing.cuisine || listing.vertical} • {listing.neighbourhood || listing.city}
        </p>

        {isRegistered && listing.booking_stats?.today_count && (
          <p className="text-xs text-subtle mb-4">
            Booked <span className="font-bold text-forest">{listing.booking_stats.today_count} times</span> today
          </p>
        )}

        {isRegistered && showTimeSlots && listing.available_slots?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {listing.available_slots.slice(0, 4).map((slot, idx) => (
              <button
                key={idx}
                onClick={(e) => handleTimeSlotClick(slot, e)}
                className="px-4 py-2 bg-off-white text-forest font-semibold text-sm rounded-full hover:bg-mint hover:text-white transition-all"
              >
                {slot}
              </button>
            ))}
          </div>
        )}

        {!isRegistered && (
          <button
            onClick={handleNotifyClick}
            className="w-full bg-forest text-white font-bold py-3 rounded-full hover:bg-sage transition-all"
          >
            Notify Me When They Join
          </button>
        )}

        {isRegistered && listing.price_category && (
          <div className="text-xs text-muted">
            <span className="font-semibold">{listing.price_category}</span>
            {listing.avg_price && ` • Average ${listing.avg_price} per person`}
          </div>
        )}
      </div>
    </div>
  );
}
