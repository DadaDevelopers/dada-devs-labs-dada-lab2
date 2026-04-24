'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Bell,
  Camera,
  Shield,
  FileText,
  LogOut,
  Wallet,
  X,
  Eye,
  EyeOff,
  Check,
  Pencil,
  Loader2,
  Hash,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type EditField = 'name' | 'phone' | null;

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('Your Name');
  const [displayPhone, setDisplayPhone] = useState('—');

  // ── name / phone bottom-sheet ────────────────────────────
  const [editField, setEditField] = useState<EditField>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── inline PIN change ────────────────────────────────────
  const [pinExpanded, setPinExpanded] = useState(false);
  const [pinValues, setPinValues] = useState({ current: '', next: '', confirm: '' });
  const [pinErrors, setPinErrors] = useState({ current: '', next: '', confirm: '' });
  const [showPins, setShowPins] = useState({ current: false, next: false, confirm: false });
  const [pinSaving, setPinSaving] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('profileAvatar');
    if (stored) setAvatarSrc(stored);

    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const msisdn = localStorage.getItem('msisdn');
      if (!token || !msisdn) {
        setDisplayPhone(msisdn || '—');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/users/${msisdn}/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setDisplayName(data.username || data.name || 'Your Name');
          setDisplayPhone(data.msisdn || msisdn || '—');
        } else {
          setDisplayPhone(msisdn || '—');
        }
      } catch {
        setDisplayPhone(localStorage.getItem('msisdn') || '—');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── avatar upload ────────────────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setAvatarSrc(src);
      localStorage.setItem('profileAvatar', src);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── name / phone sheet helpers ───────────────────────────
  const openEdit = (field: EditField) => {
    setSaveSuccess(false);
    setSaveError('');
    setEditValue(field === 'name' ? displayName : displayPhone);
    setEditField(field);
  };

  const closeEdit = () => {
    setEditField(null);
    setSaveError('');
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      if (editField === 'name') {
        if (!editValue.trim()) {
          setSaveError('Name cannot be empty.');
          setSaving(false);
          return;
        }
        setDisplayName(editValue.trim());
      } else if (editField === 'phone') {
        const cleaned = editValue.trim();
        if (!cleaned) {
          setSaveError('Phone number cannot be empty.');
          setSaving(false);
          return;
        }
        if (!/^\d{9,15}$/.test(cleaned.replace(/[\s+\-()]/g, ''))) {
          setSaveError('Enter a valid phone number.');
          setSaving(false);
          return;
        }
        setDisplayPhone(cleaned);
        localStorage.setItem('msisdn', cleaned);
      }
      await new Promise((r) => setTimeout(r, 450));
      setSaveSuccess(true);
      setTimeout(closeEdit, 900);
    } catch {
      setSaveError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── inline PIN save ──────────────────────────────────────
  const validatePin = () => {
    const errs = { current: '', next: '', confirm: '' };
    let valid = true;
    if (!pinValues.current) {
      errs.current = 'Enter your current PIN.';
      valid = false;
    }
    if (pinValues.next.length < 4) {
      errs.next = 'New PIN must be at least 4 digits.';
      valid = false;
    }
    if (pinValues.next && pinValues.confirm && pinValues.next !== pinValues.confirm) {
      errs.confirm = 'PINs do not match.';
      valid = false;
    }
    if (!pinValues.confirm) {
      errs.confirm = 'Please confirm your new PIN.';
      valid = false;
    }
    setPinErrors(errs);
    return valid;
  };

  const handlePinSave = async () => {
    if (!validatePin()) return;
    setPinSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setPinSuccess(true);
      setTimeout(() => {
        setPinExpanded(false);
        setPinSuccess(false);
        setPinValues({ current: '', next: '', confirm: '' });
        setPinErrors({ current: '', next: '', confirm: '' });
      }, 1200);
    } catch {
      setPinErrors((p) => ({ ...p, confirm: 'Something went wrong. Please try again.' }));
    } finally {
      setPinSaving(false);
    }
  };

  const togglePin = () => {
    if (pinExpanded) {
      setPinExpanded(false);
      setPinValues({ current: '', next: '', confirm: '' });
      setPinErrors({ current: '', next: '', confirm: '' });
      setPinSuccess(false);
    } else {
      setPinExpanded(true);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/landing-page');
  };

  return (
    <div className="flex flex-col min-h-screen pb-32" style={{ background: '#F8FAFC' }}>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* ── Header ── */}
      <header
        className="flex flex-row justify-between items-center px-4 h-16 bg-white sticky top-0 z-10"
        style={{ borderBottom: '1px solid #F1F5F9' }}
      >
        <button onClick={() => router.back()} className="flex items-center justify-center w-8 h-8" aria-label="Go back">
          <ArrowLeft className="w-4 h-4" style={{ color: '#64748B' }} />
        </button>
        <span className="font-bold text-xl leading-7" style={{ color: '#0F172A' }}>Profile</span>
        <button className="flex items-center justify-center w-8 h-8" aria-label="Notifications">
          <Bell className="w-5 h-5" style={{ color: '#64748B' }} />
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="flex flex-col gap-6 px-4 pt-6 w-full max-w-md mx-auto">

        {/* ── Profile Header Card ── */}
        <div
          className="relative flex flex-col p-6 rounded-3xl overflow-hidden"
          style={{ background: '#FFFFFF', border: '1px solid #F1F5F9', boxShadow: '0px 1px 2px rgba(0,0,0,0.05)' }}
        >
          <div className="absolute pointer-events-none" style={{ width: 128, height: 128, right: -63, top: -63, background: 'rgba(16,185,129,0.1)', filter: 'blur(32px)', borderRadius: 9999 }} />

          <div className="w-full flex flex-col items-center relative z-10">
            <div className="relative">
              {avatarSrc ? (
                <Image src={avatarSrc} alt="Profile" className="w-24 h-24 rounded-full object-cover"
                  style={{ border: '4px solid #ECFDF5', boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)' }} />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white select-none"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: '4px solid #ECFDF5', boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <button onClick={handleAvatarClick} aria-label="Upload photo"
                className="absolute bottom-0 right-0 flex items-center justify-center rounded-full"
                style={{ width: 26.5, height: 26.5, background: '#059669', border: '2px solid #FFFFFF', boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)' }}>
                <Camera className="w-[10.5px] h-[10.5px] text-white" />
              </button>
            </div>
            <div className="pt-4">
              <h2 className="font-bold text-2xl leading-8 tracking-[-0.6px] text-center" style={{ color: '#0F172A' }}>
                {loading ? <span className="inline-block w-36 h-6 bg-slate-200 rounded animate-pulse" /> : displayName}
              </h2>
            </div>
          </div>
        </div>

        {/* ── Account Information ── */}
        <section className="flex flex-col gap-3">
          <h3 className="px-1 text-xs font-bold uppercase tracking-[1.4px]" style={{ color: '#94A3B8' }}>
            Account Information
          </h3>
          <div className="w-full flex flex-col rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F1F5F9' }}>

            {/* Full Name */}
            <button
              onClick={() => openEdit('name')}
              className="flex flex-row justify-between items-center px-4 py-4 w-full text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[-0.5px]" style={{ color: '#94A3B8' }}>Full Name</span>
                <span className="text-base font-medium leading-6 truncate" style={{ color: '#0F172A' }}>
                  {loading ? <span className="inline-block w-28 h-5 bg-slate-200 rounded animate-pulse" /> : displayName}
                </span>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full ml-2 shrink-0" style={{ background: '#F1F5F9' }}>
                <Pencil className="w-3.5 h-3.5" style={{ color: '#64748B' }} />
              </div>
            </button>

            <div style={{ height: 1, background: '#F1F5F9', margin: '0 16px' }} />

            {/* Phone Number */}
            <button
              onClick={() => openEdit('phone')}
              className="flex flex-row justify-between items-center px-4 py-4 w-full text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[-0.5px]" style={{ color: '#94A3B8' }}>Phone Number</span>
                <span className="text-base font-medium leading-6 truncate" style={{ color: '#0F172A' }}>
                  {loading ? <span className="inline-block w-32 h-5 bg-slate-200 rounded animate-pulse" /> : displayPhone}
                </span>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full ml-2 shrink-0" style={{ background: '#F1F5F9' }}>
                <Pencil className="w-3.5 h-3.5" style={{ color: '#64748B' }} />
              </div>
            </button>
          </div>
        </section>

        {/* ── Payment Methods ── */}
        <section className="flex flex-col gap-3">
          <h3 className="px-1 text-xs font-bold uppercase tracking-[1.4px]" style={{ color: '#94A3B8' }}>
            Payment Methods
          </h3>
          <div className="flex flex-row items-center gap-4 px-4 py-4 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #F1F5F9' }}>
            <div className="w-12 h-12 flex items-center justify-center rounded-xl shrink-0" style={{ background: '#ECFDF5' }}>
              <Wallet className="w-[15px] h-[22px]" style={{ color: '#059669' }} />
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-base font-bold leading-6 truncate" style={{ color: '#0F172A' }}>Mobile Money</span>
              <span className="text-sm font-normal leading-5 truncate" style={{ color: '#64748B' }}>
                {displayPhone && displayPhone !== '—' ? `• • • • ${displayPhone.slice(-4)}` : '• • • • ——'}
              </span>
            </div>
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-[-0.5px] rounded-md shrink-0 whitespace-nowrap"
              style={{ background: '#FEF3C7', color: '#D97706' }}>
              Coming Soon
            </span>
          </div>
        </section>

        {/* ── USSD Feature ── */}
        <section className="flex flex-col gap-3">
          <h3 className="px-1 text-xs font-bold uppercase tracking-[1.4px]" style={{ color: '#94A3B8' }}>
            USSD Access
          </h3>
          <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F1F5F9' }}>
            <div className="flex flex-row items-center gap-4 px-4 py-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl shrink-0" style={{ background: '#EFF6FF' }}>
                <Hash className="w-5 h-5" style={{ color: '#3B82F6' }} />
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-base font-bold leading-6" style={{ color: '#0F172A' }}>Dial *483#</span>
                <span className="text-sm font-normal leading-5" style={{ color: '#64748B' }}>
                  Access ChamaVault from any phone
                </span>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-[-0.5px] rounded-md shrink-0 whitespace-nowrap"
                style={{ background: '#FEF3C7', color: '#D97706' }}>
                Coming Soon
              </span>
            </div>
            <div style={{ height: 1, background: '#F1F5F9', margin: '0 16px' }} />
            <div className="px-4 py-3">
              <p className="text-xs leading-5" style={{ color: '#94A3B8' }}>
                Dial the USSD code to contribute to your Chama, check your balance, and manage your account — no internet required.
              </p>
            </div>
          </div>
        </section>

        {/* ── Settings & Security ── */}
        <section className="flex flex-col gap-3">
          <h3 className="px-1 text-xs font-bold uppercase tracking-[1.4px]" style={{ color: '#94A3B8' }}>
            Settings &amp; Security
          </h3>
          <div className="w-full flex flex-col rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F1F5F9' }}>

            {/* Security & PIN — inline expand */}
            <button
              onClick={togglePin}
              className="flex flex-row items-center gap-4 px-4 w-full h-14 text-left hover:bg-slate-50 transition-colors"
            >
              <Shield className="w-4 h-5 shrink-0" style={{ color: pinExpanded ? '#059669' : '#94A3B8' }} />
              <span className="flex-1 text-base font-medium leading-6" style={{ color: '#0F172A' }}>
                Security &amp; PIN
              </span>
              {pinExpanded
                ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: '#059669' }} />
                : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#CBD5E1' }} />
              }
            </button>

            {/* Inline PIN form */}
            {pinExpanded && (
              <div className="px-4 pb-5 flex flex-col gap-4" style={{ borderTop: '1px solid #F1F5F9' }}>
                <p className="text-xs pt-4 leading-5" style={{ color: '#64748B' }}>
                  Update your 4–6 digit PIN used to authorise transactions.
                </p>

                {(
                  [
                    { key: 'current', label: 'Current PIN', placeholder: 'Enter current PIN' },
                    { key: 'next', label: 'New PIN', placeholder: 'Enter new PIN (min. 4 digits)' },
                    { key: 'confirm', label: 'Confirm New PIN', placeholder: 'Re-enter new PIN' },
                  ] as { key: keyof typeof pinValues; label: string; placeholder: string }[]
                ).map(({ key, label, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-[1px]" style={{ color: '#94A3B8' }}>
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        type={showPins[key] ? 'text' : 'password'}
                        inputMode="numeric"
                        maxLength={6}
                        value={pinValues[key]}
                        onChange={(e) => {
                          setPinValues((p) => ({ ...p, [key]: e.target.value.replace(/\D/g, '') }));
                          if (pinErrors[key]) setPinErrors((p) => ({ ...p, [key]: '' }));
                        }}
                        placeholder={placeholder}
                        className="w-full h-12 px-4 pr-12 rounded-xl text-base outline-none tracking-[0.3em] focus:ring-2 focus:ring-emerald-500 transition-all"
                        style={{
                          border: pinErrors[key] ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                          color: '#0F172A',
                          background: '#F8FAFC',
                        }}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPins((p) => ({ ...p, [key]: !p[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPins[key]
                          ? <EyeOff className="w-4 h-4" style={{ color: '#94A3B8' }} />
                          : <Eye className="w-4 h-4" style={{ color: '#94A3B8' }} />
                        }
                      </button>
                    </div>
                    {pinErrors[key] && (
                      <p className="text-xs font-medium" style={{ color: '#EF4444' }}>{pinErrors[key]}</p>
                    )}
                  </div>
                ))}

                <button
                  onClick={handlePinSave}
                  disabled={pinSaving || pinSuccess}
                  className="w-full h-12 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all mt-1"
                  style={{
                    background: pinSuccess ? '#059669' : '#0F172A',
                    opacity: pinSaving ? 0.75 : 1,
                  }}
                >
                  {pinSuccess ? (
                    <><Check className="w-4 h-4" /> PIN Updated</>
                  ) : pinSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    'Save PIN'
                  )}
                </button>
              </div>
            )}

            <div style={{ width: 'calc(100% - 32px)', height: 1, background: '#F1F5F9', marginLeft: 16 }} />

            {/* Terms & Privacy Policy */}
            <button
              onClick={() => router.push('/terms')}
              className="flex flex-row items-center gap-4 px-4 w-full h-14 text-left hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-4 h-[21px] shrink-0" style={{ color: '#94A3B8' }} />
              <span className="flex-1 text-base font-medium leading-6" style={{ color: '#0F172A' }}>Terms &amp; Privacy Policy</span>
              <ChevronRight className="w-[7.4px] h-3 shrink-0" style={{ color: '#CBD5E1' }} />
            </button>
          </div>
        </section>

        {/* ── Log Out ── */}
        <section className="flex flex-col items-center gap-6 pt-4">
          <button
            onClick={handleLogout}
            className="w-full h-14 flex flex-row items-center justify-center gap-2 rounded-2xl transition-opacity active:opacity-80"
            style={{ background: '#FEF2F2' }}
          >
            <LogOut className="w-[18px] h-[18px]" style={{ color: '#DC2626' }} />
            <span className="font-bold text-base leading-6" style={{ color: '#DC2626' }}>Log Out</span>
          </button>
          <span className="text-xs font-medium leading-4 text-center" style={{ color: '#94A3B8' }}>
            ChamaVault v1.0.0 · Built on Bitcoin
          </span>
        </section>
      </main>

      {/* ── Edit Bottom Sheet (name / phone) ── */}
      {editField && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closeEdit} />
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <div
              className="w-full max-w-md bg-white rounded-t-3xl px-6 pt-5 pb-10"
              style={{ boxShadow: '0px -4px 24px rgba(0,0,0,0.08)' }}
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold" style={{ color: '#0F172A' }}>
                  {editField === 'name' ? 'Edit Full Name' : 'Edit Phone Number'}
                </h3>
                <button onClick={closeEdit} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: '#F1F5F9' }}>
                  <X className="w-4 h-4" style={{ color: '#64748B' }} />
                </button>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-bold uppercase tracking-[1px]" style={{ color: '#94A3B8' }}>
                  {editField === 'name' ? 'Full Name' : 'Phone Number'}
                </label>
                <input
                  type={editField === 'phone' ? 'tel' : 'text'}
                  value={editValue}
                  onChange={(e) => { setEditValue(e.target.value); if (saveError) setSaveError(''); }}
                  placeholder={editField === 'name' ? 'Enter your full name' : 'e.g. 254700000000'}
                  autoFocus
                  className="w-full h-12 px-4 rounded-xl text-base outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  style={{
                    border: saveError ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                    color: '#0F172A',
                    background: '#F8FAFC',
                  }}
                />
                {saveError && (
                  <p className="text-xs font-medium" style={{ color: '#EF4444' }}>{saveError}</p>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving || saveSuccess}
                className="w-full h-12 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: saveSuccess ? '#059669' : '#0F172A', opacity: saving ? 0.75 : 1 }}
              >
                {saveSuccess ? (
                  <><Check className="w-4 h-4" /> Saved</>
                ) : saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
