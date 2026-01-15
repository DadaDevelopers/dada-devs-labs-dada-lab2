import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full overflow-x-hidden">

      {/* TOP GREEN SECTION */}
      <div className="w-full bg-[#047857] text-white py-10 sm:py-12 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-semibold mb-5 sm:mb-6">Quick Links</h3>

            <p className="text-[15px] sm:text-[16px] mb-3 cursor-pointer hover:underline">Join ChamaVault</p>
            <p className="text-[15px] sm:text-[16px] mb-3 cursor-pointer hover:underline">Privacy Policy</p>
            <p className="text-[15px] sm:text-[16px] cursor-pointer hover:underline">Terms of Service</p>
          </div>

          {/* GET IN TOUCH */}
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-semibold mb-5 sm:mb-6">Get in Touch</h3>

            <p className="flex items-center gap-3 text-[15px] sm:text-[16px] mb-3">
              <Image src="/phone.svg" width={20} height={20} alt="Phone" className="sm:w-[22px] sm:h-[22px]" />
              +254 7 XX XXX XXX
            </p>

            <p className="flex items-center gap-3 text-[15px] sm:text-[16px] mb-3">
              <Image src="/email.svg" width={20} height={20} alt="Email" className="sm:w-[22px] sm:h-[22px]" />
              info@chama.com
            </p>

            <p className="flex items-center gap-3 text-[15px] sm:text-[16px]">
              <Image src="/location.svg" width={20} height={20} alt="Location" className="sm:w-[22px] sm:h-[22px]" />
              Kenya
            </p>
          </div>

        </div>
      </div>

       {/* BOTTOM LIGHT GRAY SECTION */}
      <div className="w-full bg-[#E5E7EB] flex items-center justify-center py-5 sm:py-6 px-5">
        <p className="text-[14px] sm:text-[15px] text-[#000000] text-center leading-relaxed">
          © 2025 Chama Vault. Making savings simple and transparent.
        </p>
      </div>

    </footer>
  );
}