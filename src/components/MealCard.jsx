import React, { useState } from 'react';
import { RefreshCw, Heart, Clock, ChefHat, BookOpen, X, Pin } from 'lucide-react';
import { CUISINES } from '../data/meals';

const cuisineEmojiMap = Object.fromEntries(CUISINES.map(c => [c.id, c.emoji]));

export default function MealCard({ meal, index, onSwap, onToggleFav, isFav, onViewRecipe, onRemoveBooster, isPinned }) {
  const [removingBoosterId, setRemovingBoosterId] = useState(null);

  const handleRemoveBooster = (boosterId) => {
    setRemovingBoosterId(boosterId);
    setTimeout(() => {
      onRemoveBooster?.(boosterId);
      setRemovingBoosterId(null);
    }, 200);
  };

  const macroCell = (label, value, unit, colorClass, bold) => (
    <div className="text-center">
      <div className={`text-sm font-bold ${colorClass} ${bold ? 'text-base' : ''}`}>
        {Math.round(value)}{unit}
      </div>
      <div className="text-[10px] text-bark-400 uppercase tracking-wide">{label}</div>
    </div>
  );

  const boosterTotal = (meal.boosters || []).reduce((a, b) => ({
    cal: a.cal + (b.cal || 0), protein: a.protein + (b.protein || 0),
  }), { cal: 0, protein: 0 });

  return (
    <div className={`bg-white rounded-xl border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden animate-fade-in-up stagger-${Math.min(index + 1, 5)}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-cream-200 bg-gradient-to-r from-cream-100 to-cream-50">
        <span className="text-xs font-bold text-sage-600 uppercase tracking-wider flex items-center gap-1.5">
          {isPinned && <Pin size={11} className="text-terra-500" />}
          {meal.slotLabel}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onToggleFav} className="p-1.5 rounded-full hover:bg-cream-200 transition-colors" title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
            <Heart size={16} className={isFav ? 'fill-red-500 text-red-500' : 'text-bark-300'} />
          </button>
          {!isPinned && (
            <button onClick={onSwap} className="p-1.5 rounded-full hover:bg-cream-200 transition-colors" title="Swap meal">
              <RefreshCw size={16} className="text-sage-600" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-xl mt-0.5">{cuisineEmojiMap[meal.cuisine] || '🍽️'}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-bark-700 text-sm leading-tight">{meal.name}</h3>
            <p className="text-xs text-bark-400 mt-0.5 leading-relaxed">{meal.desc}</p>
          </div>
        </div>

        <div className="mb-3 px-2 py-1.5 bg-cream-50 rounded-lg">
          <span className="text-[10px] font-semibold text-bark-500 uppercase tracking-wide">Portion: </span>
          <span className="text-xs text-bark-600">{meal.serving}</span>
        </div>

        <div className="grid grid-cols-4 gap-1 py-2 border-t border-cream-100">
          {macroCell('Calories', meal.cal + boosterTotal.cal, '', 'text-terra-600', false)}
          {macroCell('Protein', meal.protein + boosterTotal.protein, 'g', 'text-sage-600', true)}
          {macroCell('Carbs', meal.carbs, 'g', 'text-blue-500', false)}
          {macroCell('Fat', meal.fat, 'g', 'text-amber-500', false)}
        </div>

        {/* Booster pills — removable */}
        {meal.boosters && meal.boosters.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {meal.boosters.map((b) => (
              <div key={b.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-dashed border-sage-300 bg-sage-50 transition-all duration-200 ${removingBoosterId === b.id ? 'opacity-0 max-h-0 py-0 my-0 overflow-hidden' : 'opacity-100 max-h-20'}`}>
                <span className="text-sage-600 text-[10px] font-bold flex-shrink-0">+{b.protein || b.extraProtein}g</span>
                <span className="text-xs text-bark-600 flex-1 truncate">{b.text || b.name}</span>
                <span className="text-[10px] text-bark-400">+{b.cal || b.extraCal} cal</span>
                {onRemoveBooster && (
                  <button onClick={() => handleRemoveBooster(b.id)}
                    className="p-0.5 rounded-full hover:bg-red-100 text-bark-400 hover:text-red-500 transition-colors flex-shrink-0">
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {meal.tags && meal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {meal.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 text-[10px] font-medium bg-cream-100 text-bark-400 rounded">{tag}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-cream-100">
          <div className="flex items-center gap-2 flex-wrap">
            {meal.prepTime > 0 && (
              <>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                    meal.prepTime <= 15
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : meal.prepTime <= 30
                        ? 'bg-cream-100 text-bark-600 border-cream-300'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                  }`}
                  title="Estimated active prep time"
                >
                  {meal.prepTime <= 15 ? 'Quick' : meal.prepTime <= 30 ? 'Medium prep' : 'Longer prep'}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-bark-400">
                  <Clock size={12} className="text-bark-300" aria-hidden />
                  {meal.prepTime} min
                </span>
              </>
            )}
            {meal.proteinBoosters && meal.proteinBoosters.length > 0 && (!meal.boosters || meal.boosters.length === 0) && (
              <span className="flex items-center gap-1 text-[10px] text-sage-500 font-medium">
                <ChefHat size={12} className="text-sage-400" />Boost available
              </span>
            )}
          </div>
          {onViewRecipe && (
            <button onClick={onViewRecipe}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-protein-600 bg-protein-50 border border-protein-200 hover:bg-protein-100 transition-colors active:scale-95">
              <BookOpen size={12} /> Recipe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
