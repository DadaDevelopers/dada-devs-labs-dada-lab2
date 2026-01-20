"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
};

export default function ChamasPage() {
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "PENDING">("ACTIVE");

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
            You don’t have any active chamas yet.
          </p>
        )}

        {!loading &&
          !error &&
          chamas.map((chama) => (
            <Link
              key={chama.chamaReference}
              href={`/userdashboard/chama/${chama.chamaReference}`}
            >
              <div className="bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:bg-gray-50 transition">
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
