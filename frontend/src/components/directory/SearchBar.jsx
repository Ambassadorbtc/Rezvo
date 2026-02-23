import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════
// BRANDED MONOCHROME ICONS
// ═══════════════════════════════════════════════════

const TabIcons = {
  restaurants: (color = "currentColor") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  ),
  salons: (color = "currentColor") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/>
      <circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>
    </svg>
  ),
  barbers: (color = "currentColor") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2v16c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4V2"/>
      <path d="M5 8h14"/><path d="M5 14h14"/>
      <circle cx="9" cy="11" r="1" fill={color} stroke="none"/>
      <circle cx="15" cy="11" r="1" fill={color} stroke="none"/>
    </svg>
  ),
  spas: (color = "currentColor") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="18" rx="7" ry="3"/><ellipse cx="12" cy="13" rx="5" ry="2.5"/>
      <ellipse cx="12" cy="8.5" rx="3.5" ry="2"/><path d="M10 4c0-1 1-2 2-2s2 1 2 2" strokeDasharray="1 2"/>
    </svg>
  ),
  more: (color = "currentColor") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/>
      <rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>
    </svg>
  ),
};

const Icons = {
  calendar: (color = "#40916C") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="3" ry="3"/>
      <line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
      <circle cx="8" cy="15" r="1" fill={color} stroke="none"/>
      <circle cx="12" cy="15" r="1" fill={color} stroke="none"/>
      <circle cx="16" cy="15" r="1" fill={color} stroke="none"/>
    </svg>
  ),
  clock: (color = "#40916C") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  guests: (color = "#40916C") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  scissors: (color = "#40916C") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/>
      <circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>
    </svg>
  ),
  spa: (color = "#40916C") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="18" rx="7" ry="3"/><ellipse cx="12" cy="13" rx="5" ry="2.5"/>
      <ellipse cx="12" cy="8.5" rx="3.5" ry="2"/><path d="M10 4c0-1 1-2 2-2s2 1 2 2" strokeDasharray="1 2"/>
    </svg>
  ),
  dots: (color = "#40916C") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none"/>
      <circle cx="19" cy="12" r="1.5" fill={color} stroke="none"/>
      <circle cx="5" cy="12" r="1.5" fill={color} stroke="none"/>
    </svg>
  ),
  search: (color = "#9CA09E") => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  chevron: (color = "#9CA09E") => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  arrow: (color = "white") => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  ),
  check: (color = "#52B788") => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
};

const FILTER3_ICONS = {
  restaurants: Icons.guests,
  salons: Icons.scissors,
  barbers: Icons.scissors,
  spas: Icons.spa,
  more: Icons.dots,
};

// ═══════════════════════════════════════════════════
// VERTICALS CONFIG
// ═══════════════════════════════════════════════════

