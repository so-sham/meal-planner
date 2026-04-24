import React, { useMemo } from 'react';
import { calcDayTotals } from '../utils/algorithm';
import { getFilteredBoosters, SWAPS } from '../data/proteinBoosters';
import { blinkitProducts } from '../data/blinkitProducts';
import { PRESET_SHAKES, SHAKE_BASES, SHAKE_PROTEINS, SHAKE_ADDINS } from '../data/shakeData';
import { TrendingUp, ArrowRight, Check, Plus, ShoppingBag, Zap } from 'lucide-react';
import usePlanStore from '../store/usePlanStore';

function pickBestGapFix({ shakeRecs, selectedBoosters, storeProducts, addedBoosterTexts, addedAddonNames }) {
  const candidates = [];
  for (const s of shakeRecs) {
    if (addedAddonNames.has(s.name)) continue;
    candidates.push({
      type: 'shake',
      item: s,
      score: s.macros.protein / Math.max(s.macros.cal, 1),
      title: s.name,
      detail: `${Math.round(s.macros.cal)} cal · +${Math.round(s.macros.protein)}g protein`,
    });
  }
  for (const b of selectedBoosters) {
    if (addedBoosterTexts.has(b.text)) continue;
    candidates.push({
      type: 'booster',
      item: b,
      score: b.extraProtein / Math.max(b.extraCal, 1),
      title: b.text,
      detail: `+${b.extraCal} cal · +${b.extraProtein}g protein`,
    });
  }
  for (const p of storeProducts) {
    const name = `${p.name} (${p.brand})`;
    if (addedAddonNames.has(name)) continue;
    candidates.push({
      type: 'product',
      item: p,
      score: p.protein / Math.max(p.calories, 1),
      title: p.name,
      detail: `${p.brand} · +${p.protein}g`,
    });
  }
  for (const sw of SWAPS.slice(0, 4)) {
    const name = `${sw.from} → ${sw.to}`;
    if (addedAddonNames.has(name)) continue;
    candidates.push({
      type: 'swap',
      item: sw,
      score: sw.extraProtein,
      title: name,
      detail: `+${sw.extraProtein}g protein`,
    });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

function calcPresetMacros(preset) {
  const base = SHAKE_BASES.find(b => b.id === preset.base) || { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const prot = SHAKE_PROTEINS.find(p => p.id === preset.protein) || { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const addins = SHAKE_ADDINS.filter(a => preset.addins.includes(a.id));
  return [base, prot, ...addins].reduce((acc, item) => ({
    cal: acc.cal + item.cal, protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs, fat: acc.fat + item.fat,
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
}

export default function BridgeTheGap({ plan, prefs, onAddBooster, onAddSwap, onAddShake, onAddProduct, meals: overrideMeals, addons: overrideAddons }) {
  const daily = usePlanStore(s => s.activePlan.daily);
  const totals = calcDayTotals(plan);
  const gap = prefs.proteinTarget - totals.protein;

  const sourceMeals = overrideMeals || daily?.meals || [];
  const sourceAddons = overrideAddons || daily?.addons || [];

  const addedBoosterTexts = useMemo(() => {
    const texts = new Set();
    for (const m of sourceMeals) {
      for (const b of (m.boosters || [])) {
        texts.add(b.text || b.name);
      }
    }
    return texts;
  }, [sourceMeals]);

  const addedAddonNames = useMemo(() => {
    return new Set(sourceAddons.map(a => a.name));
  }, [sourceAddons]);

  const storeProducts = useMemo(() => {
    const calBudget = Math.max(prefs.calorieTarget * 1.05 - totals.cal, 100);
    return blinkitProducts
      .filter(p => {
        if (prefs.dietType === 'vegetarian' && !p.isVeg) return false;
        if (prefs.dietType === 'eggetarian' && !p.isVeg) return false;
        if (!prefs.dairyOk && p.dairy) return false;
        if (!prefs.soyOk && p.soy) return false;
        return p.protein > 5 && p.calories <= calBudget;
      })
      .sort((a, b) => (b.protein / Math.max(b.calories, 1)) - (a.protein / Math.max(a.calories, 1)))
      .slice(0, 5);
  }, [prefs, totals]);

  const boosters = getFilteredBoosters(prefs);

  const selectedBoosters = useMemo(() => {
    const selected = [];
    let remaining = gap;
    for (const b of boosters) {
      if (remaining <= 0) break;
      if (b.extraProtein <= remaining + 5) {
        selected.push(b);
        remaining -= b.extraProtein;
      }
    }
    return selected;
  }, [boosters, gap]);

  const shakeRecs = useMemo(() => PRESET_SHAKES
    .map(p => ({ ...p, macros: calcPresetMacros(p) }))
    .filter(s => s.macros.protein >= 10)
    .sort((a, b) => (b.macros.protein / Math.max(b.macros.cal, 1)) - (a.macros.protein / Math.max(a.macros.cal, 1)))
    .slice(0, 3), []);

  const bestFix = useMemo(
    () => pickBestGapFix({
      shakeRecs,
      selectedBoosters,
      storeProducts,
      addedBoosterTexts,
      addedAddonNames,
    }),
    [shakeRecs, selectedBoosters, storeProducts, addedBoosterTexts, addedAddonNames],
  );

  const applyBestFix = () => {
    if (!bestFix) return;
    if (bestFix.type === 'shake') onAddShake?.(bestFix.item);
    else if (bestFix.type === 'booster') onAddBooster?.(bestFix.item);
    else if (bestFix.type === 'product') onAddProduct?.(bestFix.item);
    else if (bestFix.type === 'swap') onAddSwap?.(bestFix.item);
  };

  if (gap <= 5) {
    return (
      <div id="bridge-the-gap" className="bg-sage-50 border border-sage-200 rounded-xl p-4 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sage-100 mb-2">
          <Check size={20} className="text-sage-600" aria-hidden />
        </div>
        <p className="text-sm font-bold text-sage-700">You&apos;ve hit your protein target!</p>
        <p className="text-xs text-sage-600 mt-0.5">{Math.round(totals.protein)}g of {prefs.proteinTarget}g</p>
      </div>
    );
  }

  return (
    <div id="bridge-the-gap" className="bg-white border-2 border-terra-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl" aria-hidden>💪</span>
        <div>
          <h3 className="font-bold text-bark-700 text-sm flex items-center gap-1.5 font-sans">
            Bridge the Protein Gap <TrendingUp size={14} className="text-terra-500" aria-hidden />
          </h3>
          <p className="text-xs text-terra-700">
            Need <strong>{Math.round(gap)}g more protein</strong> to hit your {prefs.proteinTarget}g target
            {totals.cal < prefs.calorieTarget * 0.95 && (
              <span className="text-bark-500"> · ~{Math.max(0, Math.round(prefs.calorieTarget - totals.cal))} kcal room left today</span>
            )}
          </p>
        </div>
      </div>

      {bestFix && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-sage-600 to-sage-700 text-white shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sage-100 mb-1">Best next step (highest protein per calorie)</p>
          <p className="text-sm font-bold leading-snug">{bestFix.title}</p>
          <p className="text-xs text-sage-100 mt-0.5">{bestFix.detail}</p>
          <button
            type="button"
            onClick={applyBestFix}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-lg bg-white text-sage-800 text-sm font-bold hover:bg-cream-50 transition-colors"
          >
            <Zap size={16} aria-hidden />
            Close the gap — add this
          </button>
        </div>
      )}

      {shakeRecs.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-bark-600 uppercase tracking-wider mb-2">🥤 Quick Protein Shakes</h4>
          <div className="space-y-2">
            {shakeRecs.map(s => {
              const isAdded = addedAddonNames.has(s.name);
              return (
                <div key={s.id} className={`flex items-center gap-3 rounded-lg p-3 border transition-all ${isAdded ? 'bg-sage-50 border-sage-300' : 'bg-white border-cream-200 hover:border-terra-300'}`}>
                  <span className="text-xl flex-shrink-0">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bark-700">{s.name}</p>
                    <p className="text-[10px] text-bark-400">{Math.round(s.macros.cal)} cal · {Math.round(s.macros.protein)}g protein</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sage-600 font-bold text-xs">+{Math.round(s.macros.protein)}g</span>
                    <button onClick={() => !isAdded && onAddShake?.(s)} disabled={isAdded}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${isAdded ? 'bg-sage-100 text-sage-600 cursor-default' : 'bg-terra-500 text-white hover:bg-terra-600 active:scale-95'}`}>
                      {isAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-xs font-bold text-bark-600 uppercase tracking-wider mb-2">💪 Quick Protein Add-ons</h4>
        <div className="space-y-2">
          {selectedBoosters.map((b) => {
            const isAdded = addedBoosterTexts.has(b.text);
            return (
              <div key={b.id} className={`flex items-center gap-3 rounded-lg p-3 border transition-all ${isAdded ? 'bg-sage-50 border-sage-300' : 'bg-white border-cream-200 hover:border-sage-300'}`}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center text-sage-600 font-bold text-xs flex-shrink-0">+{b.extraProtein}g</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-bark-700">{b.text}</p>
                  <p className="text-[10px] text-bark-400">+{b.extraCal} cal</p>
                </div>
                <button onClick={() => !isAdded && onAddBooster?.(b)} disabled={isAdded}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 ${isAdded ? 'bg-sage-100 text-sage-600 cursor-default' : 'bg-sage-500 text-white hover:bg-sage-600 active:scale-95'}`}>
                  {isAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {storeProducts.length > 0 && (
        <div className="mb-4 pt-3 border-t border-terra-200">
          <h4 className="text-xs font-bold text-bark-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShoppingBag size={12} /> From Blinkit / Quick Commerce</h4>
          <div className="space-y-2">
            {storeProducts.map(p => {
              const isAdded = addedAddonNames.has(`${p.name} (${p.brand})`);
              return (
                <div key={p.id} className={`flex items-center gap-3 rounded-lg p-3 border transition-all ${isAdded ? 'bg-sage-50 border-sage-300' : 'bg-white border-cream-200 hover:border-sage-300'}`}>
                  <div className="w-8 h-8 rounded-full bg-protein-50 flex items-center justify-center text-protein-600 font-bold text-xs flex-shrink-0">+{p.protein}g</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bark-700 truncate">{p.name}</p>
                    <p className="text-[10px] text-bark-400">{p.brand} · {p.calories} cal · {p.serving} · {p.price}</p>
                  </div>
                  <button onClick={() => !isAdded && onAddProduct?.(p)} disabled={isAdded}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 ${isAdded ? 'bg-sage-100 text-sage-600 cursor-default' : 'bg-protein-500 text-white hover:bg-protein-600 active:scale-95'}`}>
                    {isAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-terra-200">
        <h4 className="text-xs font-bold text-bark-600 uppercase tracking-wider mb-2">🔄 Smart Protein Swaps</h4>
        <div className="space-y-1.5">
          {SWAPS.slice(0, 5).map((sw, i) => {
            const isAdded = addedAddonNames.has(`${sw.from} → ${sw.to}`);
            return (
              <div key={i} className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 transition-all ${isAdded ? 'bg-sage-50' : 'hover:bg-white'}`}>
                <span className="text-bark-400 line-through">{sw.from}</span>
                <ArrowRight size={12} className="text-sage-500 flex-shrink-0" />
                <span className="text-bark-700 font-medium">{sw.to}</span>
                <span className="text-sage-600 font-bold whitespace-nowrap">+{sw.extraProtein}g</span>
                <button onClick={() => !isAdded && onAddSwap?.(sw)} disabled={isAdded}
                  className={`ml-auto flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-bold transition-all flex-shrink-0 ${isAdded ? 'bg-sage-100 text-sage-600 cursor-default' : 'bg-sage-500 text-white hover:bg-sage-600 active:scale-95'}`}>
                  {isAdded ? '✓' : '+ Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
