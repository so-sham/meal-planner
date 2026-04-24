import React, { useState, useMemo, useRef, useEffect } from 'react';
import usePlanStore, { calcDayTotalsWithBoosters } from '../store/usePlanStore';
import { meals as mealDB } from '../data/meals';
import { CUISINES } from '../data/meals';
import {
  Bookmark, Trash2, Copy, ArrowRight, Search, SlidersHorizontal,
  Heart, ChevronDown, ChevronUp, Save, Zap, Pencil,
} from 'lucide-react';

const cuisineEmojiMap = Object.fromEntries(CUISINES.map(c => [c.id, c.emoji]));

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'protein', label: 'Highest Protein' },
  { value: 'name', label: 'Name A-Z' },
];

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 172_800_000) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function getPlanMacros(plan) {
  if (!plan.planData) return { cal: 0, protein: 0 };
  const meals = plan.type === 'weekly'
    ? plan.planData.days?.[0]?.meals
    : plan.planData.meals;
  if (!meals) return { cal: 0, protein: 0 };
  return calcDayTotalsWithBoosters(meals);
}

// ── Favorite Meals Section ──
function FavoriteMeals({ favorites, onRemoveFav, onGenerateFromFavs }) {
  const favMeals = useMemo(() => {
    const favSet = new Set(favorites);
    return mealDB.filter(m => favSet.has(m.id));
  }, [favorites]);

  if (favMeals.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-cream-200 bg-gradient-to-r from-red-50 to-cream-50">
        <Heart size={16} className="text-red-400 fill-red-400" />
        <h2 className="text-sm font-bold text-bark-700">Favorite Meals</h2>
        <span className="text-[10px] text-bark-400 ml-auto">{favMeals.length} meal{favMeals.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="divide-y divide-cream-100 max-h-[320px] overflow-y-auto">
        {favMeals.map(meal => (
          <div key={meal.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-cream-50 transition-colors group">
            <span className="text-base flex-shrink-0">{cuisineEmojiMap[meal.cuisine] || '🍽️'}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-bark-700 truncate">{meal.name}</h4>
              <p className="text-[10px] text-bark-400 truncate">{meal.desc}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[10px] font-semibold text-sage-600 bg-sage-50 px-1.5 py-0.5 rounded-full border border-sage-200">
                {meal.protein}g P
              </span>
              <span className="text-[10px] text-bark-400">{meal.cal} cal</span>
              <button onClick={() => onRemoveFav(meal.id)}
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 text-bark-300 hover:text-red-500 transition-all"
                title="Remove from favorites">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-cream-100 bg-cream-50">
        <button onClick={onGenerateFromFavs}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-400 to-terra-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
          <Zap size={14} /> Generate Plan from Favorites
        </button>
      </div>
    </section>
  );
}

// ── Editable meal row within a saved plan ──
function MealRow({ meal, index, totalMeals, onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-cream-50 rounded-lg group">
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button onClick={onMoveUp} disabled={index === 0}
          className="p-0.5 rounded hover:bg-cream-200 text-bark-300 hover:text-bark-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
          <ChevronUp size={12} />
        </button>
        <button onClick={onMoveDown} disabled={index === totalMeals - 1}
          className="p-0.5 rounded hover:bg-cream-200 text-bark-300 hover:text-bark-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
          <ChevronDown size={12} />
        </button>
      </div>
      <span className="text-xs flex-shrink-0 w-5 text-center font-bold text-bark-400">{index + 1}</span>
      <span className="text-sm flex-shrink-0">{cuisineEmojiMap[meal.cuisine] || '🍽️'}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-bark-700 truncate block">{meal.name}</span>
        <span className="text-[10px] text-bark-400">{meal.slotLabel}</span>
      </div>
      <span className="text-[10px] font-semibold text-sage-600 flex-shrink-0">{meal.protein}g P</span>
      <span className="text-[10px] text-bark-400 flex-shrink-0">{meal.cal} cal</span>
      <button onClick={onRemove}
        className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 text-bark-300 hover:text-red-500 transition-all flex-shrink-0"
        title="Remove meal">
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ── Plan Card ──
function PlanCard({ plan, onLoad, onDuplicate, onDelete, onRename, onReorderMeal, onRemoveMeal }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(plan.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const macros = useMemo(() => getPlanMacros(plan), [plan]);
  const planMeals = plan.planData?.meals || [];
  const isWeekly = plan.type === 'weekly';
  const weeklyDays = isWeekly ? (plan.planData?.days || []) : [];
  const totalMealCount = isWeekly
    ? weeklyDays.reduce((sum, d) => sum + (d.meals?.length || 0), 0)
    : planMeals.length;

  const commitRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== plan.name) onRename(plan.id, trimmed);
    else setEditName(plan.name);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setEditName(plan.name); setEditing(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleKeyDown}
                className="w-full text-sm font-bold text-bark-700 bg-cream-50 border border-sage-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-sage-300"
              />
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-left w-full text-sm font-bold text-bark-700 hover:text-sage-600 transition-colors truncate block"
                title="Click to rename"
              >
                {plan.name}
              </button>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-bark-400">{formatDate(plan.createdAt)}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${plan.type === 'weekly' ? 'bg-sage-100 text-sage-600' : 'bg-cream-100 text-bark-500'}`}>
                {plan.type === 'weekly' ? '7-day' : 'Daily'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-terra-50 text-terra-600 border border-terra-200">
            {Math.round(macros.cal)} cal
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sage-50 text-sage-600 border border-sage-200">
            {Math.round(macros.protein)}g protein
          </span>
          <button onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-[11px] text-bark-400 hover:text-sage-600 transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {totalMealCount} meal{totalMealCount !== 1 ? 's' : ''}{isWeekly ? ' · 7 days' : ''}
          </button>
        </div>

        {plan.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {plan.tags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 text-[10px] font-medium bg-cream-100 text-bark-400 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {expanded && (
          <div className="space-y-1.5 mb-3 pt-2 border-t border-cream-100">
            {isWeekly ? (
              weeklyDays.map((day, dayIdx) => {
                const dayMeals = day.meals || [];
                if (dayMeals.length === 0) return null;
                return (
                  <div key={dayIdx}>
                    <div className="text-[10px] font-bold text-bark-400 uppercase tracking-wider px-1 py-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIdx] || `Day ${dayIdx + 1}`}
                    </div>
                    {dayMeals.map((meal, i) => (
                      <MealRow
                        key={`${dayIdx}-${meal.id}-${i}`}
                        meal={meal}
                        index={i}
                        totalMeals={dayMeals.length}
                        onMoveUp={() => onReorderMeal(plan.id, i, i - 1, dayIdx)}
                        onMoveDown={() => onReorderMeal(plan.id, i, i + 1, dayIdx)}
                        onRemove={() => onRemoveMeal(plan.id, i, dayIdx)}
                      />
                    ))}
                  </div>
                );
              })
            ) : (
              planMeals.map((meal, i) => (
                <MealRow
                  key={`${meal.id}-${i}`}
                  meal={meal}
                  index={i}
                  totalMeals={planMeals.length}
                  onMoveUp={() => onReorderMeal(plan.id, i, i - 1)}
                  onMoveDown={() => onReorderMeal(plan.id, i, i + 1)}
                  onRemove={() => onRemoveMeal(plan.id, i)}
                />
              ))
            )}
          </div>
        )}

        {confirmDelete ? (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-xs text-red-600 flex-1">
              Delete <span className="font-semibold">{plan.name}</span>? Can't undo.
            </span>
            <button
              onClick={() => { onDelete(plan.id); setConfirmDelete(false); }}
              className="px-2.5 py-1 text-[11px] font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 text-[11px] font-semibold bg-white text-bark-500 border border-cream-200 rounded-lg hover:bg-cream-50 transition-colors"
            >
              No
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-2 border-t border-cream-100">
            <button
              onClick={onLoad}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors active:scale-95"
            >
              <ArrowRight size={13} /> Load Plan
            </button>
            <button
              onClick={() => onDuplicate(plan.id)}
              className="p-1.5 rounded-lg border border-cream-200 text-bark-400 hover:bg-cream-50 hover:text-sage-600 transition-colors active:scale-95"
              title="Duplicate"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg border border-cream-200 text-bark-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors active:scale-95"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main SavedPlansView ──
export default function SavedPlansView() {
  const savedPlans = usePlanStore((s) => s.savedPlans);
  const favorites = usePlanStore((s) => s.favorites);
  const activePlan = usePlanStore((s) => s.activePlan);
  const planViewMode = usePlanStore((s) => s.planViewMode);
  const loadPlan = usePlanStore((s) => s.loadPlan);
  const deletePlan = usePlanStore((s) => s.deletePlan);
  const duplicatePlan = usePlanStore((s) => s.duplicatePlan);
  const renamePlan = usePlanStore((s) => s.renamePlan);
  const toggleFavorite = usePlanStore((s) => s.toggleFavorite);
  const setActiveView = usePlanStore((s) => s.setActiveView);
  const setActiveModal = usePlanStore((s) => s.setActiveModal);
  const setPreferFavorites = usePlanStore((s) => s.setPreferFavorites);
  const doGenerateDayPlan = usePlanStore((s) => s.doGenerateDayPlan);
  const quickSavePlan = usePlanStore((s) => s.quickSavePlan);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showSort, setShowSort] = useState(false);

  const hasPlanToSave = planViewMode === 'day' ? !!activePlan.daily : !!activePlan.weekly;

  const filtered = useMemo(() => {
    let list = [...savedPlans];
    if (typeFilter !== 'all') list = list.filter((p) => p.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q)));
    }
    switch (sortBy) {
      case 'oldest': list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'protein': list.sort((a, b) => getPlanMacros(b).protein - getPlanMacros(a).protein); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [savedPlans, search, sortBy, typeFilter]);

  const handleLoad = (id) => {
    loadPlan(id);
    setActiveView('plan');
  };

  const handleGenerateFromFavs = () => {
    setPreferFavorites(true);
    doGenerateDayPlan();
    setActiveView('plan');
  };

  const handleReorderMeal = (planId, fromIndex, toIndex, dayIdx) => {
    usePlanStore.setState((s) => {
      const plans = s.savedPlans.map(p => {
        if (p.id !== planId) return p;
        const data = JSON.parse(JSON.stringify(p.planData));
        const mealsArr = p.type === 'weekly' && dayIdx != null
          ? data.days[dayIdx]?.meals
          : (p.type === 'weekly' ? data.days[0]?.meals : data.meals);
        if (!mealsArr || toIndex < 0 || toIndex >= mealsArr.length) return p;
        const [moved] = mealsArr.splice(fromIndex, 1);
        mealsArr.splice(toIndex, 0, moved);
        return { ...p, planData: data };
      });
      return { savedPlans: plans };
    });
  };

  const handleRemoveMeal = (planId, mealIndex, dayIdx) => {
    usePlanStore.setState((s) => {
      const plans = s.savedPlans.map(p => {
        if (p.id !== planId) return p;
        const data = JSON.parse(JSON.stringify(p.planData));
        const mealsArr = p.type === 'weekly' && dayIdx != null
          ? data.days[dayIdx]?.meals
          : (p.type === 'weekly' ? data.days[0]?.meals : data.meals);
        if (!mealsArr || mealsArr.length <= 1) return p;
        mealsArr.splice(mealIndex, 1);
        return { ...p, planData: data };
      });
      return { savedPlans: plans };
    });
  };

  const isEmpty = savedPlans.length === 0 && favorites.length === 0;

  return (
    <div className="space-y-5">
      {/* Save Current Plan button */}
      {hasPlanToSave && (
        <button
          onClick={() => setActiveModal('savePlan')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sage-500 to-sage-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl hover:from-sage-600 hover:to-sage-700 transition-all active:scale-[0.98]"
        >
          <Save size={16} /> Save Current Plan
        </button>
      )}

      {/* Favorite Meals */}
      <FavoriteMeals favorites={favorites} onRemoveFav={toggleFavorite} onGenerateFromFavs={handleGenerateFromFavs} />

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-4">
            <Bookmark size={28} className="text-bark-300" />
          </div>
          <h3 className="text-lg font-bold text-bark-600 mb-2">Nothing saved yet</h3>
          <p className="text-sm text-bark-400 max-w-xs">
            Heart meals you love — they'll appear here. Save full plans to revisit them later.
          </p>
        </div>
      )}

      {/* Saved Plans section */}
      {savedPlans.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <h2 className="text-sm font-bold text-bark-600">Saved Plans</h2>
            <span className="text-[10px] text-bark-400">({savedPlans.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plans…"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-cream-200 rounded-lg outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-300 text-bark-600 placeholder:text-bark-300"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="p-2 border border-cream-200 rounded-lg bg-white hover:bg-cream-50 text-bark-400 hover:text-sage-600 transition-colors"
                title="Sort"
              >
                <SlidersHorizontal size={16} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-cream-200 rounded-xl shadow-lg z-20 p-1.5 w-40">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${sortBy === opt.value ? 'bg-sage-50 text-sage-600 font-semibold' : 'text-bark-500 hover:bg-cream-50'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'daily', 'weekly'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                  typeFilter === t
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-bark-500 border-cream-200 hover:border-sage-200'
                }`}
              >
                {t === 'all' ? 'All' : t === 'daily' ? 'Daily' : 'Weekly'}
              </button>
            ))}
            <span className="text-[10px] text-bark-400 ml-auto">{filtered.length} plan{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-bark-400">
              No plans match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onLoad={() => handleLoad(plan.id)}
                  onDuplicate={duplicatePlan}
                  onDelete={deletePlan}
                  onRename={renamePlan}
                  onReorderMeal={handleReorderMeal}
                  onRemoveMeal={handleRemoveMeal}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
