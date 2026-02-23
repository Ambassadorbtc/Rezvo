import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter, Linkedin, Check } from 'lucide-react'

export default function RezvoFooter() {
  return (
    <footer className="mt-20">
      {/* Business Owner CTA Banner */}
      <div className="bg-forest py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-4">
            Own a Restaurant, Salon, or Service Business?
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-8 max-w-2xl mx-auto font-body">
            Join Rezvo and start accepting bookings in minutes. No per-cover fees, no contracts, just more customers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/for-business" className="px-8 py-4 bg-white text-forest rounded-full font-bold border border-mint hover:bg-mint hover:text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto text-center">
              List Your Business
            </Link>
            <a href="/contact.html" className="px-8 py-4 bg-transparent text-white rounded-full font-bold border border-white/40 hover:bg-white/10 hover:border-white transition-all w-full sm:w-auto text-center">
              Get In Touch
            </a>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/50 text-sm font-medium">
            {['5-minute setup', 'No per-cover fees', 'Real-time availability'].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-mint" strokeWidth={2.5} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16" style={{ background: '#0D1F17' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-mint flex items-center justify-center">
                  <span className="font-heading font-extrabold text-xl" style={{ color: '#D4A017' }}>R</span>
                </div>
                <span className="text-white font-heading font-extrabold text-2xl tracking-tight">REZVO</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm font-body">
                Discover and book the best independent restaurants, salons, barbers, and spas across the UK. Zero commission for businesses.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { Icon: Instagram, href: 'https://instagram.com/rezvouk', label: 'Instagram' },
                  { Icon: Facebook, href: 'https://facebook.com/rezvouk', label: 'Facebook' },
                  { Icon: Twitter, href: 'https://twitter.com/rezvouk', label: 'Twitter' },
                  { Icon: Linkedin, href: 'https://linkedin.com/company/rezvo', label: 'LinkedIn' },
                ].map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:bg-mint hover:text-forest transition-all duration-200" aria-label={label}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Discover */}
            <FooterCol title="Discover">
              <FooterLink to="/search?vertical=restaurants">Restaurants</FooterLink>
              <FooterLink to="/search?vertical=salons">Hair Salons</FooterLink>
              <FooterLink to="/search?vertical=barbers">Barbers</FooterLink>
              <FooterLink to="/search?vertical=spas">Spas & Wellness</FooterLink>
              <FooterLink to="/search">Browse All</FooterLink>
            </FooterCol>

            {/* Features */}
            <FooterCol title="Features">
              <FooterExtLink href="/features/restaurants.html">For Restaurants</FooterExtLink>
              <FooterExtLink href="/features/calendar.html">Smart Calendar</FooterExtLink>
              <FooterExtLink href="/features/payments.html">Stripe Payments</FooterExtLink>
              <FooterExtLink href="/features/mobile-app.html">Mobile App</FooterExtLink>
              <FooterExtLink href="/features/integrations.html">Integrations</FooterExtLink>
              <FooterExtLink href="/features/uber-direct.html">Uber Direct</FooterExtLink>
            </FooterCol>

            {/* For Business */}
            <FooterCol title="For Business">
              <FooterLink to="/for-business">How It Works</FooterLink>
              <FooterLink to="/for-business#pricing">Pricing</FooterLink>
              <FooterExtLink href="/features/team-up.html">Team Up & Save</FooterExtLink>
              <FooterLink to="/signup">Get Started</FooterLink>
              <FooterLink to="/login">Partner Login</FooterLink>
            </FooterCol>

            {/* Company */}
            <FooterCol title="Company">
              <FooterExtLink href="/about.html">About Us</FooterExtLink>
              <FooterLink to="/faqs">FAQs</FooterLink>
              <FooterExtLink href="/support.html">Support Center</FooterExtLink>
              <FooterExtLink href="/contact.html">Contact</FooterExtLink>
            </FooterCol>
          </div>

          <div className="h-px bg-white/10 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/35 text-xs">
            <p>&copy; {new Date().getFullYear()} Rezvo Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="/privacy.html" className="hover:text-mint transition-colors">Privacy Policy</a>
              <span>·</span>
              <a href="/terms.html" className="hover:text-mint transition-colors">Terms of Service</a>
              <span>·</span>
              <a href="/cookies.html" className="hover:text-mint transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }) {
  return (
    <div>
      <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }) {
  return (
    <li><Link to={to} className="text-white/50 text-sm hover:text-mint transition-colors font-body">{children}</Link></li>
  )
}

function FooterExtLink({ href, children }) {
  return (
    <li><a href={href} className="text-white/50 text-sm hover:text-mint transition-colors font-body">{children}</a></li>
  )
}
