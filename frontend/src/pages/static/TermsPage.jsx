import Navbar from '../../components/directory/Navbar'
import RezvoFooter from '../../components/directory/RezvoFooter'
import SEO from '../../components/seo/SEO'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO title="Terms of Service" description="Read the Rezvo Terms of Service governing use of our platform." path="/terms" />
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-heading font-extrabold text-forest mb-3">Terms of Service</h1>
          <p className="text-muted text-sm mb-10 font-body">Last updated: February 2026</p>
          <div className="prose prose-sm max-w-none font-body text-muted space-y-6">
            <Sec title="1. Acceptance of Terms">By using Rezvo ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</Sec>
            <Sec title="2. Description of Service">Rezvo provides a booking and management platform connecting consumers with independent restaurants, salons, barbers, spas, and other service businesses across the United Kingdom.</Sec>
            <Sec title="3. User Accounts">You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 16 years old to use the Platform.</Sec>
            <Sec title="4. Bookings">Bookings made through Rezvo create a direct arrangement between you and the business. Rezvo facilitates but is not a party to these arrangements. Cancellation policies are set by individual businesses.</Sec>
            <Sec title="5. Business Accounts">Business owners are responsible for maintaining accurate availability, pricing, and business information. Payments are processed via Stripe Connect directly to business accounts.</Sec>
            <Sec title="6. Acceptable Use">You may not use the Platform for any unlawful purpose, to harass or abuse others, to submit false or misleading information, or to interfere with the Platform's operation.</Sec>
            <Sec title="7. Limitation of Liability">Rezvo is provided "as is". We are not liable for any losses arising from bookings, business conduct, or service quality. Our total liability is limited to fees paid to us in the preceding 12 months.</Sec>
            <Sec title="8. Governing Law">These Terms are governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of the English courts.</Sec>
          </div>
        </div>
      </section>
      <RezvoFooter />
    </div>
  )
}

function Sec({ title, children }) {
  return <div><h2 className="text-lg font-heading font-bold text-forest mb-2">{title}</h2><p className="leading-relaxed">{children}</p></div>
}
