"use client";
import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="pt-16 px-8 pb-16"
      style={{
        background:
          "radial-gradient(147.43% 136.09% at 100% 0%, #DCFCE7 0%, #FFFFFF 100%)",
      }}
    >
      <div className="max-w-md mx-auto flex flex-col items-center gap-6">
        {/* Heading */}
        <div className="flex flex-col items-center pt-12">
          <h1 className="text-4xl font-extrabold text-[#0F172A] text-center leading-relaxed">
            <span className="block text-4xl ml-0">Empowering</span> 
            <span className="block ml-4">Chamas to <span className="text-[#2563EB]">Save</span>,</span>
          </h1>
          <h1 className="text-4xl font-extrabold text-[#0F172A] text-center leading-tight">
             <span className="block ml-6">Grow & Thrive</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-lg text-[#475569] text-center leading-relaxed max-w-sm">
          Manage contributions, track savings, and build financial growth
          together with modern fintech tools.
        </p>

        {/* Buttons */}
        <div className="flex flex-col w-full gap-4">
          {/* Get Started */}
          <Link href="/landing-page/create-account" className="w-full">
            <button
              className="w-full py-4 bg-[#059669] text-white font-bold text-base rounded-2xl cursor-pointer hover:bg-emerald-700 transition-colors"
              style={{
                boxShadow: "0px 10px 15px -3px #A7F3D0, 0px 4px 6px -4px #A7F3D0",
              }}
            >
              Get Started
            </button>
          </Link>

          {/* Member Login */}
          <Link href="/landing-page/login" className="w-full">
            <button className="w-full py-4 bg-white text-[#334155] font-semibold text-base rounded-2xl border border-[#E2E8F0] cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
              Member Login
            </button>
          </Link>
        </div>

        {/* Bitcoin Link */}
        <Link
          href="/landing-page/learnbitcoin"
          className="flex items-center gap-2 text-[#F7931A] font-medium text-base hover:opacity-80 transition-opacity"
        >
          {/* Bitcoin SVG icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
              fill="#F7931A"
            />
            <path
              d="M15.5 10.5c.3-.9-.5-1.4-1.4-1.7l.3-1.1-0.7-.2-.3 1.1c-.2-.1-.4-.1-.5-.2l.3-1.1-.7-.2-.3 1.1c-.1 0-.3-.1-.4-.1l-.9-.2-.2.7s.5.1.5.1c.3.1.3.3.3.4l-.7 2.9c-.1.2-.2.2-.4.2 0 0-.5-.1-.5-.1l-.3.8.9.2c.2 0 .3.1.5.1l-.3 1.1.7.2.3-1.1c.2.1.4.1.5.2l-.3 1.1.7.2.3-1.1c1.3.2 2.2.1 2.6-1 .3-.8 0-1.3-.6-1.6.4-.1.8-.4.9-1zm-1.6 2.2c-.2.9-1.6.4-2 .3l.4-1.4c.5.1 1.8.4 1.6 1.1zm.2-2.2c-.2.8-1.3.4-1.7.3l.3-1.3c.4.1 1.6.3 1.4 1z"
              fill="white"
            />
          </svg>
          Learn About Bitcoin Savings
        </Link>
      </div>
    </section>
  );
}
