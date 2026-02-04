import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, Download, CheckCircle, AlertCircle, ExternalLink, Copy, Terminal } from 'lucide-react';

const ExpoTestingPage = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00BFA5] rounded-2xl mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#0A1626] font-display mb-2">
            Test Rezvo Mobile App
          </h1>
          <p className="text-[#627D98] text-lg">
            Follow these steps to run the app on your phone
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00BFA5] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#0A1626] mb-2">
                  Download Expo Go App
                </h3>
                <p className="text-[#627D98] mb-4">
                  Install the Expo Go app on your phone to run the development build.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://apps.apple.com/app/expo-go/id982107779"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    iOS App Store
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a 
                    href="https://play.google.com/store/apps/details?id=host.exp.exponent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#00BFA5] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#00A896] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Google Play Store
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00BFA5] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#0A1626] mb-2">
                  Run the Development Server
                </h3>
                <p className="text-[#627D98] mb-4">
                  Download the mobile app code and start the Expo development server on your computer.
                </p>
                
                <div className="bg-[#1A2B3C] rounded-xl p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#627D98]"># Clone and run the mobile app</span>
                    <button 
                      onClick={() => copyToClipboard('cd /app/mobile/rezvo-mobile && npm install && npx expo start')}
                      className="text-[#00BFA5] hover:text-white transition-colors"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <code className="text-green-400">cd /app/mobile/rezvo-mobile</code>
                  <br />
                  <code className="text-green-400">npm install</code>
                  <br />
                  <code className="text-green-400">npx expo start</code>
                </div>

                <div className="mt-4 p-4 bg-[#FEF3C7] rounded-xl border border-[#F59E0B]/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-[#92400E] font-medium">Note for Emergent Platform Users</p>
                      <p className="text-sm text-[#92400E]/80 mt-1">
                        To test on your phone, you'll need to download the code using "Download Code" feature, 
                        then run the Expo commands locally on your machine.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00BFA5] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#0A1626] mb-2">
                  Scan QR Code
                </h3>
                <p className="text-[#627D98] mb-4">
                  After running <code className="bg-[#F5F0E8] px-2 py-1 rounded text-sm">npx expo start</code>, 
                  a QR code will appear in your terminal. Scan it with Expo Go.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F5F0E8] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs">📱</span>
                      </div>
                      <span className="font-medium text-[#0A1626]">iOS</span>
                    </div>
                    <p className="text-sm text-[#627D98]">
                      Open Camera app → Scan QR → Tap "Open in Expo Go"
                    </p>
                  </div>
                  <div className="p-4 bg-[#F5F0E8] rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-[#00BFA5] rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs">📱</span>
                      </div>
                      <span className="font-medium text-[#0A1626]">Android</span>
                    </div>
                    <p className="text-sm text-[#627D98]">
                      Open Expo Go app → Tap "Scan QR Code" → Scan terminal QR
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00BFA5] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#0A1626] mb-2">
                  Test the App
                </h3>
                <p className="text-[#627D98] mb-4">
                  Use these credentials to log in and test the full booking flow.
                </p>
                
                <div className="bg-[#F5F0E8] rounded-xl p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#627D98] mb-1">Email</p>
                      <p className="font-mono text-[#0A1626] font-medium">testuser@example.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#627D98] mb-1">Password</p>
                      <p className="font-mono text-[#0A1626] font-medium">password123</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[#00BFA5]/10 text-[#00BFA5] rounded-full text-sm font-medium">Client Mode</span>
                  <span className="px-3 py-1 bg-[#1A2B3C]/10 text-[#1A2B3C] rounded-full text-sm font-medium">Business Mode</span>
                  <span className="px-3 py-1 bg-[#F59E0B]/10 text-[#F59E0B] rounded-full text-sm font-medium">Booking Flow</span>
                  <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-sm font-medium">Calendar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#0A1626] mb-6 text-center">What You Can Test</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0A1626] mb-3 flex items-center gap-2">
                <span className="text-xl">👤</span> Client App
              </h3>
              <ul className="space-y-2 text-sm text-[#627D98]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  Browse businesses & services
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  Search & filter by category
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  Book appointments with date/time picker
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  View & manage bookings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  Profile & settings
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0A1626] mb-3 flex items-center gap-2">
                <span className="text-xl">💼</span> Business App
              </h3>
              <ul className="space-y-2 text-sm text-[#627D98]">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  Dashboard with today's stats
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  Calendar view (week/day)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  Manage bookings (confirm/cancel)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  Services management with deposits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#00BFA5]" />
                  Share booking link
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Web App */}
        <div className="mt-12 text-center">
          <a 
            href="/mobile-preview" 
            className="inline-flex items-center gap-2 text-[#00BFA5] font-medium hover:underline"
          >
            Or view the interactive web preview instead →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExpoTestingPage;
