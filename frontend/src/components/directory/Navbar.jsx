import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, Utensils, Scissors, Sparkles, Dumbbell, Palette, Heart, Camera, Zap, ArrowRight, CalendarCheck, CreditCard, Smartphone, Plug, Truck, Users, Info, HelpCircle, MessageSquare, FileText } from 'lucide-react'

const FEATURES = [
  { href: '/features/restaurants.html', label: 'For Restaurants', desc: 'Floor plans, covers & ordering', Icon: Utensils },
  { href: '/features/calendar.html', label: 'Smart Calendar', desc: 'Flexible, intelligent scheduling', Icon: CalendarCheck },
  { href: '/features/payments.html', label: 'Stripe Payments', desc: 'Direct payouts, no middleman', Icon: CreditCard },
  { href: '/features/mobile-app.html', label: 'Mobile App', desc: 'Voice AI & smart assistant', Icon: Smartphone },
  { href: '/features/integrations.html', label: 'Integrations', desc: 'Google Cal, Outlook & more', Icon: Plug },
  { href: '/features/uber-direct.html', label: 'Uber Direct', desc: 'Delivery without commission', Icon: Truck },
  { href: '/features/team-up.html', label: 'Team Up & Save', desc: 'Refer & get 50% off forever', Icon: Users },
]

const INDUSTRIES = [
  { href: '/industries/restaurants', label: 'Restaurants', Icon: Utensils },
  { href: '/industries/barbers', label: 'Barbers', Icon: Scissors },
  { href: '/industries/salons-spas', label: 'Salons & Spas', Icon: Sparkles },
  { href: '/industries/personal-trainers', label: 'Personal Trainers', Icon: Dumbbell },
  { href: '/industries/tattoo-studios', label: 'Tattoo Studios', Icon: Palette },
  { href: '/industries/dentists', label: 'Dentists', Icon: Heart },
  { href: '/industries/photographers', label: 'Photographers', Icon: Camera },
  { href: '/industries/fitness-studios', label: 'Fitness Studios', Icon: Zap },
]

