"use client";

import { useState } from "react";

export default function CreatePinPasswordPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    pin: "",
    confirmPin: "",
    agreed: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContinue = () => {
    // Add your form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <section className="w-full min-h-screen bg-gray-50 px-4 py-8 flex flex-col">
      {/* Back to Home */}
      <a
        href="/"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
      >
        <img src="/ic-left.svg" alt="Back" width="18" height="18" />
        <span>Back to Home</span>
      </a>

      {/* Main Content */}
      <div className="flex flex-col items-center mt-8 mx-auto w-full max-w-md">
        {/* Form Container with shadow */}
        <div className="bg-white rounded-2xl shadow-sm px-8 py-10 w-full">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/Ellipse 1.svg"
              alt="ChamaVault Logo"
              width="80"
              height="80"
              className="object-contain"
            />
          </div>

          {/* Headings */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Create Account
            </h1>
            <p className="text-sm text-gray-600 mt-1">Create PIN/Password</p>
          </div>

          {/* Form */}
          <div className="w-full space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* New PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New PIN
              </label>
              <input
                type="password"
                name="pin"
                placeholder="••••"
                maxLength={4}
                value={formData.pin}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Confirm PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                name="confirmPin"
                placeholder="••••"
                maxLength={4}
                value={formData.confirmPin}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                name="agreed"
                checked={formData.agreed}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="agreed" className="text-sm text-gray-700 cursor-pointer">
                I understand the{" "}
                <span className="text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer">
                  terms & policy
                </span>
              </label>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleContinue}
              className="mt-6 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 py-3.5 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}