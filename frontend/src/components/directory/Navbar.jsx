import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Search, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setIsMobileOpen(false) }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const NAV_LINKS = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Search' },
    { to: '/for-business', label: 'For Business' },
    { to: '/about', label: 'About' },
    { to: '/faqs', label: 'FAQs' },
  ]

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

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(link.to)
                      ? 'text-forest bg-forest/[0.06]'
                      : 'text-muted hover:text-forest hover:bg-forest/[0.04]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="text-forest font-semibold text-sm hover:text-sage transition-colors px-4 py-2.5"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-forest text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-sage transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile: Search + Hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                to="/search"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-forest hover:bg-forest/5 transition-colors"
              >
                <Search size={20} />
              </Link>
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-forest hover:bg-forest/5 transition-colors"
              >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isMobileOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-[72px] left-0 right-0 bg-white border-b border-border shadow-xl transition-all duration-300 ${
            isMobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                    isActive(link.to)
                      ? 'text-forest bg-forest/[0.06]'
                      : 'text-muted hover:text-forest hover:bg-forest/[0.04]'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-px bg-border my-4" />

            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="text-center text-forest font-bold text-sm py-3 rounded-xl border border-forest/20 hover:bg-forest/5 transition-all"
                onClick={() => setIsMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-center bg-forest text-white font-bold text-sm py-3 rounded-full hover:bg-sage transition-all"
                onClick={() => setIsMobileOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
