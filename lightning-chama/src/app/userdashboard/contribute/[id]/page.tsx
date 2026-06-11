"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, User, CheckCircle, XCircle, Wallet, AlertCircle, X, Loader2, ChevronDown, ChevronUp, Zap, Bell, MoreVertical } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import SatsAmount from '@/components/SatsAmount';

// Helper to format time ago
const timeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const map: any = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
  for (const k in map) {
    const v = Math.floor(seconds / map[k]);
    if (v >= 1) return `${v} ${k}${v > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

// Helper to extract name from lnAddressUsername
const getContributorName = (wallet: any) => {
  if (!wallet?.lightning?.lnAddressUsername) return 'Unknown User';
  const parts = wallet.lightning.lnAddressUsername.split('-rotation-');
  return parts[0] || wallet.lightning.lnAddressUsername;
};

export default function ChamasContribution() {
  const params = useParams();
  const router = useRouter();
  const chamaId = params.id as string;
  
  // State variables
  const [chamaDetails, setChamaDetails] = useState<any>(null);
  const [cycles, setCycles] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showCycleDetailsModal, setShowCycleDetailsModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);

  // --- USER WALLETS STATE ---
  const [userWallets, setUserWallets] = useState<any[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);

  // --- WALLET TOP UP STATE (For Chama Wallets) ---
  const [topUpState, setTopUpState] = useState({
    open: false,
    step: 'input' as 'input' | 'confirm' | 'processing' | 'success',
    walletRef: '',
    amount: '',
    memo: '',
    senderWalletId: '',
    senderWalletName: '',
    recipientName: '',
    recipientType: '',
    recipientActive: false,
    error: '',
    loading: false,
    showWalletSelector: false
  });

  // --- ROTATIONAL PAYMENT STATE (For Cycle Contribution) ---
  const [rotationalPaymentModal, setRotationalPaymentModal] = useState({
    isOpen: false,
    cycle: null as any,
    selectedWallet: null as any,
    loading: false,
    error: ''
  });

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const CACHE_DURATION_MS = 5 * 60 * 1000;

  const currentUserRef = useMemo(() => localStorage.getItem('userReference'), []);
  
  // Exchange Rate Logic
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (lastFetched && Date.now() - lastFetched < CACHE_DURATION_MS) {
        setLoadingRate(false);
        return;
      }
      try {
        setLoadingRate(true);
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=kes");
        if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
        const data = await response.json();
        if (data.bitcoin && data.bitcoin.kes) {
          setExchangeRate(data.bitcoin.kes);
          setLastFetched(Date.now());
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        if (!exchangeRate) setExchangeRate(11500000);
      } finally {
        setLoadingRate(false);
      }
    };
    fetchExchangeRate();
  }, [exchangeRate, lastFetched, CACHE_DURATION_MS]);

  const convertSatsToKes = (sats: number): number => {
    if (!exchangeRate) return 0;
    return (sats / 100000000) * exchangeRate;
  };

  // --- FETCHING ALL DATA ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setError('Not authenticated'); return; }
        
        // 1. Fetch Chama Details
        const detailsResponse = await fetch(`https://dada-devs-labs-dada-lab2-chamavault.onrender.com/chama/${chamaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          setChamaDetails(detailsData);
        }

        // 2. Fetch Contribution Cycles
        const cyclesResponse = await fetch(`https://dada-devs-labs-dada-lab2-chamavault.onrender.com/contribution-cycles/chama/${chamaId}?size=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (cyclesResponse.ok) {
          const cyclesData = await cyclesResponse.json();
          if (cyclesData.content) {
            setCycles(cyclesData.content);
          }
        } else {
          throw new Error('Failed to fetch contribution cycles');
        }
        
        // 3. Fetch Members
        const membersResponse = await fetch(`https://dada-devs-labs-dada-lab2-chamavault.onrender.com/chama/${chamaId}/members-by-status/ACTIVE`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData || []);
        }

        // 4. Fetch User Wallets
        const ownerRef = localStorage.getItem('userReference');
        if (token && ownerRef) {
            try {
                const walletRes = await fetch(
                    `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/wallets/${ownerRef}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (walletRes.ok) {
                    const walletData = await walletRes.json();
                    setUserWallets(walletData.content || []);
                }
            } catch (e) {
                console.error("Failed to fetch user wallets", e);
            } finally {
                setLoadingWallets(false);
            }
        }
        
      } catch (err) {
        console.error(err);
        setError('Unable to load chama details');
      } finally {
        setLoading(false);
      }
    };
    
    if (chamaId) fetchAllData();
  }, [chamaId]);

  const activities = useMemo(() => {
    if (!cycles || cycles.length === 0) return [];
    
    return cycles.map((cycle: any) => ({
      id: cycle.cycleReference,
      type: 'CYCLE_END',
      beneficiary: cycle.beneficiaryUser?.user?.username || 'Unknown',
      status: cycle.status,
      date: cycle.createdAt || cycle.endAt,
      details: `Cycle for ${cycle.beneficiaryUser?.user?.username} is ${cycle.status.toLowerCase()}`,
      rawCycle: cycle 
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cycles]);

  const chama = chamaDetails?.chama || (cycles.length > 0 ? cycles[0].chama : null);
  const rules = chamaDetails?.rules;
  const wallets = chamaDetails?.wallets || [];
  
  const activeCycle = cycles.find((cycle: any) => cycle.status === 'ACTIVE');
  const displayCycle = activeCycle || cycles[0];
  
  const isBeneficiary = useMemo(() => {
    if (!activeCycle || !currentUserRef) return false;
    return currentUserRef === activeCycle.beneficiaryUser?.user?.userReference;
  }, [activeCycle, currentUserRef]);

  const hasContributed = useMemo(() => {
    if (!activeCycle || !currentUserRef) return false;
    return activeCycle.contributorWallets?.some(
      (wallet: any) => wallet.ownerReference === currentUserRef
    ) || false;
  }, [activeCycle, currentUserRef]);


  const currentSats = displayCycle?.currentTotalContributionAmount || 0;
  const expectedSats = displayCycle?.expectedTotalContributionAmount || 0;
  
  const contributionSats = displayCycle?.contributionAmount || 0;
  
  const progress = expectedSats > 0 ? (currentSats / expectedSats) * 100 : 0;

  const totalMembers = members.length;
  const visibleMembers = members.slice(0, 4);

  // --- ROTATIONAL PAYMENT HANDLERS ---
  const handleInitiatePayment = (cycle: any) => {
    if (!cycle) return;
    // Check if user has wallets
    if (userWallets.length === 0) {
        alert("You have no wallets to pay from. Please create a wallet first.");
        return;
    }
    setRotationalPaymentModal({
      isOpen: true,
      cycle: cycle,
      selectedWallet: null,
      loading: false,
      error: ''
    });
  };

  const handleSelectRotationalWallet = (wallet: any) => {
    setRotationalPaymentModal(prev => ({ ...prev, selectedWallet: wallet }));
  };

  const handleConfirmRotationalPayment = async () => {
    if (!rotationalPaymentModal.cycle || !rotationalPaymentModal.selectedWallet) return;

    const token = localStorage.getItem('token');
    const userMsisdn = localStorage.getItem('msisdn') || "254700000007"; 

    setRotationalPaymentModal(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const params = new URLSearchParams({
        contributionCycleReference: rotationalPaymentModal.cycle.cycleReference.toString(),
        msisdn: userMsisdn,
        moveFundsFromPreviousAccounts: "true",
        walletToMoveFundsFrom: rotationalPaymentModal.selectedWallet.walletReference
      });

      const response = await fetch(
        `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/transactions/make-rotational-payments?${params.toString()}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment failed");
      }

      alert("Payment Successful! Cycle updated.");
      setRotationalPaymentModal({ isOpen: false, cycle: null, selectedWallet: null, loading: false, error: '' });
      
      // Refresh Data
      const fetchAllData = async () => {
          const token = localStorage.getItem('token');
          if (!token) return;
          // Refetch cycles specifically to update progress
          const cyclesResponse = await fetch(`https://dada-devs-labs-dada-lab2-chamavault.onrender.com/contribution-cycles/chama/${chamaId}?size=5`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cyclesResponse.ok) {
            const cyclesData = await cyclesResponse.json();
            if (cyclesData.content) setCycles(cyclesData.content);
          }
      };
      fetchAllData();

    } catch (error: any) {
      console.error("Payment Error:", error);
      setRotationalPaymentModal(prev => ({ ...prev, loading: false, error: error.message }));
    }
  };


  // --- WALLET TOP UP HANDLERS (Separate flow) ---
  const openTopUpModal = (walletRef: string) => {
    const storedRef = localStorage.getItem('selectedWalletRef');
    let defaultWallet = userWallets.find((w: any) => w.walletReference === storedRef);
    if (!defaultWallet && userWallets.length > 0) defaultWallet = userWallets[0];

    setTopUpState({
      open: true,
      step: 'input',
      walletRef: walletRef,
      amount: '',
      memo: '',
      senderWalletId: defaultWallet?.walletReference || '',
      senderWalletName: defaultWallet?.lightning?.name || (defaultWallet ? 'Unknown Wallet' : 'No Wallet'),
      recipientName: '',
      recipientType: '',
      recipientActive: false,
      error: '',
      loading: false,
      showWalletSelector: false
    });
  };

  const closeTopUpModal = () => {
    setTopUpState(prev => ({ ...prev, open: false, showWalletSelector: false }));
  };

  const handleSelectWallet = (wallet: any) => {
    setTopUpState(prev => ({
        ...prev,
        senderWalletId: wallet.walletReference,
        senderWalletName: wallet.lightning?.name || wallet.walletType,
        showWalletSelector: false
    }));
  };

  const handleTopUpContinue = async () => {
    if (!topUpState.amount) {
      setTopUpState(prev => ({ ...prev, error: "Please enter an amount" }));
      return;
    }
    if (!topUpState.senderWalletId) {
      setTopUpState(prev => ({ ...prev, error: "Please select a sender wallet." }));
      return;
    }
    setTopUpState(prev => ({ ...prev, loading: true, error: '', showWalletSelector: false }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/wallets/fetch-by-id/${topUpState.walletRef}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Recipient wallet not found");

      setTopUpState(prev => ({
        ...prev,
        step: 'confirm',
        recipientName: data.lightning?.name || "Wallet",
        recipientType: data.walletType,
        recipientActive: data.active ?? false,
        loading: false
      }));
    } catch (err: any) {
      setTopUpState(prev => ({ ...prev, error: err.message || "Validation failed", loading: false }));
    }
  };

  const handleTopUpConfirm = async () => {
    setTopUpState(prev => ({ ...prev, loading: true, step: 'processing', error: '' }));
    try {
      const token = localStorage.getItem('token');
      const payload = {
        senderWalletId: topUpState.senderWalletId,
        recipientWalletId: topUpState.walletRef,
        amountSats: parseInt(topUpState.amount),
        memo: topUpState.memo || "Top up from Chama Page"
      };
      const response = await fetch(
        "https://dada-devs-labs-dada-lab2-chamavault.onrender.com/transactions/wallet-top-up",
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Transaction failed");

      setTopUpState(prev => ({ ...prev, step: 'success', loading: false }));
      setTimeout(() => closeTopUpModal(), 2000);
    } catch (err: any) {
      setTopUpState(prev => ({ ...prev, step: 'input', error: err.message || "Transaction failed", loading: false }));
    }
  };

  const openCycleDetails = (cycle: any) => {
    setSelectedCycle(cycle);
    setShowCycleDetailsModal(true);
  };

  const closeCycleDetails = () => {
    setSelectedCycle(null);
    setShowCycleDetailsModal(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chama details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !chama) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Chama not found'}</p>
          <button 
            onClick={() => router.push('/userdashboard/chama')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Back to Chamas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-2 w-full flex items-center justify-between px-4"
        style={{
          height: 73,
          background: 'rgba(255,255,255,0.8)',
          borderBottom: '1px solid #E2E8F0',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/userdashboard/chama')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#0F172A]" />
          </button>
          <div>
            <p className="text-[18px] font-bold text-[#0F172A] leading-[22px]">{chama?.name}</p>
            <p className="text-[12px] text-[#64748B] leading-4">Group Contribution</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <MoreVertical className="w-4 h-4 text-[#0F172A]" />
        </button>
      </header>

      {/* ── Main ── */}
      <main className="w-full max-w-md flex flex-col items-center gap-4 px-4 pt-4 pb-32">

        {/* Financial Summary Hero */}
        <div
          className="w-full rounded-xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #00875A 0%, #047857 100%)',
            boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
          }}
        >
          {/* decoration blob */}
          <div
            className="absolute w-32 h-32 -right-8 -bottom-8 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }}
          />
          <div className="relative z-10 flex flex-col gap-1">
            <p className="text-[14px] font-medium text-[#ECFDF5]">Current Balance</p>
            <SatsAmount
              sats={currentSats}
              exchangeRate={exchangeRate}
              loadingRate={loadingRate}
              primaryClassName="text-[30px] font-bold text-white leading-9"
              detailClassName="text-[12px] text-[#ECFDF5]"
            />
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-end justify-between">
                <p className="text-[12px] text-[#ECFDF5]">
                  {activeCycle?.contributorWallets?.length || 0} of {totalMembers} members contributed
                </p>
                <p className="text-[12px] font-bold text-white">{progress.toFixed(0)}%</p>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%`, background: 'rgba(255,255,255,0.7)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Cycle Alert — only shown when current user is beneficiary */}
        {isBeneficiary && (
          <div
            className="w-full rounded-xl flex flex-col gap-4 px-4 pt-4 pb-6"
            style={{
              background: 'rgba(0,135,90,0.05)',
              border: '2px solid rgba(0,135,90,0.2)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#00875A] flex items-center justify-center shrink-0 p-2">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[16px] font-bold text-[#0F172A] leading-6">
                  You are receiving this round
                </p>
                <p className="text-[14px] text-[#475569] leading-5">
                  You are the current beneficiary for this cycle. Funds will be deposited to your wallet.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <button className="flex-1 h-[42px] bg-[#00875A] rounded-lg text-white font-bold text-[14px] shadow-sm hover:bg-emerald-800 transition-colors">
                View Payout
              </button>
              <button className="flex-1 h-[42px] border border-[#00875A] rounded-lg text-[#00875A] font-bold text-[14px] hover:bg-emerald-50 transition-colors">
                Beneficiary Details
              </button>
            </div>
          </div>
        )}

        {/* Main CTA */}
        <button
          onClick={() => displayCycle && handleInitiatePayment(displayCycle)}
          disabled={!cycles.length || isBeneficiary || hasContributed}
          className="w-full h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-[16px] text-white disabled:opacity-50 transition-opacity"
          style={{
            background: '#0F172A',
            boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
          }}
        >
          <Zap className="w-5 h-5" fill="white" />
          {isBeneficiary
            ? 'Beneficiary This Round'
            : hasContributed
            ? 'Already Contributed'
            : activeCycle
            ? 'Contribute to Group'
            : 'Make Late Contribution'}
        </button>

        {/* ── CONTRIBUTION CYCLE ── */}
        <div className="w-full flex flex-col gap-3">
          <h3 className="text-[14px] font-bold text-[#64748B] uppercase tracking-[0.7px] px-1">
            Contribution Cycle
          </h3>
          <div
            className="w-full rounded-xl p-4"
            style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {/* Status */}
              <div className="flex flex-col gap-1">
                <p className="text-[12px] text-[#64748B]">Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  <p className="text-[14px] font-semibold text-[#0F172A]">
                    {displayCycle?.status || 'N/A'}
                  </p>
                </div>
              </div>
              {/* Current Beneficiary */}
              <div className="flex flex-col gap-1">
                <p className="text-[12px] text-[#64748B]">Current Beneficiary</p>
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  {displayCycle?.beneficiaryUser?.user?.username || 'N/A'}
                  {isBeneficiary ? ' (You)' : ''}
                </p>
              </div>
              {/* Rotation Index */}
              <div className="flex flex-col gap-1">
                <p className="text-[12px] text-[#64748B]">Rotation Index</p>
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  #{displayCycle?.rotationIndex || 'N/A'} of {totalMembers}
                </p>
              </div>
              {/* Cycle End Date */}
              <div className="flex flex-col gap-1">
                <p className="text-[12px] text-[#64748B]">Cycle End Date</p>
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  {displayCycle?.endAt
                    ? new Date(displayCycle.endAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CHAMA WALLETS ── */}
        {wallets.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[14px] font-bold text-[#64748B] uppercase tracking-[0.7px]">
                Chama Wallets
              </h3>
              <button className="text-[12px] font-bold text-[#00875A]">Manage</button>
            </div>
            {wallets.map((wallet: any, i: number) => (
              <div
                key={i}
                className="w-full bg-white rounded-xl p-4 flex items-center justify-between"
                style={{
                  border: '1px solid #E2E8F0',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,135,90,0.1)' }}
                  >
                    <Wallet className="w-5 h-5 text-[#00875A]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0F172A]">
                      {wallet.lightning?.walletName || wallet.lightning?.name || `Wallet ${i + 1}`}
                    </p>
                    <p className="text-[12px] text-[#64748B]">{wallet.walletType}</p>
                  </div>
                </div>
                <button
                  onClick={() => openTopUpModal(wallet.walletReference)}
                  className="px-4 py-1.5 rounded-lg text-[12px] font-bold text-[#00875A] hover:opacity-80 transition-opacity"
                  style={{ background: 'rgba(0,135,90,0.1)' }}
                >
                  Contribute
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── MEMBERS ── */}
        <div className="w-full flex flex-col gap-3">
          <h3 className="text-[14px] font-bold text-[#64748B] uppercase tracking-[0.7px] px-1">
            Members ({totalMembers})
          </h3>
          <div className="flex flex-col gap-3">
            {visibleMembers.map((member: any) => (
              <div key={member.reference} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background:
                        member.role === 'ADMIN' ? 'rgba(0,135,90,0.2)' : '#E2E8F0',
                    }}
                  >
                    <User
                      className="w-4 h-4"
                      style={{ color: member.role === 'ADMIN' ? '#00875A' : '#64748B' }}
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0F172A]">
                      {member.user.username || 'Unknown'}
                    </p>
                    <p className="text-[12px] text-[#64748B]">
                      {member.user.kyc?.email || 'No email'}
                    </p>
                  </div>
                </div>
                {member.role === 'ADMIN' ? (
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-[#00875A] uppercase"
                    style={{ background: 'rgba(0,135,90,0.1)' }}
                  >
                    Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#64748B] bg-[#F1F5F9]">
                    Member
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── ABOUT GROUP ── */}
        <div className="w-full flex flex-col gap-3">
          <h3 className="text-[14px] font-bold text-[#64748B] uppercase tracking-[0.7px] px-1">
            About Group
          </h3>
          <div
            className="w-full rounded-xl p-4 flex flex-col gap-4"
            style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}
          >
            <p className="text-[14px] text-[#475569] leading-[23px]">
              {chama?.description || 'No description available.'}
            </p>
            <div
              className="flex flex-col gap-2 pt-4"
              style={{ borderTop: '1px solid #E2E8F0' }}
            >
              <p className="text-[12px] font-bold text-[#94A3B8]">RULES</p>
              <ul className="flex flex-col gap-1.5">
                <li className="flex items-start gap-2.5">
                  <span className="text-[12px] text-[#64748B]">•</span>
                  <span className="text-[12px] text-[#64748B]">
                    Frequency: {rules?.frequency || 'Not specified'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[12px] text-[#64748B]">•</span>
                  <span className="text-[12px] text-[#64748B]">
                    Requires Approval: {rules?.requiresApproval ? 'Yes' : 'No'}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[12px] text-[#64748B]">•</span>
                  <span className="text-[12px] text-[#64748B]">
                    Max Members: {chama?.maxMembers || 'N/A'} — Required Approvals:{' '}
                    {rules?.requiredApprovals || 0}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── RECENT ACTIVITY ── */}
        <div className="w-full flex flex-col gap-3">
          <h3 className="text-[14px] font-bold text-[#64748B] uppercase tracking-[0.7px] px-1">
            Recent Activity
          </h3>
          <div className="relative flex flex-col gap-6 isolation-isolate">
            {/* Vertical timeline line */}
            <div
              className="absolute left-[19px] top-0 bottom-0 w-0.5 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, #E2E8F0 0%, #E2E8F0 50%, rgba(226,232,240,0) 100%)',
              }}
            />
            {activities.length > 0 ? (
              activities.map((activity: any) => (
                <div
                  key={activity.id}
                  onClick={() => openCycleDetails(activity.rawCycle)}
                  className="relative flex items-center gap-4 cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white shrink-0"
                    style={{
                      border: `2px solid ${activity.status === 'ACTIVE' ? '#00875A' : '#E2E8F0'}`,
                    }}
                  >
                    <CheckCircle
                      className="w-3 h-3"
                      style={{ color: activity.status === 'ACTIVE' ? '#00875A' : '#94A3B8' }}
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0F172A]">
                      {activity.beneficiary}
                    </p>
                    <p className="text-[12px] text-[#64748B]">{timeAgo(activity.date)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[14px] text-[#64748B] pl-14">No recent activity.</p>
            )}
          </div>
        </div>

      </main>

      {/* --- ROTATIONAL PAYMENT MODAL (New) --- */}
      {rotationalPaymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setRotationalPaymentModal({ isOpen: false, cycle: null, selectedWallet: null, loading: false, error: '' })} />
          
          <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slideUp max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">
                {rotationalPaymentModal.selectedWallet ? "Confirm Payment" : "Select Wallet"}
              </h3>
              <button onClick={() => setRotationalPaymentModal({ isOpen: false, cycle: null, selectedWallet: null, loading: false, error: '' })} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              
              {/* VIEW 1: SELECT WALLET */}
              {!rotationalPaymentModal.selectedWallet ? (
                <div className="space-y-3">
                  {userWallets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No wallets available</div>
                  ) : (
                    userWallets.map((wallet) => (
                      <div
                        key={wallet.walletReference}
                        onClick={() => handleSelectRotationalWallet(wallet)}
                        className="group bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-2xl p-4 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Wallet size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{wallet.lightning.name}</h4>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{wallet.walletType}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <SatsAmount
                              sats={wallet.balanceSats}
                              exchangeRate={exchangeRate}
                              loadingRate={loadingRate}
                              align="right"
                              primaryClassName="font-bold text-gray-900"
                              detailClassName="text-[10px] text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* VIEW 2: CONFIRM PAYMENT */
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Contributing to</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        {rotationalPaymentModal.cycle.beneficiaryUser?.user?.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{rotationalPaymentModal.cycle.beneficiaryUser?.user?.username}</p>
                        <p className="text-xs text-gray-500">{rotationalPaymentModal.cycle.chama.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-gray-400 my-2">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-xs font-medium">Paying From</span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>

                  <div className="bg-gray-900 text-white p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{rotationalPaymentModal.selectedWallet.lightning.name}</p>
                        <p className="text-xs text-gray-400">{rotationalPaymentModal.selectedWallet.walletType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <SatsAmount
                        sats={contributionSats}
                        exchangeRate={exchangeRate}
                        loadingRate={loadingRate}
                        align="right"
                        primaryClassName="font-bold text-lg text-white"
                        detailClassName="text-xs text-gray-400"
                      />
                    </div>
                  </div>

                  {rotationalPaymentModal.error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{rotationalPaymentModal.error}</span>
                    </div>
                  )}
                  
                  <button
                    onClick={handleConfirmRotationalPayment}
                    disabled={rotationalPaymentModal.loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {rotationalPaymentModal.loading ? (
                      <><Loader2 className="animate-spin" /> Processing...</>
                    ) : (
                      <><Zap size={20} fill="currentColor" /> Confirm Payment</>
                    )}
                  </button>

                  <button onClick={() => setRotationalPaymentModal(prev => ({ ...prev, selectedWallet: null }))} className="w-full text-center text-sm text-gray-500 hover:text-gray-900 font-medium py-2">
                    Change Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- WALLET TOP UP MODAL (For Chama Wallets) --- */}
      {topUpState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center text-[#191919]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={closeTopUpModal}
          />
          <div className="relative bg-white rounded-xl w-[95%] max-w-md max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {topUpState.step === 'input' ? 'Wallet Top Up' : 
                 topUpState.step === 'confirm' ? 'Confirm Transaction' : 
                 topUpState.step === 'processing' ? 'Processing...' : 'Success!'}
              </h3>
              <button onClick={closeTopUpModal} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {topUpState.step === 'input' && (
                <div className="space-y-6">
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <div 
                      onClick={() => setTopUpState(prev => ({...prev, showWalletSelector: !prev.showWalletSelector}))}
                      className="bg-gray-50 p-3 rounded-lg flex justify-between items-center cursor-pointer border border-transparent hover:border-gray-300 transition-colors"
                    >
                        <div className="flex-1 min-w-0 mr-2">
                            <span className="text-sm font-semibold text-gray-900 block truncate">
                                {topUpState.senderWalletName || 'Select Wallet'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {topUpState.senderWalletId ? 'ID: ' + topUpState.senderWalletId.substring(0,8) + '...' : 'Click to select'}
                            </span>
                        </div>
                        {topUpState.showWalletSelector ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                    {topUpState.showWalletSelector && (
                        <div className="absolute left-0 right-0 top-20 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                            {loadingWallets ? <div className="p-4 text-center text-sm text-gray-500">Loading wallets...</div> : 
                             userWallets.length === 0 ? <div className="p-4 text-center text-sm text-red-500">No wallets found</div> :
                             userWallets.map((wallet: any) => (
                                <div 
                                    key={wallet.walletReference}
                                    onClick={(e) => { e.stopPropagation(); handleSelectWallet(wallet); }}
                                    className={`p-3 border-b last:border-0 cursor-pointer hover:bg-emerald-50 transition-colors ${
                                        topUpState.senderWalletId === wallet.walletReference ? 'bg-emerald-50' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-900">{wallet.lightning?.name || wallet.walletType}</span>
                                        <SatsAmount
                                          sats={wallet.balanceSats}
                                          exchangeRate={exchangeRate}
                                          loadingRate={loadingRate}
                                          align="right"
                                          primaryClassName="text-xs font-semibold text-gray-700"
                                          detailClassName="text-[10px] text-gray-500"
                                        />
                                    </div>
                                    {topUpState.senderWalletId === wallet.walletReference && (
                                        <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Selected</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                  {topUpState.error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{topUpState.error}</span>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Sats)</label>
                      <input
                        type="number"
                        value={topUpState.amount}
                        onChange={(e) => setTopUpState({ ...topUpState, amount: e.target.value, error: '', showWalletSelector: false })}
                        placeholder="0"
                        className="w-full text-lg font-semibold text-gray-900 placeholder-gray-400 outline-none border border-gray-200 rounded-lg p-3 focus:border-emerald-500"
                      />
                      {parseInt(topUpState.amount || '0') > 0 && (
                        <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2">
                          <SatsAmount
                            sats={parseInt(topUpState.amount || '0')}
                            exchangeRate={exchangeRate}
                            loadingRate={loadingRate}
                            primaryClassName="font-semibold text-sm text-gray-700"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Memo (Optional)</label>
                      <input
                        type="text"
                        value={topUpState.memo}
                        onChange={(e) => setTopUpState({ ...topUpState, memo: e.target.value, showWalletSelector: false })}
                        placeholder="What is this for?"
                        className="w-full text-base text-gray-900 placeholder-gray-400 outline-none border border-gray-200 rounded-lg p-3 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              {topUpState.step === 'confirm' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <span className="text-gray-500 text-sm">Sender</span>
                    <span className="font-semibold text-gray-900">{topUpState.senderWalletName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <span className="text-gray-500 text-sm">Recipient</span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{topUpState.recipientName}</p>
                      <p className="text-xs text-gray-500">{topUpState.recipientType}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <span className="text-gray-500 text-sm">Amount</span>
                    <SatsAmount
                      sats={parseInt(topUpState.amount || '0')}
                      exchangeRate={exchangeRate}
                      loadingRate={loadingRate}
                      align="right"
                      primaryClassName="font-bold text-gray-900"
                    />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <span className="text-gray-500 text-sm">Memo</span>
                    <span className="text-gray-900 truncate max-w-[200px]">{topUpState.memo || 'None'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 text-sm">Network Fee</span>
                    <span className="text-gray-400 text-sm">Calculated at confirmation</span>
                  </div>
                  {topUpState.error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{topUpState.error}</span>
                    </div>
                  )}
                </div>
              )}
              {topUpState.step === 'processing' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <p className="text-gray-600 font-medium">Confirming transaction...</p>
                </div>
              )}
              {topUpState.step === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg">Transfer Successful</p>
                  <p className="text-gray-500 text-sm">Your contribution has been sent.</p>
                </div>
              )}
            </div>
            {topUpState.step !== 'processing' && topUpState.step !== 'success' && (
              <div className="p-6 border-t pt-4">
                {topUpState.step === 'input' ? (
                  <button 
                    onClick={handleTopUpContinue}
                    disabled={topUpState.loading || !topUpState.amount || !topUpState.senderWalletId}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {topUpState.loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Continue"}
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setTopUpState({ ...topUpState, step: 'input' })}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 rounded-xl transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleTopUpConfirm}
                      disabled={topUpState.loading}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {topUpState.loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Confirm Transfer"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cycle Details Modal */}
      {showCycleDetailsModal && selectedCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center text-[#191919]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={closeCycleDetails}
          />
          <div className="relative bg-white rounded-xl p-6 w-[95%] max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Cycle #{selectedCycle.rotationIndex} Details</h3>
              <button onClick={closeCycleDetails} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex items-start justify-between mb-6">
               <div>
                 <p className="text-sm text-gray-600">Beneficiary</p>
                 <p className="text-lg font-bold text-gray-900">{selectedCycle.beneficiaryUser?.user?.username || 'N/A'}</p>
               </div>
               <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                 selectedCycle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
               }`}>
                 {selectedCycle.status}
               </span>
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">
                    {selectedCycle.expectedTotalContributionAmount > 0 
                        ? ((selectedCycle.currentTotalContributionAmount / selectedCycle.expectedTotalContributionAmount) * 100).toFixed(1) 
                        : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className="bg-emerald-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min((selectedCycle.currentTotalContributionAmount / selectedCycle.expectedTotalContributionAmount) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                 <SatsAmount
                   sats={selectedCycle.currentTotalContributionAmount}
                   exchangeRate={exchangeRate}
                   loadingRate={loadingRate}
                   primaryClassName="text-xs text-gray-500"
                   detailClassName="text-[10px] text-gray-400"
                 />
                 <SatsAmount
                   sats={selectedCycle.expectedTotalContributionAmount}
                   exchangeRate={exchangeRate}
                   loadingRate={loadingRate}
                   align="right"
                   primaryClassName="text-xs text-gray-500"
                   detailClassName="text-[10px] text-gray-400"
                 />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Contribution Amount</p>
                <SatsAmount
                  sats={selectedCycle.contributionAmount || 0}
                  exchangeRate={exchangeRate}
                  loadingRate={loadingRate}
                  primaryClassName="font-semibold text-gray-900"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Cycle Created</p>
                <p className="font-semibold text-gray-900 text-xs">{new Date(selectedCycle.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Cycle Ended</p>
                <p className="font-semibold text-gray-900 text-xs">{new Date(selectedCycle.endAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Total Contributors</p>
                <p className="font-semibold text-gray-900">{selectedCycle.contributorWallets?.length || 0}</p>
              </div>
            </div>
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
                selectedCycle.contributorWallets?.some((w: any) => w.ownerReference === currentUserRef)
                ? 'bg-emerald-50 border border-emerald-100'
                : 'bg-amber-50 border border-amber-100'
            }`}>
                {selectedCycle.contributorWallets?.some((w: any) => w.ownerReference === currentUserRef) ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                    <XCircle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                <div>
                    <p className="text-sm font-semibold text-gray-900">Your Contribution Status</p>
                    <p className="text-xs text-gray-600">
                        {selectedCycle.contributorWallets?.some((w: any) => w.ownerReference === currentUserRef) 
                        ? 'You contributed to this cycle.' 
                        : 'You did not contribute to this cycle.'}
                    </p>
                </div>
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">Contributors</h4>
                {selectedCycle.contributorWallets && selectedCycle.contributorWallets.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedCycle.contributorWallets.map((wallet: any, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getContributorName(wallet)}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No contributors recorded.</p>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Late Contribution Warning Modal */}
      {showWarningModal && displayCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center text-[#191919]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowWarningModal(false)}
          />
          <div className="relative bg-white rounded-xl p-6 w-[92%] max-w-md animate-scaleIn">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-amber-100 rounded-full p-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Late Contribution</h3>
                <p className="text-sm text-gray-600 mt-1">
                  The contribution period for this cycle has closed on {displayCycle && new Date(displayCycle.endAt).toLocaleDateString()}.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Your contribution will be marked as late.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  if (displayCycle && displayCycle.wallet?.walletReference) {
                    router.push(`/userdashboard/contribute/${chamaId}/wallet/${displayCycle.wallet.walletReference}`);
                  }
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Proceed Anyway
              </button>
              <button
                onClick={() => setShowWarningModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
