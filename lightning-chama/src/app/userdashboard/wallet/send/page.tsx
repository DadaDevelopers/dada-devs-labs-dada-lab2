"use client";

import { useState } from 'react';
import { ClipboardPaste } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import ConfirmTransactionModal from '@/components/ConfirmTransactionModal';

export default function SendPage() {
  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setToAddress(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar 
        isAuthenticated={true}
        userName=''
      />

      {/* Status Bar Spacer */}
      <div className="h-6"></div>
      
      {/* Main Content */}
      <div className="px-5 pt-32 pb-32 max-w-md mx-auto">
        {/* Back to Home */}
      <div className='mt-20 mb-8'>
        <a
          href="/userdashboard/wallet"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
        >
          <img src="/ic-left.svg" alt="Back" width="18" height="18" />
          <span>Back</span>
        </a>
          <h1 className="text-3xl font-bold text-center text-gray-600 mb-12">Send</h1>
      </div>
        {/* Form Container */}
        <div className="bg-white px-6  py-4 rounded-2xl shadow-sm overflow-hidden">
          {/* To Field */}
          <div className="p-5 border-b">
            <label className="text-xl font-medium text-gray-700 mb-2 block">
              To
            </label>
            <div className="flex items-center gap-3 border border-emerald-300 rounded-xl px-4 py-3 mb-4">
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="2dg6TH...45yfghjil"
                className="flex-1 text-gray-900  placeholder-gray-400 outline-none text-base"
              />
              <button
                onClick={handlePaste}
                className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors px-2 py-1"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span className="text-sm font-medium">Paste</span>
              </button>
            </div>
          </div>

          {/* Amount Field */}
          <div className="p-5">
            <label className="text-xl font-medium text-gray-700 mb-4 block">
              Amount
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0004567"
              className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
            />
          </div>
        </div>

        {/* Fee Section */}
        <div className="mt-4 px-4 py-3 bg-white rounded-2xl shadow-sm flex items-center justify-between">
          <span className="text-gray-600">Fee</span>
          <span className="text-gray-400">2, 000sats &gt;</span>
        </div>

        {/* Continue Button */}
        <button 
          onClick={() => setOpenConfirm(true)}
          className="w-full mt-10 border-2 bg-emerald-500 hover:bg-emerald-600 text-white text-2xl font-semibold py-4 rounded-2xl transition-colors">
            Continue
        </button>
      </div>
      {/* CONFIRM MODAL */}
      <ConfirmTransactionModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={() => {
          setOpenConfirm(false);
          console.log("Send transaction");
        }}
        data={{
          to: toAddress,
          amount: `${amount} sats`,
          amountKsh: "Ksh 50,000",
          fee: "2,000 sats",
        }}
      />
      {/* Bottom Bar Indicator */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center py-4">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  );
}