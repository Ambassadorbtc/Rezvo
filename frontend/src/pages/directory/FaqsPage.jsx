import Navbar from '../../components/directory/Navbar';
import RezvoFooter from '../../components/directory/RezvoFooter';
import FaqAccordion from '../../components/directory/FaqAccordion';

export default function FaqsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-forest mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted font-medium">
              Everything you need to know about booking with Rezvo
            </p>
          </div>

          <FaqAccordion />

          <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm text-center">
            <h3 className="text-2xl font-heading font-black text-forest mb-3">
              Still have questions?
            </h3>
            <p className="text-muted mb-6">
              Our support team is here to help. Get in touch and we'll respond within 24 hours.
            </p>
            <a
              href="mailto:support@rezvo.app"
              className="inline-block bg-forest text-white font-bold px-8 py-4 rounded-full hover:bg-sage transition-all shadow-md"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <RezvoFooter />
    </div>
  );
}
