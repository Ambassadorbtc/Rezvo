import Navbar from '../../components/directory/Navbar'
import RezvoFooter from '../../components/directory/RezvoFooter'
import SEO from '../../components/seo/SEO'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO title="Privacy Policy" description="Learn how Rezvo collects, uses, and protects your personal data." path="/privacy" />
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-heading font-extrabold text-forest mb-3">Privacy Policy</h1>
          <p className="text-muted text-sm mb-10 font-body">Last updated: February 2026</p>
          <div className="prose prose-sm max-w-none font-body text-muted space-y-6">
            <LegalSection title="1. Information We Collect">
              We collect information you provide when creating an account (name, email, phone number), making bookings (date, time, party size, preferences), and using our platform (usage data, device information, location data when enabled). For business owners, we also collect business details, payment information via Stripe, and operational data.
            </LegalSection>
            <LegalSection title="2. How We Use Your Information">
              We use your data to provide and improve our services, process bookings and payments, send booking confirmations and reminders, personalise your experience, communicate service updates, and comply with legal obligations. We never sell your personal data to third parties.
            </LegalSection>
            <LegalSection title="3. Data Sharing">
              We share relevant booking details with the businesses you book with. We use trusted service providers (Stripe for payments, email delivery services) who process data on our behalf under strict agreements. We may share anonymised, aggregated data for analytics purposes.
            </LegalSection>
            <LegalSection title="4. Your Rights">
              Under UK GDPR, you have the right to access, rectify, erase, restrict processing of, and port your personal data. You can also object to processing and withdraw consent at any time. Contact us at privacy@rezvo.co.uk to exercise these rights.
            </LegalSection>
            <LegalSection title="5. Data Security">
              We implement industry-standard security measures including encryption in transit and at rest, regular security audits, and access controls. Payment data is processed securely by Stripe and never stored on our servers.
            </LegalSection>
            <LegalSection title="6. Contact">
              For privacy-related queries, email privacy@rezvo.co.uk. Our Data Protection Officer can be reached at the same address.
            </LegalSection>
          </div>
        </div>
      </section>
      <RezvoFooter />
    </div>
  )
}

function LegalSection({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-heading font-bold text-forest mb-2">{title}</h2>
      <p className="leading-relaxed">{children}</p>
    </div>
  )
}
