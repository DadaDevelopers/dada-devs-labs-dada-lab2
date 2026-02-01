"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardPaste, AlertCircle, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import ConfirmTransactionModal from '@/components/ConfirmTransactionModal';

type StoredWallet = {
  walletReference: string;
  lightning: { name: string };
};

export default function SendPage() {
  const router = useRouter();
  
  // Form State
  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  
  // Recipient Validation State
  const [recipientWalletName, setRecipientWalletName] = useState<string>('');
  const [recipientWalletType, setRecipientWalletType] = useState<string>('');
  const [recipientActive, setRecipientActive] = useState<boolean>(false);
  const [validatingRecipient, setValidatingRecipient] = useState<boolean>(false);
  
  // UI State
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [loadingTransaction, setLoadingTransaction] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Sender Wallet State
  const [senderWalletId, setSenderWalletId] = useState<string>('');
  const [senderWalletName, setSenderWalletName] = useState<string>('');

  // Load wallet context on mount
  useEffect(() => {
    const selectedRef = localStorage.getItem('selectedWalletRef');
    if (selectedRef === 'ALL' || !selectedRef) {
      setError("Please select a specific wallet before sending funds.");
      return;
    }
    setSenderWalletId(selectedRef);
    const walletsData = localStorage.getItem('wallets');
    if (walletsData) {
      try {
        const wallets: StoredWallet[] = JSON.parse(walletsData);
        const found = wallets.find(w => w.walletReference === selectedRef);
        if (found) setSenderWalletName(found.lightning.name);
      } catch (e) {
        console.error("Could not parse wallet list");
      }
    }
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setToAddress(text);
      setError(''); // Clear error on new input
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const validateRecipient = async () => {
    setError('');
    if (!toAddress.trim()) {
      setError("Please enter a Recipient Wallet ID");
      return;
    }

    setValidatingRecipient(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token missing.");

      // Call fetch-by-id API
      const response = await fetch(
        `https://dada-devs-labs-dada-lab2.onrender.com/wallets/fetch-by-id/${toAddress}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Wallet not found");
      }

      // If found, set details and open modal
      setRecipientWalletName(data.lightning?.name || "Unknown Wallet");
      setRecipientWalletType(data.walletType || "Personal"); // Added wallet type
      setRecipientActive(data.active ?? false);
      setOpenConfirm(true);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid Wallet ID");
    } finally {
      setValidatingRecipient(false);
    }
  };

  const handleConfirmTransaction = async () => {
    setLoadingTransaction(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token missing.");
      if (!senderWalletId) throw new Error("Sender wallet ID is missing.");
      if (!toAddress) throw new Error("Recipient Wallet ID is required.");
      if (!amount) throw new Error("Amount is required.");

      // Check if recipient wallet is active just in case
      if (!recipientActive) {
         throw new Error("Recipient wallet is currently inactive.");
      }

      const payload = {
        senderWalletId: senderWalletId,
        recipientWalletId: toAddress,
        amountSats: parseInt(amount),
        memo: memo || "Sent from Dada Wallet"
      };

      const response = await fetch(
        "https://dada-devs-labs-dada-lab2.onrender.com/transactions/wallet-top-up",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Transaction failed");
      }

      console.log("Transaction Success:", data);
      router.push("/userdashboard/wallet");

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoadingTransaction(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} userName='' />
      <div className="h-6"></div>
      
      <div className="px-5 pt-32 pb-32 max-w-md mx-auto">
        <div className='mt-20 mb-8'>
          <a href="/userdashboard/wallet" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
            <span>Back</span>
          </a>
          <h1 className="text-3xl font-bold text-center text-gray-600 mb-2">Send</h1>
          {senderWalletName && (
            <p className="text-center text-sm text-emerald-600 font-medium">From: {senderWalletName}</p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm overflow-hidden">
          {/* To Field */}
          <div className="p-5 border-b">
            <label className="text-xl font-medium text-gray-700 mb-2 block">Recipient Wallet ID</label>
            <div className="flex items-center gap-3 border border-emerald-300 rounded-xl px-4 py-3 mb-4">
              <input
                type="text"
                value={toAddress}
                onChange={(e) => {
                  setToAddress(e.target.value);
                  setError('');
                }}
                placeholder="e.g. 123e4567-e89b..."
                className="flex-1 text-gray-900 placeholder-gray-400 outline-none text-base font-mono text-sm"
              />
              <button onClick={handlePaste} className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors px-2 py-1">
                <ClipboardPaste className="w-4 h-4" />
                <span className="text-sm font-medium">Paste</span>
              </button>
            </div>
          </div>

          {/* Amount Field */}
          <div className="p-5 border-b">
            <label className="text-xl font-medium text-gray-700 mb-4 block">Amount (Sats)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-gray-900 placeholder-gray-400 outline-none text-lg font-semibold"
            />
          </div>

          {/* Memo Field */}
          <div className="p-5">
            <label className="text-sm font-medium text-gray-500 mb-2 block uppercase tracking-wide">Memo (Optional)</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="What is this for?"
              className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
            />
          </div>
        </div>

        {/* Fee Section */}
        <div className="mt-4 px-4 py-3 bg-white rounded-2xl shadow-sm flex items-center justify-between">
          <span className="text-gray-600">Network Fee</span>
          <span className="text-gray-400 text-sm">Calculated at confirmation</span>
        </div>

        {/* Continue Button */}
        <button 
          onClick={validateRecipient}
          disabled={validatingRecipient || !toAddress || !amount}
          className={`w-full mt-10 border-2 text-white text-2xl font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 ${
            validatingRecipient || !toAddress || !amount
              ? "bg-gray-300 border-gray-300 cursor-not-allowed" 
              : "bg-emerald-500 border-emerald-500 hover:bg-emerald-600"
          }`}
        >
          {validatingRecipient ? <Loader2 className="animate-spin" /> : "Continue"}
        </button>
      </div>
      
      {/* CONFIRM MODAL */}
      <ConfirmTransactionModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmTransaction}
        loading={loadingTransaction}
        error={error}
        data={{
          to: toAddress,
          amount: `${amount} sats`,
          amountKsh: `Approx. KES ${(parseInt(amount || '0') / 100000000 * 11500000).toLocaleString()}`, 
          fee: "Variable",
          memo: memo || "None",
          recipientName: recipientWalletName,
          recipientWalletType: recipientWalletType, // New
          recipientActive: recipientActive,
        }}
      />
      
      <div className="fixed bottom-0 left-0 right-0 flex justify-center py-4">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  );
}