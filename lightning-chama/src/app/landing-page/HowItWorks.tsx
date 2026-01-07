"use client";
import Link from "next/link";
export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 px-5 bg-[#F3F7FF] mt-4">
      <div className="max-w-2xl mx-auto">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
          How it works
        </h2>

        {/* Steps */}
        <div className="space-y-6 mb-10">
          {/* Step 1 */}
          <div className="flex items-start gap-4 pb-6 border-b border-gray-300">
            <div className="shrink-0 w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center text-white text-xl font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-normal  text-[#000000] mb-1">
                Create or Join a Chama
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Find or create a group and add members by phone.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 pb-6 border-b border-gray-300">
            <div className="shrink-0 w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center text-white text-xl font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-normal text-[#000000] mb-1">
                Contribute (USSD or App)
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Dial *XYZ# or use the app to contribute.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 pb-6 border-b border-gray-300">
            <div className="shrink-0 w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center text-white text-xl font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-normal text-[#000000] mb-1">
                Withdraw & Settle
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Admin approves withdrawals → instant Lightning payout.
              </p>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <div className="flex justify-center">
        < Link href="/landing-page/create-account">
          <button className="w-full max-w-sm px-20 py-4 bg-[#059669] text-white border-none rounded-xl text-lg font-semibold cursor-pointer hover:bg-[#059669] transition-colors shadow-md">
            Get Started
          </button>
        </Link>
        </div>
      </div>
    </section>
  );
}