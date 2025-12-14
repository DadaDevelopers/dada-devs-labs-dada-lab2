"use client";

import Image from "next/image";

export default function WhyBitcoin() {
  return (
    <section className="w-full bg-blue-50 py-16 md:py-24 px-6 border-t">
      <div className="max-w-4xl mx-auto">

        {/* Centered Bitcoin Icon */}
        <div className="flex justify-center mb-4">
          <Image
            src="/bitcoin.svg"
            width={40}
            height={40}
            alt="Bitcoin Icon"
          />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          Why Bitcoin for Chamas?
        </h2>

        <p className="text-gray-600 text-center max-w-2xl mx-auto mt-3">
          Bitcoin isn’t just digital money. It’s a transparent, secure way to manage group finances.
        </p>

        {/* Bullet Points with Figma Tick Icons */}
        <div className="mt-10 space-y-5 max-w-md mx-auto">

          {/* Point 1 */}
          <div className="flex items-start gap-3">
            <Image
              src="/check.svg"    
              width={20}
              height={20}
              alt="Check Icon"
              className="flex-shrink-0 mt-1"
            />
            <p className="text-gray-700">
              No hidden fees or charges
            </p>
          </div>

          {/* Point 2 */}
          <div className="flex items-start gap-3">
            <Image
              src="/check.svg"    
              width={20}
              height={20}
              alt="Check Icon"
              className="flex-shrink-0 mt-1"
            />
            <p className="text-gray-700">
              Complete transaction transparency
            </p>
          </div>

          {/* Point 3 */}
          <div className="flex items-start gap-3">
            <Image
              src="/check.svg"    
              width={20}
              height={20}
              alt="Check Icon"
              className="flex-shrink-0 mt-1"
            />
            <p className="text-gray-700">
              Instant global settlements
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