const VERTICALS = [
  {
    id: "restaurants", label: "Restaurants", tabIcon: TabIcons.restaurants,
    filter3Label: "Party Size",
    filter3Options: ["1 guest", "2 guests", "3 guests", "4 guests", "5 guests", "6 guests", "7 guests", "8+ guests"],
    filter3Default: "2 guests",
    hints: [
      "Italian in Shoreditch for 4 tonight at 8",
      "Book sushi near Tower Bridge Saturday 7pm",
      "Table for 6 Manchester Friday evening",
      "Romantic dinner Mayfair tomorrow 8:30",
      "Brunch spot Hackney Sunday for 3",
    ],
    hoverColor: "#52B788",
  },
  {
    id: "salons", label: "Salons", tabIcon: TabIcons.salons,
    filter3Label: "Service",
    filter3Options: ["Haircut", "Balayage", "Colour", "Blowdry", "Extensions", "Keratin", "Braids"],
    filter3Default: "Haircut",
    hints: [
      "Balayage in Clapham Saturday afternoon",
      "Colour appointment Shoreditch tomorrow 2pm",
      "Blowdry Chelsea before Friday night",
      "Braids specialist South London this week",
      "Haircut and style Dalston Saturday morning",
    ],
    hoverColor: "#74C69D",
  },
  {
    id: "barbers", label: "Barbers", tabIcon: TabIcons.barbers,
    filter3Label: "Service",
    filter3Options: ["Skin fade", "Beard trim", "Fade & beard", "Buzz cut", "Scissor cut", "Hot towel shave", "Line up"],
    filter3Default: "Skin fade",
    hints: [
      "Fade and beard trim near me tomorrow 10am",
      "Turkish barber Manchester walk-in today",
      "Best barber Brixton Saturday morning",
      "Hot towel shave Sheffield this week",
      "Skin fade Liverpool today afternoon",
    ],
    hoverColor: "#40916C",
  },
  {
    id: "spas", label: "Spas", tabIcon: TabIcons.spas,
    filter3Label: "Treatment",
    filter3Options: ["Massage", "Facial", "Body wrap", "Couples massage", "Hot stone", "Aromatherapy", "Mani & Pedi"],
    filter3Default: "Massage",
    hints: [
      "Couples massage Manchester this Saturday",
      "Deep tissue near Canary Wharf tomorrow",
      "Spa day Birmingham Saturday morning",
      "Facial treatment Nottingham 3pm",
      "Hot stone therapy Leeds this afternoon",
    ],
    hoverColor: "#2D6A4F",
  },
  {
    id: "more", label: "More", tabIcon: TabIcons.more,
    filter3Label: "Service",
    filter3Options: ["Dog grooming", "Tattoo", "Nails", "Lashes", "Personal training", "Piercing", "Tanning"],
    filter3Default: "Dog grooming",
    hints: [
      "Dog groomer Bristol this Saturday",
      "Nail salon Clapham Saturday morning",
      "Lash extensions near me tomorrow",
      "Tattoo consultation Manchester this week",
      "Personal trainer South London mornings",
    ],
    hoverColor: "#D4A017",
  },
];

const TIMES = ["09:00","10:00","11:00","12:00","12:30","13:00","14:00","15:00","16:00","17:00","18:00","18:30","19:00","19:30","20:00","20:30","21:00"];

// Generate dynamic date options from today
function generateDates() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const today = new Date();
  const result = ["Today", "Tomorrow"];
  for (let i = 2; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    result.push(`${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`);
  }
  return result;
}
const DATES = generateDates();


// ═══════════════════════════════════════════════════
// FILTER PILL
// ═══════════════════════════════════════════════════

