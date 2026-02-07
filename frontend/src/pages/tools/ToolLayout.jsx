import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';

export default function ToolLayout({ title, subtitle, children }) {
  const location = useLocation();

  // Auto SEO for every tool page
  useEffect(() => {
    const seoTitle = `${title} — Free Online Tool | Rezvo`;
    const seoDesc = subtitle || `Free ${title} tool. No sign-up required. Instant results for small businesses.`;
    document.title = seoTitle;
    const setMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', seoDesc);
    setMeta('og:title', seoTitle, 'property');
    setMeta('og:description', seoDesc, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', `https://rezvo.app${location.pathname}`, 'property');
    setMeta('og:site_name', 'Rezvo', 'property');
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', seoTitle, 'name');
    setMeta('twitter:description', seoDesc, 'name');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', `https://rezvo.app${location.pathname}`);
  }, [title, subtitle, location.pathname]);

  return (
    <div className="min-h-screen bg-cream" data-testid={`tool-page-${title?.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tools" className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-navy-700" />
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">R</div>
              <span className="font-display text-lg font-bold text-navy-900 hidden sm:block">Rezvo</span>
            </Link>
          </div>
          <Link to="/signup" className="bg-navy-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-teal-500 transition-all">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Upsell Banner */}
      <div className="max-w-4xl mx-auto px-6 mt-6">
        <div className="bg-white border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-navy-700 text-sm"><Zap className="w-4 h-4 text-teal-500 inline mr-1.5 -mt-0.5" />Need unlimited bookings & AI reminders? <span className="text-teal-600 font-bold">Pro — £8.99/mo</span></p>
          <Link to="/signup" className="bg-teal-500 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-teal-600 transition-all flex-shrink-0">Start trial</Link>
        </div>
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 pt-10 pb-6 anim-fade-up">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-2">{title}</h1>
        <p className="text-navy-400 text-base">{subtitle || 'Free — No login — Instant result'}</p>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 pb-12 anim-fade-up" style={{animationDelay: '.1s'}}>
        {children}
      </main>

      {/* Mid-page upsell */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-center text-white">
          <h3 className="font-display text-2xl font-bold mb-2">This free tool is just the start</h3>
          <p className="text-white/80 mb-6">Rezvo Pro gives you full calendars, client reminders & payments.</p>
          <Link to="/signup" className="inline-block bg-white text-teal-600 px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all">
            Start free trial
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy-900 py-8 px-6 text-center">
        <div className="flex justify-center gap-6 mb-3">
          <Link to="/tools" className="text-teal-500 text-sm font-medium hover:text-teal-400 transition-colors">All Free Tools</Link>
          <Link to="/" className="text-white/40 text-sm hover:text-teal-500 transition-colors">Home</Link>
          <Link to="/privacy" className="text-white/40 text-sm hover:text-teal-500 transition-colors">Privacy</Link>
        </div>
        <p className="text-white/20 text-xs">© 2026 Rezvo. Made with grit in the UK.</p>
      </footer>
    </div>
  );
}
