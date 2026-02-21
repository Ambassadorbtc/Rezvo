import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown } from 'lucide-react';
import VoiceSearch from './VoiceSearch';

const VERTICAL_CONFIG = {
  restaurants: {
    icon: <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3ZM21 15v7" />,
    filter3Label: 'Party Size',
    filter3Default: '2 guests',
    filter3Options: [
      '1 guest', '2 guests', '3 guests', '4 guests', '5 guests', '6 guests', '7 guests', '8+ guests'
    ],
    ctaText: 'Find a table',
    hints: [
      'Italian in Shoreditch for 4 tonight',
      'Sushi near Tower Bridge Saturday 7pm',
      'Family brunch spot Manchester tomorrow',
      'Fine dining Mayfair next Friday',
      'Turkish restaurant Leeds for 6'
    ]
  },
  salons: {
    icon: <><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></>,
    filter3Label: 'Service',
    filter3Default: 'Haircut',
    filter3Options: ['Haircut', 'Balayage', 'Colour', 'Blowdry', 'Extensions', 'Keratin', 'Braids'],
    ctaText: 'Find a stylist',
    hints: [
      'Balayage in Clapham Saturday afternoon',
      'Hair salon near me with good reviews',
      'Colour appointment Shoreditch tomorrow',
      'Blowdry Chelsea before Friday night',
      'Braids specialist South London'
    ]
  },
  barbers: {
    icon: <><path d="M5 2v16c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4V2M5 8h14M5 14h14"/><circle cx="9" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1" fill="currentColor" stroke="none"/></>,
    filter3Label: 'Service',
    filter3Default: 'Skin fade',
    filter3Options: ['Skin fade', 'Beard trim', 'Fade & beard', 'Buzz cut', 'Scissor cut', 'Hot towel shave', 'Line up'],
    ctaText: 'Find a barber',
    hints: [
      'Fade and beard trim near me tomorrow',
      'Turkish barber Manchester walk-in',
      'Best barber Brixton Saturday morning',
      'Hot towel shave Sheffield this week',
      'Skin fade Liverpool today'
    ]
  },
  spas: {
    icon: <><ellipse cx="12" cy="18" rx="7" ry="3"/><ellipse cx="12" cy="13" rx="5" ry="2.5"/><ellipse cx="12" cy="8.5" rx="3.5" ry="2"/><path d="M10 4c0-1 1-2 2-2s2 1 2 2" strokeDasharray="1 2"/></>,
    filter3Label: 'Treatment',
    filter3Default: 'Massage',
    filter3Options: ['Massage', 'Facial', 'Body wrap', 'Couples massage', 'Hot stone', 'Aromatherapy', 'Mani & Pedi'],
    ctaText: 'Find a treatment',
    hints: [
      'Couples massage Manchester this weekend',
      'Deep tissue massage near Canary Wharf',
      'Spa day Birmingham Saturday',
      'Facial treatment Nottingham tomorrow',
      'Hot stone therapy Leeds afternoon'
    ]
  },
  more: {
    icon: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    filter3Label: 'Service',
    filter3Default: 'Dog grooming',
    filter3Options: ['Dog grooming', 'Tattoo', 'Nails', 'Lashes', 'Personal training', 'Piercing', 'Tanning'],
    ctaText: 'Book now',
    hints: [
      'Dog groomer in Bristol this week',
      'Nail salon Clapham Saturday morning',
      'Lash extensions near me tomorrow',
      'Tattoo artist Manchester consultations',
      'Personal trainer South London mornings'
    ]
  }
};

