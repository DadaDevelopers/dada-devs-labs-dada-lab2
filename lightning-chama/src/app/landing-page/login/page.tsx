'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!phone || !password) {
      setError('Phone number and PIN are required.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'https://dada-devs-labs-dada-lab2-chamavault.onrender.com/api/users/setup/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msisdn: phone.replace(/\s+/g, ''),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid phone number or PIN.');
        return;
      }

      // Save auth token
      localStorage.setItem('token', data.token);
      localStorage.setItem('userReference', data.user.userReference);
      localStorage.setItem('msisdn', data.user.msisdn);

      // Login success → Dashboard
      router.push('/userdashboard');

    } catch (err) {
      setError('Failed to connect to server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white px-6 pt-6">
      <div className="mx-auto w-full max-w-sm">

        {/* Back to Home */}
        <div className="w-full flex items-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
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
          <p className="text-black mt-1 text-base">
            Login to Continue
          </p>
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label className="block text-sm text-gray-900 mb-1 font-medium">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="254700000007"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3
                       text-base text-gray-900 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* PIN / Password */}
        <div className="mb-2">
          <label className="block text-sm text-gray-900 mb-1 font-medium">
            PIN
          </label>
          <input
            type="password"
            placeholder="••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3
                       text-base text-gray-900 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-700
                     py-3 text-white font-semibold transition
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
         {/* ============================================ */}
        {/* 🎯 NEW: FORGOT PASSWORD LINK */}
        {/* ============================================ */}
        <div className="mt-4 text-center">
          <Link 
            href="/forgot-password"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        {/* ============================================ */}

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
