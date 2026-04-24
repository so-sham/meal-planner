import React, { useState } from 'react';
import { CUISINES } from '../data/meals';
import { ChevronRight, ChevronLeft, Sparkles, Target, Leaf, UtensilsCrossed, CalendarDays } from 'lucide-react';

const STEPS = [
  { label: 'Goals', icon: Target },
  { label: 'Diet', icon: Leaf },
  { label: 'Cuisine', icon: UtensilsCrossed },
  { label: 'Structure', icon: CalendarDays },
];

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map(({ label, icon: Icon }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              i < step ? 'bg-sage-500 text-white' :
              i === step ? 'bg-sage-500 text-white ring-4 ring-sage-200' :
              'bg-cream-200 text-bark-400'
            }`}>
              {i < step ? '✓' : <Icon size={16} />}
            </div>
            <span className={`text-[10px] mt-1 font-semibold ${
              i <= step ? 'text-sage-600' : 'text-bark-400'
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 transition-all duration-300 ${
              i < step ? 'bg-sage-500' : 'bg-cream-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function GoalsStep({ prefs, update }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <Target size={24} className="text-sage-500" />
          <h2 className="text-2xl font-extrabold text-bark-700">Set Your Targets</h2>
        </div>
        <p className="text-sm text-bark-400 mt-1">Tell us your nutrition targets</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-2">
          Calorie Target — <span className="text-terra-500 font-bold">{prefs.calorieTarget} kcal</span>
        </label>
        <input
          type="range" min={1200} max={3500} step={50}
          value={prefs.calorieTarget}
          onChange={e => update('calorieTarget', +e.target.value)}
          className="w-full h-2 rounded-lg appearance-none bg-cream-200 accent-sage-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-bark-400 mt-1"><span>1200</span><span>3500</span></div>
      </div>

      <div className="bg-gradient-to-r from-protein-50 to-sage-50 rounded-xl p-4 border-2 border-protein-300">
        <label className="block text-sm font-bold text-protein-700 mb-2">
          💪 Protein Target — <span className="text-protein-600 text-lg">{prefs.proteinTarget}g</span>
        </label>
        <p className="text-[10px] text-protein-600 mb-2">This is your PRIMARY goal. We'll optimize everything around it.</p>
        <input
          type="range" min={50} max={250} step={5}
          value={prefs.proteinTarget}
          onChange={e => update('proteinTarget', +e.target.value)}
          className="w-full h-3 rounded-lg appearance-none bg-protein-200 accent-protein-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-protein-500 mt-1"><span>50g</span><span>250g</span></div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-2">Carb Preference</label>
        <div className="flex gap-2">
          {[{ val: 'low', label: 'Low Carb' }, { val: 'moderate', label: 'Moderate' }, { val: 'none', label: 'No Restriction' }].map(opt => (
            <button key={opt.val} onClick={() => update('carbPref', opt.val)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all border ${
                prefs.carbPref === opt.val
                  ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                  : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
              }`}>{opt.label}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-2">Fat Preference</label>
        <div className="flex gap-2">
          {[{ val: 'low', label: 'Low Fat' }, { val: 'moderate', label: 'Moderate' }, { val: 'none', label: 'No Restriction' }].map(opt => (
            <button key={opt.val} onClick={() => update('fatPref', opt.val)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all border ${
                prefs.fatPref === opt.val
                  ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                  : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
              }`}>{opt.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DietStep({ prefs, update }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <Leaf size={24} className="text-sage-500" />
          <h2 className="text-2xl font-extrabold text-bark-700">Diet Preferences</h2>
        </div>
        <p className="text-sm text-bark-400 mt-1">Help us personalize your meal options</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-2">Diet Type</label>
        <div className="flex gap-2">
          {[
            { val: 'vegetarian', label: '🥬 Vegetarian' },
            { val: 'eggetarian', label: '🥚 Eggetarian' },
            { val: 'non-vegetarian', label: '🍗 Non-Veg' },
          ].map(d => (
            <button key={d.val} onClick={() => update('dietType', d.val)}
              className={`flex-1 py-3 px-3 rounded-lg text-sm font-medium transition-all border ${
                prefs.dietType === d.val
                  ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                  : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
              }`}>{d.label}</button>
          ))}
        </div>
      </div>

      {prefs.dietType === 'vegetarian' && (
        <div className="animate-fade-in">
          <label className="block text-sm font-semibold text-bark-600 mb-2">Egg Preference</label>
          <div className="flex gap-2">
            {[
              { val: 'egg', label: '🥚 Includes Egg' },
              { val: 'no-egg', label: '🌱 Pure Veg' },
            ].map(opt => (
              <button key={opt.val} onClick={() => update('eggPref', opt.val)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all border ${
                  prefs.eggPref === opt.val
                    ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                    : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-bark-600 mb-2">🥛 Dairy OK?</label>
          <div className="flex gap-2">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => update('dairyOk', v)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  prefs.dairyOk === v
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
                }`}>{v ? 'Yes' : 'No'}</button>
            ))}
          </div>
          <p className="text-[10px] text-bark-400 mt-1">Paneer, whey, curd</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-bark-600 mb-2">🫘 Soy OK?</label>
          <div className="flex gap-2">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => update('soyOk', v)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  prefs.soyOk === v
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
                }`}>{v ? 'Yes' : 'No'}</button>
            ))}
          </div>
          <p className="text-[10px] text-bark-400 mt-1">Tofu, soy chunks</p>
        </div>
      </div>
    </div>
  );
}

function CuisineStep({ prefs, setPrefs }) {
  const toggleCuisine = (id) => {
    setPrefs(p => {
      if (id === 'mixed') return { ...p, cuisines: ['mixed'] };
      let next = p.cuisines.filter(c => c !== 'mixed');
      if (next.includes(id)) next = next.filter(c => c !== id);
      else next = [...next, id];
      return { ...p, cuisines: next.length === 0 ? ['mixed'] : next };
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <UtensilsCrossed size={24} className="text-sage-500" />
          <h2 className="text-2xl font-extrabold text-bark-700">Pick Your Cuisines</h2>
        </div>
        <p className="text-sm text-bark-400 mt-1">Pick all that you enjoy (multi-select)</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {CUISINES.map(c => (
          <button key={c.id} onClick={() => toggleCuisine(c.id)}
            className={`py-3 px-3 rounded-xl text-sm font-medium transition-all duration-200 border text-left ${
              prefs.cuisines.includes(c.id)
                ? 'bg-terra-50 text-terra-700 border-terra-300 shadow-sm ring-1 ring-terra-200'
                : 'bg-white text-bark-500 border-cream-200 hover:border-terra-200'
            }`}>
            <span className="text-lg mr-1.5">{c.emoji}</span>
            {c.label.replace(/ — .*/, '').replace(/ \/ .*/, '')}
          </button>
        ))}
      </div>
    </div>
  );
}

function MealStructureStep({ prefs, update }) {
  const mealOptions = [
    { val: 3, label: '3', sub: 'B / L / D' },
    { val: 4, label: '4', sub: 'B / L / S / D' },
    { val: 5, label: '5', sub: 'B / MS / L / ES / D' },
    { val: 6, label: '6', sub: 'B / MS / L / AS / ES / D' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
          <CalendarDays size={24} className="text-sage-500" />
          <h2 className="text-2xl font-extrabold text-bark-700">Meal Structure</h2>
        </div>
        <p className="text-sm text-bark-400 mt-1">How many meals do you prefer per day?</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {mealOptions.map(opt => (
          <button key={opt.val} onClick={() => update('numMeals', opt.val)}
            className={`py-3 px-2 rounded-xl text-center transition-all duration-200 border ${
              prefs.numMeals === opt.val
                ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
            }`}>
            <div className="text-2xl font-bold">{opt.label}</div>
            <div className={`text-[9px] ${prefs.numMeals === opt.val ? 'text-sage-100' : 'text-bark-400'}`}>{opt.sub}</div>
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-r from-terra-50 to-cream-100 rounded-xl p-4 border border-terra-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-bark-700">💪 Protein Gap Mode</h4>
            <p className="text-[10px] text-bark-400 mt-0.5">
              Auto-insert protein boosters between meals to bridge the gap between food protein and your target
            </p>
          </div>
          <button
            onClick={() => update('proteinGapMode', !prefs.proteinGapMode)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
              prefs.proteinGapMode ? 'bg-sage-500' : 'bg-cream-300'
            }`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
              prefs.proteinGapMode ? 'left-[26px]' : 'left-0.5'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding({ prefs, setPrefs, onComplete }) {
  const [step, setStep] = useState(0);

  const update = (key, value) => setPrefs(p => ({ ...p, [key]: value }));

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-4xl">💪</span>
          <h1 className="text-2xl font-extrabold text-bark-700 mt-2">NourishPlan</h1>
          <p className="text-xs text-bark-400">Protein-First Meal Planner</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-cream-200 p-6">
          <ProgressBar step={step} />
          <p className="text-center text-xs font-semibold text-bark-500 mb-6 -mt-2" aria-live="polite">
            Step {step + 1} of 4
          </p>

          {step === 0 && <GoalsStep prefs={prefs} update={update} />}
          {step === 1 && <DietStep prefs={prefs} update={update} />}
          {step === 2 && <CuisineStep prefs={prefs} setPrefs={setPrefs} />}
          {step === 3 && <MealStructureStep prefs={prefs} update={update} />}

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-bark-600 bg-cream-100 border border-cream-200 hover:bg-cream-200 transition-all flex items-center justify-center gap-1">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sage-500 to-sage-600 shadow-lg hover:shadow-xl hover:from-sage-600 hover:to-sage-700 transition-all active:scale-[0.98] flex items-center justify-center gap-1">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={onComplete}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sage-500 to-sage-600 shadow-lg hover:shadow-xl hover:from-sage-600 hover:to-sage-700 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5">
                <Sparkles size={16} /> Generate My Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
