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
        <div className="mt-10 space-y-4">

          {/* Works Offline */}
          <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl border">
            <Image
              src="/works-offline.svg"
              width={40}
              height={40}
              alt="Works Offline Icon"
              className="flex-shrink-0"
            />

            <div>
              <h3 className="font-semibold text-gray-900">Works Offline</h3>
              <p className="text-gray-600 text-sm">
                Use USSD to access your funds even without internet.
              </p>
            </div>
          </div>

          {/* Community Driven */}
          <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl border">
            <Image
              src="/community-driven.svg"
              width={40}
              height={40}
              alt="Community Icon"
              className="flex-shrink-0"
            />

            <div>
              <h3 className="font-semibold text-gray-900">Community Driven</h3>
              <p className="text-gray-600 text-sm">
                Create or join Chamas with your community members.
              </p>
            </div>
          </div>

          {/* Secure Transactions */}
          <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl border">
            <Image
              src="/secure-transactions.svg"
              width={40}
              height={40}
              alt="Secure Transactions Icon"
              className="flex-shrink-0"
            />

            <div>
              <h3 className="font-semibold text-gray-900">Secure Transactions</h3>
              <p className="text-gray-600 text-sm">
                Lightning payments are fast, secure and transparent.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
