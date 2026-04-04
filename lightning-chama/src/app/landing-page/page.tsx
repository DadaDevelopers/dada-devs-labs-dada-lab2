"use client";

import WhyChooseChama from "@/app/landing-page/WhyChooseChama";
import WhyBitcoin from "@/app/landing-page/WhyBitcoin";
import Testimonials from "@/app/landing-page/Testimonials";
import Footer from "@/app/landing-page/Footer";
import FinalCTA from "@/app/landing-page/FinalCTA";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorks";

export default function Page() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <WhyChooseChama />
      <WhyBitcoin />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
