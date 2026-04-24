import React, { useState } from 'react';
import MealCard from './MealCard';
import MacroRings from './MacroRings';
import BridgeTheGap from './BridgeTheGap';
import DayTotalsBreakdown from './DayTotalsBreakdown';
import { calcDayTotals } from '../utils/algorithm';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function flattenWithBoosters(m) {
  const bc = (m.boosters || []).reduce((s, b) => s + (b.cal || 0), 0);
  const bp = (m.boosters || []).reduce((s, b) => s + (b.protein || 0), 0);
  return { ...m, cal: (m.cal || 0) + bc, protein: (m.protein || 0) + bp };
}

function DayTab({ day, addons, index, isActive, onClick, prefs }) {
  const allItems = [
    ...day,
    ...(addons || []).map(a => ({ cal: a.cal, protein: a.protein, carbs: a.carbs, fat: a.fat, boosters: [] })),
  ].map(flattenWithBoosters);
  const totals = calcDayTotals(allItems);
  const protPct = totals.protein / Math.max(prefs.proteinTarget, 1);
  const dotColor = protPct >= 0.90 ? 'bg-emerald-400' : protPct >= 0.75 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-center transition-all border ${
        isActive
          ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
          : 'bg-white text-bark-500 border-cream-200 hover:border-sage-200'
      }`}
    >
      <div className="text-xs font-bold">{DAY_NAMES[index].slice(0, 3)}</div>
      <div className="flex items-center justify-center gap-1 mt-0.5">
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : dotColor}`} />
        <span className={`text-[10px] ${isActive ? 'text-sage-100' : 'text-bark-400'}`}>
          {Math.round(totals.protein)}g P
        </span>
      </div>
    </button>
  );
}

export default function WeeklyView({
  weekPlan, weekDays, prefs, onSwapMeal, favorites, onToggleFav, onViewRecipe,
  onAddBooster, onAddSwap, onAddShake, onAddProduct,
  onRemoveBooster, onRemoveAddon,
}) {
  const [activeDay, setActiveDay] = useState(0);

  if (!weekPlan || weekPlan.length === 0) return null;

  const dayMeals = weekPlan[activeDay];
  const dayAddons = weekDays?.[activeDay]?.addons || [];

  const augmentedPlan = [
    ...dayMeals,
    ...dayAddons.map(a => ({ cal: a.cal, protein: a.protein, carbs: a.carbs, fat: a.fat, boosters: [] })),
  ].map(flattenWithBoosters);

  const addonTotals = dayAddons.reduce(
    (acc, a) => ({ cal: acc.cal + a.cal, protein: acc.protein + a.protein, carbs: acc.carbs + a.carbs, fat: acc.fat + a.fat }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {weekPlan.map((day, i) => (
          <DayTab
            key={i}
            day={day}
            addons={weekDays?.[i]?.addons}
            index={i}
            isActive={i === activeDay}
            onClick={() => setActiveDay(i)}
            prefs={prefs}
          />
        ))}
      </div>

      <h3 className="font-bold text-bark-700 text-lg">{DAY_NAMES[activeDay]}</h3>

      <MacroRings plan={augmentedPlan} prefs={prefs} />

      <DayTotalsBreakdown meals={dayMeals} addons={dayAddons} />

      <BridgeTheGap
        plan={augmentedPlan}
        prefs={prefs}
        meals={dayMeals}
        addons={dayAddons}
        onAddBooster={(booster) => onAddBooster?.(activeDay, booster)}
        onAddSwap={(swap) => onAddSwap?.(activeDay, swap)}
        onAddShake={(shake) => onAddShake?.(activeDay, shake)}
        onAddProduct={(product) => onAddProduct?.(activeDay, product)}
      />

      {dayAddons.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-sage-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-sage-700 uppercase tracking-wider mb-2">Added to {DAY_NAMES[activeDay]}</h3>
          <div className="space-y-1.5">
            {dayAddons.map(a => (
              <div key={a.id} className="flex items-center gap-2 bg-sage-50 rounded-lg px-3 py-2">
                <span className="text-[10px] font-bold text-white bg-sage-500 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {a.type === 'shake' ? '🥤' : a.type === 'product' ? '🛒' : a.type === 'swap' ? '🔄' : '💪'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-bark-700 truncate">{a.name}</p>
                  <p className="text-[10px] text-bark-400">+{a.protein}g protein · +{a.cal} cal</p>
                </div>
                <button onClick={() => onRemoveAddon?.(activeDay, a.id)}
                  className="text-bark-400 hover:text-red-500 text-xs font-bold px-1">✕</button>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-sage-200 flex justify-between text-xs font-bold">
            <span className="text-bark-600">Total add-ons:</span>
            <span className="text-sage-700">+{addonTotals.protein}g protein · +{addonTotals.cal} cal</span>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {dayMeals.map((meal, i) => (
          <MealCard
            key={`${activeDay}-${meal.id}-${i}`}
            meal={meal}
            index={i}
            onSwap={() => onSwapMeal(activeDay, i)}
            onToggleFav={() => onToggleFav(meal.id)}
            isFav={favorites.has(meal.id)}
            onViewRecipe={() => onViewRecipe?.(meal)}
            onRemoveBooster={(boosterId) => onRemoveBooster?.(activeDay, i, boosterId)}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-cream-200 shadow-sm p-4">
        <h4 className="text-xs font-bold text-bark-500 uppercase tracking-wider mb-3">
          Week at a Glance
        </h4>
        <div className="space-y-2">
          {weekPlan.map((day, i) => {
            const dayAd = weekDays?.[i]?.addons || [];
            const allItems = [
              ...day,
              ...dayAd.map(a => ({ cal: a.cal, protein: a.protein, carbs: a.carbs, fat: a.fat, boosters: [] })),
            ].map(flattenWithBoosters);
            const totals = calcDayTotals(allItems);
            const calPct = Math.min(100, (totals.cal / prefs.calorieTarget) * 100);
            const protPct = Math.min(100, (totals.protein / prefs.proteinTarget) * 100);

            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`font-semibold w-10 cursor-pointer ${
                      i === activeDay ? 'text-sage-600' : 'text-bark-600'
                    }`}
                    onClick={() => setActiveDay(i)}
                  >
                    {DAY_NAMES[i].slice(0, 3)}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-cream-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all"
                          style={{ width: `${calPct}%` }}
                        />
                      </div>
                      <span className="text-bark-500 w-16 text-right text-[10px]">
                        {Math.round(totals.cal)} kcal
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-cream-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-protein-400 to-protein-500 rounded-full transition-all"
                          style={{ width: `${protPct}%` }}
                        />
                      </div>
                      <span className="text-sage-600 w-16 text-right text-[10px]">
                        {Math.round(totals.protein)}g P
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-bark-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-sage-400 inline-block" /> Calories
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-protein-400 inline-block" /> Protein
          </span>
        </div>
      </div>
    </div>
  );
}
