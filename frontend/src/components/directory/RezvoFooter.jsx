import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Linkedin, Check } from 'lucide-react';

export default function RezvoFooter() {
  return (
    <footer className="mt-20">
      {/* Business Owner CTA Banner */}
      <div className="bg-forest py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Own a Restaurant, Salon, or Service Business?
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Join Rezvo and start accepting bookings in minutes. No per-cover fees, no contracts, just more customers.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/claim"
              className="px-8 py-4 bg-white text-forest rounded-full font-bold border border-mint hover:bg-mint hover:text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto text-center"
            >
              Claim Your Listing
            </Link>
            <Link
              to="/for-business"
              className="px-8 py-4 bg-transparent text-white rounded-full font-bold border border-white/40 hover:bg-white/10 hover:border-white transition-all w-full sm:w-auto text-center"
            >
              Learn More
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/60 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-mint" strokeWidth={2.5} />
              <span>5-minute setup</span>
            </div>
            <div className="hidden sm:block">·</div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-mint" strokeWidth={2.5} />
              <span>No per-cover fees</span>
            </div>
            <div className="hidden sm:block">·</div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-mint" strokeWidth={2.5} />
              <span>Real-time availability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div 
        className="py-16"
        style={{ background: '#0D1F17' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-mint flex items-center justify-center">
                  <span className="text-forest font-extrabold text-xl">R</span>
                </div>
                <span className="text-white font-extrabold text-2xl tracking-tight">
                  REZVO
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
                Discover and book the best independent restaurants, salons, barbers, and spas across the UK.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com/rezvouk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-mint hover:text-forest transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com/rezvouk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-mint hover:text-forest transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com/rezvouk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-mint hover:text-forest transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/company/rezvo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-mint hover:text-forest transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* For Diners Column */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                For Diners
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/search?vertical=restaurants" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Browse Restaurants
                  </Link>
                </li>
                <li>
                  <Link to="/search?vertical=salons" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Browse Salons
                  </Link>
                </li>
                <li>
                  <Link to="/search?vertical=barbers" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Browse Barbers
                  </Link>
                </li>
                <li>
                  <Link to="/search?vertical=spas" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Browse Spas
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="text-white/60 text-sm hover:text-mint transition-colors">
                    My Bookings
                  </Link>
                </li>
                <li>
                  <Link to="/saved" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Saved Venues
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Businesses Column */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                For Businesses
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/claim" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Claim Your Listing
                  </Link>
                </li>
                <li>
                  <Link to="/for-business" className="text-white/60 text-sm hover:text-mint transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/for-business#pricing" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/for-business#resources" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Resources
                  </Link>
                </li>
                <li>
                  <a href="/auth/login" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Partner Login
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-white/60 text-sm hover:text-mint transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/faqs" className="text-white/60 text-sm hover:text-mint transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="text-white/60 text-sm hover:text-mint transition-colors">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mb-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-xs">
            <p>© 2026 Rezvo. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-mint transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-mint transition-colors">
                Terms of Service
              </Link>
              <span>·</span>
              <Link to="/cookies" className="hover:text-mint transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Giant REZVO Watermark Section */}
      <div 
        className="bg-forest overflow-hidden flex items-center justify-center"
        style={{ paddingTop: '20px', paddingBottom: '0' }}
      >
        <div 
          className="text-mint font-extrabold select-none text-center"
          style={{ 
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 'clamp(120px, 15vw, 280px)',
            lineHeight: 1,
            opacity: 0.08,
            letterSpacing: '-0.02em'
          }}
        >
          REZVO
        </div>
      </div>
    </footer>
  );
}
