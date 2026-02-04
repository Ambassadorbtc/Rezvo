import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiesPage = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#00BFA5] hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-[#0A1626] font-display">Cookie Policy</h1>
          <p className="text-[#627D98] mt-2">Last updated: February 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">What Are Cookies?</h2>
            <p className="text-[#627D98] leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">Types of Cookies We Use</h2>
            
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-[#F5F0E8] rounded-xl">
                <h3 className="font-semibold text-[#0A1626] mb-2">Essential Cookies</h3>
                <p className="text-[#627D98] text-sm">
                  Required for the website to function. These include authentication tokens and session management. Cannot be disabled.
                </p>
              </div>
              
              <div className="p-4 bg-[#F5F0E8] rounded-xl">
                <h3 className="font-semibold text-[#0A1626] mb-2">Performance Cookies</h3>
                <p className="text-[#627D98] text-sm">
                  Help us understand how visitors interact with our website by collecting anonymous information about page visits and errors.
                </p>
              </div>
              
              <div className="p-4 bg-[#F5F0E8] rounded-xl">
                <h3 className="font-semibold text-[#0A1626] mb-2">Functionality Cookies</h3>
                <p className="text-[#627D98] text-sm">
                  Remember your preferences such as language, region, and display settings to personalize your experience.
                </p>
              </div>
              
              <div className="p-4 bg-[#F5F0E8] rounded-xl">
                <h3 className="font-semibold text-[#0A1626] mb-2">Marketing Cookies</h3>
                <p className="text-[#627D98] text-sm">
                  Used to track visitors across websites to display relevant advertisements. We currently do not use marketing cookies.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">Cookies We Set</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left py-3 text-[#0A1626] font-semibold">Name</th>
                    <th className="text-left py-3 text-[#0A1626] font-semibold">Purpose</th>
                    <th className="text-left py-3 text-[#0A1626] font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-[#627D98]">
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="py-3">rezvo_token</td>
                    <td className="py-3">Authentication</td>
                    <td className="py-3">14 days</td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="py-3">rezvo_user</td>
                    <td className="py-3">User session data</td>
                    <td className="py-3">14 days</td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="py-3">cookie_consent</td>
                    <td className="py-3">Cookie preferences</td>
                    <td className="py-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">Managing Cookies</h2>
            <p className="text-[#627D98] leading-relaxed mb-3">
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside text-[#627D98] space-y-2 ml-4">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p className="text-[#627D98] leading-relaxed mt-3">
              Note: Blocking essential cookies may prevent you from using certain features of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">Updates to This Policy</h2>
            <p className="text-[#627D98] leading-relaxed">
              We may update this Cookie Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#0A1626] mb-3">Contact Us</h2>
            <p className="text-[#627D98] leading-relaxed">
              If you have questions about our use of cookies, contact: <a href="mailto:privacy@rezvo.app" className="text-[#00BFA5] hover:underline">privacy@rezvo.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
