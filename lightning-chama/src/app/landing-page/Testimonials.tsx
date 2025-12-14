import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="w-full px-5 sm:px-6 py-12 sm:py-14 bg-white flex flex-col items-center overflow-x-hidden">
      <h2 className="text-center text-[24px] sm:text-[26px] font-bold text-black mb-10 sm:mb-12 px-2">
        What Our Users Say
      </h2>
      {/* Cards Row */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-stretch justify-center gap-5 sm:gap-6">
        {/* CARD 1 - Alice */}
        <div className="bg-[#F5F5F5] rounded-lg shadow-sm p-6 sm:p-7 w-full md:flex-1">
          {/* Header - User and Stars on same line */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Image
                src="/user1.svg"
                alt="Alice"
                width={100}
                height={100}
                className="rounded-full w-[100px] h-[100px]"
              />
            </div>
            <div className="flex gap-1">
              <span className="text-[#FFC107] text-lg">⭐</span>
              <span className="text-[#FFC107] text-lg">⭐</span>
              <span className="text-[#FFC107] text-lg">⭐</span>
              <span className="text-[#FFC107] text-lg">⭐</span>
              <span className="text-[#FFC107] text-lg">⭐</span>
            </div>
          </div>
          {/* Text */}
          <p className="text-[15px] sm:text-[16px] text-black leading-relaxed">
            Chama has changed the way I save!
          </p>
        </div>
        {/* CARD 2 - Bob */}
        <div className="bg-[#F5F5F5] rounded-lg shadow-sm p-6 sm:p-7 w-full md:flex-1">
          {/* Header - User and Stars on same line */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Image
                src="/user2.svg"
                alt="Bob"
                width={100}
                height={100}
                className="rounded-full w-[100px] h-[100px]"
              />
            </div>
            <div className="flex gap-1">
              <span className="text-[#FFC107] text-lg">⭐</span>
              <span className="text-[#FFC107] text-lg">⭐</span>
              <span className="text-[#FFC107] text-lg">⭐</span>
              <span className="text-[#FFC107] text-lg">⭐</span>
              <span className="text-[#FFC107] text-lg">⭐</span>
            </div>
          </div>
          {/* Text */}
          <p className="text-[15px] sm:text-[16px] text-black leading-relaxed">
            I love the community aspect of the platform.
          </p>
        </div>
      </div>
    </section>
  );
}