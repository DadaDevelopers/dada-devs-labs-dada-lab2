'use client';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Users, Check, Copy, X, Eye } from 'lucide-react';
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
          <Link href="/userdashboard/wallet">
            <button className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2">
              <svg width="66" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.04175 21.25L21.9584 8.75M21.9584 8.75H9.04175M21.9584 8.75V21.25" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Send</span>
            </button>
          </Link>
          <Link href="/userdashboard/wallet">
            <button className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2">
              <svg width="66" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13.3333L12 20M12 20L5 13.3333M12 20L12 4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Receive</span>
            </button>
          </Link>
          <Link href="/userdashboard/contribute">
            <button className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2">
              <svg width="40" height="29" viewBox="0 0 40 29" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M38.0986 8.16406V19.5693L25.0781 24.0156L14.252 19.4648L14.1191 19.7773L13.5391 19.8643V23.8096L7.26953 27.6631L1 23.8086V16.042L4.42969 13.9336L4.59082 13.834L4.64648 13.6533L6.03613 9.0918L13.4277 1.91113L27.458 1.00977L38.0986 8.16406ZM14.5918 6.57031L7.82227 11.5264H6.19434L7.7002 12.4521L13.5391 16.041V17.5303L14.333 16.9521L15.8643 15.8379L24.1064 17.6396L24.501 17.7256L24.668 17.3594L27.2061 11.8066L27.3105 11.5771L27.1885 11.3574L24.6328 6.73145L24.4893 6.47363H14.7236L14.5918 6.57031Z" fill="white" stroke="#059669"/>
              <path d="M13.5391 23.809L7.26953 27.6625L1.4541 24.0873L13.5391 16.6556V23.809Z" fill="#BBD8FF" stroke="#059669"/>
              <path d="M8.98086 16.182H5.59734L4.75146 18.0315L5.59734 19.881H8.98086L9.82673 21.7305L8.98086 23.5818H5.59734M7.2891 16.182V15.2572M7.2891 24.5066V23.5818" stroke="#059669" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.0577 23.5818V24.0442L7.28902 28.2056L0.516918 24.0442L0.5 15.7621L7.26703 11.6007L11.8686 14.2788" stroke="#059669" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.98584 12.0169L14.8865 6.97327H24.1946L26.7508 11.5989L24.2132 17.1511L15.751 15.3016L13.2134 17.1511L14.0592 19.9254L25.059 24.551L38.5982 19.9272" stroke="#059669" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M38.5986 7.89803L27.5971 0.5L13.2121 1.42475L5.59581 8.82278L4.16797 13.5076" stroke="#059669" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-900">Contribute</span>
            </button>
          </Link>
          <Link href="/userdashboard/chama">
            <button className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2">
              <svg width="29" height="27" viewBox="0 0 29 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.735 10.1354C13.2399 10.1354 15.2705 7.97846 15.2705 5.31771C15.2705 2.65696 13.2399 0.5 10.735 0.5C8.23008 0.5 6.19946 2.65696 6.19946 5.31771C6.19946 7.97846 8.23008 10.1354 10.735 10.1354Z" stroke="#059669" strokeLinecap="round"/>
              <path d="M17.5706 6.28126C17.8071 5.83939 18.1236 5.45159 18.5018 5.14016C18.8799 4.82874 19.3124 4.59985 19.7742 4.46668C20.236 4.3335 20.718 4.29867 21.1925 4.36418C21.6671 4.4297 22.1247 4.59427 22.5391 4.84842C22.9535 5.10257 23.3165 5.44128 23.6072 5.84504C23.8978 6.24881 24.1104 6.70966 24.2327 7.20107C24.3551 7.69247 24.3846 8.20472 24.3198 8.70832C24.255 9.21192 24.097 9.69693 23.855 10.1354C23.3705 11.0134 22.5786 11.6522 21.6523 11.9123C20.726 12.1725 19.7404 12.0329 18.9106 11.524C18.0808 11.0151 17.4742 10.1782 17.2232 9.19603C16.9722 8.21382 17.097 7.16601 17.5706 6.28126Z" stroke="#059669"/>
              <path d="M18.3984 25.0885V26.0153H3.07129V25.0885H18.3984ZM1.36328 24.2194C1.46139 24.5575 1.70983 24.8504 2.07129 24.9938V25.9498C1.24711 25.7399 0.573919 25.0257 0.505859 24.0739L1.36328 24.2194ZM20.9629 24.0739C20.8941 25.0259 20.2219 25.7398 19.3984 25.9498V24.9938C19.7596 24.8504 20.0063 24.5573 20.1045 24.2194L20.9629 24.0739ZM10.2344 14.4635C6.94337 14.5994 4.8723 16.0756 3.55371 17.8776C2.29373 19.5989 1.69698 21.6514 1.41406 23.2135L0.608398 23.0758C0.903126 21.4213 1.54055 19.1836 2.92773 17.2848L2.92676 17.2838C4.40402 15.267 6.70194 13.6734 10.2344 13.5358V14.4635ZM11.2344 13.5358C14.7675 13.6732 17.0647 15.2679 18.542 17.2867V17.2877C19.9302 19.1842 20.5648 21.4223 20.8594 23.0758L20.0547 23.2135C19.7718 21.6501 19.176 19.5989 17.916 17.8776C16.5956 16.0736 14.5257 14.5991 11.2344 14.4635V13.5358Z" fill="#090909" stroke="#059669"/>
              <path d="M25.4651 25.0889V26.0156H21.1565C21.4024 25.7487 21.6029 25.4366 21.7434 25.0889H25.4651ZM28.0579 23.8594C28.0704 24.8982 27.3614 25.7218 26.4651 25.9502V24.9961C26.8784 24.8345 27.1422 24.478 27.2161 24.083L28.0579 23.8594ZM20.6155 25.0889C20.3281 25.5188 19.8911 25.8236 19.3987 25.9492V25.0889H20.6155ZM20.9602 24.0889H20.8762L20.9622 24.0732C20.9618 24.0785 20.9606 24.0836 20.9602 24.0889ZM18.886 17.7871C20.0384 19.569 20.5923 21.5666 20.8616 23.0762L20.0559 23.2129C19.7915 21.7536 19.2511 19.8719 18.1584 18.2295L18.3938 18.0713C18.5498 17.9663 18.7138 17.8713 18.886 17.7871ZM21.2131 15.4736C23.3163 15.6382 24.8273 16.8345 25.8889 18.3369V18.3359C26.9028 19.7735 27.5135 21.4914 27.8762 22.873L27.0823 23.084C26.7356 21.7799 26.168 20.2077 25.2542 18.917H25.2532C24.3164 17.5907 23.022 16.5648 21.2131 16.4043V15.4736ZM18.2581 16.916C18.2716 16.9328 18.2847 16.9499 18.2981 16.9668C18.2947 16.9686 18.2917 16.9709 18.2883 16.9727L18.2561 16.918L18.2581 16.916ZM17.0002 16.7676L16.9885 16.7793L16.9651 16.7529L16.9836 16.7402L17.0002 16.7676ZM20.2131 16.4023C19.8778 16.4321 19.5616 16.4939 19.262 16.5791C19.0732 16.3279 18.8724 16.0816 18.6575 15.8428L18.636 15.8184C19.122 15.6369 19.6467 15.517 20.2131 15.4727V16.4023Z" fill="#090909" stroke="#059669"/>
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-900">My Chama</span>
            </button>
          </Link>
          <button
            type="button"
            onClick={openOnRamp}
            disabled={loadingWallets}
            className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowDownLeft className="w-[66px] h-[30px] text-emerald-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-900">
              {loadingWallets ? 'Loading' : 'Deposit'}
            </span>
          </button>
          <button
            type="button"
            onClick={openWithdraw}
            disabled={loadingWallets}
            className="bg-white border-2 border-emerald-500 rounded-xl p-2 sm:p-3 hover:bg-emerald-50 transition flex flex-col items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowUpRight className="w-[66px] h-[30px] text-emerald-600" />
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
                <label htmlFor="onRampWallet" className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet
                </label>
                <select
                  id="onRampWallet"
                  value={onRampForm.walletId}
                  onChange={(e) => setOnRampForm((prev) => ({ ...prev, walletId: e.target.value }))}
                  disabled={onRampSucceeded}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">
                    {loadingWallets ? 'Loading wallets...' : walletError || 'Select wallet'}
                  </option>
                  {!loadingWallets && !walletError && wallets.length === 0 && (
                    <option value="" disabled>No wallets found</option>
                  )}
                  {wallets.map((wallet) => (
                    <option key={wallet.walletReference} value={wallet.walletReference}>
                      {wallet.lightning?.name || wallet.walletType} - {wallet.balanceSats.toLocaleString()} sats / {exchangeRate ? `${convertSatsToKes(wallet.balanceSats).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES` : 'KES --'} / {(wallet.balanceSats / SATS_PER_BTC).toFixed(8)} BTC
                    </option>
                  ))}
                </select>
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
                <label htmlFor="withdrawWallet" className="block text-sm font-medium text-gray-700 mb-1">
                  Withdraw From
                </label>
                <select
                  id="withdrawWallet"
                  value={withdrawForm.walletId}
                  onChange={(e) => setWithdrawForm((prev) => ({ ...prev, walletId: e.target.value }))}
                  disabled={withdrawSucceeded}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">
                    {loadingWallets ? 'Loading wallets...' : walletError || 'Select wallet'}
                  </option>
                  {!loadingWallets && !walletError && wallets.length === 0 && (
                    <option value="" disabled>No wallets found</option>
                  )}
                  {wallets.map((wallet) => (
                    <option key={wallet.walletReference} value={wallet.walletReference}>
                      {wallet.lightning?.name || wallet.walletType} - {wallet.balanceSats.toLocaleString()} sats / {exchangeRate ? `${convertSatsToKes(wallet.balanceSats).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES` : 'KES --'} / {(wallet.balanceSats / SATS_PER_BTC).toFixed(8)} BTC
                    </option>
                  ))}
                </select>
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
