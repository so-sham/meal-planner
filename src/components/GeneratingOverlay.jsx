import React, { useEffect, useState } from 'react';

const STAGES = [
  { label: 'Reading your targets…', sub: 'Calories, protein, diet preferences' },
  { label: 'Selecting candidate meals…', sub: 'Matching 200+ recipes to your profile' },
  { label: 'Optimizing protein distribution…', sub: 'Balancing across meals to hit your goal' },
  { label: 'Adjusting calories & macros…', sub: 'Fine-tuning portions for the right totals' },
  { label: 'Finalizing your plan…', sub: 'Almost ready' },
];

export default function GeneratingOverlay({ message }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (message) return;
    const id = setInterval(() => {
      setStage(s => Math.min(s + 1, STAGES.length - 1));
    }, 700);
    return () => clearInterval(id);
  }, [message]);

  const current = STAGES[stage];
  const label = message || current.label;
  const sub = message ? 'Optimizing protein and calories for your goals' : current.sub;
  const progress = ((stage + 1) / STAGES.length) * 100;

  return (
    <div
      className="fixed inset-0 z-[70] bg-bark-900/40 backdrop-blur-[2px] flex items-center justify-center px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="bg-white rounded-2xl border border-cream-200 shadow-xl px-8 py-6 max-w-sm w-full text-center">
        <div className="w-10 h-10 border-[3px] border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-bark-700">{label}</p>
        <p className="text-xs text-bark-400 mt-1">{sub}</p>
        {!message && (
          <div className="mt-4 h-1 w-full bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
