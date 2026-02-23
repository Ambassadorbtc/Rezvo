import Navbar from '../../components/directory/Navbar'
import RezvoFooter from '../../components/directory/RezvoFooter'
import SEO from '../../components/seo/SEO'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO title="Cookie Policy" description="Learn how Rezvo uses cookies and similar technologies." path="/cookies" />
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-heading font-extrabold text-forest mb-3">Cookie Policy</h1>
          <p className="text-muted text-sm mb-10 font-body">Last updated: February 2026</p>
          <div className="prose prose-sm max-w-none font-body text-muted space-y-6">
            <div>
              <h2 className="text-lg font-heading font-bold text-forest mb-2">What are cookies?</h2>
              <p className="leading-relaxed">Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience.</p>
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-forest mb-2">Cookies we use</h2>
              <p className="leading-relaxed mb-3">We use the following types of cookies:</p>
              <div className="space-y-3">
                <div className="p-4 bg-cream rounded-xl"><strong className="text-forest">Essential cookies</strong> — Required for the Platform to function (authentication, security, preferences).</div>
                <div className="p-4 bg-cream rounded-xl"><strong className="text-forest">Analytics cookies</strong> — Help us understand how visitors use the Platform (anonymous usage data).</div>
                <div className="p-4 bg-cream rounded-xl"><strong className="text-forest">Functional cookies</strong> — Remember your preferences like location and search history.</div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-forest mb-2">Managing cookies</h2>
              <p className="leading-relaxed">You can control cookies through your browser settings. Note that disabling essential cookies may affect Platform functionality. For questions, contact privacy@rezvo.co.uk.</p>
            </div>
          </div>
        </div>
      </section>
      <RezvoFooter />
    </div>
  )
}
