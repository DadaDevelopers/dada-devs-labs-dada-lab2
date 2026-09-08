"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SetPinPage() {
  const router = useRouter();

  const [msisdn, setMsisdn] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [receiveNewsletter, setReceiveNewsletter] = useState(false);
  const [howDidYouHearUs, setHowDidYouHearUs] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const identifier = params.get("identifier") || params.get("phone") || "";
    if (identifier.includes("@")) {
      setEmail(identifier.toLowerCase());
      setEmailVerified(true);
    } else if (identifier) {
      setMsisdn(identifier.replace(/\D/g, ""));
    }
  }, []);

  const handleSubmit = async () => {
    setError("");

    const normalizedMsisdn = msisdn.replace(/\D/g, "");
    if (normalizedMsisdn.length !== 12 || !normalizedMsisdn.startsWith("254")) {
      setError("Enter a valid Kenyan phone number, e.g. 0712345678 or 254712345678.");
      return;
    }

    if (!username.trim() || !email.trim() || !howDidYouHearUs.trim() || !pin || !confirmPin) {
      setError("All fields are required.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
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
            msisdn: normalizedMsisdn,
            password: pin,
            passwordReEntered: confirmPin,
            username: username.trim(),
            roles: ["USER"],
            countries: ["KE"],
            kyc: {
              email: email.trim(),
              receive_newsletter: receiveNewsletter ? "Yes" : "No",
              how_did_you_hear_us: howDidYouHearUs.trim(),
            },
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
      sessionStorage.removeItem('email_prompt_dismissed');

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
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="e.g. Janexxx"
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 text-[#191919]"
            />
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Phone number
            </label>
            <input
              type="tel"
              value={msisdn}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "");
                setMsisdn(digits.startsWith("0") ? `254${digits.slice(1)}` : digits);
              }}
              autoComplete="tel"
              placeholder="0712345678 or 254712345678"
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 text-[#191919]"
            />
            {emailVerified && <p className="mt-1 text-xs text-gray-500">Required to create your ChamaVault account after email verification.</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={emailVerified}
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 text-[#191919] read-only:bg-gray-50 read-only:text-gray-500"
            />
            {emailVerified && <p className="mt-1 text-xs font-medium text-emerald-600">Email verified</p>}
          </div>

          {/* Referral source */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              How did you hear about us?
            </label>
            <select
              value={howDidYouHearUs}
              onChange={(e) => setHowDidYouHearUs(e.target.value)}
              className="w-full border border-gray-300 rounded-lg bg-white px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-emerald-600 text-[#191919]"
            >
              <option value="">Select an option</option>
              <option value="A friend's referral">A friend&apos;s referral</option>
              <option value="Social media">Social media</option>
              <option value="Community event">Community event</option>
              <option value="Online search">Online search</option>
              <option value="Other">Other</option>
            </select>
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
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={receiveNewsletter}
              onChange={(e) => setReceiveNewsletter(e.target.checked)}
              className="mt-1 h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm text-gray-700">
              Send me occasional ChamaVault news and product updates.
            </span>
          </label>

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
