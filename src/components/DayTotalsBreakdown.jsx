import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function sumMealBase(meals) {
  return (meals || []).reduce(
    (a, m) => ({
      cal: a.cal + (m.cal || 0),
      protein: a.protein + (m.protein || 0),
    }),
    { cal: 0, protein: 0 },
  );
}

function sumBoosters(meals) {
  let cal = 0;
  let protein = 0;
  for (const m of meals || []) {
    for (const b of m.boosters || []) {
      cal += b.cal || 0;
      protein += b.protein || 0;
    }
  }
  return { cal, protein };
}

function sumAddons(addons) {
  return (addons || []).reduce(
    (a, x) => ({
      cal: a.cal + (x.cal || 0),
      protein: a.protein + (x.protein || 0),
    }),
    { cal: 0, protein: 0 },
  );
}

export default function DayTotalsBreakdown({ meals, addons, className = '' }) {
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const base = sumMealBase(meals);
    const boost = sumBoosters(meals);
    const add = sumAddons(addons);
    const totalCal = base.cal + boost.cal + add.cal;
    const totalP = base.protein + boost.protein + add.protein;
    return { base, boost, add, totalCal, totalP };
  }, [meals, addons]);

  return (
    <div className={`bg-white rounded-xl border border-cream-200 shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left min-h-[44px] rounded-xl hover:bg-cream-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-xs font-bold text-bark-600 uppercase tracking-wider">
          How your day adds up
        </span>
        <span className="flex items-center gap-1 text-[10px] text-bark-400">
          {open ? 'Hide' : 'Show'} detail
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-cream-100 pt-3">
          <p className="text-[10px] text-bark-400 mb-2">
            Totals = planned meals + boosters on those meals + add-ons (shakes, swaps, store items).
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="text-bark-500 font-medium">Source</div>
            <div className="text-right text-bark-500 font-medium">Cal</div>
            <div className="text-right text-bark-500 font-medium">Protein</div>

            <div className="text-bark-600">Base meals</div>
            <div className="text-right tabular-nums">{Math.round(rows.base.cal)}</div>
            <div className="text-right tabular-nums font-semibold text-sage-700">{Math.round(rows.base.protein)}g</div>

            <div className="text-bark-600">Meal boosters</div>
            <div className="text-right tabular-nums">{Math.round(rows.boost.cal)}</div>
            <div className="text-right tabular-nums font-semibold text-sage-700">{Math.round(rows.boost.protein)}g</div>

            <div className="text-bark-600">Add-ons</div>
            <div className="text-right tabular-nums">{Math.round(rows.add.cal)}</div>
            <div className="text-right tabular-nums font-semibold text-sage-700">{Math.round(rows.add.protein)}g</div>

            <div className="text-bark-700 font-bold pt-2 border-t border-cream-200 col-span-1">Total</div>
            <div className="text-right font-bold text-bark-700 tabular-nums pt-2 border-t border-cream-200">{Math.round(rows.totalCal)}</div>
            <div className="text-right font-bold text-sage-700 tabular-nums pt-2 border-t border-cream-200">{Math.round(rows.totalP)}g</div>
          </div>
        </div>
      )}
    </div>
  );
}
