"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowUp, Users, ArrowLeft, TrendingUp, Calendar, Crown, User, CheckCircle, XCircle, Wallet, CreditCard, Info, AlertCircle } from 'lucide-react';
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

export default function ChamasContribution() {
  const params = useParams();
  const router = useRouter();
  const chamaId = params.id as string;
  
  const [chamaData, setChamaData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const CACHE_DURATION_MS = 5 * 60 * 1000;
  
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
  }, []);

  const convertSatsToKes = (sats: number): number => {
    if (!exchangeRate) return 0;
    return (sats / 100000000) * exchangeRate;
  };

  useEffect(() => {
    const fetchChamaData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setError('Not authenticated'); return; }
        
        const chamaResponse = await fetch(`https://dada-devs-labs-dada-lab2.onrender.com/chama/${chamaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!chamaResponse.ok) throw new Error('Failed to fetch chama details');
        const data = await chamaResponse.json();
        setChamaData(data);
        
        const membersResponse = await fetch(`https://dada-devs-labs-dada-lab2.onrender.com/chama/${chamaId}/members-by-status/ACTIVE`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!membersResponse.ok) throw new Error('Failed to fetch chama members');
        const membersData = await membersResponse.json();
        setMembers(membersData || []);
        
      } catch (err) {
        setError('Unable to load chama details');
      } finally {
        setLoading(false);
      }
    };
    
    if (chamaId) fetchChamaData();
  }, [chamaId]);

  const activities = useMemo(() => {
    if (!chamaData?.contributionCycles) return [];
    const allActivities: any[] = [];
    chamaData.contributionCycles.forEach((cycle: any) => {
      if (cycle.usersAlreadyContributed && cycle.usersAlreadyContributed.length > 0) {
        cycle.usersAlreadyContributed.forEach((contrib: any) => {
          allActivities.push({
            id: `${cycle.cycleReference}-${contrib.userReference || Math.random()}`,
            type: 'CONTRIBUTION',
            user: contrib.user || { username: 'A member' },
            amount: contrib.amount || 0,
            date: contrib.contributedAt || cycle.endAt,
            details: `contributed to ${cycle.beneficiaryName}'s round`
          });
        });
      } else {
        allActivities.push({
          id: cycle.cycleReference,
          type: 'CYCLE_END',
          beneficiary: cycle.beneficiaryName,
          status: cycle.status,
          date: cycle.endAt,
          details: `Cycle for ${cycle.beneficiaryName} ${cycle.status.toLowerCase()}`
        });
      }
    });
    return allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [chamaData]);

  const chama = chamaData?.chama;
  const rules = chamaData?.rules;
  const wallets = chamaData?.wallets || [];
  const contributionCycles = chamaData?.contributionCycles || [];
  
  const activeCycle = contributionCycles.find((cycle: any) => cycle.status === 'ACTIVE');
  const latestCycle = contributionCycles[0];
  
  // Get the group chama wallet
  const chamaWallet = wallets.find((wallet: any) => wallet.walletType === 'CHAMA_GROUP');
  const chamaWalletReference = chamaWallet?.walletReference || '';
  
  const walletBalance = wallets.length > 0 ? wallets[0].balanceSats : 0;
  const currentAmount = convertSatsToKes(walletBalance);
  const contributionAmount = rules ? convertSatsToKes(rules.contributionAmount || 0) : 0;
  
  const targetAmount = activeCycle 
    ? convertSatsToKes(activeCycle.expectedTotalContributionAmount || 0)
    : convertSatsToKes(latestCycle?.expectedTotalContributionAmount || 0);
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  const totalMembers = members.length;
  const visibleMembers = members.slice(0, 4);

  // Central navigation handler for contributing to a cycle
  const handleNavigateToCycleContribution = (cycle: any) => {
    if (!cycle) return;
    const walletReference = cycle.beneficiaryWalletReference;
    if (!activeCycle) {
      setShowWarningModal(true);
    } else {
      router.push(`/userdashboard/contribute/${chamaId}/wallet/${walletReference}`);
    }
  };
  
  // Central navigation handler for contributing to the group chama
  const handleNavigateToChamaContribution = () => {
    if (!chamaWalletReference) return;
    router.push(`/userdashboard/contribute/${chamaId}/wallet/${chamaWalletReference}`);
  };
  
  // Central navigation handler for contributing to a specific wallet
  const handleNavigateToWalletContribution = (walletId: string) => {
    if (!walletId) return;
    router.push(`/userdashboard/contribute/${chamaId}/wallet/${walletId}`);
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

          {/* Progress Section */}
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

            {/* Progress Bar */}
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

          {/* Beneficiary and Rotation Info */}
          <div className="space-y-1 mb-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Beneficiary:</span>
              <span className="font-medium text-gray-900">
                {activeCycle?.beneficiaryName || latestCycle?.beneficiaryName || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Rotation Index:</span>
              <span className="font-medium text-gray-900">
                {activeCycle?.rotationIndex || latestCycle?.rotationIndex || 'N/A'}
              </span>
            </div>
          </div>

          {/* Next Contribution Info */}
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
                {activeCycle ? (
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => activeCycle ? handleNavigateToCycleContribution(activeCycle) : handleNavigateToCycleContribution(latestCycle)}
              disabled={!contributionCycles.length}
              className={`flex-1 text-md font-medium py-3.5 px-2 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                contributionCycles.length 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {activeCycle ? 'Contribute to Cycle' : 'Make Late Contribution'}
              <ArrowUp className="w-5 h-5" />
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
                <span className="text-sm text-gray-700">{activeCycle.beneficiaryName}</span>
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

              {activeCycle && activeCycle.usersAlreadyContributed && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {activeCycle.usersAlreadyContributed.length} member{activeCycle.usersAlreadyContributed.length > 1 ? 's' : ''} contributed
                  </p>
                  {activeCycle.usersAlreadyContributed.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeCycle.usersAlreadyContributed.map((contributor: any) => (
                        <span key={contributor.userReference} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {contributor.user?.username || 'Unknown'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => handleNavigateToCycleContribution(activeCycle)}
              className="w-full mt-4 text-md font-medium py-3.5 px-2 rounded-xl transition-colors flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Contribute to Cycle
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* If no active cycle, show the last closed cycle info */}
        {!activeCycle && latestCycle && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Last Contribution Cycle</h3>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {latestCycle.status}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Beneficiary</span>
                <span className="text-sm text-gray-700">{latestCycle.beneficiaryName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Rotation Index</span>
                <span className="text-sm text-gray-700">{latestCycle.rotationIndex}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Cycle Ended</span>
                <span className="text-sm text-gray-700">
                  {new Date(latestCycle.endAt).toLocaleString()}
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
                    onClick={() => handleNavigateToWalletContribution(wallet.walletReference)}
                    className="w-full mt-3 text-sm bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
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
              activities.slice(0, 5).map((activity: { [key: string]: any }) => {
                const isContribution = activity.type === 'CONTRIBUTION';
                const Icon = isContribution ? TrendingUp : CheckCircle;
                const iconColor = isContribution ? 'text-emerald-600' : 'text-blue-600';
                const bgColor = isContribution ? 'bg-emerald-100' : 'bg-blue-100';
                
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`${bgColor} rounded-full p-2`}>
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {isContribution ? activity.user.username : activity.beneficiary} {activity.details}
                      </p>
                      <p className="text-xs text-gray-600">{timeAgo(activity.date)}</p>
                    </div>
                    <p className={`font-semibold ${isContribution ? 'text-emerald-600' : 'text-gray-700'}`}>
                      {isContribution ? `+KES ${convertSatsToKes(activity.amount).toLocaleString()}` : activity.status}
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

      {/* Late Contribution Warning Modal */}
      {showWarningModal && (
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
                  The contribution period for this cycle has closed on {latestCycle && new Date(latestCycle.endAt).toLocaleDateString()}.
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
                  if (latestCycle) {
                    router.push(`/userdashboard/contribute/${chamaId}/wallet/${latestCycle.beneficiaryWalletReference}`);
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