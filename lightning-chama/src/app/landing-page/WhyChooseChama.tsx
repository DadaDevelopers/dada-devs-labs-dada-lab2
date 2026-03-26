"use client";

const features = [
  {
    iconBg: "#EEF2FF",
    iconColor: "#6366F1",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="#6366F1" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="#6366F1" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="#6366F1" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="#6366F1" strokeWidth="2" />
      </svg>
    ),
    title: "Smart Savings",
    description:
      "Access your funds and manage contributions via USSD even without a data connection.",
  },
  {
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"
          stroke="#059669"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M9 12l2 2 4-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Community Driven",
    description:
      "Built for the way groups naturally save. Flexible rules for unique Chama needs.",
  },
  {
    iconBg: "#FFF7ED",
    iconColor: "#F7931A",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#F7931A" strokeWidth="2" />
        <path
          d="M14.5 9.5c.3-.9-.5-1.4-1.4-1.7l.3-1.1-.7-.2-.3 1.1c-.2-.1-.3-.1-.5-.2l.3-1.1-.7-.2-.3 1.1c-.1 0-.3-.1-.4-.1l-.9-.2-.2.7.5.1c.3.1.3.3.3.4l-.7 2.9c-.1.2-.2.2-.4.2l-.5-.1-.3.8.9.2c.2 0 .3.1.5.1l-.3 1.1.7.2.3-1.1c.2.1.4.1.5.2l-.3 1.1.7.2.3-1.1c1.3.2 2.2.1 2.6-1 .3-.8 0-1.3-.6-1.6.4-.1.7-.4.8-1z"
          fill="#F7931A"
        />
      </svg>
    ),
    title: "Bitcoin Powered",
    description:
      "Lightning-fast payments settle instantly, keeping your group funds secure and borderless.",
  },
];

export default function WhyChooseChama() {
  return (
    <section id="features" className="bg-[#F8FAFC] px-8 py-16">
      <div className="max-w-md mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <h2
            className="text-2xl font-bold text-[#064E3B] text-center"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Why Choose ChamaVault?
          </h2>
          <p className="text-base text-[#64748B] text-center">
            Discover the benefits that set us apart.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="flex flex-col gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white border border-[#F1F5F9] rounded-2xl shadow-sm p-6 flex flex-col gap-4"
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: feature.iconBg }}
              >
                {feature.icon}
              </div>

              {/* Titles */}
              <div className="flex flex-col gap-0.5">
                <h3 className="text-lg font-bold text-[#064E3B]">
                  {feature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-[#64748B] leading-6">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
