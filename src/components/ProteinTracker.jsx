import React from 'react';
import { calcDayTotals } from '../utils/algorithm';
import { AlertCircle, ChevronDown } from 'lucide-react';

export default function ProteinTracker({ plan, prefs, showGapHint = true }) {
  if (!plan || plan.length === 0) {
    return (
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-cream-200 w-full px-4 py-3">
        <p className="text-sm text-bark-400 text-center">Generate a plan to track protein</p>
      </div>
    );
  }

  const totals = calcDayTotals(plan);
  const target = prefs.proteinTarget || 1;
  const pct = Math.min((totals.protein / Math.max(target, 1)) * 100, 100);
  const hitTarget = pct >= 90;
  const shortfall = Math.max(0, Math.round(target - totals.protein));
  const showShortfallBanner = showGapHint && shortfall > 5;

  const scrollToBridge = () => {
    document.getElementById('bridge-the-gap')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-cream-200 w-full">
      <div className="px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-bark-600 whitespace-nowrap" id="protein-tracker-label">
              💪 Protein
            </span>

            <div
              className="flex-1 h-3 bg-sage-200 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(totals.protein)}
              aria-valuemin={0}
              aria-valuemax={target}
              aria-labelledby="protein-tracker-label"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  hitTarget ? 'bg-emerald-500' : 'bg-sage-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <span className="text-sm font-bold text-bark-700 whitespace-nowrap tabular-nums">
              {Math.round(totals.protein)}g / {target}g
            </span>
          </div>

          <p className="text-[10px] text-bark-400 text-center mt-1 tabular-nums">
            {Math.round(totals.cal)} / {prefs.calorieTarget} kcal
          </p>
        </div>
      </div>

      {showShortfallBanner && (
        <div className="border-t border-amber-200 bg-amber-50/95 px-3 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <AlertCircle size={14} className="text-amber-600 shrink-0" aria-hidden />
              <span>
                Short by <strong>{shortfall}g protein</strong> — add boosters or use &quot;Close the gap&quot; below
              </span>
            </span>
            <button
              type="button"
              onClick={scrollToBridge}
              className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] sm:min-h-0 text-xs font-bold text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Jump to fixes
              <ChevronDown size={14} className="rotate-[-90deg]" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
