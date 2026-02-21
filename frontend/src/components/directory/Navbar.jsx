import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-forest rounded flex items-center justify-center">
              <span className="text-white font-heading font-black text-xl">R</span>
            </div>
            <span className="text-forest font-heading font-black text-2xl tracking-tight">REZVO</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-forest font-medium hover:text-sage transition-colors">
              Home
            </Link>
            <Link to="/faqs" className="text-muted font-medium hover:text-forest transition-colors">
              FAQs
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:block text-forest font-semibold hover:text-sage transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="bg-forest text-white font-semibold px-6 py-2.5 rounded-full hover:bg-sage transition-all"
            >
              Get Started Free
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-forest"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-white/95 backdrop-blur-lg">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-forest font-medium hover:text-sage transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/faqs"
                className="text-muted font-medium hover:text-forest transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link
                to="/login"
                className="text-forest font-semibold hover:text-sage transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
