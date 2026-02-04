import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#00BFA5] hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-[#0A1626] font-display">Terms and Conditions</h1>
          <p className="text-[#627D98] mt-2">Last updated: February 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">1. Acceptance of Terms</h2>
            <p className="text-[#627D98] leading-relaxed">
              By accessing or using Rezvo's services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">2. Service Description</h2>
            <p className="text-[#627D98] leading-relaxed">
              Rezvo provides a booking platform that connects customers with service providers. We facilitate appointment scheduling, payment processing, and business management tools for UK micro-businesses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside text-[#627D98] space-y-2 ml-4">
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>One person or business may not maintain multiple accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">4. Business Subscriptions</h2>
            <p className="text-[#627D98] leading-relaxed mb-3">
              Business accounts require a monthly subscription of £4.99/month. Subscription terms:
            </p>
            <ul className="list-disc list-inside text-[#627D98] space-y-2 ml-4">
              <li>Subscriptions are billed monthly via Stripe</li>
              <li>You may cancel anytime, effective at the end of your billing period</li>
              <li>Refunds are not provided for partial months</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">5. Booking Terms</h2>
            <ul className="list-disc list-inside text-[#627D98] space-y-2 ml-4">
              <li>Bookings are agreements between customers and businesses</li>
              <li>Rezvo is not a party to these agreements</li>
              <li>Cancellation policies are set by individual businesses</li>
              <li>Deposits may be required and are non-refundable per business policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">6. Prohibited Activities</h2>
            <p className="text-[#627D98] leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc list-inside text-[#627D98] space-y-2 ml-4">
              <li>Use the service for any unlawful purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Impersonate another person or entity</li>
              <li>Interfere with the proper functioning of the platform</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">7. Limitation of Liability</h2>
            <p className="text-[#627D98] leading-relaxed">
              Rezvo is not liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">8. Termination</h2>
            <p className="text-[#627D98] leading-relaxed">
              We may terminate or suspend your account at any time for violations of these terms. Upon termination, your right to use the service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">9. Governing Law</h2>
            <p className="text-[#627D98] leading-relaxed">
              These terms are governed by the laws of England and Wales. Any disputes shall be resolved in the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">10. Contact</h2>
            <p className="text-[#627D98] leading-relaxed">
              For questions about these terms, contact: <a href="mailto:legal@rezvo.app" className="text-[#00BFA5] hover:underline">legal@rezvo.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
