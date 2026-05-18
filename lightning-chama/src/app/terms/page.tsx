'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

const SECTIONS = [
  {
    part: 'PART I — TERMS OF SERVICE',
    items: [
      {
        id: '1',
        title: '1. Introduction & Acceptance of Terms',
        body: `Welcome to ChamaVault. ChamaVault is a financial technology platform designed to help informal savings groups—commonly known as Chamas—manage contributions, track savings, and execute payments using Bitcoin's Lightning Network.

By creating an account, joining a Chama, accessing our USSD service, or using any feature of the ChamaVault platform (collectively, the "Service"), you ("User", "Member", or "Administrator") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Service.

These Terms constitute a legally binding agreement between you and ChamaVault. We reserve the right to update these Terms at any time, and we will notify users of material changes via email or in-app notice at least 14 days before such changes take effect.`,
      },
      {
        id: '2',
        title: '2. Definitions',
        body: `For the purposes of these Terms, the following definitions apply:

• "Chama" means an informal savings or investment group registered on the ChamaVault platform.
• "Administrator" means a User who creates or manages a Chama, including approving contributions and withdrawals.
• "Member" means any User who has been added to a Chama by an Administrator.
• "Contribution" means a financial deposit made by a Member into a Chama's pool.
• "Lightning Network" means the Bitcoin Layer-2 payment protocol used for instant, low-cost settlements on the ChamaVault platform.
• "USSD" means Unstructured Supplementary Service Data, allowing access to the Service without an internet connection.
• "KYC" means Know Your Customer, referring to identity verification procedures.
• "AML" means Anti-Money Laundering, referring to legal frameworks against illicit financial activity.
• "Individual Lightning Wallet" means the personal Bitcoin Lightning Network wallet provisioned by ChamaVault for each registered Member.
• "Group Wallet" means the shared Bitcoin wallet secured by multi-signature technology and assigned to a Chama for pooling contributions.
• "Multisig" or "Multi-Signature" means a cryptographic security mechanism requiring a minimum number of authorised signatories to co-sign a transaction before it is executed.
• "Signatory" means a Chama Member or Administrator who holds signing authority over a Group Wallet transaction.`,
      },
      {
        id: '3',
        title: '3. Eligibility & Account Registration',
        subsections: [
          {
            subtitle: '3.1 Eligibility',
            text: `To use ChamaVault you must:\n• Be at least 18 years of age.\n• Be a resident of a jurisdiction where our services are legally permitted.\n• Provide accurate and complete registration information.\n• Not have been previously suspended or banned from the Service.\n• Comply with all applicable laws and regulations in your jurisdiction.`,
          },
          {
            subtitle: '3.2 Account Security',
            text: `You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately at support@chamavault.xyz if you suspect any unauthorised access to your account. ChamaVault will not be liable for losses arising from unauthorised access resulting from your failure to secure your credentials.`,
          },
          {
            subtitle: '3.3 KYC & Identity Verification',
            text: `ChamaVault complies with Kenya's Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) and Central Bank of Kenya (CBK) digital finance guidelines. We may require you to submit identity documents including but not limited to a National ID, Passport, or driving licence, as well as phone number verification via your registered mobile number. Failure to complete KYC verification may result in restricted access to certain features.`,
          },
        ],
      },
      {
        id: '4',
        title: '4. Chama Creation & Administration',
        subsections: [
          {
            subtitle: '4.1 Creating a Chama',
            text: `Any eligible User may create a Chama on the platform. The Administrator is solely responsible for:\n• Setting contribution rules, schedules, and withdrawal policies for the Chama.\n• Ensuring all Members are added with their informed consent.\n• Approving or rejecting withdrawals.\n• Communicating the Chama's operating rules to all Members.`,
          },
          {
            subtitle: '4.2 Administrator Liability',
            text: `ChamaVault provides infrastructure and tools for Chama management but does not participate in the governance or decisions of any individual Chama. Disputes between Members and Administrators are the responsibility of the group. ChamaVault shall not be liable for losses arising from Administrator mismanagement.`,
          },
          {
            subtitle: '4.3 Member Responsibilities',
            text: `As a Member, you agree to:\n• Contribute amounts and on schedules agreed within your Chama.\n• Provide accurate payment details for Lightning Network payouts.\n• Promptly notify your Administrator and ChamaVault of any technical issues affecting your contributions.`,
          },
        ],
      },
      {
        id: '5',
        title: '5. ChamaVault Wallets',
        body: `ChamaVault provisions two distinct types of Bitcoin wallets: an Individual Lightning Wallet for each registered Member, and a Group Multisig Wallet for each Chama.`,
        subsections: [
          {
            subtitle: '5.1 Individual Lightning Wallet',
            text: `Upon successful registration and KYC verification, ChamaVault automatically creates a Bitcoin Lightning Network wallet linked to your account. The following terms apply:\n\n• Wallet creation: ChamaVault generates and manages the cryptographic keys associated with your Individual Lightning Wallet on your behalf. You are responsible for securely storing any recovery credentials provided to you at wallet creation.\n• Purpose: The wallet is used to receive Chama payout disbursements, receive instant Lightning Network settlements, and send contributions to your Chama's Group Wallet.\n• Custody: You retain beneficial ownership of funds. ChamaVault acts as a technical custodian solely to facilitate platform operations.\n• Irreversibility: All Lightning Network transactions are cryptographically final and cannot be reversed once broadcast.\n• Loss of access: Contact support@chamavault.xyz immediately. Recovery is subject to successful KYC re-verification.\n• Wallet closure: Upon account termination, any remaining balance must be withdrawn prior to closure.`,
          },
          {
            subtitle: '5.2 Group Chama Wallet (Multisig)',
            text: `Each Chama is assigned a shared Bitcoin wallet secured by multi-signature (multisig) technology. Key terms:\n\n• Multisig structure: Requires a defined threshold of cryptographic signatures from designated signatories before any outgoing transaction can be executed.\n• Purpose: Holds pooled Member contributions, accumulates Chama savings, and disburses approved withdrawals to Member wallets.\n• Signatory responsibilities: Signatories must review and co-sign transactions in a timely manner.\n• Transparency: All Group Wallet transactions are recorded on the Bitcoin blockchain and visible to all Chama Members.\n• No commingling: ChamaVault does not commingle Group Wallet funds with its own operational funds or with funds belonging to other Chamas.\n• Chama dissolution: Any remaining balance must be disbursed to Members in accordance with agreed rules and with the required multisig approvals.`,
          },
          {
            subtitle: '5.3 General Wallet Terms',
            text: `• Bitcoin volatility: Funds are denominated in Bitcoin (BTC) and are subject to market price volatility. ChamaVault does not guarantee, insure, or protect against changes in the value of Bitcoin.\n• Regulatory compliance: Wallet activity is subject to ongoing AML/KYC monitoring in accordance with POCAMLA and CBK guidelines.\n• No deposit insurance: Funds held in ChamaVault wallets are not insured by the Kenya Deposit Insurance Corporation (KDIC) or any other government deposit protection scheme.\n• Security responsibility: You are responsible for keeping your account credentials secure. ChamaVault cannot be held liable for losses resulting from user-side security breaches, phishing attacks, or social engineering.`,
          },
        ],
      },
      {
        id: '6',
        title: '6. Contributions, Withdrawals & Payments',
        subsections: [
          {
            subtitle: '6.1 Contributions',
            text: `Contributions can be made via the ChamaVault mobile app or the USSD interface (accessible without an internet connection). All contributions are recorded on the platform in real time and are visible to all Chama Members. Contributions are routed from the Member's Individual Lightning Wallet into the Chama's Group Wallet upon confirmation.`,
          },
          {
            subtitle: '6.2 Bitcoin & Lightning Network Payments',
            text: `ChamaVault uses the Bitcoin Lightning Network for withdrawals and settlements. You acknowledge and accept that:\n• Bitcoin is a volatile digital asset. The value of funds may fluctuate significantly.\n• Blockchain transactions are irreversible. Once a Lightning payment is dispatched, it cannot be reversed or recalled.\n• You are responsible for ensuring your Individual Lightning Wallet is active and accessible for receiving disbursements.`,
          },
          {
            subtitle: '6.3 Fees',
            text: `ChamaVault does not charge hidden fees. Any applicable platform or network fees will be clearly disclosed prior to transaction completion. Bitcoin Lightning Network transaction fees are variable and determined by network conditions, not ChamaVault.`,
          },
          {
            subtitle: '6.4 Withdrawal Approval',
            text: `All withdrawals from the Group Wallet require both Administrator approval and the requisite multisig signatures before funds are released. ChamaVault processes approved and fully signed withdrawals promptly via the Lightning Network. Processing times may vary due to network conditions beyond our control.`,
          },
        ],
      },
      {
        id: '7',
        title: '7. Prohibited Conduct',
        body: `You agree not to use ChamaVault to:\n• Engage in money laundering, terrorist financing, fraud, or any other illegal activity.\n• Create Chamas for the purpose of operating illegal pyramid or Ponzi schemes.\n• Impersonate another person or misrepresent your identity.\n• Circumvent, hack, or interfere with the platform's security measures.\n• Use the Service to conduct transactions on behalf of sanctioned individuals or entities.\n• Use automated bots or scripts to access the platform without authorisation.\n• Violate any applicable law or regulation in your jurisdiction.\n\nChamaVault reserves the right to suspend or permanently terminate any account found to be in violation of this section, and to report such activity to the relevant authorities including the Financial Reporting Centre (FRC) of Kenya.`,
      },
      {
        id: '8',
        title: '8. Intellectual Property',
        body: `All content, trademarks, software, logos, and intellectual property on the ChamaVault platform are the exclusive property of ChamaVault or its licensors. You are granted a limited, non-exclusive, non-transferable licence to access and use the Service for personal and group savings purposes only. You may not copy, modify, distribute, sell, sublicense, or create derivative works of any platform content without our prior written consent.`,
      },
      {
        id: '9',
        title: '9. Disclaimers & Limitation of Liability',
        subsections: [
          {
            subtitle: '9.1 No Financial Advice',
            text: `ChamaVault is a savings management technology platform and does not provide financial, investment, legal, or tax advice. Nothing on the platform constitutes a recommendation to buy, hold, or sell Bitcoin or any other asset. You should seek independent professional advice before making financial decisions.`,
          },
          {
            subtitle: '9.2 Service Availability',
            text: `We strive to maintain continuous availability of the Service; however, we do not warrant that the platform will be uninterrupted, error-free, or free from security vulnerabilities. We will not be liable for losses arising from platform downtime, technical errors, or third-party service failures.`,
          },
          {
            subtitle: '9.3 Limitation of Liability',
            text: `To the maximum extent permitted by applicable Kenyan law, ChamaVault's total liability to you for any claim arising out of or related to these Terms or your use of the Service shall not exceed the total amount of transaction fees paid by you to ChamaVault in the 90 days preceding the claim. ChamaVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages.`,
          },
        ],
      },
      {
        id: '10',
        title: '10. Dispute Resolution',
        body: `In the event of a dispute arising out of or relating to these Terms or the Service, you agree to first attempt to resolve the matter informally by contacting us at support@chamavault.xyz within 30 days of the dispute arising.

If the dispute cannot be resolved informally, both parties agree to submit to arbitration in Nairobi, Kenya, in accordance with the Arbitration Act (Cap 49, Laws of Kenya). Arbitration shall be conducted in English and the decision of the arbitrator shall be final and binding.

Nothing in this clause prevents either party from seeking emergency injunctive relief from a competent court.`,
      },
      {
        id: '11',
        title: '11. Governing Law & Jurisdiction',
        body: `These Terms are governed by and construed in accordance with the laws of the Republic of Kenya. Any matters not resolved through arbitration shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.`,
      },
      {
        id: '12',
        title: '12. Termination',
        body: `ChamaVault reserves the right to suspend or terminate your access to the Service at any time, with or without notice, for violation of these Terms, suspected fraudulent activity, regulatory requirements, or for any other legitimate business reason.

You may terminate your account at any time by contacting us at support@chamavault.xyz. Upon termination, any pending approved withdrawals will be processed. Funds locked in an active Chama are subject to that Chama's withdrawal rules and require Administrator approval.`,
      },
    ],
  },
  {
    part: 'PART II — PRIVACY POLICY',
    items: [
      {
        id: '13',
        title: '13. Introduction',
        body: `ChamaVault is committed to protecting your personal data in accordance with the Kenya Data Protection Act, 2019 (DPA 2019), the Kenya Data Protection (General) Regulations 2021, and internationally recognised data protection principles including those outlined in the EU General Data Protection Regulation (GDPR) to the extent applicable.

This Privacy Policy explains what personal data we collect, why we collect it, how we use and protect it, and your rights as a data subject. By using our Service, you consent to the collection and use of your data as described in this Policy.`,
      },
      {
        id: '14',
        title: '14. Data Controller Information',
        body: `ChamaVault is the Data Controller responsible for your personal data.\n\nEmail: support@chamavault.xyz\nPhone: +254 713 072 153\nAddress: Nairobi, Kenya\nWebsite: www.chamavault.xyz\n\nFor all data protection enquiries, please contact us using the details above with the subject line: "DATA PROTECTION ENQUIRY".`,
      },
      {
        id: '15',
        title: '15. Personal Data We Collect',
        subsections: [
          {
            subtitle: '15.1 Data You Provide Directly',
            text: `• Identity data: Full name, national ID number, date of birth, passport number.\n• Contact data: Phone number, email address, physical address.\n• Financial data: Bitcoin/Lightning Network wallet addresses, transaction amounts, contribution history.\n• Account data: Username, hashed password, account preferences.\n• Chama data: Chama name, membership information, contribution and withdrawal records.`,
          },
          {
            subtitle: '15.2 Data Collected Automatically',
            text: `• Device and technical data: IP address, device type, operating system, browser type.\n• Usage data: Pages visited, features used, USSD session logs, timestamps.\n• Transaction data: On-chain and Lightning Network transaction metadata (note: Bitcoin transactions are public on the blockchain).`,
          },
          {
            subtitle: '15.3 Data from Third Parties',
            text: `• Identity verification data from licensed KYC/AML service providers.\n• Telecommunications data from mobile network operators for USSD services.`,
          },
        ],
      },
      {
        id: '16',
        title: '16. Legal Basis for Processing',
        body: `We process your personal data on the following legal bases under the Kenya DPA 2019:\n\n• Contractual necessity: To provide you with the Service as described in these Terms.\n• Legal obligation: To comply with KYC, AML, POCAMLA, CBK regulations, and tax reporting requirements.\n• Legitimate interests: To improve our platform, prevent fraud, and ensure platform security.\n• Consent: Where we ask for your specific consent (e.g., marketing communications), which you may withdraw at any time.`,
      },
      {
        id: '17',
        title: '17. How We Use Your Personal Data',
        body: `We use your personal data for the following purposes:\n• Account creation, management, and authentication.\n• Processing contributions, withdrawals, and Lightning Network payments.\n• Conducting KYC/AML checks as required by Kenyan law.\n• Communicating service-related notices, updates, and alerts.\n• Providing customer support and resolving disputes.\n• Detecting and preventing fraud, money laundering, and other illegal activities.\n• Improving platform functionality, features, and user experience.\n• Complying with legal, regulatory, and reporting obligations.\n• Sending marketing communications where you have consented.`,
      },
      {
        id: '18',
        title: '18. Data Sharing & Third-Party Disclosure',
        body: `We do not sell your personal data to third parties. We may share your data with:\n\n• KYC/AML service providers: For identity verification as required by law.\n• Payment and blockchain infrastructure providers: To process Lightning Network transactions.\n• Mobile network operators: For USSD service delivery.\n• Cloud hosting and IT service providers: Operating under strict data processing agreements.\n• Regulatory and law enforcement authorities: Where required by law, court order, or where we are legally compelled to do so.\n• Professional advisors: Legal, accounting, and audit firms under confidentiality obligations.\n\nWhere we share data with third-party processors, we ensure they are bound by contractual obligations consistent with the Kenya DPA 2019 to protect your personal data.`,
      },
      {
        id: '19',
        title: '19. International Data Transfers',
        body: `Bitcoin transactions are recorded on a public, globally distributed blockchain. Beyond this, ChamaVault aims to store personal data within Kenya or in jurisdictions that provide an equivalent level of data protection. Where data is transferred internationally, we will implement appropriate safeguards such as standard contractual clauses, as required by the Kenya DPA 2019.`,
      },
      {
        id: '20',
        title: '20. Data Retention',
        body: `We retain personal data for as long as necessary to fulfil the purposes described in this Policy, and to comply with legal and regulatory obligations. Our standard retention periods are:\n\n• Account and identity data: For the duration of your account and 7 years after account closure (as required by POCAMLA and tax laws).\n• Transaction records: 7 years from the date of the transaction.\n• USSD session logs: 12 months.\n• Marketing consent records: Until consent is withdrawn plus 3 years.\n\nOnce the relevant retention period expires, personal data is securely deleted or anonymised.`,
      },
      {
        id: '21',
        title: '21. Data Security',
        body: `ChamaVault implements appropriate technical and organisational measures to protect your personal data. Our security measures include:\n\n• End-to-end encryption for all data transmissions.\n• Password hashing using industry-standard algorithms.\n• Role-based access controls limiting internal access to personal data.\n• Regular security audits and vulnerability assessments.\n• Bitcoin Lightning Network cryptographic verification for all transactions.\n• Incident response procedures for data breach notification.\n\nIn the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the Office of the Data Protection Commissioner (ODPC) within 72 hours of becoming aware of the breach, and will notify affected users without undue delay, as required by the Kenya DPA 2019.`,
      },
      {
        id: '22',
        title: '22. Your Rights as a Data Subject',
        body: `Under the Kenya Data Protection Act, 2019, you have the following rights:\n\n• Right of access: To obtain a copy of your personal data we hold.\n• Right to rectification: To correct inaccurate or incomplete personal data.\n• Right to erasure: To request deletion of your personal data, where legally permissible.\n• Right to restriction of processing: To limit how we process your data in certain circumstances.\n• Right to data portability: To receive your personal data in a structured, commonly used format.\n• Right to object: To object to processing based on legitimate interests or for direct marketing.\n• Right to withdraw consent: Where processing is based on consent, you may withdraw at any time without affecting prior processing.\n• Right not to be subject to automated decision-making: To not be subject solely to automated decisions that produce significant legal effects.\n\nTo exercise any of these rights, please contact us at support@chamavault.xyz. We will respond within 21 days as required by the Kenya DPA 2019. If you are not satisfied with our response, you have the right to lodge a complaint with the Office of the Data Protection Commissioner (ODPC) of Kenya at www.odpc.go.ke.`,
      },
      {
        id: '23',
        title: '23. Cookies & Tracking Technologies',
        body: `Our web application may use cookies and similar tracking technologies to:\n• Maintain your session and authentication state.\n• Analyse platform usage.\n• Remember your preferences.\n\nYou may control cookie preferences through your browser settings. Note that disabling certain cookies may affect platform functionality. The USSD service does not use cookies.`,
      },
      {
        id: '24',
        title: "24. Children's Privacy",
        body: `ChamaVault does not knowingly collect personal data from individuals under the age of 18. If we become aware that we have inadvertently collected data from a minor, we will promptly delete such data. If you believe a minor's data has been submitted to our platform, please contact us immediately at support@chamavault.xyz.`,
      },
      {
        id: '25',
        title: '25. Changes to This Privacy Policy',
        body: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes at least 14 days before they take effect via email or in-app notification. Continued use of the Service following the effective date of any update constitutes acceptance of the revised Policy.`,
      },
    ],
  },
  {
    part: 'PART III — GENERAL PROVISIONS',
    items: [
      {
        id: '26',
        title: '26. Severability',
        body: `If any provision of these Terms or Privacy Policy is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.`,
      },
      {
        id: '27',
        title: '27. Entire Agreement',
        body: `These Terms and the Privacy Policy constitute the entire agreement between you and ChamaVault with respect to the Service and supersede all prior agreements, representations, and understandings, whether oral or written.`,
      },
      {
        id: '28',
        title: '28. Waiver',
        body: `ChamaVault's failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.`,
      },
      {
        id: '29',
        title: '29. Contact Us',
        body: `For any questions, concerns, or requests relating to these Terms or Privacy Policy, please contact us:\n\nEmail: support@chamavault.xyz\nPhone: +254 713 072 153\nWebsite: www.chamavault.xyz\nAddress: Nairobi, Kenya\n\nFor Data Protection matters, include "DATA PROTECTION" in your email subject line.\nFor regulatory complaints: Office of the Data Protection Commissioner (ODPC), Kenya — www.odpc.go.ke`,
      },
    ],
  },
] as const;

