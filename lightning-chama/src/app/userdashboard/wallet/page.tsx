"use client";

import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, ChevronDown, Wallet, X, Copy, Clock, CheckCircle, AlertCircle, Layers, Eye, Plus, Check, Filter, Search, ListOrdered } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import BalanceHero from '@/components/BalanceHero';
import SatsAmount from '@/components/SatsAmount';

// --- TYPES ---

type LightningNode = {
  name: string;
  id: string;
  adminkey: string;
  inkey: string;
  currency: string;
  balance_msat?: string;
};

type Wallet = {
  walletReference: string;
  walletType: string;
  balanceSats: number;
  lightning: LightningNode;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Invoice = {
  invoice: string;
  paymentHash: string;
  amountSats: number;
  amountMsats: number;
  amountFees: number;
  qrCode: string;
  expiresAt: string;
  status: string; // 'PENDING' | 'PAID' | 'EXPIRED'
  paidAt?: string;
};

const WalletPage = () => {
  // --- STATE ---

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const [selectedWalletRef, setSelectedWalletRef] = useState<string | 'ALL'>('ALL');
  
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [walletsExpanded, setWalletsExpanded] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedWalletDetails, setSelectedWalletDetails] = useState<Wallet | null>(null);
  
  const [copiedHash, setCopiedHash] = useState(false);
  const [walletDetailsCopied, setWalletDetailsCopied] = useState<string | null>(null);

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  
  // New states for invoice filtering
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpanded, setFilterExpanded] = useState(false);
  
  const CACHE_DURATION_MS = 5 * 60 * 1000;

  // --- HELPERS ---

  const formatBtc = (sats: number) => {
    const btc = sats / 100000000;
    return btc.toFixed(5);
  };

  const convertSatsToKes = (sats: number): number => {
    if (!exchangeRate) return 0;
    const btcAmount = sats / 100000000;
    return btcAmount * exchangeRate;
  };

  const walletData = useMemo(() => {
    if (wallets.length === 0) return { balance: 0, walletObj: null };

    if (selectedWalletRef === 'ALL') {
      const totalBalance = wallets.reduce((sum, w) => sum + (w.balanceSats || 0), 0);
      return { balance: totalBalance, walletObj: null };
    } else {
      const found = wallets.find((w) => w.walletReference === selectedWalletRef);
      return { balance: found?.balanceSats || 0, walletObj: found || null };
    }
  }, [wallets, selectedWalletRef]);

  const activeWalletName = useMemo(() => {
    if (selectedWalletRef === 'ALL') return "(All Wallets)";
    const found = wallets.find((w) => w.walletReference === selectedWalletRef);
    return found ? `(${found.lightning.name})` : "";
  }, [wallets, selectedWalletRef]);

  const getInvoiceMeta = (invoice: Invoice) => {
    // First check if status is explicitly provided in the API response
    if (invoice.status) {
      if (invoice.status === 'EXPIRED') {
        return { 
          label: 'EXPIRED', 
          color: 'bg-red-50 text-red-700 border-red-100', 
          icon: Clock, 
          showPaid: false,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      }
      if (invoice.status === 'PAID') {
        return { 
          label: 'PAID', 
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
          icon: CheckCircle, 
          showPaid: true,
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200'
        };
      }
      if (invoice.status === 'PENDING') {
        return { 
          label: 'PENDING', 
          color: 'bg-yellow-50 text-yellow-700 border-yellow-100', 
          icon: Clock, 
          showPaid: false,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200'
        };
      }
    }
    
    // Fallback to checking dates if status is not provided
    const now = new Date();
    const expiry = new Date(invoice.expiresAt);
    if (expiry < now) {
      return { 
        label: 'EXPIRED', 
        color: 'bg-red-50 text-red-700 border-red-100', 
        icon: Clock, 
        showPaid: false,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    }
    if (invoice.paidAt) {
      return { 
        label: 'PAID', 
        color: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
        icon: CheckCircle, 
        showPaid: true,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200'
      };
    }

    return { 
      label: 'PENDING', 
      color: 'bg-yellow-50 text-yellow-700 border-yellow-100', 
      icon: Clock, 
      showPaid: false,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200'
    };
  };

  // Filter invoices based on status and search query
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;
    
    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(invoice => 
        invoice.paymentHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.amountSats.toString().includes(searchQuery)
      );
    }
    
    return filtered;
  }, [invoices, statusFilter, searchQuery]);

  // --- HANDLERS ---

  const toggleWallets = () => setWalletsExpanded(!walletsExpanded);

  const selectWallet = (ref: string | 'ALL') => {
    setSelectedWalletRef(ref);
    setWalletsExpanded(false);
    if (typeof window !== 'undefined') {
        localStorage.setItem('selectedWalletRef', ref);
    }
  };

  const copyHash = async () => {
    if (selectedInvoice?.paymentHash) {
      await navigator.clipboard.writeText(selectedInvoice.paymentHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const copyWalletDetail = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setWalletDetailsCopied(field);
    setTimeout(() => setWalletDetailsCopied(null), 1500);
  };

  // --- EFFECTS ---

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

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const token = localStorage.getItem('token');
        const userReference = localStorage.getItem('userReference');
        if (!token || !userReference) return;

        const walletRes = await fetch(
          `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/wallets/${userReference}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const walletData = await walletRes.json();
        
        if (walletRes.ok && walletData.content) {
          setWallets(walletData.content);
          
          const storedRef = localStorage.getItem('selectedWalletRef');
          if (storedRef) {
             setSelectedWalletRef(storedRef);
          } else if (walletData.content.length > 0) {
             setSelectedWalletRef('ALL');
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

  useEffect(() => {
    const fetchInvoices = async () => {
      if (selectedWalletRef === 'ALL' || !wallets.length) {
        setInvoices([]);
        return;
      }

      const currentWallet = wallets.find(w => w.walletReference === selectedWalletRef);
      if (!currentWallet) return;

      setLoadingInvoices(true);
      try {
        const token = localStorage.getItem('token');
        const invoiceRes = await fetch(
          `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/api/v1/wallets/user-invoices/${currentWallet.walletReference}`,
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
  }, [selectedWalletRef, wallets]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedInvoice(null);
        setSelectedWalletDetails(null);
        setWalletsExpanded(false);
        setFilterExpanded(false);
      }
    };
    if (selectedInvoice || selectedWalletDetails || walletsExpanded || filterExpanded) {
      document.addEventListener('keydown', esc);
      return () => document.removeEventListener('keydown', esc);
    }
  }, [selectedInvoice, selectedWalletDetails, walletsExpanded, filterExpanded]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar 
        isAuthenticated={true}
        userName=''
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* WALLET SELECTOR */}
        <div className="relative z-30 mb-2 mt-14">
          <button
            onClick={toggleWallets}
            className="flex items-center justify-between w-full bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#191919] uppercase tracking-wider">My Wallets</span>
              <span className="text-sm font-medium text-emerald-600">
                {activeWalletName}
              </span>
            </div>
            <ChevronDown 
              size={20} 
              className={`text-gray-500 transition-transform duration-300 ${walletsExpanded ? 'rotate-90' : ''}`} 
            />
          </button>

          <div
            className={`absolute w-full bg-white rounded-xl shadow-lg overflow-hidden mt-1 transition-all duration-300 origin-top z-50 ${
              walletsExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {/* ALL WALLETS (Fixed Header) */}
            <div
              onClick={() => selectWallet('ALL')}
              className={`p-4 cursor-pointer flex justify-between items-center transition ${
                selectedWalletRef === 'ALL' ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Layers size={16} className="text-emerald-700" />
                </div>
                <span className="font-medium text-[#191919]">All Wallets</span>
              </div>
              <SatsAmount
                sats={wallets.reduce((s, w) => s + w.balanceSats, 0)}
                exchangeRate={exchangeRate}
                loadingRate={loadingRate}
                align="right"
                primaryClassName="text-sm font-semibold text-gray-700"
              />
            </div>

            {/* SCROLLABLE LIST */}
            <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
              {wallets.map((wallet) => (
                <div key={wallet.walletReference} className="p-4">
                  <div
                    onClick={() => selectWallet(wallet.walletReference)}
                    className={`cursor-pointer flex justify-between items-center rounded-lg p-2 mb-2 transition ${
                      selectedWalletRef === wallet.walletReference
                        ? 'bg-emerald-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">
                        {wallet.lightning.name}
                        <span className="text-gray-400 text-xs ml-1">({wallet.walletType})</span>
                      </p>
                      {selectedWalletRef === wallet.walletReference && (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    <SatsAmount
                      sats={wallet.balanceSats}
                      exchangeRate={exchangeRate}
                      loadingRate={loadingRate}
                      align="right"
                      primaryClassName="font-semibold text-sm text-gray-900"
                    />
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWalletDetails(wallet);
                      setWalletsExpanded(false);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition ml-2"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* CREATE NEW WALLET SECTION (Fixed Footer) */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 shrink-0">
               <Link 
                  href="/userdashboard/wallet/newwallet"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition shadow-sm"
               >
                  <Plus size={18} />
                  Create New Wallet
               </Link>
            </div>
          </div>
        </div>

        {/* Balance Hero */}
        {!loading ? (
          <div>
            <BalanceHero 
              btcAmount={formatBtc(walletData.balance)} 
              kshAmount={convertSatsToKes(walletData.balance).toLocaleString()} 
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
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
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
          <Link
            href={`/userdashboard/transactions${selectedWalletRef !== 'ALL' ? `?walletRef=${encodeURIComponent(selectedWalletRef)}` : ''}`}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-900 rounded-full flex items-center justify-center hover:bg-black transition shadow-md">
              <ListOrdered className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">Transactions</span>
          </Link>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Past Invoices</h2>
            {selectedWalletRef === 'ALL' && (
                <span className="text-sm font-normal text-gray-500">Select a wallet to view invoices</span>
            )}
            {selectedWalletRef !== 'ALL' && invoices.length > 0 && (
              <button
                onClick={() => setFilterExpanded(!filterExpanded)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                <Filter size={16} />
                Filter
              </button>
            )}
          </div>
          
          {/* Filter Panel */}
          {filterExpanded && selectedWalletRef !== 'ALL' && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by hash or amount"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {loading || loadingInvoices ? (
             <div className="space-y-4">
               {[1,2,3].map((i) => (
                 <div key={i} className="h-16 bg-gray-100 rounded-xl w-full animate-pulse"></div>
               ))}
             </div>
          ) : selectedWalletRef === 'ALL' ? (
            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
              <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Select a specific wallet above to view its transaction history.</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
              <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No invoices found.</p>
              {statusFilter !== 'ALL' || searchQuery && (
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Hash</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInvoices.map((invoice, index) => {
                      const meta = getInvoiceMeta(invoice);
                      return (
                        <tr 
                          key={index} 
                          onClick={() => setSelectedInvoice(invoice)}
                          className="hover:bg-gray-50 transition cursor-pointer"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.bgColor} ${meta.textColor}`}>
                              <meta.icon size={12} className="mr-1" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <SatsAmount
                              sats={invoice.amountSats}
                              exchangeRate={exchangeRate}
                              loadingRate={loadingRate}
                              primaryClassName="text-sm font-medium text-gray-900"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 truncate max-w-xs">
                              {invoice.paymentHash.substring(0, 20)}...
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(invoice.expiresAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(invoice.expiresAt).toLocaleTimeString()}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* WALLET DETAILS MODAL */}
      {selectedWalletDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedWalletDetails(null)}
          />
          <div className="relative bg-white rounded-xl p-6 w-[92%] max-w-md animate-scaleIn max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#191919]">Wallet Details</h3>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs ${
                  selectedWalletDetails.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedWalletDetails.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button onClick={() => setSelectedWalletDetails(null)}>
                <X />
              </button>
            </div>

            <div className="space-y-3 text-sm">
               <div className="flex gap-2 items-start justify-between">
                 <p className="font-medium text-gray-500">Wallet Name</p>
                 <span className="text-right font-semibold text-[#191919]">{selectedWalletDetails.lightning.name}</span>
               </div>
               <div className="flex gap-2 items-start justify-between">
                 <p className="font-medium text-gray-500">Type</p>
                 <span className="bg-gray-100 px-2 py-1 rounded text-xs text-[#191919]">{selectedWalletDetails.walletType}</span>
               </div>
               <div className="border-t border-gray-100 my-2"></div>
               <div className="flex gap-2 items-start justify-between">
                 <p className="font-medium text-gray-500">Balance</p>
                 <SatsAmount
                   sats={selectedWalletDetails.balanceSats}
                   exchangeRate={exchangeRate}
                   loadingRate={loadingRate}
                   align="right"
                   primaryClassName="font-bold text-emerald-600"
                 />
               </div>
               <div className="flex gap-2 items-start justify-between">
                 <p className="font-medium text-gray-500">Reference</p>
                 <button onClick={() => copyWalletDetail(selectedWalletDetails.walletReference, 'ref')} className="flex items-center gap-1 text-blue-600 text-xs">
                    {selectedWalletDetails.walletReference.substring(0,8)}... {walletDetailsCopied === 'ref' ? <Check size={12}/> : <Copy size={12}/>}
                 </button>
               </div>
               
               <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-4">
                 <p className="text-xs font-bold text-amber-800 uppercase mb-2">Technical Details</p>
                 
                 <div className="mb-2">
                    <p className="text-[10px] text-amber-600 uppercase font-bold">Admin Key</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono truncate w-4/5 text-gray-700 bg-white/50 px-1 rounded">{selectedWalletDetails.lightning.adminkey}</p>
                      <Copy size={14} className="cursor-pointer text-amber-700 shrink-0" onClick={() => copyWalletDetail(selectedWalletDetails.lightning.adminkey, 'admin')} />
                    </div>
                 </div>

                 <div className="mb-2">
                    <p className="text-[10px] text-amber-600 uppercase font-bold">In Key</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono truncate w-4/5 text-gray-700 bg-white/50 px-1 rounded">{selectedWalletDetails.lightning.inkey}</p>
                      <Copy size={14} className="cursor-pointer text-amber-700 shrink-0" onClick={() => copyWalletDetail(selectedWalletDetails.lightning.inkey, 'inkey')} />
                    </div>
                 </div>
                 
                 <div>
                    <p className="text-[10px] text-amber-600 uppercase font-bold">Lightning ID</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono truncate w-4/5 text-gray-700 bg-white/50 px-1 rounded">{selectedWalletDetails.lightning.id}</p>
                      <Copy size={14} className="cursor-pointer text-amber-700 shrink-0" onClick={() => copyWalletDetail(selectedWalletDetails.lightning.id, 'id')} />
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE DETAILS MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedInvoice(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scaleIn z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Invoice Details</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                  <img src={selectedInvoice.qrCode} alt="Invoice QR" className="w-48 h-48 object-contain mix-blend-multiply" />
                </div>
                {(() => {
                  const meta = getInvoiceMeta(selectedInvoice);
                  return (
                    <div className={`absolute -bottom-2 -right-2 ${meta.bgColor} ${meta.textColor} px-3 py-1.5 rounded-full text-xs font-bold border ${meta.borderColor} shadow-sm flex items-center gap-1.5`}>
                      <meta.icon size={12} />
                      {meta.label}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-4">
              <SatsAmount
                sats={selectedInvoice.amountSats}
                exchangeRate={exchangeRate}
                loadingRate={loadingRate}
                align="center"
                primaryClassName="text-3xl font-extrabold text-gray-900 mb-1"
                detailClassName="text-sm text-gray-500"
              />

              <div className="flex justify-center items-center gap-2">
                 <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Transaction Fee</span>
                 <SatsAmount
                   sats={selectedInvoice.amountFees}
                   exchangeRate={exchangeRate}
                   loadingRate={loadingRate}
                   align="right"
                   primaryClassName="text-sm font-medium text-gray-700"
                 />
              </div>

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
