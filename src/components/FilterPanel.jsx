import React from 'react';
import { CUISINES } from '../data/meals';
import { Zap } from 'lucide-react';

export default function FilterPanel({ prefs, setPrefs, onGenerate, isGenerating }) {
  const update = (key, value) => setPrefs(p => ({ ...p, [key]: value }));

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
    <div className="space-y-5">
      {/* Calorie Target */}
      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-1.5">
          Calorie Target — <span className="text-terra-500 font-bold">{prefs.calorieTarget} kcal</span>
        </label>
        <input
          type="range"
          min={1200} max={3500} step={50}
          value={prefs.calorieTarget}
          onChange={e => update('calorieTarget', +e.target.value)}
          className="w-full h-2 rounded-lg appearance-none bg-cream-200 accent-sage-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-bark-400 mt-0.5">
          <span>1200</span><span>3500</span>
        </div>
      </div>

      {/* Protein Target */}
      <div className="bg-sage-50 rounded-lg p-3 border border-sage-200">
        <label className="block text-sm font-bold text-protein-700 mb-1.5">
          💪 Protein Target — <span className="text-protein-600">{prefs.proteinTarget}g</span>
        </label>
        <input
          type="range"
          min={50} max={250} step={5}
          value={prefs.proteinTarget}
          onChange={e => update('proteinTarget', +e.target.value)}
          className="w-full h-2 rounded-lg appearance-none bg-protein-200 accent-protein-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-protein-500 mt-0.5">
          <span>50g</span><span>250g</span>
        </div>
      </div>

      {/* Carb Preference */}
      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-1.5">Carb Preference</label>
        <div className="flex gap-1.5">
          {[{ val: 'low', label: 'Low' }, { val: 'moderate', label: 'Mod' }, { val: 'none', label: 'Any' }].map(opt => (
            <button key={opt.val} onClick={() => update('carbPref', opt.val)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all border ${
                prefs.carbPref === opt.val
                  ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                  : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
              }`}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Fat Preference */}
      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-1.5">Fat Preference</label>
        <div className="flex gap-1.5">
          {[{ val: 'low', label: 'Low' }, { val: 'moderate', label: 'Mod' }, { val: 'none', label: 'Any' }].map(opt => (
            <button key={opt.val} onClick={() => update('fatPref', opt.val)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all border ${
                prefs.fatPref === opt.val
                  ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                  : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
              }`}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Diet Type */}
      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-1.5">Diet Type</label>
        <div className="flex gap-1.5">
          {[
            { val: 'vegetarian', label: '🥬 Veg' },
            { val: 'eggetarian', label: '🥚 Egg' },
            { val: 'non-vegetarian', label: '🍗 Non-Veg' },
          ].map(d => (
            <button
              key={d.val}
              onClick={() => update('dietType', d.val)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                prefs.dietType === d.val
                  ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                  : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Egg Preference — only if Vegetarian */}
      {prefs.dietType === 'vegetarian' && (
        <div className="animate-fade-in">
          <label className="block text-sm font-semibold text-bark-600 mb-1.5">Egg Preference</label>
          <div className="flex gap-2">
            {[
              { val: 'egg', label: '🥚 Includes Egg' },
              { val: 'no-egg', label: '🌱 Pure Veg' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => update('eggPref', opt.val)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  prefs.eggPref === opt.val
                    ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                    : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dairy & Soy Toggles */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-bark-600 mb-1">🥛 Dairy</label>
          <div className="flex gap-1">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => update('dairyOk', v)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  prefs.dairyOk === v
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-bark-600 border-cream-200'
                }`}>{v ? 'Yes' : 'No'}</button>
            ))}
          </div>
          <p className="text-[9px] text-bark-400 mt-0.5">Paneer, whey, curd</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-bark-600 mb-1">🫘 Soy</label>
          <div className="flex gap-1">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => update('soyOk', v)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  prefs.soyOk === v
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-bark-600 border-cream-200'
                }`}>{v ? 'Yes' : 'No'}</button>
            ))}
          </div>
          <p className="text-[9px] text-bark-400 mt-0.5">Tofu, soy chunks</p>
        </div>
      </div>

      {/* Cuisine Selection */}
      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-1.5">Cuisine / Meal Base</label>
        <div className="grid grid-cols-2 gap-1.5">
          {CUISINES.map(c => (
            <button
              key={c.id}
              onClick={() => toggleCuisine(c.id)}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 border text-left ${
                prefs.cuisines.includes(c.id)
                  ? 'bg-terra-50 text-terra-700 border-terra-300 shadow-sm'
                  : 'bg-white text-bark-500 border-cream-200 hover:border-terra-200'
              }`}
            >
              {c.emoji} {c.label.replace(/ — .*/, '').replace(/ \/ .*/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Number of Meals */}
      <div>
        <label className="block text-sm font-semibold text-bark-600 mb-1.5">Meals per Day</label>
        <div className="flex gap-1.5">
          {[
            { val: 3, label: '3', sub: 'B/L/D' },
            { val: 4, label: '4', sub: 'B/L/S/D' },
            { val: 5, label: '5', sub: '+Snacks' },
            { val: 6, label: '6', sub: 'Frequent' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => update('numMeals', opt.val)}
              className={`flex-1 py-2 px-1 rounded-lg text-center transition-all duration-200 border ${
                prefs.numMeals === opt.val
                  ? 'bg-sage-500 text-white border-sage-500 shadow-sm'
                  : 'bg-white text-bark-600 border-cream-200 hover:border-sage-300'
              }`}
            >
              <div className="text-lg font-bold">{opt.label}</div>
              <div className={`text-[9px] ${prefs.numMeals === opt.val ? 'text-sage-100' : 'text-bark-400'}`}>
                {opt.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Protein Gap Mode */}
      <div className="flex items-center justify-between bg-terra-50 rounded-lg p-2.5 border border-terra-200">
        <div>
          <span className="text-xs font-bold text-bark-700">💪 Protein Gap Mode</span>
          <p className="text-[9px] text-bark-400">Show protein boosters</p>
        </div>
        <button
          onClick={() => update('proteinGapMode', !prefs.proteinGapMode)}
          className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 ${
            prefs.proteinGapMode ? 'bg-sage-500' : 'bg-cream-300'
          }`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
            prefs.proteinGapMode ? 'left-[22px]' : 'left-0.5'
          }`} />
        </button>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-sage-500 to-sage-600 text-white font-bold text-base shadow-lg hover:shadow-xl hover:from-sage-600 hover:to-sage-700 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Generating...
          </span>
        ) : (
          <>
            <Zap size={18} />
            Generate Meal Plan
          </>
        )}
      </button>
    </div>
  );
}
