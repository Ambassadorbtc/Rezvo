import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#00BFA5] hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-[#0A1626] font-display">Privacy Policy</h1>
          <p className="text-[#627D98] mt-2">Last updated: February 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">1. Introduction</h2>
            <p className="text-[#627D98] leading-relaxed">
              Rezvo ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our booking platform and mobile application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">2. Information We Collect</h2>
            <p className="text-[#627D98] leading-relaxed mb-3">We collect information you provide directly:</p>
            <ul className="list-disc list-inside text-[#627D98] space-y-2 ml-4">
              <li>Account information (name, email, phone number)</li>
              <li>Business information (business name, address, services)</li>
              <li>Booking details (appointments, service preferences)</li>
              <li>Payment information (processed securely via Stripe)</li>
              <li>Communications with us or other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-[#627D98] space-y-2 ml-4">
              <li>To provide and maintain our services</li>
              <li>To process bookings and payments</li>
              <li>To send booking confirmations and reminders</li>
              <li>To improve our platform and user experience</li>
              <li>To communicate about updates and promotions</li>
              <li>To ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">4. Information Sharing</h2>
            <p className="text-[#627D98] leading-relaxed">
              We share your information only with: service providers (such as Stripe for payments), business owners you book with, and when required by law. We never sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">5. Data Security</h2>
            <p className="text-[#627D98] leading-relaxed">
              We implement appropriate security measures including encryption, secure servers, and regular security audits to protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">6. Your Rights (GDPR)</h2>
            <p className="text-[#627D98] leading-relaxed mb-3">Under UK GDPR, you have the right to:</p>
            <ul className="list-disc list-inside text-[#627D98] space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">7. Cookies</h2>
            <p className="text-[#627D98] leading-relaxed">
              We use cookies to enhance your experience. See our <Link to="/cookies" className="text-[#00BFA5] hover:underline">Cookie Policy</Link> for more details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">8. Contact Us</h2>
            <p className="text-[#627D98] leading-relaxed">
              For privacy-related inquiries, contact us at: <a href="mailto:privacy@rezvo.app" className="text-[#00BFA5] hover:underline">privacy@rezvo.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
