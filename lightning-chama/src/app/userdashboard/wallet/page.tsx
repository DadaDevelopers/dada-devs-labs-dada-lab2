"use client";

import { useState, useEffect } from 'react';
import { ArrowUpRight, ChevronDown, Wallet, X, Copy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import BalanceHero from '@/components/BalanceHero';

// Types
type Wallet = {
  walletReference: string;
  walletType: string;
  balanceSats: number;
  lightning: {
    name: string;
  };
};

type Invoice = {
  invoice: string;
  paymentHash: string;
  amountSats: number;
  amountMsats: number;
  amountFees: number;
  qrCode: string;
  expiresAt: string;
  status?: string; // 'PENDING' | 'PAID' | 'EXPIRED'
  paidAt?: string;
};

const WalletPage = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Modal States
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  
  const CACHE_DURATION_MS = 5 * 60 * 1000;

  // Format Sats to BTC
  const formatBtc = (sats: number) => {
    const btc = sats / 100000000;
    return btc.toFixed(5);
  };

  // 1. Fetch Exchange Rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (lastFetched && Date.now() - lastFetched < CACHE_DURATION_MS) {
        setLoadingRate(false);
        return;
      }
      try {
        setLoadingRate(true);
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=kes"
        );
        if (!response.ok) throw new Error(`API status: ${response.status}`);
        const data = await response.json();
        if (data.bitcoin && data.bitcoin.kes) {
          setExchangeRate(data.bitcoin.kes);
          setLastFetched(Date.now());
        }
      } catch (error) {
        console.error("Rate fetch error:", error);
        if (!exchangeRate) setExchangeRate(11500000);
      } finally {
        setLoadingRate(false);
      }
    };
    fetchExchangeRate();
  }, []);

  // 2. Fetch Wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const token = localStorage.getItem('token');
        const userReference = localStorage.getItem('userReference');
        if (!token || !userReference) return;

        const walletRes = await fetch(
          `https://dada-devs-labs-dada-lab2.onrender.com/wallets/${userReference}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const walletData = await walletRes.json();
        
        if (walletRes.ok && walletData.content) {
          setWallets(walletData.content);
          if (walletData.content.length > 0) {
            setSelectedWallet(walletData.content[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, []);

  // 3. Fetch Invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!selectedWallet) {
        setInvoices([]);
        return;
      }
      setLoadingInvoices(true);
      try {
        const token = localStorage.getItem('token');
        const invoiceRes = await fetch(
          `https://dada-devs-labs-dada-lab2.onrender.com/api/v1/wallets/user-invoices/${selectedWallet.walletReference}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const invoiceData = await invoiceRes.json();

        if (invoiceRes.ok && invoiceData.content) {
          setInvoices(invoiceData.content);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoadingInvoices(false);
      }
    };
    fetchInvoices();
  }, [selectedWallet]);

  // 4. Handle Modal Closing (ESC key)
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedInvoice(null);
      }
    };
    if (selectedInvoice) document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [selectedInvoice]);

  // Helpers
  const convertSatsToKes = (sats: number): number => {
    if (!exchangeRate) return 0;
    const btcAmount = sats / 100000000;
    return btcAmount * exchangeRate;
  };

  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const walletId = e.target.value;
    const found = wallets.find((w) => w.walletReference === walletId);
    if (found) setSelectedWallet(found);
  };

  const copyHash = async () => {
    if (selectedInvoice?.paymentHash) {
      await navigator.clipboard.writeText(selectedInvoice.paymentHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  // Helper to determine UI properties based on API status
  const getInvoiceMeta = (invoice: Invoice) => {
    // 1. Check for explicit API status field
    if (invoice.status) {
      if (invoice.status === 'EXPIRED') {
        return { 
          label: 'EXPIRED', 
          color: 'bg-red-50 text-red-700 border-red-100', 
          icon: Clock,
          showPaid: false 
        };
      }
      if (invoice.status === 'PAID') {
        return { 
          label: 'PAID', 
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
          icon: CheckCircle,
          showPaid: true 
        };
      }
    }
    
    // 2. Fallback: Infer status from dates
    const now = new Date();
    const expiry = new Date(invoice.expiresAt);
    if (expiry < now) {
      return { 
        label: 'EXPIRED', 
        color: 'bg-red-50 text-red-700 border-red-100', 
        icon: Clock,
        showPaid: false 
      };
    }
    if (invoice.paidAt) {
      return { 
        label: 'PAID', 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
        icon: CheckCircle,
        showPaid: true 
      };
    }

    // Default
    return { 
      label: 'PENDING', 
      color: 'bg-yellow-50 text-yellow-700 border-yellow-100', 
      icon: Clock,
      showPaid: false 
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar 
        isAuthenticated={true}
        userName=''
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Wallet Selector */}
        <div className="mt-16 mb-0 max-w-xs">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Select Wallet
          </label>
          <div className="relative">
            <select
              value={selectedWallet?.walletReference || ''}
              onChange={handleWalletChange}
              className="w-full appearance-none bg-white border border-gray-300 text-gray-900 py-3 px-4 pr-8 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
            >
              {wallets.map((wallet) => (
                <option key={wallet.walletReference} value={wallet.walletReference}>
                  {wallet.lightning.name} ({wallet.walletType})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        {/* Balance Hero */}
        {selectedWallet ? (
          <div>
            <BalanceHero 
              btcAmount={formatBtc(selectedWallet.balanceSats)} 
              kshAmount={convertSatsToKes(selectedWallet.balanceSats).toLocaleString()} 
              className="mb-6"
            />
            {exchangeRate && !loadingRate && (
              <div className="text-xs text-gray-500 mb-8 text-center">
                Exchange rate: 1 BTC ≈ {exchangeRate.toLocaleString()} KES
              </div>
            )}
          </div>
        ) : (
          <div className="h-40 bg-gray-200 rounded-2xl animate-pulse mb-6"></div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-8">
          <Link href="/userdashboard/wallet/send" className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 transition shadow-md">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Send</span>
          </Link>
          
          <button className="flex flex-col items-center gap-2">
            <Link href="/userdashboard/wallet/recieve" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-700 rounded-full flex items-center justify-center hover:bg-teal-800 transition shadow-md">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 7L17 17M17 17H7M17 17V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Receive</span>
            </Link>
          </button>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span>Past Invoices</span>
            {!loading && !loadingInvoices && invoices.length === 0 && <span className="text-sm font-normal text-gray-500">No history</span>}
          </h2>
          
          {loading || loadingInvoices ? (
             <div className="space-y-4">
               {[1,2,3].map((i) => (
                 <div key={i} className="h-16 bg-gray-100 rounded-xl w-full animate-pulse"></div>
               ))}
             </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              {invoices.map((invoice, index) => (
                <div 
                  key={index} 
                  onClick={() => setSelectedInvoice(invoice)}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                      Hash: {invoice.paymentHash.substring(0, 15)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {invoice.amountSats} Sats • {new Date(invoice.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* INVOICE DETAILS MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedInvoice(null)}
          />
          
          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scaleIn z-10">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Invoice Details</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                  <img src={selectedInvoice.qrCode} alt="Invoice QR" className="w-48 h-48 object-contain mix-blend-multiply" />
                </div>
                
                {/* Status Badge */}
                {(() => {
                  const meta = getInvoiceMeta(selectedInvoice);
                  return (
                    <div className={`absolute -bottom-2 -right-2 ${meta.color} px-3 py-1.5 rounded-full text-xs font-bold border border-white shadow-sm flex items-center gap-1.5`}>
                      <meta.icon size={12} />
                      {meta.label}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Amount, Fees & Details */}
            <div className="space-y-4">
              {/* Main Amount */}
              <div className="text-center">
                <p className="text-3xl font-extrabold text-gray-900 mb-1">
                  {selectedInvoice.amountSats.toLocaleString()} <span className="text-lg font-medium text-gray-500">sats</span>
                </p>
                <p className="text-sm text-gray-500">
                  {convertSatsToKes(selectedInvoice.amountSats).toFixed(2)} KES
                </p>
              </div>

              {/* Fees Section */}
              <div className="flex justify-center items-center gap-2">
                 <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Transaction Fee</span>
                 <span className="text-sm font-medium text-gray-700">
                    {selectedInvoice.amountFees} sats
                 </span>
              </div>

              {/* Status Message inside modal */}
              {(() => {
                 const meta = getInvoiceMeta(selectedInvoice);
                 if (meta.label === 'EXPIRED') {
                    return (
                       <div className="flex items-center justify-center gap-2 text-red-600 text-sm bg-red-50 py-2 rounded-lg border border-red-100">
                         <AlertCircle size={16} />
                         <span className="font-semibold">This invoice has expired</span>
                       </div>
                    )
                 }
                 if (meta.label === 'PAID') {
                    return (
                       <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm bg-emerald-50 py-2 rounded-lg border border-emerald-100">
                         <CheckCircle size={16} />
                         <span className="font-semibold">Payment Successful</span>
                       </div>
                    )
                 }
                 return null;
              })()}

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wide truncate flex-1">
                    Payment Hash
                  </p>
                  <button 
                    onClick={copyHash}
                    className="text-emerald-600 hover:text-emerald-700 p-1"
                  >
                    {copiedHash ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {selectedInvoice.paymentHash}
                </p>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                 <span>Expires: {new Date(selectedInvoice.expiresAt).toLocaleString()}</span>
                 {selectedInvoice.paidAt && <span className="text-emerald-600 font-medium">Paid: {new Date(selectedInvoice.paidAt).toLocaleString()}</span>}
              </div>
            </div>

            {/* Footer */}
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="mt-8 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default WalletPage;