"use client";

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Share2, Loader2, RefreshCw, 
  Wallet, Zap, ChevronRight, CheckCircle, Clock, ChevronDown 
} from 'lucide-react';
import Link from 'next/link';
import SatsAmount from '@/components/SatsAmount';
import { useBitcoinKesRate } from '@/hooks/useBitcoinKesRate';

// --- Typing ---
type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED';

type InvoiceStatusResponse = {
  paymentHash: string;
  amountSats: number;
  fees: number;
  status: PaymentStatus;
  paidAt: string | null;
};

type Wallet = {
  walletReference: string;
  walletType: string;
  balanceSats: number;
  lightning: {
    name: string;
    balance_msat: string;
  };
};

export default function LightningQRPage() {
  const { exchangeRate, loadingRate } = useBitcoinKesRate();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const [amount, setAmount] = useState(100);
  const [memo, setMemo] = useState("Payment Request");
  const [copied, setCopied] = useState(false);

  // 1. Fetch Wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const token = localStorage.getItem('token');
        const userReference = localStorage.getItem('userReference');
        if (!token || !userReference) throw new Error("User not authenticated");

        const res = await fetch(
          `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/wallets/${userReference}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch wallets');
        
        setWallets(data.content || []);
        if (data.content && data.content.length > 0) setSelectedWallet(data.content[0]);
      } catch (err) {
        console.error(err);
        setError('Unable to load wallets');
      } finally {
        setLoadingWallets(false);
      }
    };
    fetchWallets();
  }, []);

  // 2. AUTOMATIC POLLER
  useEffect(() => {
    if (invoiceData?.paymentHash && paymentStatus === 'PENDING') {
      setIsPolling(true);

      const intervalId = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(
            `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/api/v1/wallets/invoices/${invoiceData.paymentHash}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          if (!res.ok) throw new Error('Failed to check invoice status');
          const data: InvoiceStatusResponse = await res.json();

          if (data.status === 'PAID') {
            setPaymentStatus('PAID');
            setIsPolling(false);
            clearInterval(intervalId);
          } else if (data.status === 'EXPIRED') {
            setPaymentStatus('EXPIRED');
            setIsPolling(false);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [invoiceData, paymentStatus]);

  // 3. Generate Invoice
  const generateInvoice = async () => {
    if (!selectedWallet) return;
    
    setError('');
    setLoadingInvoice(true);
    setInvoiceData(null);
    setPaymentStatus(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/api/v1/wallets/${selectedWallet.walletReference}/invoice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ amountSats: amount, memo }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate invoice');

      setInvoiceData(data);
      setPaymentStatus('PENDING'); 
    } catch (err) {
      console.error(err);
      if (err instanceof Error) setError(err.message);
      else setError('Failed to connect to server.');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleCopy = () => {
    if (invoiceData?.invoice) {
      navigator.clipboard.writeText(invoiceData.invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && invoiceData?.invoice) {
      try {
        await navigator.share({
          title: 'Lightning Invoice',
          text: `Pay this Lightning Invoice: ${invoiceData.invoice}`,
        });
      } catch (err) { console.log('Share canceled'); }
    }
  };

  const resetSelection = () => {
    setSelectedWallet(null);
    setInvoiceData(null);
    setError('');
    setPaymentStatus(null);
  };

  // --- VIEW 1: WALLET LIST ---
  if (!selectedWallet && !loadingWallets && wallets.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/userdashboard/wallet" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
              <ArrowLeft className="text-gray-700" size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Select Wallet</h1>
          </div>
        </div>
        <div className="px-4 py-6 max-w-md mx-auto space-y-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.walletReference}
              onClick={() => setSelectedWallet(wallet)}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Wallet size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{wallet.lightning.name}</h3>
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">{wallet.walletType.replace('_', ' ')}</span>
                  </div>
                </div>
                <SatsAmount
                  sats={wallet.balanceSats}
                  exchangeRate={exchangeRate}
                  loadingRate={loadingRate}
                  align="right"
                  primaryClassName="text-lg font-bold text-gray-900"
                  detailClassName="text-xs text-gray-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadingWallets) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!selectedWallet && wallets.length === 0) return <div className="h-screen flex items-center justify-center text-center px-6"><p className="text-gray-500">No wallets found.</p></div>;

  // --- VIEW 2: MAIN INTERFACE ---
  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/userdashboard/wallet" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
            <ArrowLeft className="text-gray-700" size={24} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Receive</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        
        {/* Active Wallet Selector Card */}
        {paymentStatus !== 'PAID' && paymentStatus !== 'EXPIRED' && (
          <div 
            onClick={resetSelection}
            className="bg-white border-2 border-gray-100 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-emerald-600 border border-gray-200">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-0.5">Receiving to</p>
                {/* REMOVED TRUNCATION: Wallet name now displays fully */}
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {selectedWallet?.lightning.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedWallet && (
                <SatsAmount
                  sats={selectedWallet.balanceSats}
                  exchangeRate={exchangeRate}
                  loadingRate={loadingRate}
                  align="right"
                  primaryClassName="text-sm font-bold text-gray-900"
                  detailClassName="text-[10px] text-gray-400"
                />
              )}
              <ChevronDown className="text-gray-400" size={20} />
            </div>
          </div>
        )}

        {/* Settings Card */}
        {paymentStatus !== 'PAID' && (
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (Sats)</label>
                <div className="relative">
                  <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-white border border-gray-200 text-gray-900 text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm" min="1" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">sats</span>
                </div>
                {amount > 0 && (
                  <SatsAmount
                    sats={amount}
                    exchangeRate={exchangeRate}
                    loadingRate={loadingRate}
                    primaryClassName="mt-2 text-sm font-semibold text-gray-700"
                    detailClassName="text-xs text-gray-500"
                  />
                )}
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Memo</label>
                <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} className="w-full bg-white border border-gray-200 text-gray-900 text-base rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm" placeholder="e.g. Coffee" />
              </div>
            </div>
            <button onClick={generateInvoice} disabled={loadingInvoice} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black active:scale-[0.98] transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loadingInvoice ? <><Loader2 className="animate-spin" size={20} /> Generating...</> : <><Zap size={20} fill="currentColor" /> Generate Invoice</>}
            </button>
          </div>
        )}

        {/* Success Screen */}
        {paymentStatus === 'PAID' && (
          <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100">
              <CheckCircle className="text-emerald-600" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Received!</h2>
            <p className="text-gray-500 text-lg mb-8">Invoice settled successfully.</p>
            <button onClick={() => setPaymentStatus(null)} className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">Create New Invoice</button>
          </div>
        )}

        {/* Expired Screen */}
        {paymentStatus === 'EXPIRED' && (
          <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Clock className="text-red-600" size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoice Expired</h2>
            <p className="text-gray-500 text-lg mb-8 text-center max-w-xs">The invoice was not paid within time limit.</p>
            <button onClick={generateInvoice} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg shadow-gray-200 flex items-center gap-2"><RefreshCw size={18} /> Regenerate</button>
          </div>
        )}

        {/* QR / Polling View */}
        {paymentStatus !== 'PAID' && paymentStatus !== 'EXPIRED' && (
          <div className="flex flex-col items-center">
            {loadingInvoice && !invoiceData ? (
              <div className="w-full aspect-square max-w-[300px] bg-gray-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium">Creating Invoice...</p>
              </div>
            ) : invoiceData ? (
              <div className="relative group w-full flex flex-col items-center">
                {/* QR Card Container */}
                <div className={`
                  relative bg-white p-6 rounded-[1.5rem] shadow-xl transition-all duration-500 w-[280px] h-[280px] flex items-center justify-center
                  ${isPolling ? 'border-2 border-emerald-500 shadow-emerald-200/50' : 'border border-gray-50'}
                `}>
                  <img src={invoiceData.qrCode} alt="Lightning Invoice QR" className="w-full h-full object-contain mix-blend-multiply" />
                  
                  {/* Live Badge - Non-blocking */}
                  {isPolling && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 z-10">
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                      LISTENING
                    </div>
                  )}

                  {/* Refresh on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 backdrop-blur-[1px] rounded-[1.5rem]">
                    <button onClick={generateInvoice} className="bg-white text-emerald-700 p-3 rounded-full shadow-lg hover:rotate-180 transition-transform duration-500">
                      <RefreshCw size={24} />
                    </button>
                  </div>
                </div>

                {/* Text Status below QR */}
                {isPolling && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-600 font-medium text-sm animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    Waiting for payment...
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-square max-w-[300px] bg-gray-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4"><Zap size={32} className="text-gray-400" /></div>
                <span className="text-gray-400 font-medium">Enter amount to start</span>
              </div>
            )}

            {invoiceData && (
              <>
                <div className="mt-8 text-center w-full">
                  <SatsAmount
                    sats={invoiceData.amountSats}
                    exchangeRate={exchangeRate}
                    loadingRate={loadingRate}
                    align="center"
                    primaryClassName="text-3xl font-extrabold text-gray-900 mb-1"
                    detailClassName="text-sm text-gray-500"
                  />
                  <p className="text-gray-500 font-medium">for <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md mx-1">{memo}</span></p>
                </div>
                <div className="flex gap-3 w-full mt-8">
                  <button onClick={handleCopy} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-700 transition-all active:scale-[0.98]"><Copy size={22} /> Copy</button>
                  <button onClick={handleShare} className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"><Share2 size={22} /> Share</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {copied && (<div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-slide-up"><CheckCircle size={20} className="text-emerald-400" /><span className="font-medium">Invoice copied to clipboard</span></div>)}
      <style jsx>{` @keyframes slide-up { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } } .animate-slide-up { animation: slide-up 0.3s ease-out forwards; } @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.5s ease-out forwards; } `}</style>
    </div>
  );
}
