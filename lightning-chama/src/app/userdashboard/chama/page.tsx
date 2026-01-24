"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Users, Check, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

type Chama = {
  chamaReference: string;
  name: string;
  description: string;
  iconUrl?: string;
  visibility: string;
  contributionAmount: number;
  maxMembers: number;
  createdBy?: {
    userReference: string;
    msisdn: string;
    username: string;
  };
};

type MemberRequest = {
  reference: string;
  chama: {
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
  };
  user: {
    userReference: string;
    msisdn: string;
    username: string;
  };
  role: string;
  status: string;
  joinedAt: string;
  updatedAt: string;
};

export default function ChamasPage() {
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "PENDING">("ACTIVE");
  
  // State for pending members
  const [pendingMembers, setPendingMembers] = useState<{[key: string]: MemberRequest[]}>({});
  const [loadingPending, setLoadingPending] = useState<{[key: string]: boolean}>({});
  const [expandedChamas, setExpandedChamas] = useState<Set<string>>(new Set());

  // Function to fetch pending members using the correct endpoint
  const fetchPendingMembers = async (chamaReference: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `https://dada-devs-labs-dada-lab2.onrender.com/chama/${chamaReference}/members-by-status/PENDING`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch pending members");

      const data = await res.json();
      setPendingMembers(prev => ({
        ...prev,
        [chamaReference]: data || []
      }));
    } catch (err) {
      console.error("Error fetching pending members:", err);
    }
  };

  // Function to approve/reject a member
  const handleMemberAction = async (chamaReference: string, memberReference: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const token = localStorage.getItem("token");
      const msisdn = localStorage.getItem("msisdn");
      
      if (!token || !msisdn) return;

      setLoadingPending(prev => ({
        ...prev,
        [memberReference]: true
      }));

      const res = await fetch(
        `https://dada-devs-labs-dada-lab2.onrender.com/chama/${chamaReference}/members/${memberReference}/${action.toLowerCase()}?approverPhone=${msisdn}&status=${action === 'APPROVE' ? 'ACTIVE' : 'REJECTED'}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Failed to ${action.toLowerCase()} member`);

      // Refresh the pending members list
      await fetchPendingMembers(chamaReference);
      
      // Show success message
      alert(`Member ${action.toLowerCase()}d successfully!`);
    } catch (err) {
      console.error(`Error ${action.toLowerCase()}ing member:`, err);
      alert(`Failed to ${action.toLowerCase()} member. Please try again.`);
    } finally {
      setLoadingPending(prev => ({
        ...prev,
        [memberReference]: false
      }));
    }
  };

  // Toggle expanded state for a chama
  const toggleChamaExpanded = async (chamaReference: string) => {
    const newExpanded = new Set(expandedChamas);
    if (newExpanded.has(chamaReference)) {
      newExpanded.delete(chamaReference);
    } else {
      newExpanded.add(chamaReference);
      // Fetch pending members when expanding
      if (!pendingMembers[chamaReference]) {
        await fetchPendingMembers(chamaReference);
      }
    }
    setExpandedChamas(newExpanded);
  };

  useEffect(() => {
    const fetchChamas = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const msisdn = localStorage.getItem("msisdn");

        if (!token || !msisdn) {
          setError("Not authenticated");
          return;
        }

        const res = await fetch(
          `https://dada-devs-labs-dada-lab2.onrender.com/chama/${msisdn}/status/${statusFilter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch chamas");

        const data = await res.json();
        setChamas(data || []);
      } catch {
        setError("Unable to load chamas");
      } finally {
        setLoading(false);
      }
    };

    fetchChamas();
  }, [statusFilter]);

  const isUserCreator = (chama: Chama) => {
    const userMsisdn = localStorage.getItem("msisdn");
    return chama.createdBy && chama.createdBy.msisdn === userMsisdn;
  };

  const getPendingCount = (chamaReference: string) => {
    return pendingMembers[chamaReference] ? pendingMembers[chamaReference].length : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <Navbar isAuthenticated={true} userName="" />

      {/* Back */}
      <div className="w-full max-w-md flex p-2 items-center">
        <Link
          href="/userdashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span className="text-sm">Go Back</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white px-6 py-4 flex gap-4">
        <Link href="/userdashboard/chama" className="flex-1">
          <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium">
            My Chamas
          </button>
        </Link>
        <Link href="/userdashboard/chama/discover" className="flex-1">
          <button className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium border border-emerald-500">
            Discover
          </button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="px-6 py-3">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {["ACTIVE", "PENDING"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as "ACTIVE" | "PENDING")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition
                ${
                  statusFilter === status
                    ? "bg-white text-emerald-600 shadow"
                    : "text-gray-600"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-4">
        {loading && (
          <p className="text-sm text-gray-500">Loading chamas...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && chamas.length === 0 && (
          <p className="text-sm text-gray-500">
            You don't have any {statusFilter.toLowerCase()} chamas yet.
          </p>
        )}

        {!loading &&
          !error &&
          chamas.map((chama) => (
            <div key={chama.chamaReference} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <Link href={`/userdashboard/contribute/${chama.chamaReference}`}>
                <div className="p-4 flex items-start gap-4 hover:bg-gray-50 transition">
                  {/* Icon */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={chama.iconUrl || "/placeholder.png"}
                        alt={chama.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {chama.visibility}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {chama.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {chama.description}
                    </p>

                    <div className="mt-2 text-xs text-gray-500 flex gap-4">
                      <span>
                        💰 {chama.contributionAmount} sats
                      </span>
                      <span>
                        👥 Max {chama.maxMembers}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Pending Members Section - Only for Chama Creators */}
              {isUserCreator(chama) && (
                <div className="border-t border-gray-100 text-[#191919]">
                  <button
                    onClick={() => toggleChamaExpanded(chama.chamaReference)}
                    className="w-full px-4 py-3 flex items-center justify-between text-sm bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span className="font-medium">Member Requests</span>
                      {getPendingCount(chama.chamaReference) > 0 && (
                        <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {getPendingCount(chama.chamaReference)}
                        </span>
                      )}
                    </div>
                    <span className={`text-gray-400 transition-transform ${expandedChamas.has(chama.chamaReference) ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {expandedChamas.has(chama.chamaReference) && (
                    <div className="px-4 py-3 bg-gray-50">
                      {getPendingCount(chama.chamaReference) > 0 ? (
                        <div className="space-y-3">
                          {pendingMembers[chama.chamaReference].map((member) => (
                            <div key={member.reference} className="bg-white p-3 rounded-lg shadow-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{member.user.username}</p>
                                  <p className="text-xs text-gray-500">{member.user.msisdn}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Requested {new Date(member.joinedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleMemberAction(chama.chamaReference, member.reference, 'APPROVE')}
                                    disabled={loadingPending[member.reference]}
                                    className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition"
                                    title="Approve"
                                  >
                                    {loadingPending[member.reference] ? (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Check size={16} />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleMemberAction(chama.chamaReference, member.reference, 'REJECT')}
                                    disabled={loadingPending[member.reference]}
                                    className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
                                    title="Reject"
                                  >
                                    {loadingPending[member.reference] ? (
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <X size={16} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">
                          No pending member requests
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Create Chama */}
      <Link href="/userdashboard/chama/createchama">
        <div className="mx-6 mb-8 flex items-center gap-4 border border-gray-300 rounded-xl p-4 hover:bg-gray-50 transition">
          <div className="text-2xl">➕</div>
          <span className="font-medium text-lg text-gray-700">
            Create Chama
          </span>
        </div>
      </Link>
    </div>
  );
}