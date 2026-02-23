import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Search, ChevronDown } from 'lucide-react'

const NAV_LINKS = [
  { to: '/', label: 'Home', type: 'link' },
  { to: '/search', label: 'Search', type: 'link' },
  {
    label: 'Features',
    type: 'dropdown',
    items: [
      { href: '/features/restaurants.html', label: 'For Restaurants' },
      { href: '/features/calendar.html', label: 'Smart Calendar' },
      { href: '/features/payments.html', label: 'Stripe Payments' },
      { href: '/features/mobile-app.html', label: 'Mobile App' },
      { href: '/features/integrations.html', label: 'Integrations' },
      { href: '/features/uber-direct.html', label: 'Uber Direct' },
      { href: '/features/team-up.html', label: 'Team Up & Save' },
    ],
  },
  { to: '/for-business', label: 'For Business', type: 'link' },
  { to: '/faqs', label: 'FAQs', type: 'link' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setIsMobileOpen(false); setDropdownOpen(false) }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-forest rounded-xl flex items-center justify-center">
                <span className="text-white font-heading font-extrabold text-lg">R</span>
              </div>
              <span className="text-forest font-heading font-extrabold text-[22px] tracking-tight">
                REZVO
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((item) =>
                item.type === 'dropdown' ? (
                  <div key={item.label} className="relative" ref={dropRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        dropdownOpen ? 'text-forest bg-forest/[0.06]' : 'text-muted hover:text-forest hover:bg-forest/[0.04]'
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border py-2 animate-fadeIn z-50">
                        {item.items.map((sub) => (
                          <a
                            key={sub.href}
                            href={sub.href}
                            className="block px-4 py-2.5 text-sm text-muted hover:text-forest hover:bg-forest/[0.04] transition-colors font-medium"
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive(item.to)
                        ? 'text-forest bg-forest/[0.06]'
                        : 'text-muted hover:text-forest hover:bg-forest/[0.04]'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>

            {/* Desktop Right */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/login" className="text-forest font-semibold text-sm hover:text-sage transition-colors px-4 py-2.5">
                Log in
              </Link>
              <Link to="/signup" className="bg-forest text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-sage transition-all duration-200 shadow-sm hover:shadow-md">
                Get Started Free
              </Link>
            </div>

            {/* Mobile */}
            <div className="flex lg:hidden items-center gap-2">
              <Link to="/search" className="w-10 h-10 rounded-xl flex items-center justify-center text-forest hover:bg-forest/5 transition-colors">
                <Search size={20} />
              </Link>
              <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="w-10 h-10 rounded-xl flex items-center justify-center text-forest hover:bg-forest/5 transition-colors">
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${isMobileOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileOpen(false)} />
        <div className={`absolute top-[72px] left-0 right-0 bg-white border-b border-border shadow-xl transition-all duration-300 max-h-[80vh] overflow-y-auto ${isMobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((item) =>
                item.type === 'dropdown' ? (
                  <div key={item.label}>
                    <div className="px-4 py-2 text-xs font-bold text-muted uppercase tracking-wider mt-2">Features</div>
                    {item.items.map((sub) => (
                      <a key={sub.href} href={sub.href} className="px-4 py-3 rounded-xl text-base font-semibold text-muted hover:text-forest hover:bg-forest/[0.04] transition-all block" onClick={() => setIsMobileOpen(false)}>
                        {sub.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <Link key={item.to} to={item.to} className={`px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive(item.to) ? 'text-forest bg-forest/[0.06]' : 'text-muted hover:text-forest hover:bg-forest/[0.04]'}`} onClick={() => setIsMobileOpen(false)}>
                    {item.label}
                  </Link>
                )
              )}
            </div>
            <div className="h-px bg-border my-4" />
            <div className="flex flex-col gap-3">
              <Link to="/login" className="text-center text-forest font-bold text-sm py-3 rounded-xl border border-forest/20 hover:bg-forest/5 transition-all" onClick={() => setIsMobileOpen(false)}>Log in</Link>
              <Link to="/signup" className="text-center bg-forest text-white font-bold text-sm py-3 rounded-full hover:bg-sage transition-all" onClick={() => setIsMobileOpen(false)}>Get Started Free</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 200ms ease-out forwards; }
      `}</style>
    </>
  )
}
