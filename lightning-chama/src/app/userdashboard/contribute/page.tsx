"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Calendar, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Users,
  Hash,
  X,
  Zap,
  Clock3
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import SatsAmount from '@/components/SatsAmount';
import { useBitcoinKesRate } from '@/hooks/useBitcoinKesRate';
import { formatWalletName } from '@/lib/wallet';

// --- Types ---
interface Wallet {
  walletReference: string;
  walletType: string;
  balanceSats: number;
  lightning: {
    name: string;
    balance_msat: string;
  };
  active?: boolean;
}

interface ChamaInfo {
  chamaReference: string;
  name: string;
  description: string;
  contributionAmount: number; // Sats
  visibility: string;
  maxMembers: number;
  currentRotationIndex: number;
  iconUrl?: string;
}

export interface ContributionCycle {
  cycleReference: number;
  chama: ChamaInfo;
  contributionAmount: number; // Sats
  currentTotalContributionAmount: number; // Sats
  expectedTotalContributionAmount: number; // Sats
  wallet: Wallet; // The target wallet (cycle wallet)
  rotationIndex: number;
  status: string;
  beneficiaryUserReference: string;
  beneficiaryUsername: string;
  beneficiaryMsisdn: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  fullyFunded: boolean;
}

interface ApiResponse {
  content: ContributionCycle[];
  pageable: {
    pageNumber: number;
    totalPages: number;
  };
  totalElements: number;
}

interface ContributionObligation {
  obligationReference: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'WAIVED' | 'SKIPPED' | string;
  contributionType?: 'POOLING' | 'MERRY_GO_ROUND' | string;
  amountSats?: number;
  contributionAmount?: number;
  outstandingAmountSats?: number;
  totalPaidSats?: number;
  dueAt?: string;
  dueDate?: string;
  endAt?: string;
  cycle?: { endAt?: string };
  chama: ChamaInfo;
}

