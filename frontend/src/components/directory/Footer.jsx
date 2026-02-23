import { Link } from 'react-router-dom'
import { Instagram, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

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
              {[
                { Icon: Instagram, href: 'https://instagram.com/rezvouk' },
                { Icon: Twitter, href: 'https://twitter.com/rezvouk' },
                { Icon: Linkedin, href: 'https://linkedin.com/company/rezvo' },
              ].map(({ Icon, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-sage hover:bg-mint transition-colors flex items-center justify-center">
                  <Icon className="text-white w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* For Diners — INTERNAL to rezvo.co.uk */}
          <div>
            <h4 className="text-white font-heading font-black text-lg mb-4">For Diners</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/search?vertical=restaurants" className="hover:text-mint transition-colors">Browse Restaurants</Link></li>
              <li><Link to="/search?vertical=salons" className="hover:text-mint transition-colors">Browse Salons</Link></li>
              <li><Link to="/search?vertical=barbers" className="hover:text-mint transition-colors">Browse Barbers</Link></li>
              <li><Link to="/search?vertical=spas" className="hover:text-mint transition-colors">Browse Spas</Link></li>
              <li><Link to="/search" className="hover:text-mint transition-colors">Browse All</Link></li>
            </ul>
          </div>

          {/* For Businesses — EXTERNAL to rezvo.app */}
          <div>
            <h4 className="text-white font-heading font-black text-lg mb-4">For Businesses</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="https://rezvo.app/for-business" className="hover:text-mint transition-colors">How It Works</a></li>
              <li><a href="https://rezvo.app/for-business#pricing" className="hover:text-mint transition-colors">Pricing</a></li>
              <li><a href="https://rezvo.app/register" className="hover:text-mint transition-colors">Get Started</a></li>
              <li><a href="https://rezvo.app/login" className="hover:text-mint transition-colors">Partner Login</a></li>
            </ul>
          </div>

          {/* Company — EXTERNAL to rezvo.app */}
          <div>
            <h4 className="text-white font-heading font-black text-lg mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="https://rezvo.app/about.html" className="hover:text-mint transition-colors">About Us</a></li>
              <li><Link to="/faqs" className="hover:text-mint transition-colors">FAQs</Link></li>
              <li><a href="https://rezvo.app/support.html" className="hover:text-mint transition-colors">Support Centre</a></li>
              <li><a href="https://rezvo.app/contact.html" className="hover:text-mint transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sage pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {currentYear} Rezvo Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://rezvo.app/privacy.html" className="hover:text-mint transition-colors">Privacy Policy</a>
            <a href="https://rezvo.app/terms.html" className="hover:text-mint transition-colors">Terms of Service</a>
            <a href="https://rezvo.app/cookies.html" className="hover:text-mint transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
