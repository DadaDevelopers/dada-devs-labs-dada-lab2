'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function VerifyNumber() {
  const router = useRouter();
  const [timer, setTimer] = useState(25);
  const [otp, setOtp] = useState('');

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex justify-center px-4 pt-10">
      <div className="w-full max-w-sm">

        {/* Back */}
        <button
          className="flex items-center gap-2 text-gray-700 mb-10"
          onClick={() => router.back()}
        >
          <Image src="/ic-left.svg" alt="back" width={18} height={18} />
          <span className="text-sm">Back to Home</span>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <Image src="/Ellipse 1.svg" alt="Logo" width={85} height={85} />
        </div>

        {/* Heading */}
        <h1 className="text-center text-[20px] font-semibold text-black mb-1">
          Create Account
        </h1>

        {/* Subtitle: now pure black (#000000) as requested */}
        <p className="text-center text-[13px] mb-8" style={{ color: '#000000' }}>
          Verify your number
        </p>

        {/* Label: black */}
        <p className="text-[13px] font-medium text-black mb-2">6-digit OTP input</p>

        {/* Input: make sure typed digits are visible (text-black) */}
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter the 6-digit code sent to +254 7XX XXXXXX"
          className="
            w-full border border-gray-300 rounded-lg px-3 py-3 
            text-sm placeholder:text-gray-400 
            outline-none focus:ring-2 focus:ring-[#059669] text-black
          "
        />

        {/* Timer */}
        <p className="text-gray-400 text-[13px] mt-2">
          Resend code in {timer}s
        </p>

        {/* Verify Button: background #059669, text #FFFFFF */}
        <button
          className="
            w-full bg-[#059669] text-[#FFFFFF] py-3 rounded-lg 
            mt-7 text-sm font-medium
          "
          // placeholder handler — add real verify logic here
          onClick={() => {
            /* Add verify action here (API call, navigation, etc.) */
          }}
        >
          Verify
        </button>

        {/* Wrong number? — color now #059669 */}
        <p
          className="text-center text-sm mt-4 cursor-pointer"
          style={{ color: '#059669' }}
          onClick={() => {
            /* Add wrong-number flow here (e.g., go back to enter phone) */
          }}
        >
          Wrong number?
        </p>
      </div>
    </div>
  );
}