const COMPANY = [
  { href: '/about.html', label: 'About Us', desc: 'Our mission & story', Icon: Info },
  { href: '/faqs', label: 'FAQs', desc: 'Common questions answered', Icon: HelpCircle, isRoute: true },
  { href: '/support.html', label: 'Support Center', desc: 'Help when you need it', Icon: MessageSquare },
  { href: '/contact.html', label: 'Contact', desc: 'Get in touch', Icon: FileText },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openMega, setOpenMega] = useState(null)
  const navRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setIsMobileOpen(false); setOpenMega(null) }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMega(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleMega = (key) => setOpenMega(prev => prev === key ? null : key)

  return (
    <>
      <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'bg-white/80 backdrop-blur-md'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1B4332' }}>
                <span className="font-heading font-extrabold text-xl" style={{ color: '#FFFFFF' }}>R</span>
              </div>
              <span className="text-forest font-heading font-extrabold text-[22px] tracking-tight">REZVO</span>
            </Link>

            <div className="hidden lg:flex items-center gap-0.5">
              <Link to="/" className="px-3.5 py-2 rounded-lg text-[13px] font-semibold text-forest/60 hover:text-forest hover:bg-forest/[0.04] transition-all">Home</Link>
              <NavBtn label="Features" isOpen={openMega === 'features'} onClick={() => toggleMega('features')} />
              <NavBtn label="Industries" isOpen={openMega === 'industries'} onClick={() => toggleMega('industries')} />
              <Link to="/for-business" className="px-3.5 py-2 rounded-lg text-[13px] font-semibold text-forest/60 hover:text-forest hover:bg-forest/[0.04] transition-all">For Business</Link>
              <NavBtn label="Company" isOpen={openMega === 'company'} onClick={() => toggleMega('company')} />
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link to="/login" className="text-forest font-semibold text-sm hover:text-sage transition-colors px-4 py-2.5">Log in</Link>
              <Link to="/signup" className="bg-forest text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-sage transition-all duration-200 shadow-sm hover:shadow-md">Get Started Free</Link>
            </div>

            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-forest hover:bg-forest/5">
              {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {openMega === 'features' && (
          <div className="absolute left-0 right-0 top-[72px] bg-white border-t border-b border-border shadow-xl z-50 animate-fadeDown">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-forest/40 uppercase tracking-widest mb-4">Platform Features</p>
                  <div className="grid grid-cols-2 gap-1">
                    {FEATURES.map(f => <a key={f.href} href={f.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-forest/[0.03] transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-forest/[0.06] flex items-center justify-center group-hover:bg-mint/20 transition-colors"><f.Icon size={16} className="text-forest/50 group-hover:text-forest" /></div>
                      <div><p className="text-sm font-semibold text-forest">{f.label}</p><p className="text-xs text-forest/45">{f.desc}</p></div>
                    </a>)}
                  </div>
                </div>
                <div className="bg-forest rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-sm mb-2" style={{color:'#52B788'}}>Zero Commission</p>
                    <p className="text-white font-heading font-extrabold text-xl mb-2">Keep 100% of your revenue</p>
                    <p className="text-white/60 text-sm">No per-booking fees. No contracts. Just a simple monthly plan.</p>
                  </div>
                  <a href="/signup" className="mt-4 inline-flex items-center gap-2 text-forest font-bold text-sm py-2.5 px-5 rounded-full hover:bg-white transition-all w-fit" style={{backgroundColor:'#52B788'}}>Start Free <ArrowRight size={14} /></a>
                </div>
              </div>
            </div>
          </div>
        )}

        {openMega === 'industries' && (
          <div className="absolute left-0 right-0 top-[72px] bg-white border-t border-b border-border shadow-xl z-50 animate-fadeDown">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-forest/40 uppercase tracking-widest mb-4">Who We Serve</p>
                  <div className="grid grid-cols-4 gap-1">
                    {INDUSTRIES.map(i => <a key={i.href} href={i.href} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-forest/[0.03] transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-forest/[0.06] flex items-center justify-center group-hover:bg-mint/20 transition-colors"><i.Icon size={14} className="text-forest/50 group-hover:text-forest" /></div>
                      <span className="text-sm font-semibold text-forest">{i.label}</span>
                    </a>)}
                  </div>
                  <a href="/industries" className="mt-4 inline-flex items-center gap-2 text-sm font-bold hover:text-forest transition-colors" style={{color:'#52B788'}}>View all industries <ArrowRight size={14} /></a>
                </div>
                <div className="rounded-2xl p-6 border" style={{background:'linear-gradient(135deg,rgba(82,183,136,0.1),rgba(27,67,50,0.05))',borderColor:'rgba(82,183,136,0.2)'}}>
                  <p className="text-forest font-heading font-extrabold text-lg mb-2">One platform, every business</p>
                  <p className="text-forest/60 text-sm mb-4">From barbers to restaurants — if you take bookings, Rezvo is for you.</p>
                  <Link to="/for-business" className="inline-flex items-center gap-2 bg-forest text-white font-bold text-sm py-2.5 px-5 rounded-full hover:bg-sage transition-all">Learn More <ArrowRight size={14} /></Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {openMega === 'company' && (
          <div className="absolute top-[72px] bg-white border border-border rounded-b-2xl shadow-xl z-50 p-3 w-[360px] animate-fadeDown" style={{right:'10%'}}>
            {COMPANY.map(c => {
              const inner = (<div className="flex items-center gap-3 p-3 rounded-xl hover:bg-forest/[0.03] transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-forest/[0.06] flex items-center justify-center group-hover:bg-mint/20 transition-colors"><c.Icon size={16} className="text-forest/50 group-hover:text-forest" /></div>
                <div><p className="text-sm font-semibold text-forest">{c.label}</p><p className="text-xs text-forest/45">{c.desc}</p></div>
              </div>)
              return c.isRoute ? <Link key={c.href} to={c.href}>{inner}</Link> : <a key={c.href} href={c.href}>{inner}</a>
            })}
          </div>
        )}
      </nav>

      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${isMobileOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileOpen(false)} />
        <div className={`absolute top-[72px] left-0 right-0 bg-white border-b border-border shadow-xl transition-all duration-300 max-h-[80vh] overflow-y-auto ${isMobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
          <div className="px-4 py-6">
            <Link to="/" className="block px-4 py-3 rounded-xl text-base font-semibold text-forest" onClick={() => setIsMobileOpen(false)}>Home</Link>
            <MobileSection title="Features">{FEATURES.map(f => <a key={f.href} href={f.href} className="block px-4 py-2.5 text-sm font-semibold text-forest/70" onClick={() => setIsMobileOpen(false)}>{f.label}</a>)}</MobileSection>
            <MobileSection title="Industries">
              {INDUSTRIES.map(i => <a key={i.href} href={i.href} className="block px-4 py-2.5 text-sm font-semibold text-forest/70" onClick={() => setIsMobileOpen(false)}>{i.label}</a>)}
              <a href="/industries" className="block px-4 py-2.5 text-sm font-bold" style={{color:'#52B788'}} onClick={() => setIsMobileOpen(false)}>View all →</a>
            </MobileSection>
            <Link to="/for-business" className="block px-4 py-3 rounded-xl text-base font-semibold text-forest" onClick={() => setIsMobileOpen(false)}>For Business</Link>
            <MobileSection title="Company">{COMPANY.map(c => c.isRoute ? <Link key={c.href} to={c.href} className="block px-4 py-2.5 text-sm font-semibold text-forest/70" onClick={() => setIsMobileOpen(false)}>{c.label}</Link> : <a key={c.href} href={c.href} className="block px-4 py-2.5 text-sm font-semibold text-forest/70" onClick={() => setIsMobileOpen(false)}>{c.label}</a>)}</MobileSection>
            <div className="h-px bg-border my-4" />
            <div className="flex flex-col gap-3">
              <Link to="/login" className="text-center text-forest font-bold text-sm py-3 rounded-xl border border-forest/20" onClick={() => setIsMobileOpen(false)}>Log in</Link>
              <Link to="/signup" className="text-center bg-forest text-white font-bold text-sm py-3 rounded-full" onClick={() => setIsMobileOpen(false)}>Get Started Free</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes fadeDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}.animate-fadeDown{animation:fadeDown 200ms ease-out forwards}`}</style>
    </>
  )
}

function NavBtn({ label, isOpen, onClick }) {
  return (<button onClick={onClick} className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${isOpen ? 'text-forest bg-forest/[0.06]' : 'text-forest/60 hover:text-forest hover:bg-forest/[0.04]'}`}>
    {label}<ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
  </button>)
}

function MobileSection({ title, children }) {
  const [open, setOpen] = useState(false)
  return (<div>
    <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-forest hover:bg-forest/[0.04] transition-all">{title}<ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} /></button>
    {open && <div className="ml-2 mb-2">{children}</div>}
  </div>)
}
