import { useState } from 'react';
import { Calendar, Clock, Users, Search } from 'lucide-react';

export default function SearchBar({ onSearch, className = '' }) {
  const [date, setDate] = useState('tonight');
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState('2');
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch({ date, time, guests, query });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-3 sm:p-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-0 mb-3 sm:mb-0 lg:mb-0">
        <div className="flex items-center gap-3 px-4 py-3 lg:border-r border-border">
          <Calendar className="text-forest w-5 h-5" />
          <div className="flex-1">
            <label className="text-xs text-muted font-medium block mb-1">Date</label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-text font-semibold bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="tonight">Tonight</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this-weekend">This Weekend</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 lg:border-r border-border">
          <Clock className="text-forest w-5 h-5" />
          <div className="flex-1">
            <label className="text-xs text-muted font-medium block mb-1">Time</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-text font-semibold bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="18:00">18:00</option>
              <option value="18:30">18:30</option>
              <option value="19:00">19:00</option>
              <option value="19:30">19:30</option>
              <option value="20:00">20:00</option>
              <option value="20:30">20:30</option>
              <option value="21:00">21:00</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 lg:border-r border-border">
          <Users className="text-forest w-5 h-5" />
          <div className="flex-1">
            <label className="text-xs text-muted font-medium block mb-1">Party Size</label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full text-text font-semibold bg-transparent border-none outline-none cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="text-forest w-5 h-5" />
          <div className="flex-1">
            <label className="text-xs text-muted font-medium block mb-1">Search</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Restaurant, cuisine, or area..."
              className="w-full text-text font-semibold bg-transparent border-none outline-none placeholder:text-subtle"
            />
          </div>
        </div>
      </div>

      <div className="sm:mt-3 lg:mt-3">
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto lg:w-auto bg-forest text-white font-bold px-8 py-3.5 rounded-full hover:bg-sage transition-all shadow-md hover:shadow-xl float-right"
        >
          Find a table
        </button>
      </div>
    </div>
  );
}
