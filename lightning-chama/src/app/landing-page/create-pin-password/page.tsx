"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SetPinPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    // ✅ FORM VALIDATION (after signing)
    if (!fullName || !pin || !confirmPin) {
      setError("All fields are required.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    if (!agreed) {
      setError("You must accept the terms & policy.");
      return;
    }

    try {
      setLoading(true);

      // 🔌 API INTEGRATION POINT (READY)
      // Backend team will replace this with real endpoint
      /*
      await fetch("/api/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, pin }),
      });
      */

      console.log("API-ready payload:", { fullName, pin });

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white px-6 py-8 flex flex-col items-center">

      {/* Go Back */}
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
        >
          <Image src="/ic-left.svg" alt="Back" width={18} height={18} />
          <span>Go Back</span>
        </Link>
      </div>

      {/* Content */}
      <div className="w-full max-w-md mt-10 text-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/Ellipse 1.svg"
            alt="ChamaVault Logo"
            width={90}
            height={90}
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-gray-900">
          Set PIN
        </h1>
        <p className="text-black mt-1">
          Set PIN that will be used for transactions
        </p>

        {/* Form */}
        <div className="mt-8 space-y-5 text-left">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Chama Vault"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Set PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Set PIN
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Confirm PIN
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="
                mt-1 h-4 w-4 
                accent-emerald-600
                cursor-pointer
              "
            />
            <p className="text-sm font-medium text-gray-900">
              I understood the{" "}
              <span className="text-emerald-600 cursor-pointer">
                terms & policy
              </span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 rounded-lg font-medium transition"
          >
            {loading ? "Processing..." : "Go to Dashboard"}
          </button>

        </div>
      </div>
    </section>
  );
}