function CustomDropdown({ label, value, options, onChange, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-cream/50 rounded-lg transition-colors"
      >
        {Icon && <Icon className="text-green w-5 h-5" strokeWidth={1.8} />}
        <div className="flex-1">
          <label className="text-xs text-muted font-medium block mb-0.5">{label}</label>
          <div className="text-text font-semibold text-sm">{value}</div>
        </div>
        <ChevronDown
          className="text-muted w-4 h-4 transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-border overflow-hidden z-20"
            style={{
              boxShadow: '0 12px 40px -8px rgba(27,67,50,0.18)',
              animation: 'slideUp 0.15s ease-out'
            }}
          >
            <style>{`
              @keyframes slideUp {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-cream/70"
                style={{
                  background: value === option ? '#D8F3DC' : 'transparent',
                  color: value === option ? '#1B4332' : '#2A2A28'
                }}
              >
                {option}
                {value === option && (
                  <span className="float-right text-green">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchBar({ onSearch, className = '' }) {
  const [activeVertical, setActiveVertical] = useState('restaurants');
  const [date, setDate] = useState('Tonight');
  const [time, setTime] = useState('19:00');
  const [filter3, setFilter3] = useState('2 guests');
  const [query, setQuery] = useState('');
  const [currentHint, setCurrentHint] = useState(0);

  const config = VERTICAL_CONFIG[activeVertical];

  useEffect(() => {
    setFilter3(config.filter3Default);
  }, [activeVertical, config.filter3Default]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % config.hints.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [config.hints.length]);

  const handleVoiceTranscript = async (transcript, vertical) => {
    setQuery(transcript);
    
    // Call backend voice parser
    try {
      const response = await fetch('/api/voice-search/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, vertical })
      });
      
      if (response.ok) {
        const parsed = await response.json();
        if (parsed.date) setDate(parsed.date);
        if (parsed.time) setTime(parsed.time);
        if (parsed.guests) setFilter3(`${parsed.guests} ${parsed.guests === 1 ? 'guest' : 'guests'}`);
        if (parsed.location || parsed.cuisine) {
          setQuery(parsed.business_name || `${parsed.cuisine || ''} ${parsed.location || ''}`.trim());
        }
        
        setTimeout(() => {
          handleSearch();
        }, 500);
      }
    } catch (err) {
      console.error('Voice search parse error:', err);
      handleSearch();
    }
  };

  const handleSearch = () => {
    onSearch({
      vertical: activeVertical,
      date,
      time,
      filter3,
      query
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const dateOptions = ['Tonight', 'Tomorrow', 'This Weekend', 'Next Week'];
  const timeOptions = ['12:00', '12:30', '13:00', '13:30', '14:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

  return (
    <div className={`max-w-5xl mx-auto ${className}`}>
      <style>{`
        @keyframes breatheCTA {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(27,67,50,0.2); }
          50% { transform: scale(1.05); box-shadow: 0 8px 28px rgba(27,67,50,0.35); }
        }
        @keyframes tabGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .hint-fade {
          animation: hintFade 0.6s ease-in-out;
        }
        @keyframes hintFade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Vertical Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl">
        {Object.keys(VERTICAL_CONFIG).map((key) => {
          const isActive = activeVertical === key;
          const tabConfig = VERTICAL_CONFIG[key];
          
          return (
            <button
              key={key}
              onClick={() => setActiveVertical(key)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all relative group"
              style={{
                background: isActive ? 'white' : 'transparent',
                color: isActive ? '#1B4332' : '#6B706D',
                transform: isActive ? 'scale(1.04) translateY(-1px)' : 'scale(1)',
                boxShadow: isActive ? '0 4px 12px rgba(27,67,50,0.1)' : 'none'
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-[18px] h-[18px] transition-transform group-hover:scale-125 group-hover:rotate-[-8deg]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {tabConfig.icon}
              </svg>
              <span className="capitalize hidden sm:inline">{key}</span>
              
              {isActive && (
                <div
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-green"
                  style={{ animation: 'tabGlow 2s ease-in-out infinite' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Search Card */}
      <div className="bg-white rounded-3xl shadow-card border border-border overflow-hidden">
        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border">
          <div className="sm:border-r border-border">
            <CustomDropdown
              label="Date"
              value={date}
              options={dateOptions}
              onChange={setDate}
              icon={Calendar}
            />
          </div>
          <div className="sm:border-r border-border">
            <CustomDropdown
              label="Time"
              value={time}
              options={timeOptions}
              onChange={setTime}
              icon={Clock}
            />
          </div>
          <div>
            <CustomDropdown
              label={config.filter3Label}
              value={filter3}
              options={config.filter3Options}
              onChange={setFilter3}
            />
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-green flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="I'm looking for..."
              className="flex-1 text-text font-semibold bg-transparent border-none outline-none placeholder:text-subtle text-base"
            />
          </div>
        </div>

        {/* Voice Search Hero */}
        <div className="p-4 border-b border-border">
          <VoiceSearch onTranscript={handleVoiceTranscript} vertical={activeVertical} />
        </div>

        {/* Bottom Bar */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-muted">
            <span className="hidden sm:inline">Try: </span>
            <span key={currentHint} className="hint-fade font-medium text-text">
              "{config.hints[currentHint]}"
            </span>
          </div>
          
          <button
            onClick={handleSearch}
            className="px-8 py-3.5 rounded-full font-bold text-white flex items-center gap-2 hover:scale-110 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
              animation: 'breatheCTA 2.5s ease-in-out infinite'
            }}
          >
            {config.ctaText}
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
