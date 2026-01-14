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

        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/Ellipse 1.svg"
            width={90}
            height={90}
            alt="ChamaVault Logo"
          />
        </div>

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
            Login
          </Link>
        </p>

      </div>
    </section>
  );
}