function renderBody(text: string) {
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < text.split('\n').length - 1 && <br />}
    </span>
  ));
}

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen pb-16" style={{ background: '#F8FAFC' }}>

      {/* ── Header ── */}
      <header
        className="flex flex-row justify-between items-center px-4 h-16 bg-white sticky top-0 z-10"
        style={{ borderBottom: '1px solid #F1F5F9' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" style={{ color: '#64748B' }} />
        </button>
        <span className="font-bold text-base leading-6 text-center" style={{ color: '#064E3B' }}>
          Terms &amp; Privacy Policy
        </span>
        <div className="w-8" />
      </header>

      <main className="flex flex-col w-full max-w-md mx-auto px-4 pt-6 gap-6">

        {/* ── Hero banner ── */}
        <div
          className="relative flex flex-col gap-2 p-6 rounded-3xl overflow-hidden"
          style={{
            background: '#059669',
          }}
        >
          <div
            className="absolute pointer-events-none"
            style={{ width: 160, height: 160, right: -40, top: -40, background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)', borderRadius: 9999 }}
          />
          <span className="text-xs font-bold uppercase tracking-[1.4px] text-emerald-300">
            chamavault.xyz
          </span>
          <h1 className="font-bold text-xl leading-7 text-white">
            Terms of Service &amp; Privacy Policy
          </h1>
          <p className="text-sm leading-5 text-emerald-100">
            Version 1.0 · Effective Date: April 2026
          </p>
          <p className="text-xs leading-5 text-slate-100 mt-1">
            Governing Law: Republic of Kenya
          </p>

          {/* contact chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { icon: Mail, label: 'support@chamavault.xyz' },
              { icon: Phone, label: '+254 713 072 153' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <Icon className="w-3 h-3 text-emerald-300" />
                <span className="text-[10px] font-medium text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Table of Contents quick-links ── */}
        <div
          className="flex flex-col gap-1 p-4 rounded-2xl"
          style={{ background: '#FFFFFF', border: '1px solid #F1F5F9' }}
        >
          <p className="text-xs font-bold uppercase tracking-[1.4px] mb-2" style={{ color: '#94A3B8' }}>
            Contents
          </p>
          {['Part I — Terms of Service', 'Part II — Privacy Policy', 'Part III — General Provisions'].map((label, i) => (
            <a
              key={i}
              href={`#part-${i + 1}`}
              className="flex items-center gap-2 py-1.5 text-sm font-medium hover:text-emerald-600 transition-colors"
              style={{ color: '#0F172A' }}
            >
              <span
                className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0"
                style={{ background: '#059669' }}
              >
                {i + 1}
              </span>
              {label}
            </a>
          ))}
        </div>

        {/* ── Sections ── */}
        {SECTIONS.map((section, si) => (
          <div key={si} id={`part-${si + 1}`} className="flex flex-col gap-4">

            {/* Part heading */}
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: '#064E3B' }}
            >
              <p className="text-sm font-bold text-white tracking-[0.5px]">
                {section.part}
              </p>
            </div>

            {/* Articles */}
            {section.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl overflow-hidden"
                style={{ background: '#FFFFFF', border: '1px solid #F1F5F9' }}
              >
                {/* Article title */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                  <h2 className="text-sm font-bold leading-5" style={{ color: '#0F172A' }}>
                    {item.title}
                  </h2>
                </div>

                {/* Body */}
                {'body' in item && item.body && (
                  <div className="px-4 py-4">
                    <p className="text-sm leading-6" style={{ color: '#475569' }}>
                      {renderBody(item.body)}
                    </p>
                  </div>
                )}

                {/* Subsections */}
                {'subsections' in item && item.subsections && (
                  <div className="flex flex-col">
                    {item.subsections.map((sub, idx) => (
                      <div
                        key={sub.subtitle}
                        className="px-4 py-4"
                        style={idx > 0 ? { borderTop: '1px solid #F1F5F9' } : {}}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.8px] mb-2" style={{ color: '#059669' }}>
                          {sub.subtitle}
                        </p>
                        <p className="text-sm leading-6" style={{ color: '#475569' }}>
                          {renderBody(sub.text)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* ── Footer ── */}
        <div
          className="flex flex-col items-center gap-3 p-6 rounded-3xl mb-4"
          style={{ background: '#FFFFFF', border: '1px solid #F1F5F9' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#ECFDF5' }}
          >
          </div>
          <p className="text-sm font-bold text-center" style={{ color: '#0F172A' }}>
            © 2026 ChamaVault. All rights reserved.
          </p>
          <p className="text-xs text-center" style={{ color: '#94A3B8' }}>
            Empowering Chamas to Save, Grow &amp; Thrive
          </p>
        </div>

      </main>
    </div>
  );
}