export default function ChamasContribution() {
  const [cycles, setCycles] = useState<ContributionCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [obligations, setObligations] = useState<ContributionObligation[]>([]);
  const [loadingObligations, setLoadingObligations] = useState(true);
  const [obligationsError, setObligationsError] = useState('');

  // Wallets & Payment State
  const [userWallets, setUserWallets] = useState<Wallet[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Modal State
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    cycle: ContributionCycle | null;
    selectedWallet: Wallet | null;
  }>({
    isOpen: false,
    cycle: null,
    selectedWallet: null,
  });

  // Exchange Rate State
  const { exchangeRate, loadingRate } = useBitcoinKesRate();

  // --- Helpers ---
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "Pending";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateProgress = (current: number, expected: number) => {
    if (expected === 0) return 0;
    return Math.min((current / expected) * 100, 100);
  };

  const convertSatsToKes = (sats: number): number => {
    if (!exchangeRate) return 0;
    const btcAmount = sats / 100000000;
    return btcAmount * exchangeRate;
  };

  const formatKes = (kes: number) => {
    return kes.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  // Group Cycles by Chama
  const groupedCycles = React.useMemo(() => {
    const groups: Record<string, ContributionCycle[]> = {};
    cycles.forEach(cycle => {
      const name = cycle.chama.name;
      if (!groups[name]) groups[name] = [];
      groups[name].push(cycle);
    });
    return groups;
  }, [cycles]);

  // --- Effects ---

  // 2. Fetch User Wallets
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
          setUserWallets(walletData.content);
        }
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
      }
    };
    fetchWallets();
  }, []);

  // 3. Fetch Cycles
  const fetchCycles = (page: number) => {
    setLoading(true);
    const fetchUnpaidCycles = async () => {
      try {
        const token = localStorage.getItem('token');
        const userReference = localStorage.getItem('userReference');

        if (!token || !userReference) {
          console.error("Missing token or userReference");
          return;
        }

        const url = `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/contribution-cycles/unpaid?page=${page}&size=10&userReference=${userReference}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        setCycles(data.content || []);
        setTotalPages(data.pageable.totalPages);
      } catch (error) {
        console.error("Failed to fetch cycles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUnpaidCycles();
  };

  useEffect(() => {
    fetchCycles(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchObligations = async () => {
      try {
        setLoadingObligations(true);
        setObligationsError('');
        const token = localStorage.getItem('token');
        const msisdn = localStorage.getItem('msisdn');
        if (!token || !msisdn) throw new Error('Not authenticated');

        const chamasResponse = await fetch(
          `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/chama/${msisdn}/status/ACTIVE`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!chamasResponse.ok) throw new Error('Unable to load your Chamas');
        const chamasData = await chamasResponse.json();
        const activeChamas: ChamaInfo[] = Array.isArray(chamasData) ? chamasData : chamasData.content || [];

        const results = await Promise.all(activeChamas.map(async (chama) => {
          const response = await fetch(
            `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/chamas/${chama.chamaReference}/contribution-obligations?mine=true`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!response.ok) throw new Error(`Unable to load obligations for ${chama.name}`);
          const data = await response.json();
          const items = Array.isArray(data) ? data : data.content || [];
          return items.map((item: Omit<ContributionObligation, 'chama'> & { obligation?: Omit<ContributionObligation, 'chama'>; contributionObligationReference?: string; reference?: string; id?: string }) => {
            const obligation = item.obligation || item;
            return {
              ...obligation,
              ...item,
              obligationReference:
                obligation.obligationReference ||
                item.contributionObligationReference ||
                item.reference ||
                item.id,
              chama,
            } as ContributionObligation;
          });
        }));

        const actionable = results.flat().filter(obligation =>
          ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(obligation.status)
        );
        actionable.sort((a, b) => {
          if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1;
          if (b.status === 'OVERDUE' && a.status !== 'OVERDUE') return 1;
          const aDate = a.dueAt || a.dueDate || a.endAt || a.cycle?.endAt;
          const bDate = b.dueAt || b.dueDate || b.endAt || b.cycle?.endAt;
          return new Date(aDate || 8640000000000000).getTime() - new Date(bDate || 8640000000000000).getTime();
        });
        setObligations(actionable);
      } catch (obligationError) {
        console.error('Failed to fetch obligations:', obligationError);
        setObligationsError('We could not load your contribution obligations.');
      } finally {
        setLoadingObligations(false);
      }
    };

    fetchObligations();
  }, []);

  // --- Payment Logic ---
  const handlePayNow = (cycle: ContributionCycle) => {
    setPaymentModal({
      isOpen: true,
      cycle: cycle,
      selectedWallet: null
    });
  };

  const handleSelectWallet = (wallet: Wallet) => {
    setPaymentModal(prev => ({ ...prev, selectedWallet: wallet }));
  };

  const handleConfirmPayment = async () => {
    if (!paymentModal.cycle || !paymentModal.selectedWallet) return;

    const token = localStorage.getItem('token');
    const userMsisdn = localStorage.getItem('msisdn') || "254700000007"; 
    const sourceWalletRef = paymentModal.selectedWallet.walletReference;

    setPaymentLoading(true);

    try {
      const params = new URLSearchParams({
        contributionCycleReference: paymentModal.cycle.cycleReference.toString(),
        msisdn: userMsisdn,
        moveFundsFromPreviousAccounts: "true",
        walletToMoveFundsFrom: sourceWalletRef
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
      fetchCycles(currentPage);
      setPaymentModal({ isOpen: false, cycle: null, selectedWallet: null });

    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // --- Derived Data ---
  const obligationAmount = (obligation: ContributionObligation) =>
    Number(obligation.amountSats ?? obligation.contributionAmount ?? 0);
  const outstandingAmount = (obligation: ContributionObligation) =>
    Number(obligation.outstandingAmountSats ?? obligationAmount(obligation));
  const paidAmount = (obligation: ContributionObligation) =>
    Number(obligation.totalPaidSats ?? Math.max(obligationAmount(obligation) - outstandingAmount(obligation), 0));
  const obligationDueDate = (obligation: ContributionObligation) =>
    obligation.dueAt || obligation.dueDate || obligation.endAt || obligation.cycle?.endAt;
  const totalOwedSats = obligations.reduce((sum, obligation) => sum + outstandingAmount(obligation), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar isAuthenticated={true} userName='' />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Navigation Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/userdashboard/chama"
            className="p-2 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Contribution Dashboard</h1>
        </div>

        {/* Global Summary Stats */}
        {!loadingObligations && obligations.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wallet className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Total Owed</span>
              </div>
              <SatsAmount
                sats={totalOwedSats}
                exchangeRate={exchangeRate}
                loadingRate={loadingRate}
                primaryClassName="text-2xl font-bold text-gray-900"
                detailClassName="text-sm font-normal text-gray-500"
              />
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Payments Due</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{obligations.length}</p>
            </div>
          </div>
        )}

        {/* Actionable member obligations */}
        <section className="mb-10">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Needs your attention</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">Contribution obligations</h2>
            <p className="mt-1 text-sm text-gray-500">Your outstanding payments, ordered by urgency.</p>
          </div>

          {loadingObligations ? (
            <div className="space-y-3">
              {[1, 2].map(item => <div key={item} className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white" />)}
            </div>
          ) : obligationsError ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{obligationsError}</p>
            </div>
          ) : obligations.length === 0 ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
              <h3 className="mt-3 font-bold text-emerald-950">You’re all caught up</h3>
              <p className="mt-1 text-sm text-emerald-800">You have no outstanding Chama contributions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {obligations.map((obligation, obligationIndex) => {
                const amount = obligationAmount(obligation);
                const outstanding = outstandingAmount(obligation);
                const paid = paidAmount(obligation);
                const progress = amount > 0 ? Math.min((paid / amount) * 100, 100) : 0;
                const dueDate = obligationDueDate(obligation);
                const overdue = obligation.status === 'OVERDUE';
                const partial = obligation.status === 'PARTIALLY_PAID';
                const statusLabel = overdue ? 'Overdue' : partial ? 'Partially paid' : 'Payment due';

                return (
                  <article key={obligation.obligationReference || `${obligation.chama.chamaReference}-${obligationIndex}`} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${overdue ? 'border-red-200' : partial ? 'border-amber-200' : 'border-blue-200'}`}>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                            {obligation.chama.iconUrl ? (
                              <Image src={obligation.chama.iconUrl} alt="" width={44} height={44} className="h-full w-full object-cover" />
                            ) : (
                              <span className="font-bold text-emerald-700">{obligation.chama.name?.charAt(0) || 'C'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-gray-900">{obligation.chama.name}</h3>
                            <p className="text-xs text-gray-500">{obligation.contributionType === 'POOLING' ? 'Pooled savings' : obligation.contributionType === 'MERRY_GO_ROUND' ? 'Merry-go-round' : 'Chama contribution'}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${overdue ? 'bg-red-100 text-red-700' : partial ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Outstanding</p>
                          <SatsAmount sats={outstanding} exchangeRate={exchangeRate} loadingRate={loadingRate} primaryClassName="mt-1 text-xl font-bold text-gray-900" detailClassName="text-xs text-gray-500" />
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-semibold ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                          <Clock3 className="h-4 w-4" />
                          <span>{dueDate ? `${overdue ? 'Was due' : 'Due'} ${formatDate(dueDate)}` : 'Due date pending'}</span>
                        </div>
                      </div>

                      {partial && (
                        <div className="mt-4">
                          <div className="mb-1.5 flex justify-between text-xs text-gray-500"><span>{progress.toFixed(0)}% paid</span><span>{paid.toLocaleString()} of {amount.toLocaleString()} sats</span></div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${progress}%` }} /></div>
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center justify-between gap-3 border-t px-5 py-3 ${overdue ? 'border-red-100 bg-red-50/60' : partial ? 'border-amber-100 bg-amber-50/60' : 'border-blue-100 bg-blue-50/60'}`}>
                      <span className="text-xs text-gray-600">{partial ? 'Partial payments are allowed' : 'Pay from any active wallet'}</span>
                      {obligation.obligationReference ? (
                        <Link href={`/userdashboard/contribute/${obligation.chama.chamaReference}?obligation=${encodeURIComponent(obligation.obligationReference)}`} className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                          Pay now
                        </Link>
                      ) : (
                        <Link href={`/userdashboard/contribute/${obligation.chama.chamaReference}`} className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                          View Chama
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="mb-4 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900">Your Chamas</h2>
          <p className="mt-1 text-sm text-gray-500">View active contribution cycles and group details.</p>
        </div>

        {/* Cycles List - Grouped by Chama */}
        <div className="space-y-8">
          {loading ? (
             [1, 2].map((i) => (
               <div key={i} className="space-y-4">
                 <div className="h-32 bg-white rounded-2xl border border-gray-200 animate-pulse"></div>
                 <div className="h-48 bg-white rounded-2xl border border-gray-200 animate-pulse"></div>
               </div>
             ))
          ) : Object.keys(groupedCycles).length === 0 ? (
             <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
               <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
               <p className="text-gray-500">You have no unpaid contribution cycles at the moment.</p>
             </div>
          ) : (
            Object.entries(groupedCycles).map(([, chamaCycles]) => {
              const chama = chamaCycles[0].chama;
              
              return (
                <div key={chama.chamaReference} className="animate-fadeIn">
                  {/* --- CHAMA DETAILS CARD --- */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                        {chama.iconUrl ? (
                          <Image src={chama.iconUrl} alt={chama.name} className="w-full h-full object-cover" width={64} height={64} />
                        ) : (
                          <span className="text-2xl font-bold text-emerald-600">{chama.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h2 className="text-xl font-bold text-gray-900 truncate">{chama.name}</h2>
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                            {chama.visibility}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{chama.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs font-medium">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-700 border border-gray-100">
                            <Users className="w-3.5 h-3.5" />
                            <span>{chama.maxMembers} Members</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-gray-700 border border-gray-100">
                            <Hash className="w-3.5 h-3.5" />
                            <span>Rotation: {chama.currentRotationIndex}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100">
                            <Wallet className="w-3.5 h-3.5" />
                            <SatsAmount
                              sats={chama.contributionAmount}
                              exchangeRate={exchangeRate}
                              loadingRate={loadingRate}
                              primaryClassName="text-xs font-medium text-emerald-700"
                              detailClassName="text-[10px] text-emerald-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- CYCLES FOR THIS CHAMA --- */}
                  <div className="space-y-4 pl-2 border-l-2 border-gray-200">
                    {chamaCycles.map((cycle) => {
                      const progressPercent = calculateProgress(cycle.currentTotalContributionAmount, cycle.expectedTotalContributionAmount);
                      const currentTotalKes = convertSatsToKes(cycle.currentTotalContributionAmount);
                      const expectedTotalKes = convertSatsToKes(cycle.expectedTotalContributionAmount);

                      return (
                        <div key={cycle.cycleReference} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          {/* Card Header */}
                          <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                                {cycle.beneficiaryUsername.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Beneficiary</p>
                                <p className="font-bold text-gray-900 text-sm">{cycle.beneficiaryUsername}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold
                                ${cycle.status === 'OPEN' || cycle.status === 'ACTIVE' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-600'}`}>
                                {cycle.status}
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 space-y-4">
                            <div>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">
                                  {exchangeRate ? `KES ${formatKes(currentTotalKes)} / KES ${formatKes(expectedTotalKes)}` : "Loading rate..."}
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 p-3 rounded-xl">
                                <p className="text-[10px] text-gray-500 mb-1">Contribution</p>
                                <SatsAmount
                                  sats={cycle.contributionAmount}
                                  exchangeRate={exchangeRate}
                                  loadingRate={loadingRate}
                                  primaryClassName="font-bold text-gray-900 text-sm"
                                  detailClassName="text-[10px] text-gray-400"
                                />
                              </div>
                              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <p className="text-xs font-semibold text-gray-900">{formatDate(cycle.endAt)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex justify-end">
                             <button 
                               onClick={() => handlePayNow(cycle)}
                               className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow flex items-center gap-2"
                             >
                               Pay Now
                             </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-600">Page {currentPage + 1} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* --- PAYMENT MODAL --- */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setPaymentModal({ isOpen: false, cycle: null, selectedWallet: null })} />
          
          <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slideUp max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">
                {paymentModal.selectedWallet ? "Confirm Payment" : "Select Wallet"}
              </h3>
              <button onClick={() => setPaymentModal({ isOpen: false, cycle: null, selectedWallet: null })} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              
              {/* VIEW 1: SELECT WALLET */}
              {!paymentModal.selectedWallet ? (
                <div className="space-y-3">
                  {userWallets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No wallets available</div>
                  ) : (
                    userWallets.map((wallet) => (
                      <div
                        key={wallet.walletReference}
                        onClick={() => handleSelectWallet(wallet)}
                        className="group bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-2xl p-4 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Wallet size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{formatWalletName(wallet.lightning.name)}</h4>
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
                        {paymentModal.cycle!.beneficiaryUsername.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{paymentModal.cycle!.beneficiaryUsername}</p>
                        <p className="text-xs text-gray-500">{paymentModal.cycle!.chama.name}</p>
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
                        <p className="font-bold text-sm">{formatWalletName(paymentModal.selectedWallet.lightning.name)}</p>
                        <p className="text-xs text-gray-400">{paymentModal.selectedWallet.walletType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <SatsAmount
                        sats={paymentModal.cycle!.contributionAmount}
                        exchangeRate={exchangeRate}
                        loadingRate={loadingRate}
                        align="right"
                        primaryClassName="font-bold text-lg text-white"
                        detailClassName="text-xs text-gray-400"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleConfirmPayment}
                    disabled={paymentLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {paymentLoading ? (
                      <><Loader2 className="animate-spin" /> Processing...</>
                    ) : (
                      <><Zap size={20} fill="currentColor" /> Confirm Payment</>
                    )}
                  </button>

                  <button onClick={() => setPaymentModal(prev => ({ ...prev, selectedWallet: null }))} className="w-full text-center text-sm text-gray-500 hover:text-gray-900 font-medium py-2">
                    Change Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