function FilterPill({ label, icon, value, options, isOpen, onToggle, onChange }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onToggle(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onToggle]);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: isOpen ? 100 : 1 }}>
      <button
        onClick={() => onToggle(!isOpen)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 16px', borderRadius: '9999px',
          background: isOpen ? '#F0FAF4' : hovered ? '#FAFAF7' : 'white',
          border: isOpen
            ? '1.5px solid #52B788'
            : hovered
              ? '1.5px solid #95D5B2'
              : '1.5px solid #D4DAD7',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(82,183,136,0.12), 0 4px 16px -4px rgba(27,67,50,0.15)'
            : hovered
              ? '0 4px 12px -4px rgba(27,67,50,0.12)'
              : '0 2px 6px -2px rgba(27,67,50,0.06)',
          transform: hovered && !isOpen ? 'translateY(-1px)' : 'translateY(0)',
        }}
      >
        <span style={{
          flexShrink: 0, display: 'flex',
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(1.15)' : 'scale(1)',
        }}>{icon}</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{
            fontSize: '9px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.1em', lineHeight: 1, marginBottom: '2px',
            color: '#9CA09E', fontFamily: "'Figtree', sans-serif",
          }}>{label}</div>
          <div style={{
            fontSize: '13px', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '5px',
            color: isOpen ? '#1B4332' : '#2A2A28',
            fontFamily: "'Figtree', sans-serif",
            whiteSpace: 'nowrap',
          }}>
            {value}
            <span style={{
              transition: 'transform 0.25s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
              display: 'flex',
            }}>{Icons.chevron(isOpen ? '#52B788' : '#9CA09E')}</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, minWidth: '180px',
          marginTop: '8px', padding: '6px 0',
          background: 'white', borderRadius: '16px',
          border: '1px solid #E2E5DF',
          boxShadow: '0 12px 40px -8px rgba(27,67,50,0.18), 0 4px 12px -2px rgba(27,67,50,0.08)',
          maxHeight: '240px', overflowY: 'auto', zIndex: 9999,
          animation: 'pillDrop 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); onToggle(false); }} style={{
              width: '100%', textAlign: 'left', padding: '10px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: "'Figtree', sans-serif", fontSize: '13px',
              fontWeight: opt === value ? 700 : 500,
              color: opt === value ? '#1B4332' : '#2A2A28',
              background: opt === value ? '#D8F3DC' : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'background 0.15s',
            }}
              onMouseEnter={(e) => { if (opt !== value) e.currentTarget.style.background = '#F0FAF4'; }}
              onMouseLeave={(e) => { if (opt !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{opt}</span>
              {opt === value && Icons.check()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════
// TAB COMPONENT
// ═══════════════════════════════════════════════════

function VerticalTab({ vertical, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
        borderRadius: '9999px', fontSize: '14px', whiteSpace: 'nowrap', transition: 'all 0.3s',
        fontFamily: "'Figtree', sans-serif", fontWeight: isActive ? 800 : 600,
        background: isActive ? '#1B4332' : hovered ? 'rgba(27,67,50,0.04)' : '#FFFFFF',
        color: isActive ? '#FFFFFF' : '#2D6A4F',
        border: isActive ? '2px solid #1B4332' : '1.5px solid #B7BFB9', cursor: 'pointer',
        boxShadow: isActive
          ? '0 4px 20px -4px rgba(27,67,50,0.35), 0 0 0 2px rgba(82,183,136,0.15)'
          : hovered
            ? '0 3px 14px -3px rgba(27,67,50,0.16), 0 0 0 1px rgba(27,67,50,0.08)'
            : '0 2px 8px -2px rgba(27,67,50,0.1), 0 0 0 1px rgba(27,67,50,0.04)',
        transform: isActive ? 'scale(1.04)' : hovered ? 'scale(1.02) translateY(-1px)' : 'scale(1)',
        letterSpacing: '-0.01em', overflow: 'hidden',
      }}
    >
      {!isActive && (
        <span style={{
          position: 'absolute', bottom: 0, left: '50%', height: '2px', borderRadius: '2px',
          transition: 'all 0.3s', width: hovered ? '60%' : '0%', transform: 'translateX(-50%)',
          background: vertical.hoverColor, boxShadow: hovered ? `0 0 8px ${vertical.hoverColor}60` : 'none',
        }} />
      )}
      <span style={{
        display: 'flex', transition: 'all 0.3s',
        transform: hovered && !isActive ? 'scale(1.25) rotate(-8deg)' : isActive ? 'scale(1.1)' : 'scale(1)',
      }}>
        {vertical.tabIcon(isActive ? '#FFFFFF' : '#2D6A4F')}
      </span>
      <span style={{ position: 'relative' }}>
        {vertical.label}
        {isActive && (
          <span style={{
            position: 'absolute', right: '-10px', top: 0, width: '6px', height: '6px', borderRadius: '50%',
            background: '#52B788', boxShadow: '0 0 6px rgba(82,183,136,0.5)', animation: 'activeDot 2s ease-in-out infinite',
          }} />
        )}
      </span>
    </button>
  );
}


// ═══════════════════════════════════════════════════
// MAIN COMPONENT — Drop-in replacement
// Props: onSearch({ vertical, date, time, filter3, query }), className
// ═══════════════════════════════════════════════════

export default function SearchBar({ onSearch, className = '' }) {
  const [activeTab, setActiveTab] = useState("restaurants");
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("19:00");
  const [filter3, setFilter3] = useState("2 guests");
  const [searchText, setSearchText] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [hintFade, setHintFade] = useState(true);
  const [openPill, setOpenPill] = useState(null);

  // Voice state
  const [isFocused, setIsFocused] = useState(false);
  const [micAwake, setMicAwake] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);

  const inputRef = useRef(null);
  const pauseTimer = useRef(null);
  const recognitionRef = useRef(null);

  const vertical = VERTICALS.find((v) => v.id === activeTab);

  // ═══ SEARCH HANDLER ═══
  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch({
        vertical: activeTab,
        date,
        time,
        filter3,
        query: searchText,
      });
    }
  }, [onSearch, activeTab, date, time, filter3, searchText]);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    const v = VERTICALS.find((vt) => vt.id === tabId);
    setFilter3(v.filter3Default);
    setHintIndex(0); setHintFade(true);
    setSearchText("");
    setMicAwake(false); setListening(false);
    setTranscript(""); setProcessing(false);
  };

  // Rotating hints
  useEffect(() => {
    const interval = setInterval(() => {
      setHintFade(false);
      setTimeout(() => {
        setHintIndex((i) => (i + 1) % vertical.hints.length);
        setHintFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [vertical]);

  // Typing pause → wake mic
  useEffect(() => {
    if (searchText.length > 0) {
      clearTimeout(pauseTimer.current);
      setMicAwake(false);
      pauseTimer.current = setTimeout(() => {
        setTimeout(() => setMicAwake(true), 300);
      }, 1500);
    } else {
      setMicAwake(false);
    }
    return () => clearTimeout(pauseTimer.current);
  }, [searchText]);

  // Empty focus → wake mic
  useEffect(() => {
    if (isFocused && searchText.length === 0) {
      const t = setTimeout(() => setMicAwake(true), 2500);
      return () => clearTimeout(t);
    }
  }, [isFocused, searchText]);

  // ═══ REAL WEB SPEECH API ═══
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      inputRef.current?.focus();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    setListening(true);
    setTranscript("");
    setSearchText("");
    setMicAwake(false);

    recognition.onresult = (event) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript);

      if (event.results[0].isFinal) {
        setProcessing(true);
        handleVoiceResult(currentTranscript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setTranscript("");
      setProcessing(false);
    };

    recognition.onend = () => {
      // Only reset if we're not processing
      setListening((current) => {
        if (!current) return false;
        return current;
      });
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setListening(false);
    setProcessing(false);
    setTranscript("");
  }, []);

  // Parse voice via backend AI, fallback to raw text
  const handleVoiceResult = async (text) => {
    try {
      const response = await fetch('/api/voice-search/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, vertical: activeTab }),
      });

      if (response.ok) {
        const parsed = await response.json();
        if (parsed.date) setDate(parsed.date);
        if (parsed.time) setTime(parsed.time);
        if (parsed.guests) setFilter3(`${parsed.guests} ${parsed.guests === 1 ? 'guest' : 'guests'}`);
        if (parsed.location || parsed.cuisine) {
          setSearchText(parsed.business_name || `${parsed.cuisine || ''} ${parsed.location || ''}`.trim());
        } else {
          setSearchText(text);
        }
      } else {
        setSearchText(text);
      }
    } catch (err) {
      console.error('Voice parse error:', err);
      setSearchText(text);
    } finally {
      setListening(false);
      setProcessing(false);
      setTranscript("");
      setTimeout(() => {
        if (onSearch) {
          onSearch({
            vertical: activeTab,
            date,
            time,
            filter3,
            query: text,
          });
        }
      }, 500);
    }
  };

  const handleMicClick = useCallback(() => {
    if (listening) {
      stopListening();
    } else if (micAwake || (isFocused && searchText.length === 0)) {
      startListening();
    } else {
      handleSearch();
    }
  }, [listening, micAwake, isFocused, searchText, stopListening, startListening, handleSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const wordCount = transcript ? transcript.split(" ").length : 0;
  const intensity = Math.min(1, wordCount / 6);

  return (
    <div className={className} style={{ fontFamily: "'Figtree', sans-serif" }}>
      <style>{`
        @keyframes activeDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }
        @keyframes pillDrop { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px) scaleY(0.97); } to { opacity: 1; transform: translateY(0) scaleY(1); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.85) translateY(4px); opacity: 0; } 60% { transform: scale(1.03); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes micBounce { 0%, 100% { transform: translateY(0) scale(1); } 25% { transform: translateY(-3px) scale(1.05); } 50% { transform: translateY(0) scale(1); } 75% { transform: translateY(-1.5px) scale(1.02); } }
        @keyframes micGlowPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(82,183,136,0); } 50% { box-shadow: 0 0 14px 3px rgba(82,183,136,0.35); } }
        @keyframes shimmer { 0% { left: -100%; } 60% { left: 100%; } 100% { left: 100%; } }
        @keyframes waveBar { 0% { height: 3px; } 100% { height: 14px; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
        @keyframes processSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .search-bar-root input::placeholder { color: #B0B3B1; }
        .search-bar-root button:focus-visible { outline: 2px solid #52B788; outline-offset: 2px; border-radius: 12px; }
      `}</style>

      <div className="search-bar-root" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>

        {/* ═══ VERTICAL TABS ═══ */}
        <div style={{
          display: 'flex', gap: '6px', marginBottom: '4px', justifyContent: 'center',
          overflowX: 'auto', padding: '6px 4px 4px 4px',
        }}>
          {VERTICALS.map((v) => (
            <VerticalTab key={v.id} vertical={v} isActive={activeTab === v.id} onClick={() => handleTabChange(v.id)} />
          ))}
        </div>

        {/* ═══ BOOKING FILTER PILLS ═══ */}
        <div style={{
          display: 'flex', gap: '8px', justifyContent: 'center',
          marginBottom: '8px', flexWrap: 'wrap',
          position: 'relative', zIndex: 50,
        }}>
          <FilterPill
            label="Date" icon={Icons.calendar()} value={date}
            options={DATES} isOpen={openPill === 'date'}
            onToggle={(open) => setOpenPill(open ? 'date' : null)}
            onChange={setDate}
          />
          <FilterPill
            label="Time" icon={Icons.clock()} value={time}
            options={TIMES} isOpen={openPill === 'time'}
            onToggle={(open) => setOpenPill(open ? 'time' : null)}
            onChange={setTime}
          />
          <FilterPill
            label={vertical.filter3Label} icon={FILTER3_ICONS[activeTab]()}
            value={filter3} options={vertical.filter3Options}
            isOpen={openPill === 'filter3'}
            onToggle={(open) => setOpenPill(open ? 'filter3' : null)}
            onChange={setFilter3}
          />
        </div>

        {/* ═══ THE AI SEARCH BAR ═══ */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: 'white',
            borderRadius: listening ? '20px 20px 0 0' : '9999px',
            border: `1.5px solid ${listening ? '#52B788' : isFocused ? '#52B788' : '#E2E5DF'}`,
            boxShadow: listening
              ? `0 8px 32px -4px rgba(82,183,136,${0.15 + intensity * 0.15}), 0 0 ${8 + wordCount * 2}px rgba(82,183,136,${0.05 + intensity * 0.1})`
              : isFocused
                ? '0 8px 32px -4px rgba(82,183,136,0.18), 0 2px 8px rgba(27,67,50,0.06)'
                : '0 4px 16px -2px rgba(27,67,50,0.08), 0 1px 4px rgba(27,67,50,0.04)',
            padding: '4px 4px 4px 20px',
            display: 'flex', alignItems: 'center',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative', zIndex: 10,
          }}>
            <span style={{ flexShrink: 0, display: 'flex' }}>
              {Icons.search(isFocused || listening ? '#2D6A4F' : '#9CA09E')}
            </span>

            <input
              ref={inputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder="I'm looking for..."
              style={{
                flex: 1, fontSize: '16px', fontWeight: 500, color: '#1B4332',
                border: 'none', outline: 'none', background: 'transparent',
                padding: '14px 12px', fontFamily: "'Figtree', sans-serif",
                letterSpacing: '-0.01em', minWidth: 0,
              }}
            />

            {/* ═══ THE CTA / MIC BUTTON ═══ */}
            <div
              onClick={handleMicClick}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: listening ? '10px 14px' : '10px 20px',
                borderRadius: listening ? '14px' : '9999px',
                cursor: 'pointer', flexShrink: 0,
                background: listening
                  ? 'linear-gradient(135deg, #0D1F17, #1B4332)'
                  : micAwake
                    ? 'linear-gradient(135deg, #1B4332, #2D6A4F)'
                    : '#1B4332',
                color: 'white',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative', overflow: 'hidden', minHeight: '44px',
                boxShadow: listening
                  ? '0 0 20px rgba(82,183,136,0.3), 0 4px 16px rgba(27,67,50,0.3)'
                  : micAwake
                    ? '0 4px 16px rgba(82,183,136,0.25)'
                    : '0 4px 14px -3px rgba(27,67,50,0.35)',
              }}
            >
              {(micAwake || listening) && (
                <div style={{
                  position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(82,183,136,0.12), rgba(82,183,136,0.2), rgba(82,183,136,0.12), transparent)',
                  animation: 'shimmer 3s ease-in-out infinite', zIndex: 0,
                }} />
              )}

              {listening ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '20px', position: 'relative', zIndex: 1 }}>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} style={{
                        width: '2.5px', borderRadius: '2px',
                        background: 'linear-gradient(to top, #52B788, #95D5B2)',
                        animation: 'waveBar 0.5s ease-in-out infinite alternate',
                        animationDelay: `${i * 0.08}s`, height: '5px',
                      }} />
                    ))}
                  </div>
                  <span style={{
                    fontSize: '13px', fontWeight: 700, position: 'relative', zIndex: 1,
                    fontFamily: "'Figtree', sans-serif", color: '#D8F3DC',
                  }}>
                    {processing ? 'Finding...' : 'Listening'}
                  </span>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '5px',
                    background: 'rgba(82,183,136,0.25)', border: '1.5px solid rgba(82,183,136,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', zIndex: 1,
                  }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '1.5px', background: '#95D5B2' }} />
                  </div>
                </>
              ) : micAwake ? (
                <>
                  <div style={{ position: 'relative', zIndex: 1, animation: 'micBounce 1.8s ease-in-out infinite' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'rgba(82,183,136,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: 'micGlowPulse 2s ease-in-out infinite',
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#95D5B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="21" x2="12" y2="17"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, animation: 'popIn 0.5s ease-out' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'Figtree', sans-serif", color: '#D8F3DC', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                      Try voice
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(149,213,178,0.6)', fontFamily: "'Figtree', sans-serif", whiteSpace: 'nowrap' }}>
                      Just talk
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '14px', fontWeight: 700, position: 'relative', zIndex: 1, fontFamily: "'Figtree', sans-serif" }}>
                    Search
                  </span>
                  {Icons.arrow()}
                </>
              )}
            </div>
          </div>

          {/* ═══ VOICE DROPDOWN ═══ */}
          {listening && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '-1px',
              background: 'linear-gradient(180deg, #0D1F17 0%, #142B22 40%, #1B4332 100%)',
              borderRadius: '0 0 20px 20px',
              border: '1.5px solid rgba(82,183,136,0.2)', borderTop: 'none',
              boxShadow: '0 16px 48px -8px rgba(0,0,0,0.4), 0 0 30px rgba(82,183,136,0.08)',
              padding: `${processing ? 8 : transcript.length > 40 ? 10 : 6}px 20px ${processing ? 10 : transcript.length > 40 ? 12 : 8}px`,
              animation: 'slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 9, overflow: 'hidden', transition: 'padding 0.3s ease',
            }}>
              <div style={{
                position: 'absolute', borderRadius: '50%',
                width: `${40 + wordCount * 5}px`, height: `${40 + wordCount * 5}px`,
                background: `radial-gradient(circle, rgba(82,183,136,${0.06 + wordCount * 0.015}), transparent 70%)`,
                top: '-10px', right: '40px', filter: 'blur(12px)', transition: 'all 0.5s ease',
              }} />

              {(() => {
                const barHeight = 8 + intensity * 10;
                const waveHeight = 10 + intensity * 10;
                return (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '2px', marginBottom: '4px', height: `${waveHeight}px`,
                    position: 'relative', zIndex: 1, transition: 'height 0.3s ease',
                  }}>
                    {[...Array(20)].map((_, i) => {
                      const center = 10;
                      const dist = Math.abs(i - center);
                      return (
                        <div key={i} style={{
                          width: '2px', borderRadius: '1px',
                          background: processing
                            ? '#40916C'
                            : `linear-gradient(to top, ${dist < 4 ? '#52B788' : dist < 8 ? '#40916C' : '#2D6A4F'}, ${dist < 4 ? '#D8F3DC' : dist < 8 ? '#95D5B2' : '#74C69D'})`,
                          height: `${Math.max(2, barHeight - dist * (0.5 + intensity * 0.5))}px`,
                          animation: processing ? 'none' : 'waveBar 0.5s ease-in-out infinite alternate',
                          animationDelay: `${i * 0.04}s`,
                          opacity: processing ? 0.3 : 0.4 + intensity * 0.6,
                          transition: 'height 0.3s ease, opacity 0.3s ease',
                        }} />
                      );
                    })}
                  </div>
                );
              })()}

              <div style={{ minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                {processing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeInUp 0.3s ease-out' }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      border: '2px solid transparent', borderTop: '2px solid #52B788',
                      animation: 'processSpin 0.8s linear infinite',
                    }} />
                    <span style={{ fontSize: '12px', color: '#95D5B2', fontFamily: "'Figtree', sans-serif" }}>
                      Finding the perfect spot...
                    </span>
                  </div>
                ) : transcript ? (
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#D8F3DC', fontFamily: "'Figtree', sans-serif", textAlign: 'center', margin: 0 }}>
                    &ldquo;{transcript}&rdquo;
                    <span style={{
                      display: 'inline-block', width: '2px', height: '13px',
                      background: '#52B788', marginLeft: '2px', verticalAlign: 'text-bottom',
                      animation: 'blink 0.8s step-end infinite',
                    }} />
                  </p>
                ) : (
                  <p style={{ fontSize: '12px', color: 'rgba(149,213,178,0.5)', fontFamily: "'Figtree', sans-serif", textAlign: 'center', margin: 0 }}>
                    Say what you&apos;re looking for...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══ HINT LINE ═══ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '6px', marginTop: '14px',
          opacity: hintFade ? 1 : 0, transform: hintFade ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.4s, transform 0.4s',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
            background: '#D8F3DC', color: '#2D6A4F',
            fontFamily: "'Figtree', sans-serif",
          }}>AI</span>
          <span style={{ fontSize: '12px', color: '#9CA09E', fontFamily: "'Figtree', sans-serif" }}>
            Try: <span style={{ fontStyle: 'italic', color: '#6B706D' }}>&ldquo;{vertical.hints[hintIndex]}&rdquo;</span>
          </span>
        </div>
      </div>
    </div>
  );
}
