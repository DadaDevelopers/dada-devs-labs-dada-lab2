'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'What is ChamaVault?',
    a: `ChamaVault is a decentralized platform that helps savings groups — called Chamas — manage their money together using Bitcoin's Lightning Network. Think of it as your group's digital savings account where every member can contribute, track progress, and receive payouts quickly and transparently.\n\nYou don't need to be a Bitcoin expert to use it. ChamaVault handles everything behind the scenes so your group can focus on saving.`,
  },
  {
    q: 'How do I create or join a Chama?',
    a: `Creating a Chama: After signing up, tap "My Chama" on your dashboard, then "Create Chama." Give your group a name, set the contribution amount and schedule.\n\nJoining a Chama: In "Join Chama"you can find available chamas to join, select one of your choice, you can either join as an admin, treasurer, member, then wait for approval from the chama owner.`,
  },
  {
    q: 'How do I make a contribution?',
    a: `Tap "Contribute" on your dashboard, select your Chama, and choose your wallet to pay from. The money moves instantly through the Lightning Network directly into your Chama's contribution cycle rotation.`,
  },
  {
    q: 'Is my money safe on ChamaVault?',
    a: `Yes. Every Chama wallet uses multi-signature (multisig) technology, meaning no single person can move the group's funds alone — a minimum number of members must approve every withdrawal.\n\nYour individual wallet funds are yours at all times. ChamaVault uses end-to-end encryption and industry-standard security practices to protect your account. However, as with all Bitcoin wallets, keeping your PIN and login details private is essential.`,
  },
  {
    q: 'What is the Lightning Network and why does ChamaVault use it?',
    a: `The Lightning Network is a payment layer built on top of Bitcoin that makes transactions near-instant and very cheap — even for small amounts.\n\nChamaVault uses it so that contributions and payouts reach members in seconds rather than days, with minimal fees. It also means your group's money is always on the move efficiently, without waiting for slow bank transfers.`,
  },
  {
    q: 'How do I receive my payout when it is my turn?',
    a: `When you join a chama a contibuting wallet is automatically created for you.\n\nfunds are automatically transferred to your wallet during the rotation cycle.`,
  },
  {
    q: 'What happens if I miss a contribution?',
    a: `Missing a contribution is recorded on the platform and visible to all Chama members, keeping the group accountable. The system may mark it as a late contribution.\n\nIf you know in advance that you will miss a payment, reach out to your Admin as soon as possible. Late contributions can still be made — look for the "Make Late Contribution" button on your Chama's contribution page.`,
  },
  {
    q: 'How do I reset or change my PIN?',
    a: `Go to your Profile (tap the profile icon or open the menu), then select "Security & PIN." You will be asked to enter your current PIN, then set and confirm a new one.\n\nIf you have forgotten your PIN entirely and cannot log in, contact our support team at support@chamavault.xyz or call +254 713 072 153 and we will guide you through the recovery process.`,
  },
];

export default function FAQsPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

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
        <span className="font-bold text-base" style={{ color: '#064E3B' }}>
          Frequently Asked Questions
        </span>
        <div className="w-8" />
      </header>

      <main className="flex flex-col w-full max-w-md mx-auto px-4 pt-6 gap-5">

        {/* ── Hero ── */}
        <div
          className="relative flex flex-col gap-2 p-6 rounded-3xl overflow-hidden"
          style={{ background: 'radial-gradient(147.43% 136.09% at 100% 0%, #DCFCE7 0%, #FFFFFF 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: '#ECFDF5' }}
            >
              <HelpCircle className="w-5 h-5" style={{ color: '#059669' }} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-6" style={{ color: '#0F172A' }}>Got questions?</h1>
              <p className="text-sm font-medium" style={{ color: '#059669' }}>We have answers.</p>
            </div>
          </div>
          <p className="text-md leading-5 mt-1" style={{ color: '#475569' }}>
            Everything you need to know about saving with ChamaVault. Can&apos;t find what you&apos;re looking for? Reach us at{' '}
            <span className="font-semibold" style={{ color: '#059669' }}>support@chamavault.xyz</span>
          </p>
        </div>

        {/* ── FAQ list ── */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: '#FFFFFF',
                  border: isOpen ? '1.5px solid #059669' : '1px solid #F1F5F9',
                  boxShadow: isOpen ? '0px 4px 12px rgba(5,150,105,0.1)' : 'none',
                }}
              >
                {/* Question row */}
                <button
                  onClick={() => toggle(i)}
                  className="flex flex-row items-start gap-3 px-4 py-4 w-full text-left"
                >
                  {/* Number badge */}
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                    style={{
                      background: isOpen ? '#059669' : '#F1F5F9',
                      color: isOpen ? '#FFFFFF' : '#64748B',
                    }}
                  >
                    {i + 1}
                  </span>

                  <span
                    className="flex-1 text-sm font-semibold leading-5"
                    style={{ color: isOpen ? '#059669' : '#0F172A' }}
                  >
                    {faq.q}
                  </span>

                  <span className="shrink-0 mt-0.5">
                    {isOpen
                      ? <ChevronUp className="w-4 h-4" style={{ color: '#059669' }} />
                      : <ChevronDown className="w-4 h-4" style={{ color: '#CBD5E1' }} />
                    }
                  </span>
                </button>

                {/* Answer */}
                {isOpen && (
                  <div
                    className="px-4 pb-5"
                    style={{ borderTop: '1px solid #ECFDF5' }}
                  >
                    <p className="text-sm leading-6 pt-3" style={{ color: '#475569' }}>
                      {faq.a.split('\n').map((line, li) => (
                        <span key={li}>
                          {line}
                          {li < faq.a.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Still need help ── */}
        <div
          className="flex flex-col gap-3 p-5 rounded-2xl mb-4"
          style={{ background: '#FFFFFF', border: '1px solid #F1F5F9' }}
        >
          <p className="text-sm font-bold" style={{ color: '#0F172A' }}>Still need help?</p>
          <p className="text-sm leading-5" style={{ color: '#64748B' }}>
            Our support team is available.
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Email', value: 'support@chamavault.xyz' },
              { label: 'Phone', value: '+254 713 072 153' },
              { label: 'Website', value: 'www.chamavault.xyz' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-[1px] w-14 shrink-0"
                  style={{ color: '#94A3B8' }}
                >
                  {label}
                </span>
                <span className="text-sm font-medium" style={{ color: '#059669' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
