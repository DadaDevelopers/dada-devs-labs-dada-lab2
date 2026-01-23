"use client";
"use client";
import { useState } from 'react';
import {  ArrowLeft,Copy, QrCode, Share2 } from 'lucide-react';

import Link from 'next/link';
export default function LightningQRPage() {
  const [copied, setCopied] = useState(false);
  const address = "0x59AD...f2540";

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Lightning Address',
        text: `My Lightning address: ${address}`,
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      
      {/* Header */}
      {/*<Navbar isAuthenticated={true} userName=""/>*/}
      {/* Back to Home */}
      <div className="w-full max-w-md flex p-2 items-center">
        <Link
          href="/userdashboard/wallet"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span className="text-md">Go Back</span>
        </Link>
        </div>
      {/* Main Content */}
      <div className="px-5 py-8 flex flex-col items-center">
        {/* QR Code */}
        < QrCode  className='bg-gray-900 w-80 h-80 mb-4 rounded-xl'/>

        {/* Description */}
        <div className="text-center mb-8">
          <h2 className="text-lg text-gray-700 font-semibold mb-2">lightning</h2>
          <p className="text-gray-600 text-sm">
            Use this address to receive<br />bitcoin (sats)
          </p>
        </div>

        {/* Address and Actions */}
        <div className="flex gap-3 w-full max-w-md">
          <button
            onClick={handleCopy}
            className="flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-mono text-gray-700 text-sm">{address}</span>
            <Copy className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleShare}
            className="bg-emerald-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share QR code
          </button>
        </div>

        {copied && (
          <div className="mt-4 bg-emerald-100  px-4 py-2 text-gray-700 rounded-lg text-sm">
            Address copied to clipboard!
          </div>
        )}
      </div>

      {/* Bottom Indicator */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center py-4">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  );
}