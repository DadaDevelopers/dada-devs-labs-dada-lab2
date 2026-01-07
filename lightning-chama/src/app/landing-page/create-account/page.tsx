"use client"; 

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function CreateAccount() {
  const [phone, setPhone] = useState("");

  return (
    <section className="min-h-screen w-full bg-white px-6 py-10 flex flex-col items-center">
      
      {/* Back to Home */}
      <div className="w-full max-w-md flex items-center">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <Image src="/ic-left.svg" width={20} height={20} alt="Back" />
          <span className="text-sm">Back to Home</span>
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

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Create Account</h2>
        <p className="mt-1" style={{ color: "#000000" }}>Join ChamaVault Today</p>

        {/* Phone Input */}
        <div className="mt-8 text-left">
          <label className="font-medium text-sm" style={{ color: "#000000" }}>
            Phone Number
          </label>

          <input
            type="tel"
            placeholder="0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
          />

          <p className="text-gray-500 text-xs mt-1">
            You will receive an SMS for OTP verification.
          </p>
        </div>

        {/* Button */}
        <button
          className="w-full mt-6 py-3 rounded-xl font-semibold transition"
          style={{ backgroundColor: "#059669", color: "#FFFFFF" }}
        >
          Send OTP
        </button>

        {/* Login Link */}
        <p className="text-sm mt-4" style={{ color: "#000000" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "#059669" }}>
            Login
          </Link>
        </p>

      </div>
    </section>
  );
}
