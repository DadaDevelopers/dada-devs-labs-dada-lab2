'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone) return;

    // API-ready (OTP integration later)
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    router.push('/landing-page/verify-number');
  };

  return (
    <section className="min-h-screen bg-white px-6 pt-6">
      <div className="mx-auto w-full max-w-sm">

          {/* Back to Home */}
      <div className="w-full max-w-md flex items-center">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <Image src="/ic-left.svg" width={20} height={20} alt="Back" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/Ellipse 1.svg"
            alt="ChamaVault Logo"
            width={120}
            height={120}
            priority
          />
        </div>

        {/* Headings */}
        <div className="text-center mb-8">
          <h1 className="text-[22px] font-semibold text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-1 text-base" style={{ color: "#000000" }}>
            Login to Continue
          </p>
        </div>

        {/* Phone Number */}
        <div className="mb-6">
          <label className="block text-sm text-gray-900 mb-1 font-medium">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <p className="text-gray-500 text-xs mt-1">
            You will receive an SMS for OTP verification.
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!phone}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-white font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#059669", color: "#FFFFFF" }}
        
        >
          Login
        </button>

        {/* Register */}
        <p className="text-center text-sm text-gray-900 mt-6">
          New User?{' '}
          <Link
            href="/landing-page/create-account"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Register
          </Link>
        </p>

      </div>
    </section>
  );
}