import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-forest-darker text-light-green py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-mint rounded flex items-center justify-center">
                <span className="text-forest font-heading font-black text-xl">R</span>
              </div>
              <span className="text-white font-heading font-black text-2xl tracking-tight">REZVO</span>
            </Link>
            <p className="text-sm mb-6">
              Discover and book the best independent restaurants, salons, barbers, and spas across the UK.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/rezvo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-sage hover:bg-mint transition-colors flex items-center justify-center"
              >
                <Instagram className="text-white w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/rezvo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-sage hover:bg-mint transition-colors flex items-center justify-center"
              >
                <Facebook className="text-white w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/rezvo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-sage hover:bg-mint transition-colors flex items-center justify-center"
              >
                <Twitter className="text-white w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/rezvo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-sage hover:bg-mint transition-colors flex items-center justify-center"
              >
                <Linkedin className="text-white w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-heading font-black text-lg mb-4">For Diners</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/search?vertical=restaurant" className="hover:text-mint transition-colors">
                  Browse Restaurants
                </Link>
              </li>
              <li>
                <Link to="/search?vertical=hair_salon" className="hover:text-mint transition-colors">
                  Browse Salons
                </Link>
              </li>
              <li>
                <Link to="/search?vertical=barber" className="hover:text-mint transition-colors">
                  Browse Barbers
                </Link>
              </li>
              <li>
                <Link to="/search?vertical=spa" className="hover:text-mint transition-colors">
                  Browse Spas
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-mint transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-mint transition-colors">
                  Saved Venues
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-heading font-black text-lg mb-4">For Businesses</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/for-business" className="hover:text-mint transition-colors">
                  Claim Your Listing
                </Link>
              </li>
              <li>
                <Link to="/for-business" className="hover:text-mint transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/for-business#pricing" className="hover:text-mint transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/for-business#resources" className="hover:text-mint transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-mint transition-colors">
                  Partner Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-heading font-black text-lg mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="hover:text-mint transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-mint transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <a href="mailto:hello@rezvo.app" className="hover:text-mint transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/careers" className="hover:text-mint transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="hover:text-mint transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sage pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {currentYear} Rezvo. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-mint transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-mint transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-mint transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
