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
        <div className="mt-10 space-y-4">

          {/* Works Offline */}
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
              </p>
            </div>
          </div>

          {/* Community Driven */}
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
              </p>
            </div>
          </div>

          {/* Secure Transactions */}
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
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
