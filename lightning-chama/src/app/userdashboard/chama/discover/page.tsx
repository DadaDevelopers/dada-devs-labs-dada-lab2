"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Users, DollarSign, Calendar, X, Check } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import SatsAmount from '@/components/SatsAmount';
import { useBitcoinKesRate } from '@/hooks/useBitcoinKesRate';

type Chama = {
  chamaReference: string;
  name: string;
  description: string;
  contributionAmount: number;
  iconUrl?: string;
  visibility: string;
  maxMembers: number;
  currentRotationIndex: number;
  createdBy: {
    userReference: string;
    msisdn: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
};

// Define the available roles
const CHAMA_ROLES = [
  { value: 'MEMBER', label: 'Member', description: 'Regular member with voting rights' },
  { value: 'TREASURER', label: 'Treasurer', description: 'Manages chama finances' },
  { value: 'CHAIR', label: 'Chairperson', description: 'Leads meetings and represents the chama' },
  { value: 'ADMIN', label: 'Admin', description: 'Manages chama settings and members' }
];

export default function DiscoverChamasPage() {
  const { exchangeRate, loadingRate } = useBitcoinKesRate();
  const [activeTab, setActiveTab] = useState('discover');
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState<{[key: string]: boolean}>({});
  
  // State for role selection modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedChama, setSelectedChama] = useState<Chama | null>(null);
  const [selectedRole, setSelectedRole] = useState('MEMBER');

  useEffect(() => {
    const fetchChamas = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Not authenticated');
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

        if (!res.ok) throw new Error('Failed to fetch chamas');

        const data = await res.json();
        setChamas(data.content || []);
      } catch (err) {
        setError('Unable to load chamas');
      } finally {
        setLoading(false);
      }
    };

    fetchChamas();
  }, []);

  // Function to handle joining a chama
  const handleJoinChama = async () => {
    if (!selectedChama) return;
    
    try {
      const token = localStorage.getItem('token');
      const msisdn = localStorage.getItem('msisdn');
      
      if (!token || !msisdn) {
        setError('Not authenticated');
        return;
      }

      setJoining(prev => ({
        ...prev,
        [selectedChama.chamaReference]: true
      }));

      const res = await fetch(
        `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/chama/join/${selectedChama.chamaReference}/request?role=${selectedRole}&joinerPhone=${msisdn}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to join chama');
      }

      const data = await res.json();
      alert(`Request to join ${data.chama.name} as ${selectedRole} sent successfully! Your request is now pending approval.`);
      setShowRoleModal(false);
      setSelectedChama(null);
      setSelectedRole('MEMBER');
    } catch (err: any) {
      console.error('Error joining chama:', err);
      alert(err.message || 'Failed to join chama. Please try again.');
    } finally {
      setJoining(prev => ({
        ...prev,
        [selectedChama?.chamaReference || '']: false
      }));
    }
  };

  // Function to open role selection modal
  const openRoleModal = (chama: Chama) => {
    setSelectedChama(chama);
    setSelectedRole('MEMBER'); // Reset to default
    setShowRoleModal(true);
  };

  // Function to close role selection modal
  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedChama(null);
    setSelectedRole('MEMBER');
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to get background color based on chama name
  const getChamaColors = (name: string) => {
    const colors = [
      { bg: 'bg-green-100', icon: 'bg-green-700' },
      { bg: 'bg-teal-100', icon: 'bg-teal-600' },
      { bg: 'bg-yellow-100', icon: 'bg-yellow-600' },
      { bg: 'bg-blue-100', icon: 'bg-blue-600' },
      { bg: 'bg-purple-100', icon: 'bg-purple-600' },
      { bg: 'bg-pink-100', icon: 'bg-pink-600' },
      { bg: 'bg-indigo-100', icon: 'bg-indigo-600' },
      { bg: 'bg-red-100', icon: 'bg-red-600' }
    ];
    
    // Use a simple hash of the name to pick a consistent color
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <Navbar 
        isAuthenticated={true}
        userName=''
      />
      
      {/* Back to Home */}
      <div className="w-full max-w-md flex p-2 items-center">
        <Link
          href="/userdashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span className="text-sm">Go Back</span>
        </Link>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white px-8 py-4 flex gap-6">
        <Link href="/userdashboard/chama">
          <button 
            onClick={() => setActiveTab('myChamas')}
            className={`flex-1 py-3 px-6 text-xl rounded-lg font-medium transition-colors ${
            activeTab === 'myChamas'
              ? 'bg-white text-gray-900 border border-emerald-500'
              : 'bg-white text-gray-900 border border-emerald-500'
          }`}>
            My Chamas
          </button>
        </Link>
        <Link href="/userdashboard/chama/discover">
          <button 
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-3 px-10 rounded-lg font-medium  text-xl transition-colors ${
            activeTab === 'discover'
              ? 'bg-[#059669] text-white'
              : 'bg-[#059669] text-white'
          }`}>
            Discover
          </button>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-500">Loading chamas...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Chamas List */}
      {!loading && !error && (
        <div className="px-4 py-2 mb-2">
          {chamas.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">No chamas available to discover.</p>
            </div>
          ) : (
            chamas.map((chama) => {
              const colors = getChamaColors(chama.name);
              
              return (
                <div
                  key={chama.chamaReference}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 mb-4 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar/Logo */}
                      <div className="flex shrink-0">
                        <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center relative`}>
                          {chama.iconUrl ? (
                            <img 
                              src={chama.iconUrl} 
                              alt={chama.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full ${colors.icon} flex items-center justify-center`}>
                              <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">{chama.createdBy.username}</p>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{chama.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          {chama.description}
                        </p>
                        
                        {/* Chama Details */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-start gap-1">
                            <DollarSign size={14} />
                            <SatsAmount
                              sats={chama.contributionAmount}
                              exchangeRate={exchangeRate}
                              loadingRate={loadingRate}
                              primaryClassName="text-xs text-gray-500"
                              detailClassName="text-[10px] text-gray-400"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>Max {chama.maxMembers}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Created {formatDate(chama.createdAt)}</span>
                          </div>
                        </div>
                        
                        {/* Join Button */}
                        <button
                          onClick={() => openRoleModal(chama)}
                          disabled={joining[chama.chamaReference]}
                          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          {joining[chama.chamaReference] ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Joining...</span>
                            </div>
                          ) : (
                            'Join Chama'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Role Selection Modal */}
      {showRoleModal && selectedChama && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={closeRoleModal}
          />
          <div className="relative bg-white rounded-xl p-6 w-[92%] max-w-md animate-scaleIn">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#191919]">Join {selectedChama.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Select the role you'd like to join as</p>
              </div>
              <button onClick={closeRoleModal}>
                <X />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {CHAMA_ROLES.map((role) => (
                <div
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedRole === role.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{role.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{role.description}</div>
                    </div>
                    {selectedRole === role.value && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeRoleModal}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinChama}
                disabled={joining[selectedChama.chamaReference]}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {joining[selectedChama.chamaReference] ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Joining...</span>
                  </div>
                ) : (
                  'Confirm Join'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Indicator */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
      </div>
    </div>
  );
}
