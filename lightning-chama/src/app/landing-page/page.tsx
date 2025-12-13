"use client";

import WhyChooseChama from "@/app/landing-page/WhyChooseChama";
import WhyBitcoin from "@/app/landing-page/WhyBitcoin";
import Testimonials from "@/app/landing-page/Testimonials";
import Footer from "@/app/landing-page/Footer";

export default function Page() {
  return (
     <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <WhyChooseChama />
      <WhyBitcoin />
      <Testimonials />
      <Footer />
    </main>
  );
}
