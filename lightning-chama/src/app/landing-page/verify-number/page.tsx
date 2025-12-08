"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function VerifyNumber() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(25);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <section className="min-h-screen w-full bg-white px-6 py-8 flex flex-col items-center">

      <div className="w-full max-w-md flex items-center">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Image src="/ic-left.svg" width={20} height={20} alt="Back" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </div>

      <div className="mt-8 w-full max-w-md text-center">

        <div className="flex justify-center">
          <Image
            src="/Ellipse 1.svg"
            width={95}
            height={95}
            alt="ChamaVault Logo"
          />
        </div>

        <h2 className="text-2xl font-bold text-black mt-5">
          Create Account
        </h2>

        <p className="text-black text-sm mt-1">
          Verify your number
        </p>

        <div className="mt-8 w-full text-left">
          <label className="text-black text-sm font-medium">
            6-digit OTP input
          </label>

          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter the 6-digit code sent to +254 7XX XXXXXX"
            className="w-full mt-2 p-3 border border-gray-300 rounded-xl text-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#059669]"
          />

          <p className="text-gray-500 text-xs mt-2">
            Resend code in {timer}s
          </p>
        </div>

        <button
          className="w-full mt-8 bg-[#059669] text-white py-3 rounded-xl font-semibold text-base hover:bg-[#047857] transition"
        >
          Verify
        </button>

        <p className="text-[#059669] text-sm mt-4 cursor-pointer">
          Wrong number?
        </p>

      </div>
    </section>
  );
}
