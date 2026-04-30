"use client";

const quickLinks = [
  { label: "Join ChamaVault", href: "/landing-page/create-account" },
  { label: "Privacy Policy", href: "/terms" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Help Center", href: "/landing-page" },
];

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
      stroke="#059669"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#059669" strokeWidth="1.67" />
    <path d="M2 7l10 7 10-7" stroke="#059669" strokeWidth="1.67" strokeLinecap="round" />
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke="#059669"
      strokeWidth="1.67"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9" r="2.5" stroke="#059669" strokeWidth="1.67" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#064E3B]">
      <div className="px-8 pt-16 pb-10">
        <div className="max-w-md mx-auto flex flex-col gap-12">
          {/* Two-column links */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quick Links */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-[#34D399] uppercase tracking-widest">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-base leading-6 hover:text-[#34D399] transition-colors"
                      style={{ color: "rgba(236,253,245,0.7)" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get in Touch */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-[#34D399] uppercase tracking-widest">
                Get in Touch
              </h4>
              <ul className="flex flex-col gap-4">
                <li className="flex items-center gap-2">
                  <PhoneIcon />
                  <span
                    className="text-base leading-6"
                    style={{ color: "rgba(236,253,245,0.7)" }}
                  >
                    +254 713 072 153
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <EmailIcon />
                  <span
                    className="text-base leading-6"
                    style={{ color: "rgba(236,253,245,0.7)" }}
                  >
                    support@chamavault.xyz
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <LocationIcon />
                  <span
                    className="text-base leading-6"
                    style={{ color: "rgba(236,253,245,0.7)" }}
                  >
                    Kenya
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider + Copyright */}
          <div
            className="flex justify-center pt-8"
            style={{ borderTop: "1px solid #065F46" }}
          >
            <p
              className="text-sm text-center leading-5"
              style={{ color: "rgba(236,253,245,0.4)" }}
            >
              © 2026 ChamaVault. Making savings simple and transparent.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
