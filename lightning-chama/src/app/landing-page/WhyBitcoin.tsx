"use client";

import Image from "next/image";

export default function WhyBitcoin() {
  return (
    <section className="w-full bg-blue-50 py-10 md:py-14 px-6 border-t">
      <div className="max-w-3xl mx-auto flex flex-col items-center">

        {/* Bitcoin Icon */}
        <div className="flex justify-center mb-3">
          <Image
            src="/bitcoin.svg"
            width={23}       // Figma width 22.92
            height={38}      // Figma height 37.5
            alt="Bitcoin Icon"
            className="text-[#F7931A]"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-black text-center">
          Why Bitcoin for Chamas?
        </h2>

        {/* Subtitle */}
        <p className="text-black text-center max-w-xl mx-auto mt-2 leading-relaxed">
          Bitcoin isn’t just digital money. It’s a transparent, secure way to manage group finances.
        </p>

        {/* Bullet List */}
        <div className="mt-10 space-y-5 max-w-md mx-auto">

          {/* Point 1 */}
          <div className="flex items-center gap-3 min-h-[28px]">
            <Image
              src="/check.svg"
              width={20}
              height={20}
              alt="Check Icon"
              className="flex-shrink-0"
            />
            <p className="text-black">
              No hidden fees or charges
            </p>
          </div>

          {/* Point 2 */}
          <div className="flex items-center gap-3 min-h-[28px]">
            <Image
              src="/check.svg"
              width={20}
              height={20}
              alt="Check Icon"
              className="flex-shrink-0"
            />
            <p className="text-black">
              Complete transaction transparency
            </p>
          </div>

          {/* Point 3 */}
          <div className="flex items-center gap-3 min-h-[28px]">
            <Image
              src="/check.svg"
              width={20}
              height={20}
              alt="Check Icon"
              className="flex-shrink-0"
            />
            <p className="text-black">
              Instant global settlements
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
