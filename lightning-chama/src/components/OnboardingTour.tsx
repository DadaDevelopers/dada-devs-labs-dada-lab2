'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export type TourStep = {
  target: string | null; // data-tour value; null = fullscreen welcome card
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

type Props = {
  steps: TourStep[];
  storageKey: string; // localStorage key — set to '1' when dismissed
  onFinish?: () => void;
};

type SpotRect = {
  top: number; left: number;
  width: number; height: number;
  bottom: number; right: number;
};

const PAD = 10;
const TW = 296;        // tooltip width  (px)
const TH_EST = 190;    // tooltip height estimate for positioning

export default function OnboardingTour({ steps, storageKey, onFinish }: Props) {
  const [active, setActive]         = useState(false);
  const [idx, setIdx]               = useState(0);
  const [spot, setSpot]             = useState<SpotRect | null>(null);
  const [side, setSide]             = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [visible, setVisible]       = useState(false);

  // Show tour only if not seen before
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!localStorage.getItem(storageKey)) setActive(true);
  }, [storageKey]);

  const resolve = useCallback((index: number) => {
    const step = steps[index];
    if (!step) return;
    setVisible(false);

    if (!step.target) {
      setSpot(null);
      setSide('bottom');
      setTimeout(() => setVisible(true), 80);
      return;
    }

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setSpot(null);
      setTimeout(() => setVisible(true), 80);
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Measure after scroll settles
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const rect: SpotRect = {
        top:    r.top    - PAD,
        left:   r.left   - PAD,
        width:  r.width  + PAD * 2,
        height: r.height + PAD * 2,
        bottom: r.bottom + PAD,
        right:  r.right  + PAD,
      };
      setSpot(rect);

      const preferred = step.position;
      if (preferred) {
        setSide(preferred);
      } else {
        const spaceBelow = window.innerHeight - r.bottom;
        const spaceAbove = r.top;
        setSide(spaceBelow >= TH_EST ? 'bottom' : spaceAbove >= TH_EST ? 'top' : 'bottom');
      }
      setVisible(true);
    }, 380);
  }, [steps]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (active) resolve(idx);
  }, [active, idx, resolve]);

  // Re-measure on resize
  useEffect(() => {
    if (!active) return;
    const onResize = () => resolve(idx);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active, idx, resolve]);

  const finish = useCallback(() => {
    localStorage.setItem(storageKey, '1');
    setActive(false);
    onFinish?.();
  }, [storageKey, onFinish]);

  const next = () => (idx < steps.length - 1 ? setIdx(i => i + 1) : finish());
  const prev = () => idx > 0 && setIdx(i => i - 1);

  if (!active || !visible) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Tooltip position
  let tipStyle: React.CSSProperties;
  if (!spot) {
    tipStyle = { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: TW };
  } else {
    const safeLeft = Math.min(Math.max(spot.left, 12), vw - TW - 12);
    const safeTop  = Math.min(Math.max(spot.top, 12), vh - TH_EST - 12);
    if (side === 'bottom') tipStyle = { top: spot.bottom + 12,    left: safeLeft, width: TW };
    else if (side === 'top')  tipStyle = { top: spot.top - TH_EST - 12, left: safeLeft, width: TW };
    else if (side === 'right') tipStyle = { top: safeTop, left: spot.right  + 12, width: TW };
    else                       tipStyle = { top: safeTop, left: spot.left - TW - 12, width: TW };
  }

  const step = steps[idx];

  return (
    <>
      {/* ── Spotlight backdrop ── */}
      {spot ? (
        <>
          <div className="fixed inset-x-0 top-0 z-9990 bg-black/55"
            style={{ height: Math.max(0, spot.top) }} onClick={finish} />
          <div className="fixed inset-x-0 z-9990 bg-black/55"
            style={{ top: spot.bottom, bottom: 0 }} onClick={finish} />
          <div className="fixed z-9990 bg-black/55"
            style={{ top: spot.top, left: 0, width: Math.max(0, spot.left), height: spot.height }} onClick={finish} />
          <div className="fixed z-9990 bg-black/55"
            style={{ top: spot.top, left: spot.right, right: 0, height: spot.height }} onClick={finish} />
          {/* Highlight ring */}
          <div className="fixed z-9991 rounded-xl pointer-events-none"
            style={{
              top: spot.top, left: spot.left,
              width: spot.width, height: spot.height,
              boxShadow: '0 0 0 3px #10b981',
            }} />
        </>
      ) : (
        <div className="fixed inset-0 z-9990 bg-black/55" onClick={finish} />
      )}

      {/* ── Tooltip card ── */}
      <div
        className="fixed z-9999 bg-white rounded-2xl shadow-2xl p-5 animate-scaleIn"
        style={tipStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress + close */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-200 ${
                i === idx      ? 'w-5 h-1.5 bg-emerald-500'
                : i < idx     ? 'w-1.5 h-1.5 bg-emerald-300'
                :                'w-1.5 h-1.5 bg-gray-200'
              }`} />
            ))}
          </div>
          <button onClick={finish} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest mb-1">
          {idx + 1} / {steps.length}
        </p>
        <h3 className="font-bold text-gray-900 text-[15px] mb-1.5">{step.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{step.content}</p>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button onClick={finish} className="text-xs text-gray-400 hover:text-gray-600 transition">
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {idx > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg font-medium transition"
            >
              {idx < steps.length - 1 ? (<>Next <ChevronRight size={14} /></>) : "Let's go!"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
