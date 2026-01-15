"use client";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="pt-20 px-5 text-center">
      <div className="max-w-2xl mx-auto rounded-2xl bg-linear-to-tr from-[#FFF4D2]  via-[#E5E2D5]  to-[#059669]">
        {/* Headline */}
        <div className="p-12 px-6">
          <h1 className="text-3xl sm:text-4xl text-center font-semibold text-[#1F2937]">
            Empowering Chamas to Save,
          </h1>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#1F2937]">
            Grow & Thrive
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mb-4 -mt-10">
          <p className="text-lg sm:text-xl text-[#6B7280] leading-relaxed">
            Manage contributions, track savings,
          </p>
          <p className="text-lg sm:text-xl text-[#6B7280] leading-relaxed">
            and build financial growth together
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-6 items-center">
          {/* Sign Up and Login Row */}
          <div className="flex gap-4 flex-wrap justify-center mt-4">
            <Link href="/landing-page/create-account">
              <button className="px-8 py-4 bg-[#059669] text-white border-none rounded-2xl text-2xl font-semibold cursor-pointer hover:bg-emerald-700 transition-colors">
                Sign Up
              </button>
            </Link>
            {/*note: to change the /userdashboard with the correct link /landing-page/login */}
            <Link href="/landing-page/login" >
              <button className="px-8 py-4 bg-white text-[#059669] border-2 border-[#059669] rounded-2xl text-2xl font-semibold cursor-pointer hover:bg-emerald-50 transition-colors">
                Login
              </button>
            </Link>
          </div>

          {/* Bitcoin Button */}
          <button className="px-10 py-4 mb-14 mt-2 bg-orange-50 text-[#F7931A] border-2 border-[#F7931A] rounded-2xl text-lg font-semibold cursor-pointer hover:bg-orange-100 transition-colors">
            Learn About Bitcoin
          </button>
        </div>
      </div>
    </section>
  );
}