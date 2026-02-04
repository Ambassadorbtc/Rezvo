import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      essential: true,
      performance: true,
      functionality: true,
      accepted_at: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      essential: true,
      performance: false,
      functionality: false,
      accepted_at: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-[#E2E8F0] p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00BFA5]/10 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-6 h-6 text-[#00BFA5]" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-[#0A1626]">Cookie Preferences</h3>
              <button 
                onClick={acceptEssential}
                className="text-[#627D98] hover:text-[#0A1626] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-[#627D98] text-sm mb-4">
              We use cookies to enhance your experience on Rezvo. By clicking "Accept All", you consent to our use of cookies. 
              Read our <Link to="/cookies" className="text-[#00BFA5] hover:underline">Cookie Policy</Link> for more information.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={acceptAll}
                className="px-6 py-2.5 bg-[#00BFA5] text-white font-medium rounded-full hover:bg-[#00A896] transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={acceptEssential}
                className="px-6 py-2.5 bg-[#F5F0E8] text-[#0A1626] font-medium rounded-full hover:bg-[#E2E8F0] transition-colors"
              >
                Essential Only
              </button>
              <Link
                to="/cookies"
                className="px-6 py-2.5 text-[#627D98] font-medium hover:text-[#0A1626] transition-colors"
              >
                Manage Preferences
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
