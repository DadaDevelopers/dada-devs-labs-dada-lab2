"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CODE_PREFIX = "VAULT-";
const CODE_PATTERN = /^[A-Z0-9]{4,5}$/;

export default function VerifyNumber() {
  const router = useRouter();

  // Read phone from URL on client only
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPhone(params.get("phone"));
  }, []);

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value: string) => {
    const suffix = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
    setOtp(suffix);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedCode = event.clipboardData
      .getData("text")
      .trim()
      .toUpperCase()
      .replace(/^VAULT-/, "");

    if (!CODE_PATTERN.test(pastedCode)) return;

    event.preventDefault();
    setOtp(pastedCode);
  };

  const handleVerify = async () => {
    setError("");

    if (!CODE_PATTERN.test(otp)) {
      setError("Enter the 4 or 5 characters after VAULT-.");
      return;
    }

    const code = `${CODE_PREFIX}${otp}`;

    if (!phone) {
      setError("Phone number missing.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://dada-devs-labs-dada-lab2-chamavault.onrender.com/codes/pre-registration/code-validation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ownerMsisdn: phone,
            code,
          }),
        }
      );

      if (!response.ok) {
        setError("Invalid or expired code.");
        return;
      }

      // SUCCESS → pass phone to next step
      router.push(
        `/landing-page/create-pin-password?phone=${encodeURIComponent(phone)}`
      );
    } catch {
      setError("Failed to connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white flex justify-center px-4">
      <div className="w-full max-w-sm pt-6">
        {/* Go Back */}
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-gray-600">
            <Image src="/ic-left.svg" width={20} height={20} alt="Back" />
            <span className="text-sm">Go Back</span>
          </Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/Ellipse 1.svg"
            width={90}
            height={90}
            alt="ChamaVault Logo"
          />
        </div>

        {/* Headings */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Verify Phone Number
          </h1>
          <p className="text-black mt-1">
            Enter the verification code sent to your number
          </p>
        </div>

        {/* Verification code input */}
        <div className="mb-3 flex h-14 overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20">
          <span className="flex items-center border-r border-gray-200 bg-gray-50 px-4 font-semibold tracking-wider text-gray-500">
            {CODE_PREFIX}
          </span>
          <input
              id="verification-code"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="one-time-code"
              maxLength={5}
              value={otp}
              onChange={(e) => handleChange(e.target.value)}
              onPaste={handlePaste}
              placeholder="PPIWD"
              aria-label="Verification code suffix"
              className="min-w-0 flex-1 px-4 text-lg font-semibold uppercase tracking-[0.25em] text-gray-700 outline-none placeholder:text-gray-300"
            />
        </div>
        <p className="mb-5 text-center text-xs text-gray-500">
          You can also paste the complete code, such as VAULT-PPIWD.
        </p>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center mb-3">{error}</p>
        )}

        {/* Resend */}
        <p className="text-center text-xs text-gray-500 mb-2">
          Resend code in <span className="text-emerald-600">{timer}s</span>
        </p>

        {/* Continue Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 rounded-lg font-medium transition"
        >
          {loading ? "Verifying..." : "Continue"}
        </button>
      </div>
    </section>
  );
}
