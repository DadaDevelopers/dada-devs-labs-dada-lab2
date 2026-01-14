"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function VerifyNumber() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(25);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    // Auto focus next input
    const nextInput = document.getElementById(`otp-${index + 1}`);
    if (value && nextInput) {
      (nextInput as HTMLInputElement).focus();
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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Verify Phone Number
          </h1>
          <p className="text-black mt-1">
            Enter the 6 digit code sent to your number
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          ))}
        </div>

        {/* Resend */}
        <p className="text-center text-xs text-gray-500 mb-8">
          Resend code in <span className="text-green-600">{timer}s</span>
        </p>

        {/* Continue Button */}
        <button
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 rounded-lg font-medium transition"
        >
          Continue
        </button>

      </div>
    </section>
  );
}
