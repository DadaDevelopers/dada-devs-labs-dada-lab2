"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SetPinPage() {
  const router = useRouter();

  // Read phone from URL on client only
  const [msisdn, setMsisdn] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get("phone");
    // Remove all spaces from the phone number
    if (phone) {
      setMsisdn(phone.replace(/\s+/g, ''));
    }
  }, []);

  const [fullName, setFullName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!msisdn) {
      setError("Phone number missing.");
      return;
    }

    if (!fullName || !pin || !confirmPin) {
      setError("All fields are required.");
      return;
    }

    // EXACTLY 4 DIGIT PIN
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

      const response = await fetch(
        "https://dada-devs-labs-dada-lab2-chamavault.onrender.com/api/users/setup/sign-up",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            msisdn,
            password: pin,
            passwordReEntered: confirmPin,
            username: fullName,
            roles: ["USER"],
            countries: ["KE"],
            kyc: {},
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create account.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userReference", data.user.userReference);
      localStorage.setItem("msisdn", data.user.msisdn);

      router.push("/userdashboard");
    } catch {
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

        <h1 className="text-2xl font-semibold text-gray-900">Set PIN</h1>
        <p className="text-black mt-1">
          Set PIN that will be used for transactions
        </p>

        <div className="mt-8 space-y-5 text-left">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 text-[#191919]"
            />
          </div>

          {/* PIN */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Set PIN
            </label>
            <input
              type={showPin ? "text" : "password"}
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-[#191919]"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-4 top-[38px]"
            >
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm PIN */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Confirm PIN
            </label>
            <input
              type={showConfirmPin ? "text" : "password"}
              maxLength={4}
              value={confirmPin}
              onChange={(e) =>
                setConfirmPin(e.target.value.replace(/\D/g, ""))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-[#191919]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPin(!showConfirmPin)}
              className="absolute right-4 top-[38px]"
            >
              {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-emerald-600"
            />
            <p className="text-sm font-medium text-gray-900">
              I have read and understood the{" "}
              <Link
                href="/terms"
                className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700 transition-colors"
              >
                Terms &amp; Privacy Policy
              </Link>
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700
                       disabled:opacity-60 text-white py-3 rounded-lg"
          >
            {loading ? "Processing..." : "Go to Dashboard"}
          </button>
        </div>
      </div>
    </section>
  );
}