<<<<<<< HEAD
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function CreateAccount() {
  const [phone, setPhone] = useState("");

  return (
    <section className="min-h-screen w-full bg-white px-6 py-8 flex flex-col items-center">
      
      {/* Back to Home */}
      <div className="w-full max-w-md flex items-center">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <Image src="/ic-left.svg" width={18} height={18} alt="Back" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </div>

      {/* Content */}
      <div className="mt-10 w-full max-w-md text-center">
        
=======
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function CreateAccount() {
  const [phone, setPhone] = useState('');

  return (
    <section className="min-h-screen w-full bg-white px-6 py-10 flex flex-col items-center">
      
      {/* Back to Home */}
      <div className="w-full max-w-md flex items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Image src="/ic-left.svg" width={20} height={20} alt="Back" />
          <span className="text-sm">Go Back</span>
        </Link>
      </div>

      {/* Center Content */}
      <div className="mt-10 w-full max-w-md text-center">

>>>>>>> 16a23c9a118eb28d7cc57118c2629554d83f6754
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/Ellipse 1.svg"
<<<<<<< HEAD
            width={100}
            height={100}
=======
            width={90}
            height={90}
>>>>>>> 16a23c9a118eb28d7cc57118c2629554d83f6754
            alt="ChamaVault Logo"
          />
        </div>

<<<<<<< HEAD
        {/* Text */}
        <h2 className="text-[22px] font-semibold text-gray-900 mt-5">
          Create Account
        </h2>
        <p className="text-gray-500 text-sm mt-1">Join ChamaVault Today</p>

        {/* Phone Input */}
        <div className="mt-8 text-left">
          <label className="text-gray-800 text-sm font-medium">Phone Number</label>

          <input
            type="tel"
            placeholder="0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-2 py-3 px-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-600"
          />

          <p className="text-gray-500 text-xs mt-1">
            You will receive an SMS for OTP verification.
          </p>
        </div>

        {/* Button */}
        <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition">
          Send OTP
        </button>

        {/* Login Link */}
        <p className="text-gray-700 text-sm mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-medium hover:underline">
=======
        {/* Headings */}
        <h2 className="text-2xl font-bold text-black mt-4">
          Create Account
        </h2>
        <p className="text-black mt-1">
          Join ChamaVault Today
        </p>

        {/* Phone Input */}
        <div className="mt-8 text-left">
          <label className="block text-sm font-medium text-black mb-1">
            Phone Number
          </label>

          <input
            type="tel"
            inputMode="tel"
            placeholder="+254 903 276 2789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3
                       text-black placeholder-gray-400
                       outline-none focus:ring-2 focus:ring-[#059669]"
          />
        </div>

        {/* Verify Button */}
        <button
          className="w-full mt-6 bg-[#059669] text-white py-3 rounded-xl
                     font-semibold hover:bg-[#047857] transition"
        >
          Verify Phone Number
        </button>

        {/* Login Link */}
        <p className="text-sm text-black mt-4">
          Already have an account?{' '}
          <Link
            href="/landing-page/login"
            className="text-[#059669] font-medium hover:underline"
          >
>>>>>>> 16a23c9a118eb28d7cc57118c2629554d83f6754
            Login
          </Link>
        </p>

      </div>
    </section>
  );
}
