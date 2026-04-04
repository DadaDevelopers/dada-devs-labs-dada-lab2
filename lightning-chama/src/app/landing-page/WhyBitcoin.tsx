"use client";
import Link from "next/link";

const points = [
  "No hidden fees or charges",
  "Complete transaction transparency",
  "Instant global settlements",
];

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 13l4 4L19 7"
      stroke="#059669"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function WhyBitcoin() {
  return (
    <section
      id="why-bitcoin"
      className="relative px-8 py-16 overflow-hidden"
      style={{ backgroundColor: "#064E3B" }}
    >
      {/* Decorative Bitcoin watermark */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_1463_2528)">
            <path d="M252.139 94.9759C235.051 163.563 165.6 205.269 97.0239 188.16C28.4799 171.2 -13.2694 101.6 3.86125 33.1199C20.9279 -35.5201 90.3572 -77.2267 159.083 -60.1174C227.509 -43.0081 269.397 26.5706 252.139 94.9759ZM185.461 44.9279C187.936 28.3839 175.392 19.4879 158.251 13.5359L163.819 -8.78941L150.219 -12.1707L144.8 9.55726C141.237 8.67193 137.568 7.82926 133.931 7.00793L139.392 -14.9121L125.792 -18.3041L120.224 3.98927C117.269 3.31727 114.357 2.65593 111.531 1.95193L111.552 1.87727L92.7786 -2.8054L89.1626 11.7226C89.0239 11.5093 99.2639 14.0373 99.0506 14.1759C104.565 15.5626 105.557 19.2319 105.387 22.1439L99.0293 47.6159C99.4133 47.7119 99.9039 47.8506 100.448 48.0746L99.0186 47.7226L90.1119 83.4346C89.4399 85.1093 87.7332 87.6266 83.8932 86.6666C84.0319 86.8693 74.0052 84.2026 74.0052 84.2026L67.2426 99.7973L84.9599 104.213C88.2666 105.035 91.4879 105.899 94.6666 106.699L89.0452 129.259L102.635 132.651L108.203 110.336C111.915 111.349 115.52 112.309 119.061 113.216L113.515 135.435L127.115 138.837L132.747 116.267C155.936 120.661 173.387 118.891 180.725 97.9199C186.635 81.0346 180.437 71.2853 168.235 64.9386C177.131 62.8799 183.829 57.0133 185.621 44.9279H185.461ZM154.421 88.6399C150.219 105.547 121.739 96.4053 112.512 94.1013L119.989 64.1066C129.216 66.4106 158.741 70.9439 154.421 88.6399ZM158.635 44.6613C154.795 60.0639 131.072 52.2346 123.392 50.3146L130.165 23.1466C137.845 25.0666 162.549 28.6506 158.635 44.6613Z" fill="white"/>
          </g>
          <defs>
            <clipPath id="clip0_1463_2528">
              <rect width="256" height="256" fill="white" transform="translate(0 -64)"/>
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="relative max-w-md mx-auto flex flex-col gap-6 z-10">
        {/* Heading */}
        <h2
          className="text-3xl font-extrabold text-white text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Why Bitcoin for Chamas?
        </h2>

        {/* Subtitle */}
        <p
          className="text-lg text-center leading-7"
          style={{ color: "rgba(209, 250, 229, 0.8)" }}
        >
          Bitcoin isn&apos;t just digital money. It&apos;s a transparent, secure
          way to manage group finances without borders.
        </p>

        {/* Checklist */}
        <div className="flex flex-col gap-4 pt-4">
          {points.map((point, i) => (
            <div
              key={i}
              className="flex flex-row items-center gap-3 px-4 py-4 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span className="shrink-0">
                <CheckIcon />
              </span>
              <span className="text-base font-medium text-white">{point}</span>
            </div>
          ))}
        </div>

        {/* Learn more link */}
        <div className="flex justify-center pt-2">
          <Link
            href="/landing-page/learnbitcoin"
            className="text-[#34D399] font-semibold text-base underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Learn more about Bitcoin savings →
          </Link>
        </div>
      </div>
    </section>
  );
}
