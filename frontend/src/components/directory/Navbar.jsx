import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setIsMobileOpen(false) }, [location.pathname])

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-white/80 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1B4332' }}>
                <span className="font-heading font-extrabold text-xl text-white">R</span>
              </div>
              <span className="text-forest font-heading font-extrabold text-[22px] tracking-tight">REZVO</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/" label="Home" active={isActive('/')} />
              <NavLink to="/search" label="Find a Restaurant" active={isActive('/search')} />
              <NavLink to="/faqs" label="FAQs" active={isActive('/faqs')} />
            </div>

            {/* Desktop Right — direct links to rezvo.app */}
            <div className="hidden lg:flex items-center gap-3">
              <a href="https://rezvo.app/login" className="text-forest font-semibold text-sm hover:text-sage transition-colors px-4 py-2.5">
                Log in
              </a>
              <a href="https://rezvo.app/register" className="bg-forest text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-sage transition-all duration-200 shadow-sm hover:shadow-md">
                Sign Up Free
              </a>
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-forest hover:bg-forest/5">
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${isMobileOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileOpen(false)} />
        <div className={`absolute top-[72px] left-0 right-0 bg-white border-b border-border shadow-xl transition-all duration-300 ${isMobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
          <div className="px-4 py-6">
            <Link to="/" className="block px-4 py-3 rounded-xl text-base font-semibold text-forest" onClick={() => setIsMobileOpen(false)}>Home</Link>
            <Link to="/search" className="block px-4 py-3 rounded-xl text-base font-semibold text-forest" onClick={() => setIsMobileOpen(false)}>Find a Restaurant</Link>
            <Link to="/faqs" className="block px-4 py-3 rounded-xl text-base font-semibold text-forest" onClick={() => setIsMobileOpen(false)}>FAQs</Link>
            <div className="h-px bg-border my-4" />
            <div className="flex flex-col gap-3">
              <a href="https://rezvo.app/login" className="text-center text-forest font-bold text-sm py-3 rounded-xl border border-forest/20">Log in</a>
              <a href="https://rezvo.app/register" className="text-center bg-forest text-white font-bold text-sm py-3 rounded-full">Sign Up Free</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
      active ? 'text-forest bg-forest/[0.06]' : 'text-forest/60 hover:text-forest hover:bg-forest/[0.04]'
    }`}>
      {label}
    </Link>
  )
}
