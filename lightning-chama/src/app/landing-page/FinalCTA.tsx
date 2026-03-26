"use client";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-[#ECFDF5] px-5 py-12 flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-[#064E3B] text-center">
        Ready to grow together?
      </h2>

      <Link href="/landing-page/create-account">
        <button
          className="px-10 py-4 bg-[#059669] text-white font-bold text-base rounded-xl hover:bg-emerald-700 transition-colors"
          style={{
            boxShadow:
              "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
          }}
        >
          Create Your Account
        </button>
      </Link>
    </section>
  );
}
