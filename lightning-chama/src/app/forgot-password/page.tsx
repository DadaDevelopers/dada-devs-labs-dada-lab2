"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import logo from "@/assets/Ellipse 1.svg";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "verify" | "reset">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Request password reset
  const handleRequestReset = async () => {
    setError("");
    setSuccess("");

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://dada-devs-labs-dada-lab2.onrender.com/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ msisdn: phoneNumber }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send verification code");
      }

      setSuccess("Verification code sent to your phone!");
      setStep("verify");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = async () => {
    setError("");
    setSuccess("");

    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://dada-devs-labs-dada-lab2.onrender.com/auth/verify-reset-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            msisdn: phoneNumber,
            code: verificationCode,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Invalid verification code");
      }

      setSuccess("Code verified! Now set your new PIN.");
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!newPin.trim() || !confirmPin.trim()) {
      setError("Please enter your new PIN");
      return;
    }

    if (newPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://dada-devs-labs-dada-lab2.onrender.com/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            msisdn: phoneNumber,
            code: verificationCode,
            newPin: newPin,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess("Password reset successful! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/landing-page");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Back Button */}
      <div className="w-full max-w-md mb-8">
        <Link
          href="/landing-page"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to Login</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-emerald-600 overflow-hidden">
            <Image src={logo} alt="ChamaVault Logo" width={96} height={96} />
          </div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {step === "phone" && "Forgot Password"}
          {step === "verify" && "Verify Code"}
          {step === "reset" && "Reset Password"}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {step === "phone" && "Enter your phone number to receive a verification code"}
          {step === "verify" && "Enter the verification code sent to your phone"}
          {step === "reset" && "Create your new 4-digit PIN"}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Step 1: Phone Number */}
        {step === "phone" && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 bg-blue-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleRequestReset}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </>
        )}

        {/* Step 2: Verify Code */}
        {step === "verify" && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 bg-blue-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl tracking-widest"
              />
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              onClick={() => setStep("phone")}
              className="w-full text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Didn't receive code? Try again
            </button>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === "reset" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New PIN
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                className="w-full px-4 py-3 bg-blue-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                className="w-full px-4 py-3 bg-blue-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {/* Back to Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/landing-page"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
