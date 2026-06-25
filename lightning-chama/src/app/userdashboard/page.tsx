'use client';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Users, Check, Copy, X, Eye, Send, Download, HandCoins, ChevronDown, Wallet } from 'lucide-react';
import BalanceHero from '@/components/BalanceHero';
import { Navbar } from '@/components/Navbar';
import SatsAmount from '@/components/SatsAmount';
import Image from 'next/image';
import Link from "next/link";
import chama0 from '@/assets/chama0.svg';
import chama1 from '@/assets/chama1.svg';
import chama2 from '@/assets/chama2.svg';
import chama3 from '@/assets/chama3.svg';

type OnRampResponse = {
  message?: string;
  status?: string;
  data?: {
    transaction_code?: string;
    status?: string;
    message?: string;
    invoice_amount_sats?: number;
    kes_amount?: number;
    sats_to_send?: number;
  };
};

type WithdrawResponse = {
  transactionReference?: string;
  type?: string;
  amountSats?: number;
  feeSats?: number;
  externalRef?: string;
  memo?: string;
  occurredAt?: string;
  createdAt?: string;
  metadata?: {
    feeSats?: string;
    paymentHash?: string;
  };
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
  status?: number;
  timestamp?: string;
};

// Main Dashboard Component
export default function Dashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activityError, setActivityError] = useState('');

  const [chamas, setChamas] = useState<any[]>([]);
  const [loadingChamas, setLoadingChamas] = useState(true);
  const [chamaError, setChamaError] = useState('');

  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [onRampOpen, setOnRampOpen] = useState(false);
  const [onRampLoading, setOnRampLoading] = useState(false);
  const [onRampError, setOnRampError] = useState('');
  const [onRampResult, setOnRampResult] = useState<OnRampResponse | null>(null);
  const [onRampForm, setOnRampForm] = useState({
    phoneNumber: '',
    walletId: '',
    amountSats: '',
  });
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawResult, setWithdrawResult] = useState<WithdrawResponse | null>(null);
  const [withdrawForm, setWithdrawForm] = useState({
    recipientMsisdn: '',
    walletId: '',
    amountSats: '',
  });

  const [wallets, setWallets] = useState<any[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [walletError, setWalletError] = useState('');

  const [walletsExpanded, setWalletsExpanded] = useState(false);
  const [selectedWalletRef, setSelectedWalletRef] = useState<string | 'ALL'>('ALL');
  const [onRampWalletOpen, setOnRampWalletOpen] = useState(false);
  const [withdrawWalletOpen, setWithdrawWalletOpen] = useState(false);
  
  // New state for wallet details modal
  const [selectedWalletDetails, setSelectedWalletDetails] = useState<any | null>(null);
  const [walletDetailsCopied, setWalletDetailsCopied] = useState('');
  
  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  
  // Cache the rate for 5 minutes (300,000 milliseconds)
  const CACHE_DURATION_MS = 5 * 60 * 1000;
  const SATS_PER_BTC = 100_000_000;

  const fetchWallets = async () => {
    try {
      setLoadingWallets(true);
      setWalletError('');
      const token = localStorage.getItem('token');
      const ownerRef = localStorage.getItem('userReference'); // IMPORTANT

      if (!token || !ownerRef) {
        setWalletError('Not authenticated');
        return [];
      }

      const res = await fetch(
        `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/wallets/${ownerRef}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('Failed to fetch wallets');

      const data = await res.json();
      const fetchedWallets = data.content || [];
      setWallets(fetchedWallets);
      localStorage.setItem('wallets', JSON.stringify(fetchedWallets));
      return fetchedWallets;
    } catch (e) {
      setWalletError('Unable to load wallets');
      return [];
    } finally {
      setLoadingWallets(false);
    }
  };

  // Fetch exchange rate with caching
  useEffect(() => {
    const fetchExchangeRate = async () => {
      // Check if we have a recently cached rate
      if (lastFetched && Date.now() - lastFetched < CACHE_DURATION_MS) {
        console.log("Using cached exchange rate.");
        setLoadingRate(false);
        return;
      }

      try {
        setLoadingRate(true);
        console.log("Fetching new exchange rate from CoinGecko...");
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=kes"
        );
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        if (data.bitcoin && data.bitcoin.kes) {
          setExchangeRate(data.bitcoin.kes);
          setLastFetched(Date.now());
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        // Fallback to a default rate if API fails and no rate exists
        if (!exchangeRate) {
          setExchangeRate(11500000); // Fallback rate
        }
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const fetchChamas = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setChamaError('Not authenticated');
          return;
        }

        const res = await fetch(
          'https://dada-devs-labs-dada-lab2-chamavault.onrender.com/chama',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error('Failed to fetch chamas');
        }

        const data = await res.json();
        setChamas(data.content || []);
      } catch (err) {
        setChamaError('Unable to load chamas');
      } finally {
        setLoadingChamas(false);
      }
    };

    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        const msisdn = localStorage.getItem('msisdn');

        if (!token || !msisdn) {
          setActivityError('Not authenticated');
          return;
        }

        const res = await fetch(
          `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/users/${msisdn}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error('Failed to fetch activities');
        }

        
        const data = await res.json();

        // Sort newest first
        const sortedActions = (data.actions || []).sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        setActivities(sortedActions);
      } catch (err) {
        setActivityError('Unable to load activities');
      } finally {
        setLoadingActivities(false);
      }
    };

    const storedWallet = localStorage.getItem('selectedWalletRef');
    if (storedWallet) setSelectedWalletRef(storedWallet);

    fetchChamas();
    fetchActivities();
    fetchWallets();
  }, []);

  /* =========================
     ESC KEY SUPPORT
  ========================== */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAction(null);
        setSelectedWalletDetails(null);
        setOnRampOpen(false);
        setWithdrawOpen(false);
      }
    };
    if (selectedAction || selectedWalletDetails || onRampOpen || withdrawOpen) document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [selectedAction, selectedWalletDetails, onRampOpen, withdrawOpen]);

  /* =========================
     HELPERS
  ========================== */
  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    );
    const map: any = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
    for (const k in map) {
      const v = Math.floor(seconds / map[k]);
      if (v >= 1) return `${v} ${k}${v > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  };

  const satsFromMsat = (msat?: string) =>
    msat ? Math.floor(Number(msat) / 1000) : 0;

  const selectedWalletBalance = selectedWalletRef === 'ALL'
    ? wallets.reduce((sum, w) => sum + (w.balanceSats || 0), 0)
    : wallets.find(w => w.walletReference === selectedWalletRef)?.balanceSats || 0;
  const onRampSucceeded = Boolean(onRampResult && onRampResult.data?.status !== 'FAILED');
  const withdrawSucceeded = Boolean(withdrawResult?.transactionReference);

  // Convert Satoshis to KES using the exchange rate
  const convertSatsToKes = (sats: number): number => {
    if (!exchangeRate) return 0;
    const btcAmount = sats / SATS_PER_BTC; // Convert satoshis to BTC
    return btcAmount * exchangeRate; // Convert BTC to KES
  };

  const timesAgo = (date: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    );

    const intervals: any = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const key in intervals) {
      const value = Math.floor(seconds / intervals[key]);
      if (value >= 1) {
        return `${value} ${key}${value > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  };

  const activityMeta = (activity: string) => {
    switch (activity) {
      case 'CREATED':
      case 'USER_REQUEST_ACCEPTED':
        return { icon: ArrowUpRight, color: 'bg-emerald-500' };

      case 'WAITING':
        return { icon: RefreshCw, color: 'bg-yellow-500' };

      case 'USER_REQUEST_REJECTED':
        return { icon: ArrowDownLeft, color: 'bg-red-500' };

      default:
        return { icon: Users, color: 'bg-orange-500' };
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-700';
      case 'USER_REQUEST_ACCEPTED':
      case 'CREATED':
      case 'STARTED':
        return 'bg-emerald-100 text-emerald-700';
      case 'USER_REQUEST_REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const copyComment = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // New function to copy wallet details
  const copyWalletDetail = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setWalletDetailsCopied(field);
    setTimeout(() => setWalletDetailsCopied(''), 1500);
  };

  const getPreferredOnRampWallet = (availableWallets = wallets) => {
    if (selectedWalletRef !== 'ALL') {
      return availableWallets.find((wallet) => wallet.walletReference === selectedWalletRef);
    }
    return availableWallets[0];
  };

  const openOnRamp = async () => {
    const availableWallets = wallets.length > 0 ? wallets : await fetchWallets();
    const preferredWallet = getPreferredOnRampWallet(availableWallets);
    setOnRampError('');
    setOnRampResult(null);
    setOnRampForm({
      phoneNumber: localStorage.getItem('msisdn') || '',
      walletId: preferredWallet?.walletReference || '',
      amountSats: '',
    });
    setOnRampOpen(true);
  };

  const openWithdraw = async () => {
    const availableWallets = wallets.length > 0 ? wallets : await fetchWallets();
    const preferredWallet = getPreferredOnRampWallet(availableWallets);
    setWithdrawError('');
    setWithdrawResult(null);
    setWithdrawForm({
      recipientMsisdn: localStorage.getItem('msisdn') || '',
      walletId: preferredWallet?.walletReference || '',
      amountSats: '',
    });
    setWithdrawOpen(true);
  };

  const normalizeMsisdn = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
    if (digits.startsWith('7') && digits.length === 9) return `254${digits}`;
    if (digits.startsWith('1') && digits.length === 9) return `254${digits}`;
    return digits;
  };

  const extractOnRampError = (data: ApiErrorResponse | null, fallback: string) => {
    if (!data) return fallback;

    if (typeof data.message === 'string') {
      const jsonStart = data.message.indexOf('{');
      const jsonEnd = data.message.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        try {
          const nested = JSON.parse(data.message.slice(jsonStart, jsonEnd + 1)) as ApiErrorResponse;
          return nested.message || data.message;
        } catch {
          return data.message;
        }
      }

      return data.message;
    }

    return data.error || fallback;
  };

  const handleOnRampSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (onRampSucceeded) return;

    setOnRampError('');
    setOnRampResult(null);

    const amount = Number(onRampForm.amountSats);

    if (!onRampForm.phoneNumber.trim()) {
      setOnRampError('Phone number is required.');
      return;
    }

    if (!onRampForm.walletId) {
      setOnRampError('Select a wallet to fund.');
      return;
    }

    if (!Number.isFinite(amount) || amount < 10) {
      setOnRampError('Amount must be at least 10 sats.');
      return;
    }

    try {
      setOnRampLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setOnRampError('Not authenticated');
        return;
      }

      const response = await fetch(
        'https://dada-devs-labs-dada-lab2-chamavault.onrender.com/api/v1/payments/collections/fund-wallet/mpesa',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phoneNumber: onRampForm.phoneNumber.replace(/\s+/g, ''),
            walletId: onRampForm.walletId,
            amountSats: onRampForm.amountSats,
          }),
        }
      );

      const data = await response.json().catch(() => null) as OnRampResponse | ApiErrorResponse | null;

      if (!response.ok) {
        setOnRampError(extractOnRampError(data as ApiErrorResponse | null, 'Unable to start deposit request.'));
        return;
      }

      setOnRampResult(data as OnRampResponse);
    } catch {
      setOnRampError('Failed to connect to server. Try again.');
    } finally {
      setOnRampLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (withdrawSucceeded) return;

    setWithdrawError('');
    setWithdrawResult(null);

    const amount = Number(withdrawForm.amountSats);
    const selectedWallet = wallets.find((wallet) => wallet.walletReference === withdrawForm.walletId);
    const recipientMsisdn = normalizeMsisdn(withdrawForm.recipientMsisdn);

    if (!recipientMsisdn) {
      setWithdrawError('Recipient phone number is required.');
      return;
    }

    if (!withdrawForm.walletId) {
      setWithdrawError('Select a wallet to withdraw from.');
      return;
    }

    if (!Number.isFinite(amount) || amount < 1) {
      setWithdrawError('Amount must be at least 1 sat.');
      return;
    }

    if (selectedWallet && amount > selectedWallet.balanceSats) {
      setWithdrawError('Amount cannot be more than the selected wallet balance.');
      return;
    }

    try {
      setWithdrawLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setWithdrawError('Not authenticated');
        return;
      }

      const response = await fetch(
        'https://dada-devs-labs-dada-lab2-chamavault.onrender.com/transactions/transfer-to-mpesa',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipientMsisdn,
            amountInMilliSats: Math.round(amount * 1000),
            payerWalletId: withdrawForm.walletId,
          }),
        }
      );

      const data = await response.json().catch(() => null) as WithdrawResponse | ApiErrorResponse | null;

      if (!response.ok) {
        setWithdrawError(extractOnRampError(data as ApiErrorResponse | null, 'Unable to start withdrawal request.'));
        return;
      }

      setWithdrawResult(data as WithdrawResponse);
      await fetchWallets();
    } catch {
      setWithdrawError('Failed to connect to server. Try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const getCTA = (a: any) => {
    if (a.activity === 'WAITING')
      return { label: 'View Request', href: '/userdashboard/chama' };
    if (a.activity === 'STARTED')
      return { label: 'Make Contribution', href: '/userdashboard/chama' };
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        isAuthenticated={true}
        userName=''
      />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Wallets */}
        <div className="mt-13 -mb-18 relative text-[#191919]">
          <button
            onClick={() => setWalletsExpanded(!walletsExpanded)}
            className="flex items-center justify-between w-full mb-3 bg-white px-4 py-2 rounded-xl shadow hover:bg-gray-50 transition"
          >
            <h2 className="text-sm font-semibold">My Wallets</h2>
            <span
              className={`text-xl transition-transform duration-300 ${
                walletsExpanded ? 'rotate-90' : ''
              }`}
            >
              ›
            </span>
          </button>

          {/* Dropdown */}
          <div
            className={`absolute w-full bg-white rounded-xl shadow-sm divide-y overflow-y-auto transition-all duration-300
              ${walletsExpanded ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'} z-50`}
          >
            {/* ALL WALLETS */}
            <div
              onClick={() => {
                setSelectedWalletRef('ALL');
                localStorage.setItem('selectedWalletRef', 'ALL');
                setWalletsExpanded(false);
              }}
              className={`p-4 cursor-pointer flex justify-between items-center
                ${selectedWalletRef === 'ALL' ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
            >
              <span className="font-medium">All Wallets</span>
              <SatsAmount
                sats={wallets.reduce((s, w) => s + w.balanceSats, 0)}
                exchangeRate={exchangeRate}
                loadingRate={loadingRate}
                align="right"
                primaryClassName="font-semibold text-sm text-gray-700"
              />
            </div>

            {/* INDIVIDUAL WALLETS */}
            {wallets.map(wallet => (
              <div key={wallet.walletReference} className="p-4">
                <div
                  onClick={() => {
                    setSelectedWalletRef(wallet.walletReference);
                    localStorage.setItem('selectedWalletRef', wallet.walletReference);
                    setWalletsExpanded(false);
                  }}
                  className={`cursor-pointer flex justify-between items-center
                    ${selectedWalletRef === wallet.walletReference
                      ? 'bg-emerald-50'
                      : 'hover:bg-gray-50'} rounded-lg p-2 mb-2`}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {wallet.lightning?.name || wallet.walletType}
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
                
                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWalletDetails(wallet);
                    setWalletsExpanded(false);
                  }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition"
                >
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Hero Section */}
        <BalanceHero 
          btcAmount={(selectedWalletBalance / 100_000_000).toFixed(6)} 
          kshAmount={convertSatsToKes(selectedWalletBalance).toFixed(2)}  
          className="mb-6"
        />
        
        {/* Exchange rate info */}
        {exchangeRate && (
          <div className="text-xs text-gray-500 mb-4 text-center">
            Exchange rate: 1 BTC ≈ {exchangeRate.toLocaleString()} KES
            {lastFetched && (
              <span className="block">
                (Rate updated {Math.round((Date.now() - lastFetched) / 60000)} mins ago)
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-8">
          <Link href="/userdashboard/wallet" className="block">
            <button className="h-24 sm:h-28 w-full bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center justify-center gap-2">
              <span className="flex h-9 w-16 items-center justify-center">
                <Send className="h-7 w-7 text-emerald-600" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Send</span>
            </button>
          </Link>
          <Link href="/userdashboard/wallet" className="block">
            <button className="h-24 sm:h-28 w-full bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center justify-center gap-2">
              <span className="flex h-9 w-16 items-center justify-center">
                <Download className="h-7 w-7 text-emerald-600" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Receive</span>
            </button>
          </Link>
          <Link href="/userdashboard/contribute" className="block">
            <button className="h-24 sm:h-28 w-full bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center justify-center gap-2">
              <span className="flex h-9 w-16 items-center justify-center">
                <HandCoins className="h-7 w-7 text-emerald-600" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Contribute</span>
            </button>
          </Link>
          <Link href="/userdashboard/chama" className="block">
            <button className="h-24 sm:h-28 w-full bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center justify-center gap-2">
              <span className="flex h-9 w-16 items-center justify-center">
                <Users className="h-7 w-7 text-emerald-600" />
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">My Chama</span>
            </button>
          </Link>
          <button
            type="button"
            onClick={openOnRamp}
            disabled={loadingWallets}
            className="h-24 sm:h-28 w-full bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="flex h-9 w-16 items-center justify-center">
              <ArrowDownLeft className="h-7 w-7 text-emerald-600" />
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-900">
              {loadingWallets ? 'Loading' : 'Deposit'}
            </span>
          </button>
          <button
            type="button"
            onClick={openWithdraw}
            disabled={loadingWallets}
            className="h-24 sm:h-28 w-full bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="flex h-9 w-16 items-center justify-center">
              <ArrowUpRight className="h-7 w-7 text-emerald-600" />
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-900">
              {loadingWallets ? 'Loading' : 'Withdraw'}
            </span>
          </button>
        </div>
        
        {/* Featured Chamas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xm font-semibold text-[#191919]">
              Featured Chamas
            </h2>
            <Link href="/userdashboard/chama/discover">
              <button className="text-[#3B82F6] text-sm font-medium hover:text-emerald-700">
                View more
              </button>
            </Link>
          </div>

          {loadingChamas && (
            <p className="text-sm text-gray-500">Loading chamas...</p>
          )}

          {chamaError && (
            <p className="text-sm text-red-600">{chamaError}</p>
          )}

          {!loadingChamas && !chamaError && (
            <div className="grid grid-cols-4 gap-4 md:gap-6">
              {chamas.slice(0, 4).map((chama) => (
                <Link
                  key={chama.chamaReference}
                  href={`/userdashboard/contribute/${chama.chamaReference}`}
                >
                  <div className="flex flex-col items-center gap-2 cursor-pointer">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shadow-sm hover:scale-105 transition">
                      <img
                        src={chama.iconUrl || '/placeholder.png'}
                        alt={chama.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs md:text-sm text-gray-700 text-center">
                      {chama.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xm font-semibold text-[#191919]">
              Recent Activities
            </h2>
            <button className="text-[#3B82F6] text-sm font-medium hover:text-emerald-700">
              See all 
            </button>
          </div>

          {loadingActivities && (
            <p className="text-sm text-gray-500">Loading activities...</p>
          )}

          {activityError && (
            <p className="text-sm text-red-600">{activityError}</p>
          )}

          {!loadingActivities && !activityError && (
            <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
              {activities.slice(0, 5).map((item, index) => {
                const { icon: Icon, color } = activityMeta(item.activity);

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedAction(item)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
                  >
                    <div
                      className={`w-10 h-10 ${color} rounded-full flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-medium text-gray-900">
                        {item.action}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ================= ACTIVITY MODAL ================= */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-[#191919]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedAction(null)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Activity Details</h3>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs ${statusBadge(selectedAction.activity)}`}>
                  {selectedAction.activity}
                </span>
              </div>
              <button onClick={() => setSelectedAction(null)}>
                <X />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p><strong>Action:</strong> {selectedAction.action}</p>
              <p><strong>Description:</strong> {selectedAction.description}</p>
              <p><strong>Reason:</strong> {selectedAction.reason}</p>

              <div className="flex gap-2 items-start">
                <p className="flex-1"><strong>Comment:</strong> {selectedAction.comment}</p>
                <button onClick={() => copyComment(selectedAction.comment)}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <p><strong>Deadline:</strong> {new Date(selectedAction.deadline).toLocaleString()}</p>
            </div>

            {getCTA(selectedAction) && (
              <Link
                href={getCTA(selectedAction)!.href}
                className="block mt-6 text-center bg-emerald-600 text-white py-2 rounded-lg"
              >
                {getCTA(selectedAction)!.label}
              </Link>
            )}

            <button
              onClick={() => setSelectedAction(null)}
              className="mt-3 w-full border rounded-lg py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= ON RAMP MODAL ================= */}
      {onRampOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-[#191919]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => !onRampLoading && setOnRampOpen(false)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Deposit</h3>
                <p className="text-sm text-gray-500">Fund your wallet through M-Pesa.</p>
              </div>
              <button
                onClick={() => setOnRampOpen(false)}
                disabled={onRampLoading}
                className="disabled:opacity-50"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleOnRampSubmit} className="space-y-4">
              <div>
                <label htmlFor="onRampPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="onRampPhoneNumber"
                  type="tel"
                  value={onRampForm.phoneNumber}
                  onChange={(e) => setOnRampForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  disabled={onRampSucceeded}
                  placeholder="0115000725"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={onRampSucceeded}
                    onClick={() => setOnRampWalletOpen((o) => !o)}
                    className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition"
                  >
                    {loadingWallets ? (
                      <span className="text-gray-400">Loading wallets…</span>
                    ) : onRampForm.walletId ? (
                      (() => {
                        const w = wallets.find((x) => x.walletReference === onRampForm.walletId);
                        return w ? (
                          <span className="flex items-center gap-2 min-w-0">
                            <Wallet size={14} className="text-emerald-600 shrink-0" />
                            <span className="font-medium truncate">{w.lightning?.name || w.walletType}</span>
                            <span className="text-gray-400 shrink-0">{w.balanceSats.toLocaleString()} sats</span>
                          </span>
                        ) : <span className="text-gray-400">Select wallet</span>;
                      })()
                    ) : (
                      <span className="text-gray-400">{walletError || 'Select wallet'}</span>
                    )}
                    <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${onRampWalletOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {onRampWalletOpen && !onRampSucceeded && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {loadingWallets ? (
                        <p className="px-4 py-3 text-sm text-gray-400">Loading wallets…</p>
                      ) : walletError ? (
                        <p className="px-4 py-3 text-sm text-red-500">{walletError}</p>
                      ) : wallets.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">No wallets found</p>
                      ) : (
                        <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100">
                          {wallets.map((wallet) => {
                            const isSelected = onRampForm.walletId === wallet.walletReference;
                            return (
                              <li key={wallet.walletReference}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOnRampForm((prev) => ({ ...prev, walletId: wallet.walletReference }));
                                    setOnRampWalletOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition ${isSelected ? 'bg-emerald-50' : ''}`}
                                >
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${isSelected ? 'bg-emerald-600' : 'bg-gray-100'}`}>
                                    <Wallet size={14} className={isSelected ? 'text-white' : 'text-gray-500'} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{wallet.lightning?.name || wallet.walletType}</p>
                                    <p className="text-xs text-gray-500">{wallet.balanceSats.toLocaleString()} sats{exchangeRate ? ` · KES ${convertSatsToKes(wallet.balanceSats).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}</p>
                                  </div>
                                  {isSelected && <Check size={14} className="text-emerald-600 shrink-0" />}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="onRampAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (sats)
                </label>
                <input
                  id="onRampAmount"
                  type="number"
                  min="10"
                  value={onRampForm.amountSats}
                  onChange={(e) => setOnRampForm((prev) => ({ ...prev, amountSats: e.target.value }))}
                  disabled={onRampSucceeded}
                  placeholder="100"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
                />
                {Number(onRampForm.amountSats) > 0 && (
                  <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2">
                    <SatsAmount
                      sats={Number(onRampForm.amountSats)}
                      exchangeRate={exchangeRate}
                      loadingRate={loadingRate}
                      primaryClassName="font-semibold text-sm text-gray-700"
                    />
                  </div>
                )}
              </div>

              {onRampError && (
                <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                  {onRampError}
                </p>
              )}

              {onRampResult && (
                <div className={`rounded-lg border px-3 py-3 text-sm space-y-1 ${
                  onRampResult.data?.status === 'FAILED'
                    ? 'bg-yellow-50 border-yellow-100 text-yellow-800'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                }`}>
                  <p className="font-semibold">{onRampResult.message || 'Request successfully dispatched'}</p>
                  {onRampResult.data && (
                    <>
                      <p>Status: {onRampResult.data.status}</p>
                      <p>{onRampResult.data.message}</p>
                      {typeof onRampResult.data.invoice_amount_sats === 'number' && (
                        <div>
                          <p className="font-semibold">Amount</p>
                          <SatsAmount
                            sats={onRampResult.data.invoice_amount_sats}
                            exchangeRate={exchangeRate}
                            loadingRate={loadingRate}
                            primaryClassName="font-semibold text-sm text-emerald-900"
                            detailClassName="text-xs text-emerald-700"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={onRampLoading || onRampSucceeded}
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2.5 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {onRampLoading ? 'Sending request...' : onRampSucceeded ? 'Deposit request sent' : 'Start Deposit'}
              </button>
              {onRampSucceeded && (
                <button
                  type="button"
                  onClick={() => setOnRampOpen(false)}
                  className="w-full rounded-lg border border-emerald-200 bg-white py-2.5 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                >
                  Done
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ================= WITHDRAW MODAL ================= */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-[#191919]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => !withdrawLoading && setWithdrawOpen(false)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Withdraw</h3>
                <p className="text-sm text-gray-500">Send funds from your wallet to M-Pesa.</p>
              </div>
              <button
                onClick={() => setWithdrawOpen(false)}
                disabled={withdrawLoading}
                className="disabled:opacity-50"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label htmlFor="withdrawRecipientMsisdn" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Phone Number
                </label>
                <input
                  id="withdrawRecipientMsisdn"
                  type="tel"
                  value={withdrawForm.recipientMsisdn}
                  onChange={(e) => setWithdrawForm((prev) => ({ ...prev, recipientMsisdn: e.target.value }))}
                  disabled={withdrawSucceeded}
                  placeholder="254115000725"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Withdraw From
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={withdrawSucceeded}
                    onClick={() => setWithdrawWalletOpen((o) => !o)}
                    className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 bg-white hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition"
                  >
                    {loadingWallets ? (
                      <span className="text-gray-400">Loading wallets…</span>
                    ) : withdrawForm.walletId ? (
                      (() => {
                        const w = wallets.find((x) => x.walletReference === withdrawForm.walletId);
                        return w ? (
                          <span className="flex items-center gap-2 min-w-0">
                            <Wallet size={14} className="text-emerald-600 shrink-0" />
                            <span className="font-medium truncate">{w.lightning?.name || w.walletType}</span>
                            <span className="text-gray-400 shrink-0">{w.balanceSats.toLocaleString()} sats</span>
                          </span>
                        ) : <span className="text-gray-400">Select wallet</span>;
                      })()
                    ) : (
                      <span className="text-gray-400">{walletError || 'Select wallet'}</span>
                    )}
                    <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${withdrawWalletOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {withdrawWalletOpen && !withdrawSucceeded && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {loadingWallets ? (
                        <p className="px-4 py-3 text-sm text-gray-400">Loading wallets…</p>
                      ) : walletError ? (
                        <p className="px-4 py-3 text-sm text-red-500">{walletError}</p>
                      ) : wallets.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">No wallets found</p>
                      ) : (
                        <ul className="max-h-56 overflow-y-auto divide-y divide-gray-100">
                          {wallets.map((wallet) => {
                            const isSelected = withdrawForm.walletId === wallet.walletReference;
                            return (
                              <li key={wallet.walletReference}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setWithdrawForm((prev) => ({ ...prev, walletId: wallet.walletReference }));
                                    setWithdrawWalletOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 transition ${isSelected ? 'bg-emerald-50' : ''}`}
                                >
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${isSelected ? 'bg-emerald-600' : 'bg-gray-100'}`}>
                                    <Wallet size={14} className={isSelected ? 'text-white' : 'text-gray-500'} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{wallet.lightning?.name || wallet.walletType}</p>
                                    <p className="text-xs text-gray-500">{wallet.balanceSats.toLocaleString()} sats{exchangeRate ? ` · KES ${convertSatsToKes(wallet.balanceSats).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}</p>
                                  </div>
                                  {isSelected && <Check size={14} className="text-emerald-600 shrink-0" />}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                {withdrawForm.walletId && (
                  <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">Available balance</p>
                    <SatsAmount
                      sats={wallets.find((wallet) => wallet.walletReference === withdrawForm.walletId)?.balanceSats || 0}
                      exchangeRate={exchangeRate}
                      loadingRate={loadingRate}
                      primaryClassName="font-semibold text-sm text-gray-700"
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (sats)
                </label>
                <input
                  id="withdrawAmount"
                  type="number"
                  min="1"
                  value={withdrawForm.amountSats}
                  onChange={(e) => setWithdrawForm((prev) => ({ ...prev, amountSats: e.target.value }))}
                  disabled={withdrawSucceeded}
                  placeholder="182"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
                />
                {Number(withdrawForm.amountSats) > 0 && (
                  <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2">
                    <SatsAmount
                      sats={Number(withdrawForm.amountSats)}
                      exchangeRate={exchangeRate}
                      loadingRate={loadingRate}
                      primaryClassName="font-semibold text-sm text-gray-700"
                    />
                  </div>
                )}
              </div>

              {withdrawError && (
                <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                  {withdrawError}
                </p>
              )}

              {withdrawResult && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-emerald-800 space-y-2">
                  <p className="font-semibold">Money successfully sent</p>
                  {withdrawResult.memo && <p>{withdrawResult.memo}</p>}
                  {typeof withdrawResult.amountSats === 'number' && (
                    <div>
                      <p className="font-semibold">Amount</p>
                      <SatsAmount
                        sats={withdrawResult.amountSats}
                        exchangeRate={exchangeRate}
                        loadingRate={loadingRate}
                        primaryClassName="font-semibold text-sm text-emerald-900"
                        detailClassName="text-xs text-emerald-700"
                      />
                    </div>
                  )}
                  {typeof withdrawResult.feeSats === 'number' && (
                    <div>
                      <p className="font-semibold">Fee</p>
                      <SatsAmount
                        sats={withdrawResult.feeSats}
                        exchangeRate={exchangeRate}
                        loadingRate={loadingRate}
                        primaryClassName="font-semibold text-sm text-emerald-900"
                        detailClassName="text-xs text-emerald-700"
                      />
                    </div>
                  )}
                  {withdrawResult.transactionReference && (
                    <p className="break-all text-xs text-emerald-700">
                      Ref: {withdrawResult.transactionReference}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={withdrawLoading || withdrawSucceeded}
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2.5 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {withdrawLoading ? 'Sending withdrawal...' : withdrawSucceeded ? 'Withdrawal successfully sent' : 'Start Withdrawal'}
              </button>
              {withdrawSucceeded && (
                <button
                  type="button"
                  onClick={() => setWithdrawOpen(false)}
                  className="w-full rounded-lg border border-emerald-200 bg-white py-2.5 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                >
                  Done
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ================= WALLET DETAILS MODAL ================= */}
      {selectedWalletDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-[#191919]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedWalletDetails(null)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Wallet Details</h3>
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
              <div className="flex gap-2 items-start">
                <p className="flex-1"><strong>Wallet Reference:</strong> {selectedWalletDetails.walletReference}</p>
                <button onClick={() => copyWalletDetail(selectedWalletDetails.walletReference, 'walletRef')}>
                  {walletDetailsCopied === 'walletRef' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              
              <p><strong>Wallet Type:</strong> {selectedWalletDetails.walletType}</p>
              <div>
                <p className="font-semibold">Balance:</p>
                <SatsAmount
                  sats={selectedWalletDetails.balanceSats}
                  exchangeRate={exchangeRate}
                  loadingRate={loadingRate}
                  primaryClassName="font-semibold text-sm text-gray-900"
                />
              </div>
              
              {selectedWalletDetails.lightning && (
                <>
                  <p><strong>Lightning Wallet Name:</strong> {selectedWalletDetails.lightning.name}</p>
                  
                  <div className="flex gap-2 items-start">
                    <p className="flex-1"><strong>Lightning ID:</strong> {selectedWalletDetails.lightning.id}</p>
                    <button onClick={() => copyWalletDetail(selectedWalletDetails.lightning.id, 'lightningId')}>
                      {walletDetailsCopied === 'lightningId' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <p className="flex-1"><strong>Inkey:</strong> {selectedWalletDetails.lightning.inkey}</p>
                    <button onClick={() => copyWalletDetail(selectedWalletDetails.lightning.inkey, 'inkey')}>
                      {walletDetailsCopied === 'inkey' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <p className="flex-1"><strong>Admin Key:</strong> {selectedWalletDetails.lightning.adminkey}</p>
                    <button onClick={() => copyWalletDetail(selectedWalletDetails.lightning.adminkey, 'adminkey')}>
                      {walletDetailsCopied === 'adminkey' ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  
                  <p><strong>Currency:</strong> {selectedWalletDetails.lightning.currency}</p>
                  <p><strong>Balance (msat):</strong> {selectedWalletDetails.lightning.balance_msat}</p>
                </>
              )}
              
              <p><strong>Created At:</strong> {new Date(selectedWalletDetails.createdAt).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {new Date(selectedWalletDetails.updatedAt).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setSelectedWalletDetails(null)}
              className="mt-6 w-full border rounded-lg py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
