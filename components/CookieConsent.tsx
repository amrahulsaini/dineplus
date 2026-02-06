'use client';

import { useState, useEffect } from 'react';
import { cookies } from '@/lib/localStorage';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = cookies.getCookieConsent();
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    cookies.setCookieConsent(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    cookies.setCookieConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 border-t-2 border-orange-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">🍪 Cookie Notice</h3>
          <p className="text-sm text-gray-300">
            We use cookies and local storage to enhance your experience on Loopwar. 
            Your data will be stored locally for 30 days to provide seamless ordering and restaurant management. 
            By clicking "Accept", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-semibold"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
