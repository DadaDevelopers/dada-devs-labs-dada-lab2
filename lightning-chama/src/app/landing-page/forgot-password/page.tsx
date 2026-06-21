"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

type RecoveryStep = "request" | "reset" | "success";

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

const parseApiResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as ApiErrorResponse;
  } catch {
    return text;
  }
};

const normalizeMsisdn = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) return `254${digits}`;
  return digits;
};

const extractError = (data: ApiErrorResponse | string | null, fallback: string) => {
  if (!data) return fallback;
  if (typeof data === "string") return data || fallback;
  return data.message || data.error || fallback;
};

const extractMessage = (data: ApiErrorResponse | string | null, fallback: string) => {
  if (!data) return fallback;
  if (typeof data === "string") return data || fallback;
  return data.message || fallback;
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<RecoveryStep>("request");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const msisdn = normalizeMsisdn(phone);

  const handleRequestOtp = async () => {
    setError("");
    setMessage("");

    if (!msisdn) {
      setError("Phone number is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/users/forgot-password/${encodeURIComponent(msisdn)}`,
        { method: "GET" }
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setError(extractError(data, "Unable to send OTP. Please try again."));
        return;
      }

      setMessage(extractMessage(data, "OTP sent. Check your phone and enter the code below."));
      setStep("reset");
    } catch {
      setError("Failed to connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    if (!msisdn || !otp || !newPassword || !confirmPassword) {
      setError("Phone number, OTP, and new password are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        otp: otp.trim(),
        newPassword,
      });

      const response = await fetch(
        `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/users/retrieve-account/${encodeURIComponent(msisdn)}?${params.toString()}`,
        { method: "POST" }
      );

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setError(extractError(data, "Unable to reset password. Check the OTP and try again."));
        return;
      }

      setStep("success");
      setMessage(extractMessage(data, "Your password has been reset. You can now log in."));
    } catch {
      setError("Failed to connect to server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white px-6 pt-6">
      <div className="mx-auto w-full max-w-sm">
        <div className="w-full flex items-center mb-6">
          <Link
            href="/landing-page/login"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Image src="/ic-left.svg" width={20} height={20} alt="Back" />
            <span className="text-sm">Back to Login</span>
          </Link>
        </div>

        <div className="flex justify-center mb-6">
          <Image
            src="/Ellipse 1.svg"
            alt="ChamaVault Logo"
            width={100}
            height={100}
            priority
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[22px] font-semibold text-gray-900">
            Recover Password
          </h1>
          <p className="text-black mt-1 text-base">
            {step === "request" && "Enter your phone number to receive an OTP."}
            {step === "reset" && "Enter the OTP and set a new password."}
            {step === "success" && "Password recovery complete."}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-900 mb-1 font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="254700000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={step === "success" || loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {step !== "request" && (
            <>
              <div>
                <label className="block text-sm text-gray-900 mb-1 font-medium">
                  OTP
                </label>
                <input
                  type="text"
                  placeholder="VAULT-YBWAC"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.toUpperCase())}
                  disabled={step === "success" || loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="relative">
                <label className="block text-sm text-gray-900 mb-1 font-medium">
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={step === "success" || loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-[38px] text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm text-gray-900 mb-1 font-medium">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={step === "success" || loading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-[38px] text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-700">{message}</p>}

          {step === "request" && (
            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          )}

          {step === "reset" && (
            <div className="space-y-3 pt-2">
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={loading}
                className="w-full rounded-xl border border-emerald-200 bg-white py-3 text-emerald-700 font-semibold hover:bg-emerald-50 transition disabled:opacity-60"
              >
                Resend OTP
              </button>
            </div>
          )}

          {step === "success" && (
            <Link
              href="/landing-page/login"
              className="block w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-center text-white font-semibold transition"
            >
              Back to Login
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
