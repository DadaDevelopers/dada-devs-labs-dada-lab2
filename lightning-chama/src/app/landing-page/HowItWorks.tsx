"use client";

export function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Create or Join a Chama",
      description: "Find or create a group and add members by phone.",
    },
    {
      number: "2",
      title: "Contribute (USSD or App)",
      description: "Dial *XYZ# or use the app to contribute.",
    },
    {
      number: "3",
      title: "Withdraw & Settle",
      description: "Admin approves withdrawals → instant Lightning payout.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-white px-8 py-16">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        {/* Section Title */}
        <h2
          className="text-2xl font-bold text-[#064E3B] text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          How It Works
        </h2>

        {/* Steps */}
        <div className="flex flex-col gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-row items-start gap-5">
              {/* Number Badge */}
              <div className="shrink-0 w-12 h-12 bg-[#F0FDF4] border border-[#D1FAE5] rounded-2xl flex items-center justify-center">
                <span className="text-xl font-bold text-[#059669]">
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-[#064E3B] leading-7">
                  {step.title}
                </h3>
                <p className="text-base text-[#64748B] leading-6">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
