"use client";

import Image from "next/image";

export default function WhyChooseChama() {
  return (
    <section className="w-full bg-white py-16 md:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          Why Choose ChamaVault?
        </h2>

        <p className="text-gray-500 text-center mt-1">
          Discover the benefits.
        </p>

        {/* Feature Cards */}
        <div className="mt-12 space-y-6">

          {/* Works Offline */}
<<<<<<< HEAD
          <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#EEF4FF] flex items-center justify-center">
              <Image
                src="/works-offline.svg"
                width={26}
                height={26}
                alt="Works Offline Icon"
                className="flex-shrink-0"
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-[15px]">
                Works Offline
              </h3>
              <p className="text-gray-600 text-[13px] leading-tight">
                Use USSD to access your funds even without internet connection.
=======
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
>>>>>>> 16a23c9a118eb28d7cc57118c2629554d83f6754
              </p>
            </div>
          </div>

          {/* Community Driven */}
<<<<<<< HEAD
          <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#EFFFF4] flex items-center justify-center">
              <Image
                src="/community-driven.svg"
                width={26}
                height={26}
                alt="Community Icon"
                className="flex-shrink-0"
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-[15px]">
                Community Driven
              </h3>
              <p className="text-gray-600 text-[13px] leading-tight">
                Create or join Chamas with your community members.
=======
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
>>>>>>> 16a23c9a118eb28d7cc57118c2629554d83f6754
              </p>
            </div>
          </div>

          {/* Secure Transactions */}
<<<<<<< HEAD
          <div className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#FFF5E6] flex items-center justify-center">
              <Image
                src="/secure-transactions.svg"
                width={26}
                height={26}
                alt="Secure Transactions Icon"
                className="flex-shrink-0"
              />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-[15px]">
                Secure Transactions
              </h3>
              <p className="text-gray-600 text-[13px] leading-tight">
                Lightning payments are fast, secure and transparent.
=======
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
>>>>>>> 16a23c9a118eb28d7cc57118c2629554d83f6754
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}