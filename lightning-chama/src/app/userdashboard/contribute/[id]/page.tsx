"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowUp, Users, ArrowLeft, TrendingUp, Calendar, Crown, User, CheckCircle, XCircle, Wallet, CreditCard, Info, AlertCircle, X, Loader2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
  const [walletError, setWalletError] = useState('');

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
  }, [exchangeRate, lastFetched]);

  const convertSatsToKes = (sats: number): number => {
    if (!exchangeRate) return 0;
    return (sats / 100000000) * exchangeRate;
  };

  const formatKes = (kes: number) => kes.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

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

  const chamaWallet = wallets.find((wallet: any) => wallet.walletType === 'CHAMA_GROUP');
  const chamaWalletReference = chamaWallet?.walletReference || '';

  const currentSats = displayCycle?.currentTotalContributionAmount || 0;
  const expectedSats = displayCycle?.expectedTotalContributionAmount || 0;
  
  const currentAmount = convertSatsToKes(currentSats);
  const targetAmount = convertSatsToKes(expectedSats);
  const contributionAmount = displayCycle ? convertSatsToKes(displayCycle.contributionAmount || 0) : 0;
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

  // Navigation Handlers (Fallbacks)
  const handleNavigateToChamaContribution = () => {
    // For the "Contribute to Group" button, we can trigger the top up modal if a wallet exists
    if (chamaWalletReference) {
        openTopUpModal(chamaWalletReference);
    }
  };
  
  const handleNavigateToWalletContribution = (walletId: string) => {
    if (!walletId) return;
    openTopUpModal(walletId);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} userName='' />
      <div className="w-full max-w-md flex items-center">
        <Link href="/userdashboard/chama" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft />
          <span className="text-lg text-gray-700">Go Back</span>
        </Link>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Group Goal Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{chama.name}</h2>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{totalMembers} members</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  KES {currentAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Target</p>
                <p className="text-xl font-semibold text-gray-700">
                  KES {targetAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 font-medium">{progress.toFixed(1)}% achieved</span>
                <span className="text-gray-600">KES {(targetAmount - currentAmount).toLocaleString()} remaining</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 mb-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Beneficiary:</span>
              <span className="font-medium text-gray-900">
                {displayCycle?.beneficiaryUser?.user?.username || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Rotation Index:</span>
              <span className="font-medium text-gray-900">
                {displayCycle?.rotationIndex || 'N/A'}
              </span>
            </div>
          </div>

          <div className={`rounded-xl p-4 mb-6 ${
            activeCycle 
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50' 
              : 'bg-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${activeCycle ? 'bg-white' : 'bg-gray-200'}`}>
                <Calendar className={`w-5 h-5 ${activeCycle ? 'text-emerald-600' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {activeCycle ? 'Active Cycle' : 'Cycle Closed'}
                </p>
                {isBeneficiary ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-amber-700">You are receiving this round</span>
                  </div>
                ) : hasContributed ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-emerald-700">You have contributed</span>
                  </div>
                ) : activeCycle ? (
                  <p className="font-semibold text-gray-900">
                    KES {contributionAmount.toLocaleString()} for this round
                  </p>
                ) : (
                  <p className="font-medium text-gray-700">
                    The contribution period for this round has passed.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* UPDATED: Triggers Rotational Payment Modal */}
            <button 
              onClick={() => displayCycle && handleInitiatePayment(displayCycle)}
              disabled={!cycles.length || isBeneficiary || hasContributed}
              className={`flex-1 text-md font-medium py-3.5 px-2 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                (!cycles.length || isBeneficiary || hasContributed)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isBeneficiary ? "Beneficiary" : hasContributed ? "Contributed" : (activeCycle ? 'Contribute to Cycle' : 'Make Late Contribution')}
              {!isBeneficiary && !hasContributed && <ArrowUp className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleNavigateToChamaContribution}
              disabled={!chamaWalletReference}
              className={`flex-1 text-md font-medium py-3.5 px-6 rounded-xl transition-colors ${
                chamaWalletReference
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-900' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Contribute to Group
            </button>
          </div>
        </div>

        {/* Current Cycle Info */}
        {activeCycle && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Contribution Cycle</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-gray-900">Status</span>
                </div>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  {activeCycle.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Current Beneficiary</span>
                <span className="text-sm text-gray-700">{activeCycle.beneficiaryUser?.user?.username}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Rotation Index</span>
                <span className="text-sm text-gray-700">{activeCycle.rotationIndex}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Cycle Ends</span>
                <span className="text-sm text-gray-700">
                  {new Date(activeCycle.endAt).toLocaleString()}
                </span>
              </div>

              {isBeneficiary && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                    <Crown className="w-5 h-5" />
                    <span className="text-sm font-medium">You are the beneficiary for this cycle.</span>
                </div>
              )}
              {hasContributed && !isBeneficiary && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">You have successfully contributed to this cycle.</span>
                </div>
              )}
            </div>
            
            {/* UPDATED: Also triggers Rotational Payment Modal */}
            <button 
              onClick={() => handleInitiatePayment(activeCycle)}
              disabled={isBeneficiary || hasContributed}
              className={`w-full mt-4 text-md font-medium py-3.5 px-2 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                isBeneficiary || hasContributed
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isBeneficiary ? "Cannot Contribute (Beneficiary)" : hasContributed ? "Already Contributed" : "Contribute to Cycle"}
              {!isBeneficiary && !hasContributed && <ArrowUp className="w-5 h-5" />}
            </button>
          </div>
        )}

        {!activeCycle && displayCycle && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Last Contribution Cycle</h3>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {displayCycle.status}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Beneficiary</span>
                <span className="text-sm text-gray-700">{displayCycle.beneficiaryUser?.user?.username}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Rotation Index</span>
                <span className="text-sm text-gray-700">{displayCycle.rotationIndex}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Cycle Ended</span>
                <span className="text-sm text-gray-700">
                  {new Date(displayCycle.endAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chama Wallets Section */}
        {wallets.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Chama Wallets
              </h3>
            </div>
            <div className="space-y-3">
              {wallets.map((wallet: { [key: string]: any }, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        {wallet.lightning?.walletName || `Wallet ${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: <span className="font-medium">{wallet.walletType}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className="font-bold text-lg text-gray-900">
                        KES {convertSatsToKes(wallet.balanceSats || 0).toLocaleString()}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        wallet.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {wallet.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => openTopUpModal(wallet.walletReference)}
                    className="w-full mt-3 text-sm bg-yellow-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Contribute To This Wallet
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Info */}
        <div className="bg-[#CFFEEF] rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-2 mb-6">
            <h2 className="text-gray-900 font-semibold text-lg">
              Group members ({totalMembers})
            </h2>
            <button className="text-teal-700 hover:text-teal-800 font-medium text-sm transition-colors">
              View all members
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {visibleMembers.map((member: { [key: string]: any }) => (
              <div key={member.reference} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold">
                  {member.user.username ? member.user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.user.username || 'Unknown User'}</p>
                  <p className="text-xs text-gray-600">{member.user.kyc?.email || 'No email'}</p>
                </div>
                <div className="flex items-center gap-1">
                  {member.role === 'ADMIN' ? (
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                      <Crown className="w-3 h-3" />
                      Admin
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      <User className="w-3 h-3" />
                      Member
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-gray-900 font-semibold text-base mb-2">
              About the Group
            </h3>
            <div className="mb-4">
              <p className="text-gray-900 font-medium text-sm mb-1">Description:</p>
              <ul className="list-disc list-inside text-gray-800 text-sm">
                <li>
                  {chama.description || "No description available"}
                </li>
              </ul>
            </div>

            <div className="space-y-1">
              <p className="text-gray-900 text-sm">
                <span className="font-medium">Frequency:</span> {rules?.frequency || "Not specified"}
              </p>
              <p className="text-gray-900 text-sm">
                <span className="font-medium">Requires Approval:</span>{" "}
                <span className="font-semibold">{rules?.requiresApproval ? "Yes" : "No"}</span>
              </p>
              <p className="text-gray-900 text-sm">
                <span className="font-medium">Required Approvals:</span>{" "}
                <span className="font-semibold">{rules?.requiredApprovals || 0}</span>
              </p>
              <p className="text-gray-900 text-sm">
                <span className="font-medium">Max Members:</span>{" "}
                <span className="font-semibold">{chama.maxMembers}</span>
              </p>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
            Rules & Regulations
          </button>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity: { [key: string]: any }) => {
                return (
                  <div 
                    key={activity.id} 
                    onClick={() => openCycleDetails(activity.rawCycle)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <div className={`bg-blue-100 rounded-full p-2`}>
                      <CheckCircle className={`w-4 h-4 text-blue-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.beneficiary} {activity.details}
                      </p>
                      <p className="text-xs text-gray-600">{timeAgo(activity.date)}</p>
                    </div>
                    <p className={`font-semibold text-gray-700`}>
                      {activity.status}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity to show.</p>
            )}
          </div>
          {activities.length > 5 && (
            <button className="w-full mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm py-2">
              View All Activities
            </button>
          )}
        </div>
      </div>

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
                            <p className="font-bold text-gray-900">{wallet.balanceSats.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 uppercase">Sats</p>
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
                      <p className="font-bold text-lg">
                        {exchangeRate ? formatKes(convertSatsToKes(contributionSats)) : "..."}
                      </p>
                      <p className="text-xs text-gray-400">KES</p>
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
                        <div className="absolute left-0 right-0 top-[80px] bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
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
                                        <span className="text-xs text-gray-500">{wallet.balanceSats} sats</span>
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
                      <div className="text-right text-xs text-gray-400 mt-1">
                         Approx. KES {convertSatsToKes(parseInt(topUpState.amount || '0')).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide text-xs">Memo (Optional)</label>
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
                    <span className="font-bold text-gray-900">{topUpState.amount} sats</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <span className="text-gray-500 text-sm">Est. Value</span>
                    <span className="text-gray-900">KES {convertSatsToKes(parseInt(topUpState.amount || '0')).toLocaleString()}</span>
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
                 <span>KES {convertSatsToKes(selectedCycle.currentTotalContributionAmount).toLocaleString()} Collected</span>
                 <span>Target: KES {convertSatsToKes(selectedCycle.expectedTotalContributionAmount).toLocaleString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Contribution Amount</p>
                <p className="font-semibold text-gray-900">KES {convertSatsToKes(selectedCycle.contributionAmount || 0).toLocaleString()}</p>
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
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                ) : (
                    <XCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
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