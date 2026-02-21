import { useState } from 'react';
import { Calendar, Clock, Users } from 'lucide-react';

export default function BookingWidget({ listing, onBooking, availableSlots = [] }) {
  const [date, setDate] = useState('tonight');
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState('2');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleFindTable = () => {
    onBooking?.({ date, time, guests });
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setTime(slot);
  };

  const defaultSlots = availableSlots.length > 0 
    ? availableSlots 
    : ['18:30', '19:00', '19:30', '20:00', '20:30'];

  return (
    <div className="bg-cream rounded-2xl p-4 sm:p-6">
      <h3 className="font-heading font-black text-forest text-xl mb-4">Make a Reservation</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 border-2 border-border">
          <label className="block text-xs font-semibold text-muted mb-2">Date</label>
          <div className="flex items-center gap-2">
            <Calendar className="text-forest w-4 h-4" />
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm font-semibold text-forest bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="tonight">Tonight</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this-weekend">This Weekend</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border-2 border-border">
          <label className="block text-xs font-semibold text-muted mb-2">Time</label>
          <div className="flex items-center gap-2">
            <Clock className="text-forest w-4 h-4" />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-sm font-semibold text-forest bg-transparent border-none outline-none cursor-pointer"
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

        <div className="bg-white rounded-xl p-3 border-2 border-border">
          <label className="block text-xs font-semibold text-muted mb-2">Party Size</label>
          <div className="flex items-center gap-2">
            <Users className="text-forest w-4 h-4" />
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full text-sm font-semibold text-forest bg-transparent border-none outline-none cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleFindTable}
          className="bg-forest text-white font-bold py-3 px-6 rounded-xl hover:bg-sage transition-all shadow-md"
        >
          Find a Table
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {defaultSlots.map((slot, idx) => (
          <button
            key={idx}
            onClick={() => handleSlotSelect(slot)}
            className={`px-5 py-2.5 font-semibold text-sm rounded-full transition-all ${
              selectedSlot === slot
                ? 'bg-white text-forest border-2 border-mint'
                : 'bg-white text-forest border-2 border-border hover:border-mint hover:bg-mint hover:text-white'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
}
