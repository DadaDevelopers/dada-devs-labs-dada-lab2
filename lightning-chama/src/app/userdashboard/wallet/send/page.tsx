"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardPaste, AlertCircle, Loader2, Zap, User, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import ConfirmTransactionModal from '@/components/ConfirmTransactionModal';

type StoredWallet = {
  walletReference: string;
  lightning: { name: string };
};

type SendMode = 'user' | 'invoice';

export default function SendPage() {
  const router = useRouter();
  
  // UI Mode
  const [mode, setMode] = useState<SendMode>('user');
  
  // Form State
  const [recipientInput, setRecipientInput] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  
  // Invoice Preview State
  const [invoicePreview, setInvoicePreview] = useState<any>(null);
  
  // Recipient Validation State (Used for User Mode)
  const [recipientWalletName, setRecipientWalletName] = useState<string>('');
  const [recipientWalletType, setRecipientWalletType] = useState<string>('');
  const [recipientActive, setRecipientActive] = useState<boolean>(false);
  const [validatingRecipient, setValidatingRecipient] = useState<boolean>(false);
  
  // UI State
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [loadingTransaction, setLoadingTransaction] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  
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
      setRecipientInput(text);
      setInvoicePreview(null); // Reset preview on paste
      setError('');
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  // Handle input change to clear stale preview data
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientInput(e.target.value);
    setError('');
    if (mode === 'invoice') {
      setInvoicePreview(null);
    }
  };

  const validateRecipient = async () => {
    setError('');
    if (!recipientInput.trim()) {
      setError(mode === 'user' ? "Please enter a Recipient Wallet ID" : "Please enter a Lightning Invoice");
      return;
    }

    // --- LOGIC FOR INVOICE MODE (WITH PREVIEW) ---
    if (mode === 'invoice') {
      // Basic format check
      if (!recipientInput.toLowerCase().startsWith('ln')) {
        setError("Invalid Lightning Invoice format.");
        return;
      }

      setValidatingRecipient(true);

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Authentication token missing.");

        // Call Preview API
        const response = await fetch(
          `https://dada-devs-labs-dada-lab2.onrender.com/transactions/invoice-preview?invoiceHash=${encodeURIComponent(recipientInput)}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not decode invoice.");
        }

        // Store preview data
        setInvoicePreview(data);
        
        // Open modal with this data
        setOpenConfirm(true);

      } catch (err: any) {
        console.error(err);
        setError(err.message || "Invalid or expired invoice");
      } finally {
        setValidatingRecipient(false);
      }
      return;
    }

    // --- LOGIC FOR USER MODE (EXISTING) ---
    setValidatingRecipient(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Authentication token missing.");

      const response = await fetch(
        `https://dada-devs-labs-dada-lab2.onrender.com/wallets/fetch-by-id/${recipientInput}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Wallet not found");
      }

      setRecipientWalletName(data.lightning?.name || "Unknown Wallet");
      setRecipientWalletType(data.walletType || "Personal");
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

      // --- LOGIC FOR INVOICE PAYMENT ---
      if (mode === 'invoice') {
        if (!recipientInput) throw new Error("Invoice is required.");

        const payload = {
          payerWalletId: senderWalletId,
          beneficiaryInvoice: recipientInput
        };

        const response = await fetch(
          "https://dada-devs-labs-dada-lab2.onrender.com/transactions/pay-invoice",
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

        console.log("Invoice Payment Success:", data);
        // Show Success Toast and wait before redirect
        setShowSuccessToast(true);
        setTimeout(() => {
            router.push("/userdashboard/wallet");
        }, 2000);
        return;
      }

      // --- LOGIC FOR USER TRANSFER (EXISTING) ---
      if (!recipientInput) throw new Error("Recipient Wallet ID is required.");
      if (!amount) throw new Error("Amount is required.");

      if (!recipientActive) {
         throw new Error("Recipient wallet is currently inactive.");
      }

      const payload = {
        senderWalletId: senderWalletId,
        recipientWalletId: recipientInput,
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
      // Show Success Toast and wait before redirect
      setShowSuccessToast(true);
      setTimeout(() => {
          router.push("/userdashboard/wallet");
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoadingTransaction(false);
    }
  };

  // Determine amount/fee/memo to show in Modal
  const getModalData = () => {
    if (mode === 'invoice') {
      return {
        to: 'Lightning Network',
        amount: invoicePreview ? `${invoicePreview.amountSats} sats` : 'Loading...',
        amountKsh: invoicePreview ? `Approx. KES ${(invoicePreview.amountSats / 100000000 * 11500000).toLocaleString()}` : '...', 
        fee: invoicePreview ? `${invoicePreview.interimFeeSats} sats` : 'Calculating...',
        memo: invoicePreview?.memo || 'No Memo',
        recipientName: "Lightning Invoice",
        recipientWalletType: "LN_INVOICE",
        recipientActive: true,
      };
    } else {
      return {
        to: recipientInput,
        amount: `${amount} sats`,
        amountKsh: `Approx. KES ${(parseInt(amount || '0') / 100000000 * 11500000).toLocaleString()}`, 
        fee: "Variable",
        memo: memo || "None",
        recipientName: recipientWalletName,
        recipientWalletType: recipientWalletType, 
        recipientActive: recipientActive,
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} userName='' />
      <div className="h-6"></div>
      
      <div className="px-5 pt-32 pb-32 max-w-md mx-auto">
        <div className='mt-20 mb-6'>
          <a href="/userdashboard/wallet" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
            <span>Back</span>
          </a>
          <h1 className="text-3xl font-bold text-center text-gray-600 mb-2">Send</h1>
          {senderWalletName && (
            <p className="text-center text-sm text-emerald-600 font-medium">From: {senderWalletName}</p>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-gray-200 rounded-xl mb-6">
          <button
            onClick={() => {
              setMode('user');
              setRecipientInput('');
              setInvoicePreview(null);
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'user'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={18} />
            Send to User
          </button>
          <button
            onClick={() => {
              setMode('invoice');
              setRecipientInput('');
              setInvoicePreview(null);
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'invoice'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap size={18} />
            Pay Invoice
          </button>
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
          
          {/* Dynamic Input Field */}
          <div className="p-5 border-b">
            <label className="text-xl font-medium text-gray-700 mb-2 block">
              {mode === 'user' ? 'Recipient Wallet ID' : 'Lightning Invoice'}
            </label>
            <div className="flex items-center gap-3 border border-emerald-300 rounded-xl px-4 py-3 mb-4">
              <input
                type="text"
                value={recipientInput}
                onChange={handleInputChange}
                placeholder={mode === 'user' ? "e.g. 123e4567-e89b..." : "lnbc10n1p5cnrqzpp5..."}
                className={`flex-1 text-gray-900 placeholder-gray-400 outline-none text-sm ${
                  mode === 'invoice' ? 'font-mono text-xs' : 'font-mono'
                }`}
              />
              <button onClick={handlePaste} className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors px-2 py-1">
                <ClipboardPaste className="w-4 h-4" />
                <span className="text-sm font-medium">Paste</span>
              </button>
            </div>
          </div>

          {/* Amount Field (Only for User Mode) */}
          {mode === 'user' && (
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
          )}

          {/* Memo Field (Only for User Mode) */}
          {mode === 'user' && (
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
          )}

          {/* Info Message for Invoice Mode */}
          {mode === 'invoice' && (
            <div className="p-5">
               <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Zap className="text-blue-500 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Paste a Lightning Invoice</p>
                    <p className="text-xs text-blue-600 mt-1">We will decode the amount, fee, and description automatically.</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Fee Section */}
        <div className="mt-4 px-4 py-3 bg-white rounded-2xl shadow-sm flex items-center justify-between">
          <span className="text-gray-600">Network Fee</span>
          <span className="text-gray-400 text-sm">
             {mode === 'invoice' && invoicePreview ? `${invoicePreview.interimFeeSats} sats` : "Calculated at confirmation"}
          </span>
        </div>

        {/* Continue Button */}
        <button 
          onClick={validateRecipient}
          disabled={validatingRecipient || !recipientInput || (mode === 'user' && !amount)}
          className={`w-full mt-10 border-2 text-white text-2xl font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 ${
            validatingRecipient || !recipientInput || (mode === 'user' && !amount)
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
        data={getModalData()}
      />

      {/* SUCCESS TOAST */}
      {showSuccessToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-in fade-in zoom-in duration-300">
          <CheckCircle className="fill-white" size={20} />
          <span className="font-semibold text-sm">Payment Successful!</span>
        </div>
      )}
      
      <div className="fixed bottom-0 left-0 right-0 flex justify-center py-4">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  );
}