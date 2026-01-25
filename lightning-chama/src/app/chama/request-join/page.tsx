"use client";

import RequestJoinForm from "./RequestJoinForm";

export default function RequestJoinPage() {
  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm px-8 py-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/Ellipse 1.svg"
            alt="ChamaVault"
            width={90}
            height={90}
          />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Request to Join Chama
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Enter the details below to request access
          </p>
        </div>

        <RequestJoinForm />
      </div>
    </section>
  );
}
