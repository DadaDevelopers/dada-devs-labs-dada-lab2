"use client";
import Link from "next/link";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";

export function HeroSection() {
  const [selectedPath, setSelectedPath] = useState<'create' | 'signin' | null>(null);

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

        {/* Clear paths for new and returning users */}
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <div
            onMouseEnter={() => setSelectedPath('create')}
            onFocusCapture={() => setSelectedPath('create')}
            onPointerDown={() => setSelectedPath('create')}
            className={`group flex flex-col rounded-2xl border-2 bg-white p-4 transition-all duration-200 hover:-translate-y-1 ${selectedPath === 'create' ? 'border-emerald-500 shadow-[0_16px_30px_-14px_rgba(5,150,105,0.55)]' : 'border-transparent shadow-sm'}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-700">New to ChamaVault?</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Create an account</h2>
            <p className="mt-1 min-h-10 text-sm leading-5 text-slate-600">Register and set up your ChamaVault profile.</p>
            <Link
              href="/landing-page/create-account"
              className={`interactive-action mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${selectedPath === 'create' ? 'border-emerald-600 bg-emerald-600 text-white shadow-md hover:bg-emerald-700' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}
            >
              Create account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            onMouseEnter={() => setSelectedPath('signin')}
            onFocusCapture={() => setSelectedPath('signin')}
            onPointerDown={() => setSelectedPath('signin')}
            className={`group flex flex-col rounded-2xl border-2 bg-white p-4 transition-all duration-200 hover:-translate-y-1 ${selectedPath === 'signin' ? 'border-emerald-500 shadow-[0_16px_30px_-14px_rgba(5,150,105,0.45)]' : 'border-transparent shadow-sm'}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors duration-200 group-hover:bg-emerald-100 group-hover:text-emerald-700">
              <LogIn className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">Already registered?</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Sign in</h2>
            <p className="mt-1 min-h-10 text-sm leading-5 text-slate-600">Access your existing account and dashboard.</p>
            <Link
              href="/landing-page/login"
              className={`interactive-action mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.97] ${selectedPath === 'signin' ? 'border-emerald-600 bg-emerald-600 text-white shadow-md hover:bg-emerald-700' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}
            >
              Sign in <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Bitcoin Link */}
        <Link
          href="/landing-page/learnbitcoin"
          className="flex items-center gap-2 text-[#F7931A] font-medium text-base hover:opacity-80 transition-opacity"
        >
          {/* Bitcoin SVG icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1532_2244)">
              <path d="M19.6984 12.42C18.3634 17.7783 12.9375 21.0366 7.58005 19.7C2.22505 18.375 -1.03662 12.9375 0.301713 7.58747C1.63505 2.22497 7.05921 -1.03336 12.4167 -0.300031C17.7717 1.03497 21.0334 6.45997 19.6984 11.8183V12.42ZM16.2492 8.56164C16.5025 6.86997 15.2159 5.96414 13.4575 5.35747L14.0275 3.0708L12.6359 2.72414L12.0809 4.94914C11.7159 4.8583 11.3417 4.77247 10.9692 4.68664L11.5292 2.4408L10.1375 2.09414L9.56755 4.3808C9.26505 4.31164 8.96755 4.2458 8.67921 4.1758L8.68088 4.16914L6.76171 3.68997L6.39171 5.1758C6.37755 5.1533 7.42505 5.41247 7.40255 5.42664C7.96671 5.5683 8.06921 5.9433 8.05255 6.2408L7.40255 8.85247C7.44171 8.86247 7.49171 8.8758 7.54838 8.89664L7.40171 8.85997L6.49005 12.5183C6.42088 12.6891 6.24505 12.945 5.85088 12.8466C5.86505 12.8666 4.84005 12.5958 4.84005 12.5958L4.14838 14.19L5.95921 14.6416C6.29588 14.725 6.62588 14.8116 6.94921 14.8916L6.36921 17.2191L7.76088 17.5658L8.33171 15.2766C8.71171 15.38 9.08005 15.475 9.44005 15.5658L8.87338 17.8383L10.2659 18.185L10.8442 15.8641C13.2209 16.3141 15.0109 16.1325 15.7634 13.9825C16.37 12.2541 15.7342 11.2575 14.4859 10.6041C14.9692 10.4925 15.3359 10.1741 15.5542 9.5183L16.2492 8.56164ZM12.9 12.9916C12.4692 14.7225 9.55838 13.7866 8.61338 13.55L9.37755 10.4816C10.3225 10.715 13.3359 11.175 12.9 12.9916ZM13.3317 8.64997C12.94 10.225 10.5125 9.42497 9.72588 9.22997L10.42 6.44497C11.2067 6.63997 13.73 7.00663 13.3317 8.64997Z" fill="#F7931A"/>
            </g>
            <defs>
              <clipPath id="clip0_1532_2244">
                <rect width="20" height="20" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          Learn About Bitcoin Savings
        </Link>
      </div>
    </section>
  );
}
