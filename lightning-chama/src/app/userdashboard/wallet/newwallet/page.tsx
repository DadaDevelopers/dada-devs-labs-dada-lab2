"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
export default function NewWalletPage() {
  const router = useRouter();
  const [walletName, setWalletName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName) {
      alert("Please enter a wallet name");
      return;
    }

    setLoading(true);

    //TEMP WALLET CREATION (localStorage)
    const newWallet = {
      id: "wallet_" + Date.now(),
      name: walletName,
      pin: pin || null,
      balanceBtc: 0,
      balanceKes: 0,
      createdAt: new Date().toISOString(),
    };

    // Save locally for now
    localStorage.setItem("wallet", JSON.stringify(newWallet));

    // Redirect to dashboard
    router.replace("/userdashboard/wallet/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} userName="" />

      <div className="flex flex-col items-center justify-center pt-20 px-6 mt-10 text-center">
        {/* Back to Home */}
      <div className="w-full max-w-md flex p-2  mb-4 items-center">
        <Link
          href="/userdashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span className="text-md text-gray-700">Go Back</span>
        </Link>
      </div>
        <h1 className="text-2xl text-gray-600 font-bold mb-4">Create Your Wallet</h1>
        <p className="text-gray-600 mb-6">
          Enter a name for your wallet and optionally set a PIN.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md space-y-4"
        >
          <div>
            <label htmlFor="walletName" className="block text-left text-gray-700 mb-1 font-medium">
              Wallet Name
            </label>
            <input
              id="walletName"
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="My Lightning Wallet"
              className="w-full border text-md text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <div>
            <label htmlFor="pin" className="block text-gray-700 text-left mb-1 font-medium">
              PIN (optional)
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4-6 digit PIN"
              className="w-full border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "Creating Wallet..." : "Create Wallet"}
          </button>
        </form>
      </div>
    </div>
  );
}
