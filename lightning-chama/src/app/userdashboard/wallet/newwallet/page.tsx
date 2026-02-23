"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NewWalletPage() {
  const router = useRouter();
  const [walletName, setWalletName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!walletName.trim()) {
      setError("Please enter a wallet name");
      return;
    }

    setLoading(true);

    try {
      // Retrieve authentication details
      const token = localStorage.getItem("token");
      const msisdn = localStorage.getItem("msisdn");

      if (!token || !msisdn) {
        throw new Error("Authentication details missing. Please log in again.");
      }

      // Construct the API URL with query parameters
      const apiUrl = `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/wallets/user?msisdn=${msisdn}&walletName=${encodeURIComponent(walletName)}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create wallet (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log("Wallet Created:", data);

      // Redirect to the main wallet page upon success
      router.push("/userdashboard/wallet");

    } catch (err: any) {
      console.error("Wallet creation error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} userName="" />

      <div className="flex flex-col items-center justify-center pt-20 px-6 mt-10 text-center">
        
        {/* Back to Home */}
        <div className="w-full max-w-md flex p-2 mb-4 items-center">
          <Link
            href="/userdashboard/wallet"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span className="text-md text-gray-700 font-medium">Back to Wallets</span>
          </Link>
        </div>

        <h1 className="text-2xl text-gray-800 font-bold mb-2">Create New Wallet</h1>
        <p className="text-gray-500 mb-8 max-w-xs">
          Give your new wallet a name to get started.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md space-y-5"
        >
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="text-left">
            <label htmlFor="walletName" className="block text-gray-700 mb-2 font-semibold text-sm">
              Wallet Name
            </label>
            <input
              id="walletName"
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="e.g. Daily Spending"
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 transition"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating Wallet...
              </>
            ) : (
              "Create Wallet"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}