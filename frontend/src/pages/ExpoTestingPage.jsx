import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, Download, CheckCircle, AlertCircle, ExternalLink, Copy, Terminal, QrCode, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';

const ExpoTestingPage = () => {
  const [copied, setCopied] = useState(false);
  const [expoUrl, setExpoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the current tunnel URL from the backend
  useEffect(() => {
    fetchTunnelUrl();
  }, []);

  const fetchTunnelUrl = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/expo/tunnel-url`);
      const data = await response.json();
      if (data.url) {
        setExpoUrl(data.url);
      } else {
        // Use internal IP as fallback
        setExpoUrl('exp://10.79.144.219:8081');
        setError('Using LAN URL. Make sure your phone is on the same network.');
      }
    } catch (err) {
      // Fallback to internal URL
      setExpoUrl('exp://10.79.144.219:8081');
      setError('Using LAN URL. Make sure your phone is on the same network.');
    }
    setLoading(false);
  };

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
            Scan the QR code with Expo Go to test on your phone
          </p>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E2E8F0] mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* QR Code */}
            <div className="flex-shrink-0">
              <div className="bg-white p-4 rounded-2xl border-2 border-[#00BFA5]/20">
                {loading ? (
                  <div className="w-[200px] h-[200px] flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-[#00BFA5] animate-spin" />
                  </div>
                ) : error ? (
                  <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-center p-4">
                    <AlertCircle className="w-8 h-8 text-[#F59E0B] mb-2" />
                    <p className="text-sm text-[#627D98]">{error}</p>
                    <button
                      onClick={fetchTunnelUrl}
                      className="mt-3 text-sm text-[#00BFA5] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                ) : (
                  <QRCode
                    value={expoUrl}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                    fgColor="#0A1626"
                    bgColor="#FFFFFF"
                  />
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold text-[#0A1626] mb-4">
                Scan with Expo Go
              </h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00BFA5] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">1</div>
                  <p className="text-[#627D98]">Download <span className="font-medium text-[#0A1626]">Expo Go</span> from App Store or Google Play</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00BFA5] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">2</div>
                  <p className="text-[#627D98]">Open Expo Go and tap <span className="font-medium text-[#0A1626]">"Scan QR Code"</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00BFA5] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">3</div>
                  <p className="text-[#627D98]">Point your camera at the QR code above</p>
                </div>
              </div>

              {expoUrl && (
                <div className="bg-[#F5F0E8] rounded-xl p-3 mt-4">
                  <p className="text-xs text-[#627D98] mb-1">Or enter this URL manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-[#0A1626] font-mono flex-1 truncate">{expoUrl}</code>
                    <button
                      onClick={() => copyToClipboard(expoUrl)}
                      className="p-1.5 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-[#00BFA5]" /> : <Copy className="w-4 h-4 text-[#627D98]" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <a 
                  href="https://apps.apple.com/app/expo-go/id982107779"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  iOS
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=host.exp.exponent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#00BFA5] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#00A896] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Android
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] mb-8">
          <h3 className="text-xl font-semibold text-[#0A1626] mb-4">Test Credentials</h3>
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
