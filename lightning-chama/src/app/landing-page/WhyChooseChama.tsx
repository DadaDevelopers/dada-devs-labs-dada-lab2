"use client";

const features = [
  {
    iconBg: "#EEF2FF",
    iconColor: "#6366F1",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.01 18H12L8 21M8 21H16C17.1038 21 18 20.1038 18 19V5C18 3.89617 17.1038 3 16 3H8C6.89617 3 6 3.89617 6 5V19C6 20.1038 6.89617 21 8 21Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Works Offline",
    description:
      "Access your funds and manage contributions via USSD even without a data connection.",
  },
  {
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_1463_2487)">
          <path d="M22.6665 26.6668H29.3332V24.0002C29.333 22.2962 28.2535 20.7794 26.6435 20.2212C25.0336 19.663 23.2467 20.186 22.1918 21.5242M22.6665 26.6668H9.33317M22.6665 26.6668V24.0002C22.6665 23.1255 22.4985 22.2895 22.1918 21.5242M9.33317 26.6668H2.6665V24.0002C2.66663 22.2962 3.74622 20.7794 5.35617 20.2212C6.96612 19.663 8.75295 20.186 9.80784 21.5242M9.33317 26.6668V24.0002C9.33317 23.1255 9.50117 22.2895 9.80784 21.5242M9.80784 21.5242C10.8209 18.9925 13.273 17.3326 15.9998 17.3326C18.7266 17.3326 21.1788 18.9925 22.1918 21.5242M19.9998 9.3335C19.9998 11.5412 18.2075 13.3335 15.9998 13.3335C13.7922 13.3335 11.9998 11.5412 11.9998 9.3335C11.9998 7.12584 13.7922 5.3335 15.9998 5.3335C18.2075 5.3335 19.9998 7.12584 19.9998 9.3335L22.6665 26.6668M30.6665 30.6668C30.6665 32.1386 29.4716 33.3335 27.9998 33.3335C26.5281 33.3335 25.3332 32.1386 25.3332 30.6668C25.3332 29.1951 26.5281 28.0002 27.9998 28.0002C29.4716 28.0002 30.6665 29.1951 30.6665 30.6668V30.6668M9.33317 13.3335C9.33317 14.8053 8.13828 16.0002 6.6665 16.0002C5.19473 16.0002 3.99984 14.8053 3.99984 13.3335C3.99984 11.8617 5.19473 10.6668 6.6665 10.6668C8.13828 10.6668 9.33317 11.8617 9.33317 13.3335V13.3335" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs>
          <clipPath id="clip0_1463_2487">
            <rect width="32" height="32" fill="white"/>
          </clipPath>
        </defs>
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
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_1532_2244_feature)">
          <path d="M19.6984 12.42C18.3634 17.7783 12.9375 21.0366 7.58005 19.7C2.22505 18.375 -1.03662 12.9375 0.301713 7.58747C1.63505 2.22497 7.05921 -1.03336 12.4167 -0.300031C17.7717 1.03497 21.0334 6.45997 19.6984 11.8183V12.42ZM16.2492 8.56164C16.5025 6.86997 15.2159 5.96414 13.4575 5.35747L14.0275 3.0708L12.6359 2.72414L12.0809 4.94914C11.7159 4.8583 11.3417 4.77247 10.9692 4.68664L11.5292 2.4408L10.1375 2.09414L9.56755 4.3808C9.26505 4.31164 8.96755 4.2458 8.67921 4.1758L8.68088 4.16914L6.76171 3.68997L6.39171 5.1758C6.37755 5.1533 7.42505 5.41247 7.40255 5.42664C7.96671 5.5683 8.06921 5.9433 8.05255 6.2408L7.40255 8.85247C7.44171 8.86247 7.49171 8.8758 7.54838 8.89664L7.40171 8.85997L6.49005 12.5183C6.42088 12.6891 6.24505 12.945 5.85088 12.8466C5.86505 12.8666 4.84005 12.5958 4.84005 12.5958L4.14838 14.19L5.95921 14.6416C6.29588 14.725 6.62588 14.8116 6.94921 14.8916L6.36921 17.2191L7.76088 17.5658L8.33171 15.2766C8.71171 15.38 9.08005 15.475 9.44005 15.5658L8.87338 17.8383L10.2659 18.185L10.8442 15.8641C13.2209 16.3141 15.0109 16.1325 15.7634 13.9825C16.37 12.2541 15.7342 11.2575 14.4859 10.6041C14.9692 10.4925 15.3359 10.1741 15.5542 9.5183L16.2492 8.56164ZM12.9 12.9916C12.4692 14.7225 9.55838 13.7866 8.61338 13.55L9.37755 10.4816C10.3225 10.715 13.3359 11.175 12.9 12.9916ZM13.3317 8.64997C12.94 10.225 10.5125 9.42497 9.72588 9.22997L10.42 6.44497C11.2067 6.63997 13.73 7.00663 13.3317 8.64997Z" fill="#F7931A"/>
        </g>
        <defs>
          <clipPath id="clip0_1532_2244_feature">
            <rect width="20" height="20" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    ),
    title: "Bitcoin Powered",
    description:
      "Lightning-fast payments settle instantly, keeping your group funds secure and borderless.",
  },
  {
    iconBg: "transparent",
    iconColor: "#F7931A",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#FFF7ED"/>
        <path d="M21 24.0001L23 26.0001L27 22.0001M32.618 17.9841C29.4561 18.152 26.3567 17.0587 24 14.9441C21.6433 17.0587 18.5439 18.152 15.382 17.9841C15.1275 18.9692 14.9992 19.9826 15 21.0001C15 26.5911 18.824 31.2901 24 32.6221C29.176 31.2901 33 26.5921 33 21.0001C33 19.9581 32.867 18.9481 32.618 17.9841L21 24.0001" stroke="#F7931A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Secure Transaction",
    description:
      "Every transaction is verified on-chain, ensuring maximum security and transparency.",
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
              className="bg-white border border-[#F1F5F9] rounded-2xl flex flex-row items-start p-5 gap-4"
              style={{ boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)", minHeight: "130px" }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: feature.iconBg }}
              >
                {feature.icon}
              </div>

              {/* Text Container */}
              <div className="flex flex-col gap-1">
                <h3
                  className="font-bold text-base text-[#0F172A] leading-6"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm text-[#64748B] leading-5"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
