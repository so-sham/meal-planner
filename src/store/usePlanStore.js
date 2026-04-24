import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  generateDayPlan,
  generateWeeklyPlan,
  swapMeal,
  calcDayTotals,
} from '../utils/algorithm';

const DEFAULT_PREFS = {
  calorieTarget: 1800,
  proteinTarget: 120,
  carbPref: 'none',
  fatPref: 'none',
  dietType: 'non-vegetarian',
  eggPref: 'egg',
  dairyOk: true,
  soyOk: true,
  cuisines: ['mixed'],
  numMeals: 4,
  proteinGapMode: true,
  mealLabels: null,
  onboardingComplete: false,
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function calcDayTotalsWithBoosters(meals) {
  if (!meals) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
  return meals.reduce((a, m) => {
    let bc = 0, bp = 0, bcarbs = 0, bf = 0;
    if (m.boosters?.length) {
      for (const b of m.boosters) {
        bc += b.cal || 0;
        bp += b.protein || 0;
        bcarbs += b.carbs || 0;
        bf += b.fat || 0;
      }
    }
    return {
      cal: a.cal + (m.cal || 0) + bc,
      protein: a.protein + (m.protein || 0) + bp,
      carbs: a.carbs + (m.carbs || 0) + bcarbs,
      fat: a.fat + (m.fat || 0) + bf,
    };
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });
}

function migrateFromOldStorage() {
  const result = {};
  try {
    const oldPrefs = localStorage.getItem('np2_prefs');
    if (oldPrefs) result.userPreferences = { ...DEFAULT_PREFS, ...JSON.parse(oldPrefs) };

    const oldFavs = localStorage.getItem('np2_favs');
    if (oldFavs) result.favorites = JSON.parse(oldFavs);

    const oldCustom = localStorage.getItem('np2_custom_foods');
    if (oldCustom) result.customFoods = JSON.parse(oldCustom);

    const oldShakes = localStorage.getItem('np2_saved_shakes');
    if (oldShakes) result.savedShakes = JSON.parse(oldShakes);
  } catch { /* ignore parse errors */ }
  return result;
}

const usePlanStore = create(
  persist(
    (set, get) => ({
      // ── User Preferences ──
      userPreferences: DEFAULT_PREFS,

      setPreferences: (partial) =>
        set((s) => ({ userPreferences: { ...s.userPreferences, ...partial } })),

      completeOnboarding: () => {
        set((s) => ({
          userPreferences: { ...s.userPreferences, onboardingComplete: true },
        }));
        const state = get();
        const plan = generateDayPlan(
          state.userPreferences,
          new Set(state.favorites),
          new Set(),
          state.customFoods,
        );
        const meals = plan.map((m) => ({ ...m, boosters: [], isSwapped: false, isPinned: false }));
        set({
          activePlan: {
            ...state.activePlan,
            daily: { date: todayKey(), meals, addons: [] },
          },
          planViewMode: 'day',
        });
      },

      // ── Active Plan ──
      activePlan: {
        daily: null,
        weekly: null,
      },
      planViewMode: 'day',

      preferFavorites: false,
      setPreferFavorites: (val) => set({ preferFavorites: val }),
      setPlanViewMode: (mode) => set({ planViewMode: mode }),

      doGenerateDayPlan: () => {
        set({ isGenerating: true });
        setTimeout(() => {
          const s = get();
          const favSet = new Set(s.favorites);
          const plan = generateDayPlan(s.userPreferences, favSet, new Set(), s.customFoods, s.preferFavorites);
          const meals = plan.map((m) => ({
            ...m,
            boosters: [],
            isSwapped: false,
            isPinned: false,
          }));
          set({
            activePlan: {
              ...get().activePlan,
              daily: { date: todayKey(), meals, addons: [] },
            },
            isGenerating: false,
          });
        }, 150);
      },

      doGenerateWeeklyPlan: () => {
        set({ isGenerating: true });
        setTimeout(() => {
          const s = get();
          const favSet = new Set(s.favorites);
          const week = generateWeeklyPlan(s.userPreferences, favSet, s.customFoods, s.preferFavorites);
          const days = week.map((dayMeals) => ({
            date: todayKey(),
            meals: dayMeals.map((m) => ({ ...m, boosters: [], isSwapped: false, isPinned: false })),
            addons: [],
          }));
          set({
            activePlan: {
              ...get().activePlan,
              weekly: { days, generatedAt: Date.now() },
            },
            isGenerating: false,
          });
        }, 150);
      },

      doSwapMeal: (slotIndex) => {
        const s = get();
        const daily = s.activePlan.daily;
        if (!daily) return;
        const rawPlan = daily.meals.map((m) => ({
          ...m,
          cal: m.cal,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
        }));
        const newPlan = swapMeal(rawPlan, slotIndex, s.userPreferences, new Set(s.favorites), s.customFoods);
        const updatedMeals = daily.meals.map((m, i) =>
          i === slotIndex
            ? { ...newPlan[i], boosters: [], isSwapped: true, isPinned: false }
            : m,
        );
        set({
          activePlan: {
            ...s.activePlan,
            daily: { ...daily, meals: updatedMeals },
          },
        });
      },

      doSwapWeekMeal: (dayIdx, slotIdx) => {
        const s = get();
        const weekly = s.activePlan.weekly;
        if (!weekly) return;
        const day = weekly.days[dayIdx];
        const rawPlan = day.meals;
        const newPlan = swapMeal(rawPlan, slotIdx, s.userPreferences, new Set(s.favorites), s.customFoods);
        const updatedDays = weekly.days.map((d, di) =>
          di === dayIdx
            ? { ...d, meals: d.meals.map((m, mi) => (mi === slotIdx ? { ...newPlan[mi], boosters: [], isSwapped: true, isPinned: false } : m)) }
            : d,
        );
        set({
          activePlan: {
            ...s.activePlan,
            weekly: { ...weekly, days: updatedDays },
          },
        });
      },

      // ── Boosters (per-meal, daily) ──
      addBoosterToMeal: (mealIdx, booster) => {
        const s = get();
        const daily = s.activePlan.daily;
        if (!daily) return;
        const meals = daily.meals.map((m, i) =>
          i === mealIdx ? { ...m, boosters: [...(m.boosters || []), { ...booster, id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }] } : m,
        );
        set({ activePlan: { ...s.activePlan, daily: { ...daily, meals } } });
      },

      removeBoosterFromMeal: (mealIdx, boosterId) => {
        const s = get();
        const daily = s.activePlan.daily;
        if (!daily) return;
        const meals = daily.meals.map((m, i) =>
          i === mealIdx ? { ...m, boosters: (m.boosters || []).filter((b) => b.id !== boosterId) } : m,
        );
        set({ activePlan: { ...s.activePlan, daily: { ...daily, meals } } });
      },

      // ── Boosters (per-meal, weekly) ──
      addBoosterToWeekMeal: (dayIdx, mealIdx, booster) => {
        const s = get();
        const weekly = s.activePlan.weekly;
        if (!weekly) return;
        const days = weekly.days.map((d, di) =>
          di !== dayIdx ? d : {
            ...d,
            meals: d.meals.map((m, mi) =>
              mi !== mealIdx ? m : { ...m, boosters: [...(m.boosters || []), { ...booster, id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }] }
            ),
          },
        );
        set({ activePlan: { ...s.activePlan, weekly: { ...weekly, days } } });
      },

      removeBoosterFromWeekMeal: (dayIdx, mealIdx, boosterId) => {
        const s = get();
        const weekly = s.activePlan.weekly;
        if (!weekly) return;
        const days = weekly.days.map((d, di) =>
          di !== dayIdx ? d : {
            ...d,
            meals: d.meals.map((m, mi) =>
              mi !== mealIdx ? m : { ...m, boosters: (m.boosters || []).filter((b) => b.id !== boosterId) }
            ),
          },
        );
        set({ activePlan: { ...s.activePlan, weekly: { ...weekly, days } } });
      },

      // ── Standalone Addons (daily) ──
      addAddon: (addon) => {
        const s = get();
        const daily = s.activePlan.daily;
        if (!daily) return;
        set({
          activePlan: {
            ...s.activePlan,
            daily: {
              ...daily,
              addons: [...(daily.addons || []), { ...addon, id: addon.id || `addon_${Date.now()}` }],
            },
          },
        });
      },

      removeAddon: (addonId) => {
        const s = get();
        const daily = s.activePlan.daily;
        if (!daily) return;
        set({
          activePlan: {
            ...s.activePlan,
            daily: { ...daily, addons: (daily.addons || []).filter((a) => a.id !== addonId) },
          },
        });
      },

      // ── Standalone Addons (weekly, per day) ──
      addWeekAddon: (dayIdx, addon) => {
        const s = get();
        const weekly = s.activePlan.weekly;
        if (!weekly) return;
        const days = weekly.days.map((d, di) =>
          di !== dayIdx ? d : {
            ...d,
            addons: [...(d.addons || []), { ...addon, id: addon.id || `addon_${Date.now()}` }],
          },
        );
        set({ activePlan: { ...s.activePlan, weekly: { ...weekly, days } } });
      },

      removeWeekAddon: (dayIdx, addonId) => {
        const s = get();
        const weekly = s.activePlan.weekly;
        if (!weekly) return;
        const days = weekly.days.map((d, di) =>
          di !== dayIdx ? d : {
            ...d,
            addons: (d.addons || []).filter((a) => a.id !== addonId),
          },
        );
        set({ activePlan: { ...s.activePlan, weekly: { ...weekly, days } } });
      },

      // ── Favorites ──
      favorites: [],
      toggleFavorite: (mealId) =>
        set((s) => {
          const favs = new Set(s.favorites);
          favs.has(mealId) ? favs.delete(mealId) : favs.add(mealId);
          return { favorites: [...favs] };
        }),

      // ── Custom Foods ──
      customFoods: [],
      addCustomFood: (food) => {
        const entry = {
          id: `custom_${Date.now()}`,
          ...food,
          cuisine: food.cuisine || 'mixed',
          types: food.types || ['snack'],
          proteinDensity: food.cal > 0 ? Math.round((food.protein / food.cal) * 100 * 10) / 10 : 0,
          ingredients: [],
          proteinBoosters: [],
          blinkitPairings: [],
          tags: ['custom'],
          prepTime: 0,
          isVeg: food.isVeg ?? true,
          hasEgg: food.hasEgg ?? false,
          dairy: false,
          soy: false,
        };
        set((s) => ({ customFoods: [...s.customFoods, entry] }));
      },

      // ── Saved Shakes ──
      savedShakes: [],
      saveShake: (shake) =>
        set((s) => ({ savedShakes: [...s.savedShakes, { ...shake, id: `shake_${Date.now()}` }] })),
      editShake: (id, data) =>
        set((s) => ({ savedShakes: s.savedShakes.map((sh) => (sh.id === id ? { ...sh, ...data } : sh)) })),
      deleteShake: (id) =>
        set((s) => ({ savedShakes: s.savedShakes.filter((sh) => sh.id !== id) })),

      // ── Saved Plans ──
      savedPlans: [],

      savePlan: (name, tags, notes) => {
        const s = get();
        const isWeekly = s.planViewMode === 'week';
        const planData = isWeekly ? s.activePlan.weekly : s.activePlan.daily;
        if (!planData) return;
        const entry = {
          id: uuidv4(),
          name,
          tags: tags || [],
          notes: notes || '',
          type: isWeekly ? 'weekly' : 'daily',
          createdAt: new Date().toISOString(),
          planData: JSON.parse(JSON.stringify(planData)),
          prefs: { ...s.userPreferences },
        };
        set((s2) => ({ savedPlans: [entry, ...s2.savedPlans] }));
      },

      quickSavePlan: () => {
        const s = get();
        const isWeekly = s.planViewMode === 'week';
        const planData = isWeekly ? s.activePlan.weekly : s.activePlan.daily;
        if (!planData) return;
        const now = new Date();
        const name = `${isWeekly ? 'Weekly' : 'Day'} Plan — ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        const entry = {
          id: uuidv4(),
          name,
          tags: [],
          notes: '',
          type: isWeekly ? 'weekly' : 'daily',
          createdAt: now.toISOString(),
          planData: JSON.parse(JSON.stringify(planData)),
          prefs: { ...s.userPreferences },
        };
        set((s2) => ({ savedPlans: [entry, ...s2.savedPlans] }));
      },

      loadPlan: (id) => {
        const s = get();
        const plan = s.savedPlans.find((p) => p.id === id);
        if (!plan) return;
        if (plan.type === 'weekly') {
          set({
            activePlan: { ...s.activePlan, weekly: plan.planData },
            planViewMode: 'week',
          });
        } else {
          set({
            activePlan: { ...s.activePlan, daily: plan.planData },
            planViewMode: 'day',
          });
        }
      },

      deletePlan: (id) =>
        set((s) => ({ savedPlans: s.savedPlans.filter((p) => p.id !== id) })),

      duplicatePlan: (id) => {
        const s = get();
        const plan = s.savedPlans.find((p) => p.id === id);
        if (!plan) return;
        const copy = {
          ...JSON.parse(JSON.stringify(plan)),
          id: uuidv4(),
          name: `${plan.name} (Copy)`,
          createdAt: new Date().toISOString(),
        };
        set((s2) => ({ savedPlans: [copy, ...s2.savedPlans] }));
      },

      renamePlan: (id, name) =>
        set((s) => ({ savedPlans: s.savedPlans.map((p) => (p.id === id ? { ...p, name } : p)) })),

      // ── Navigation ──
      activeView: 'plan',
      setActiveView: (view) => set({ activeView: view }),

      // ── UI Transients ──
      isGenerating: false,
      activeModal: null,
      setActiveModal: (modal) => set({ activeModal: modal }),
    }),
    {
      name: 'nourishplan-v2-store',
      version: 1,
      partialize: (state) => {
        const { isGenerating, activeModal, ...rest } = state;
        return rest;
      },
      migrate: (persistedState, version) => {
        if (version === 0) {
          return { ...persistedState };
        }
        return persistedState;
      },
      storage: {
        getItem: (name) => {
          try { const v = localStorage.getItem(name); return v ? JSON.parse(v) : null; }
          catch { return null; }
        },
        setItem: (name, value) => {
          try { localStorage.setItem(name, JSON.stringify(value)); }
          catch (e) {
            if (e?.name === 'QuotaExceededError' || e?.code === 22) {
              console.warn('NourishPlan: localStorage quota exceeded — some data may not be saved.');
            }
          }
        },
        removeItem: (name) => { try { localStorage.removeItem(name); } catch {} },
      },
      onRehydrateStorage: () => {
        return (state) => {
          if (state && !state.userPreferences?.onboardingComplete) {
            const migrated = migrateFromOldStorage();
            if (migrated.userPreferences) {
              state.userPreferences = { ...DEFAULT_PREFS, ...migrated.userPreferences };
              if (migrated.favorites) state.favorites = migrated.favorites;
              if (migrated.customFoods) state.customFoods = migrated.customFoods;
              if (migrated.savedShakes) state.savedShakes = migrated.savedShakes;
            }
          }
        };
      },
    },
  ),
);

export { calcDayTotalsWithBoosters };
export default usePlanStore;
