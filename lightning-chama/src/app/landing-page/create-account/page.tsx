'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 

export default function CreateAccount() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async () => {
    if (!phone){
      setError('Please enter your phone number');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        'https://dada-devs-labs-dada-lab2.onrender.com/codes/pre-registration/code-validation',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Something went wrong');
      } else {
        setSuccess('Account created! Verification code sent.');
        // redirect to verification page after a short delay
        setTimeout(() => {
          router.push(`/landing-page/verify-number?phone=${encodeURIComponent(phone)}`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to server. Try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
          onClick={handleVerify}
          disabled={loading || !phone}
          className={`w-full mt-6 bg-[#059669] text-white py-3 rounded-xl
                      font-semibold hover:bg-[#047857] transition
                      ${loading || !phone ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Verifying...' : 'Verify Phone Number'}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>}

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
