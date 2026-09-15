"use client";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-[#ECFDF5] px-5 py-12 flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-[#064E3B] text-center">
        Ready to grow together?
      </h2>

      <p className="-mt-3 text-center text-sm text-emerald-900/70">
        New here? Create your account in a few simple steps.
      </p>

      <Link
        href="/landing-page/create-account"
        className="interactive-action rounded-xl bg-[#059669] px-10 py-4 text-base font-bold text-white transition-colors hover:bg-emerald-700"
        style={{ boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)" }}
      >
        Create account
      </Link>

      <p className="-mt-3 text-sm text-emerald-950/70">
        Already registered?{' '}
        <Link href="/landing-page/login" className="font-bold text-emerald-700 underline underline-offset-4 hover:text-emerald-900">
          Sign in
        </Link>
      </p>
    </section>
  );
}
