import { ArrowDownWideNarrow, Utensils, PoundSterling, Star, MapPin, Clock } from 'lucide-react';

const CUISINES = [
  'Modern British', 'Italian', 'Japanese', 'French', 'Indian', 'Mediterranean',
  'Chinese', 'Thai', 'Spanish', 'Turkish', 'Mexican', 'Korean', 'Vietnamese'
];

const PRICE_RANGES = [
  { label: '£ Under £25', value: '1' },
  { label: '££ £25-£50', value: '2' },
  { label: '£££ £50-£80', value: '3' },
  { label: '££££ £80+', value: '4' }
];

const RATINGS = [
  { label: '4.5+', value: '4.5' },
  { label: '4.0+', value: '4.0' },
  { label: '3.5+', value: '3.5' }
];

const DISTANCES = [
  { label: 'Within 1 mile', value: '1' },
  { label: 'Within 3 miles', value: '3' },
  { label: 'Within 5 miles', value: '5' },
  { label: '10+ miles', value: '10' }
];

export default function SearchFilters({ filters, onFilterChange, onClearAll }) {
  const handleCheckboxChange = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(filterType, newValues);
  };

  const handleRadioChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-heading font-black text-forest mb-4 flex items-center justify-between">
          <span>Sort By</span>
          <ArrowDownWideNarrow className="text-mint w-5 h-5" />
        </h3>
        <div className="space-y-2">
          {['recommended', 'rating', 'popular', 'distance'].map((sort) => (
            <label key={sort} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                value={sort}
                checked={filters.sort === sort}
                onChange={(e) => handleRadioChange('sort', e.target.value)}
                className="w-4 h-4 text-forest accent-forest"
              />
              <span className="text-sm font-medium group-hover:text-forest capitalize">
                {sort === 'popular' ? 'Most Popular' : sort === 'rating' ? 'Highest Rated' : sort}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-heading font-black text-forest mb-4 flex items-center justify-between">
          <span>Cuisine</span>
          <Utensils className="text-mint w-5 h-5" />
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {CUISINES.map((cuisine) => (
            <label key={cuisine} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.cuisines?.includes(cuisine) || false}
                onChange={() => handleCheckboxChange('cuisines', cuisine)}
                className="w-4 h-4 rounded text-forest accent-forest"
              />
              <span className="text-sm font-medium group-hover:text-forest">{cuisine}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-heading font-black text-forest mb-4 flex items-center justify-between">
          <span>Price Range</span>
          <PoundSterling className="text-mint w-5 h-5" />
        </h3>
        <div className="space-y-2">
          {PRICE_RANGES.map((price) => (
            <label key={price.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.priceRanges?.includes(price.value) || false}
                onChange={() => handleCheckboxChange('priceRanges', price.value)}
                className="w-4 h-4 rounded text-forest accent-forest"
              />
              <span className="text-sm font-medium group-hover:text-forest">{price.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-heading font-black text-forest mb-4 flex items-center justify-between">
          <span>Rating</span>
          <Star className="text-gold w-5 h-5 fill-gold" />
        </h3>
        <div className="space-y-2">
          {RATINGS.map((rating) => (
            <label key={rating.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.ratings?.includes(rating.value) || false}
                onChange={() => handleCheckboxChange('ratings', rating.value)}
                className="w-4 h-4 rounded text-forest accent-forest"
              />
              <span className="text-sm font-medium group-hover:text-forest flex items-center gap-1">
                {rating.label} <Star className="text-gold w-3 h-3 fill-gold" />
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-heading font-black text-forest mb-4 flex items-center justify-between">
          <span>Distance</span>
          <MapPin className="text-mint w-5 h-5" />
        </h3>
        <div className="space-y-2">
          {DISTANCES.map((distance) => (
            <label key={distance.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.distances?.includes(distance.value) || false}
                onChange={() => handleCheckboxChange('distances', distance.value)}
                className="w-4 h-4 rounded text-forest accent-forest"
              />
              <span className="text-sm font-medium group-hover:text-forest">{distance.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-heading font-black text-forest mb-4 flex items-center justify-between">
          <span>Availability</span>
          <Clock className="text-mint w-5 h-5" />
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.availableNow || false}
              onChange={(e) => onFilterChange('availableNow', e.target.checked)}
              className="w-4 h-4 rounded text-forest accent-forest"
            />
            <span className="text-sm font-medium group-hover:text-forest">Available Now</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.showAll || false}
              onChange={(e) => onFilterChange('showAll', e.target.checked)}
              className="w-4 h-4 rounded text-forest accent-forest"
            />
            <span className="text-sm font-medium group-hover:text-forest">Show All</span>
          </label>
        </div>
      </div>

      <button
        onClick={onClearAll}
        className="w-full bg-off-white text-forest font-bold py-3 rounded-lg hover:bg-border transition-all text-sm"
      >
        Clear All Filters
      </button>
    </aside>
  );
}
