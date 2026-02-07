import { Link } from 'react-router-dom';
import { 
  QrCode, FileText, Bell, Calculator, Search, Link2, Globe, Clock, 
  MessageSquare, Star, Lightbulb, Map, FileCode, CheckSquare, AlertTriangle,
  Bot, Zap, Type, Database, Code, FileDown
} from 'lucide-react';

const TOOLS = [
  { slug: 'qr-code-generator', name: 'QR Code Generator', desc: 'Generate QR codes for any booking link or URL instantly.', icon: QrCode, color: '#00BFA5', bg: '#E8F5F3', ready: true },
  { slug: 'service-menu-generator', name: 'Service Menu Generator', desc: 'Create a formatted service menu with prices in seconds.', icon: FileText, color: '#8B5CF6', bg: '#EDE9FE', ready: true },
  { slug: 'no-show-reminder', name: 'No-Show Reminder Templates', desc: 'Copy-paste reminder messages to reduce client no-shows.', icon: Bell, color: '#F59E0B', bg: '#FEF3E2', ready: true },
  { slug: 'pricing-calculator', name: 'Pricing Calculator', desc: 'Calculate your ideal hourly rate and service prices.', icon: Calculator, color: '#3B82F6', bg: '#DBEAFE', ready: true },
  { slug: 'keyword-density', name: 'Keyword Density Analyzer', desc: 'Analyze keyword frequency in any text or webpage content.', icon: Search, color: '#EF4444', bg: '#FEE2E2', ready: true },
  { slug: 'booking-link-maker', name: 'Instant Booking Link', desc: 'Create a quick one-time booking link to share with clients.', icon: Link2, color: '#00BFA5', bg: '#E8F5F3', ready: true },
  { slug: 'domain-seo-checker', name: 'Domain SEO Checker', desc: 'Check domain age, SSL, speed score and basic SEO health.', icon: Globe, color: '#8B5CF6', bg: '#EDE9FE', ready: true },
  { slug: 'opening-hours-gap', name: 'Opening Hours Gap Finder', desc: 'Find scheduling gaps and overlaps in your business hours.', icon: Clock, color: '#F59E0B', bg: '#FEF3E2', ready: true },
  { slug: 'review-reply', name: 'Review Reply Generator', desc: 'Generate professional replies for customer reviews.', icon: Star, color: '#3B82F6', bg: '#DBEAFE', ready: true },
  { slug: 'social-post-ideas', name: 'Social Post Ideas', desc: 'Get 10 social media post ideas for your business niche.', icon: Lightbulb, color: '#EF4444', bg: '#FEE2E2', ready: true },
  { slug: 'client-intake', name: 'Client Intake Questions', desc: 'Generate intake questionnaires for your industry.', icon: MessageSquare, color: '#00BFA5', bg: '#E8F5F3', ready: true },
  { slug: 'xml-sitemap-generator', name: 'XML Sitemap Generator', desc: 'Generate an XML sitemap by crawling your website.', icon: Map, color: '#8B5CF6', bg: '#EDE9FE', ready: true },
  { slug: 'sitemap-extractor', name: 'Sitemap URL Extractor', desc: 'Extract all URLs from any sitemap.xml file.', icon: Database, color: '#F59E0B', bg: '#FEF3E2', ready: true },
  { slug: 'sitemap-validator', name: 'Sitemap Validator', desc: 'Validate your sitemap XML structure and URLs.', icon: CheckSquare, color: '#3B82F6', bg: '#DBEAFE', ready: true },
  { slug: 'sitemap-finder', name: 'Sitemap Finder', desc: 'Find sitemaps and robots.txt for any domain.', icon: Search, color: '#EF4444', bg: '#FEE2E2', ready: true },
  { slug: 'url-extractor', name: 'Website URL Extractor', desc: 'Extract all visible links from any webpage.', icon: Code, color: '#00BFA5', bg: '#E8F5F3', ready: true },
  { slug: 'robots-txt-checker', name: 'Robots.txt Checker', desc: 'Fetch and analyze any site\'s robots.txt file.', icon: Bot, color: '#8B5CF6', bg: '#EDE9FE', ready: true },
  { slug: 'page-speed', name: 'Page Speed Tester', desc: 'Test page load speed with Google PageSpeed Insights.', icon: Zap, color: '#F59E0B', bg: '#FEF3E2', ready: true },
  { slug: 'meta-tag-checker', name: 'Meta Tag Checker', desc: 'Check title, description, OG tags and canonical URLs.', icon: FileCode, color: '#3B82F6', bg: '#DBEAFE', ready: true },
  { slug: 'broken-link-checker', name: 'Broken Link Checker', desc: 'Find 404 errors and broken links on any page.', icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2', ready: true },
  { slug: 'markdown-converter', name: 'Anything to Markdown', desc: 'Convert PDF, Word, HTML, JSON and more to Markdown.', icon: FileDown, color: '#00BFA5', bg: '#E8F5F3', ready: true },
];

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-cream" data-testid="tools-hub-page">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">R</div>
            <span className="font-display text-xl font-bold text-navy-900">Rezvo</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-navy-400 text-sm font-medium hover:text-navy-900 transition-colors hidden sm:block">Home</Link>
            <Link to="/signup" className="bg-navy-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-teal-500 transition-all">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 text-center anim-fade-up">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-600 px-5 py-2 rounded-full text-sm font-semibold mb-8">
            <Zap className="w-4 h-4" /> 21 Free Tools — No Login Required
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 leading-[1.05] tracking-tight mb-6">
            Free Business Suite
          </h1>
          <p className="text-lg text-navy-400 max-w-xl mx-auto leading-relaxed">
            Instant tools made for small service businesses. Generate QR codes, pricing calculators, SEO checks and more — completely free, no sign-up needed.
          </p>
        </div>
      </section>

      {/* Upsell Banner */}
      <div className="max-w-6xl mx-auto px-6 mb-10 anim-fade-up" style={{animationDelay:'.1s'}}>
        <div className="bg-white border-2 border-teal-500 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-navy-900 font-medium text-sm">Need unlimited bookings, deposits & AI reminders? <span className="text-teal-600 font-bold">Upgrade to Pro — £8.99/month</span></p>
          </div>
          <Link to="/signup" className="bg-teal-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-teal-600 transition-all flex-shrink-0">
            Start free trial
          </Link>
        </div>
      </div>

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map((tool, i) => (
            <div key={tool.slug} className={`anim-fade-up`} style={{animationDelay: `${0.05 * Math.min(i, 12)}s`}}>
              {tool.ready ? (
                <Link to={`/tools/${tool.slug}`} className="block group" data-testid={`tool-card-${tool.slug}`}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full transition-all group-hover:shadow-lg group-hover:scale-[1.02] group-hover:border-teal-200">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{background: tool.bg}}>
                      <tool.icon className="w-6 h-6" style={{color: tool.color}} />
                    </div>
                    <h3 className="font-display font-bold text-navy-900 text-lg mb-1.5">{tool.name}</h3>
                    <p className="text-navy-400 text-sm leading-relaxed mb-4">{tool.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-teal-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                      Use tool <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="bg-white/60 rounded-2xl border border-gray-100 p-6 h-full opacity-60" data-testid={`tool-card-${tool.slug}`}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{background: tool.bg}}>
                    <tool.icon className="w-6 h-6" style={{color: tool.color}} />
                  </div>
                  <h3 className="font-display font-bold text-navy-900 text-lg mb-1.5">{tool.name}</h3>
                  <p className="text-navy-400 text-sm leading-relaxed mb-4">{tool.desc}</p>
                  <span className="text-navy-300 text-sm font-medium">Coming soon</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-navy-900 py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">These tools are just the start</h2>
          <p className="text-navy-300 text-lg mb-8">Rezvo Pro gives you full calendars, client reminders, deposits & payments — from £8.99/month.</p>
          <Link to="/signup" className="inline-block bg-teal-500 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-teal-600 transition-all hover:shadow-xl hover:shadow-teal-500/20">
            Get started — it's free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 border-t border-white/5 py-8 px-6 text-center">
        <p className="text-white/30 text-xs">© 2026 Rezvo. Made with grit in the UK.</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link to="/privacy" className="text-white/30 text-xs hover:text-teal-500 transition-colors">Privacy</Link>
          <Link to="/terms" className="text-white/30 text-xs hover:text-teal-500 transition-colors">Terms</Link>
          <Link to="/" className="text-white/30 text-xs hover:text-teal-500 transition-colors">Home</Link>
        </div>
      </footer>
    </div>
  );
}
