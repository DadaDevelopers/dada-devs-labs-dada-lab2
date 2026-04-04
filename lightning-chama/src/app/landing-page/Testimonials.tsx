"use client";

const testimonials = [
  {
    name: "Alice",
    initials: "A",
    review:
      "ChamaVault has completely changed the way I manage savings with my group. Contributions are on time and everything is transparent!",
  },
  {
    name: "Bob",
    initials: "B",
    review:
      "I love the community aspect of the platform. Our Chama has never been more organized. The Lightning payouts are instant!",
  },
];

const Stars = () => (
  <span className="text-[#F59E0B] text-base tracking-tight">★★★★★</span>
);

export default function Testimonials() {
  return (
    <section className="bg-white px-8 py-16">
      <div className="max-w-md mx-auto flex flex-col gap-10">
        {/* Heading */}
        <h2
          className="text-2xl font-bold text-[#064E3B] text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          What Our Users Say
        </h2>

        {/* Cards */}
        <div className="flex flex-col gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-3xl p-6 flex flex-col gap-4"
            >
              {/* User row */}
              <div className="flex flex-row items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#059669] border-2 border-[#059669] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg">{t.initials}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-bold text-[#064E3B]">{t.name}</span>
                  <Stars />
                </div>
              </div>
              <p className="text-base text-[#334155] leading-6">{t.review}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
