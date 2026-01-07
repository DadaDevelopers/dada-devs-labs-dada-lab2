"use client";

import Image from "next/image";

export default function WhyChooseChama() {
  return (
    <section className="w-full bg-white py-16 md:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          Why Choose ChamaVault?
        </h2>

        <p className="text-gray-500 text-center mt-1">
          Discover the benefits.
        </p>

        {/* Feature Cards */}
        <div className="mt-12 space-y-6">

          {/* Works Offline */}
          <div className="flex items-start gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-28 h-28 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
              <Image
                src="/works-offline.svg"
                width={48}
                height={48}
                alt="Works Offline Icon"
              />
            </div>

            <div className="flex-1 pt-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Works Offline</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Use USSD to access your funds even without internet connection
              </p>
            </div>
          </div>

          {/* Community Driven */}
          <div className="flex items-start gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-28 h-28 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
              <Image
                src="/community-driven.svg"
                width={48}
                height={48}
                alt="Community Icon"
              />
            </div>

            <div className="flex-1 pt-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Create or join Chamas with your community members
              </p>
            </div>
          </div>

          {/* Secure Transactions */}
          <div className="flex items-start gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-28 h-28 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Image
                src="/secure-transactions.svg"
                width={48}
                height={48}
                alt="Secure Transactions Icon"
              />
            </div>

            <div className="flex-1 pt-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Transactions</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Lightning payment are fast, secure and transparent.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}