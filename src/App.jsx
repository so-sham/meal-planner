import React, { useRef, useEffect, lazy, Suspense, useMemo } from 'react';
import { Camera, ShoppingBag, FlaskConical, Zap, CalendarDays, Calendar, ShoppingCart, Download, RefreshCw, Settings, Bookmark, Heart, Save, SlidersHorizontal, User, LogOut } from 'lucide-react';
import { calcDayTotals } from './utils/algorithm';
import usePlanStore, { calcDayTotalsWithBoosters } from './store/usePlanStore';
import { useAuth } from './lib/AuthContext';
import Onboarding from './components/Onboarding';
import FilterPanel from './components/FilterPanel';
import MealCard from './components/MealCard';
import MacroRings from './components/MacroRings';
import ProteinTracker from './components/ProteinTracker';
import BridgeTheGap from './components/BridgeTheGap';
import GeneratingOverlay from './components/GeneratingOverlay';
import DayTotalsBreakdown from './components/DayTotalsBreakdown';

const WeeklyView = lazy(() => import('./components/WeeklyView'));
const GroceryList = lazy(() => import('./components/GroceryList'));
const BlinkitStore = lazy(() => import('./components/BlinkitStore'));
const PhotoScanner = lazy(() => import('./components/PhotoScanner'));
const ShakeBuilder = lazy(() => import('./components/ShakeBuilder'));
const RecipeModal = lazy(() => import('./components/RecipeModal'));
const SavePlanModal = lazy(() => import('./components/SavePlanModal'));
const ExportModal = lazy(() => import('./components/ExportModal'));
const SavedPlansView = lazy(() => import('./components/SavedPlansView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const QuickTargetsSheet = lazy(() => import('./components/QuickTargetsSheet'));

function flattenWithBoosters(m) {
  const bc = (m.boosters || []).reduce((s, b) => s + (b.cal || 0), 0);
  const bp = (m.boosters || []).reduce((s, b) => s + (b.protein || 0), 0);
  return { ...m, cal: (m.cal || 0) + bc, protein: (m.protein || 0) + bp };
}

export default function App() {
  const store = usePlanStore();
  const {
    userPreferences: prefs, setPreferences, completeOnboarding,
    activePlan, planViewMode, setPlanViewMode,
    doGenerateDayPlan, doGenerateWeeklyPlan, doSwapMeal, doSwapWeekMeal,
    favorites, toggleFavorite, customFoods, savedShakes,
    saveShake, editShake, deleteShake,
    addAddon, removeAddon, addBoosterToMeal, removeBoosterFromMeal, addCustomFood,
    addBoosterToWeekMeal, removeBoosterFromWeekMeal, addWeekAddon, removeWeekAddon,
    isGenerating, activeModal, setActiveModal, activeView, setActiveView,
    preferFavorites, setPreferFavorites, quickSavePlan,
  } = store;

  const { user, openAuthModal, requireAuth, signOut } = useAuth();

  const planRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showSaved, setShowSaved] = React.useState(false);
  const wasGenerating = useRef(false);

  // ── Derived data (hooks MUST be above conditional returns) ──
  const daily = activePlan.daily;
  const weekly = activePlan.weekly;
  const hasPlan = planViewMode === 'day' ? !!daily : !!weekly;
  const favSet = new Set(favorites);

  const augmentedPlanForTotals = useMemo(() => daily ? [
    ...daily.meals,
    ...(daily.addons || []).map(a => ({ cal: a.cal, protein: a.protein, carbs: a.carbs, fat: a.fat, boosters: [] })),
  ] : null, [daily]);

  const flatPlan = useMemo(() => augmentedPlanForTotals ? augmentedPlanForTotals.map(flattenWithBoosters) : null, [augmentedPlanForTotals]);

  const weeklyDay0 = weekly?.days?.[0];
  const weeklyFlatPlan = useMemo(() => weeklyDay0 ? [
    ...weeklyDay0.meals,
    ...(weeklyDay0.addons || []).map(a => ({ cal: a.cal, protein: a.protein, carbs: a.carbs, fat: a.fat, boosters: [] })),
  ].map(flattenWithBoosters) : null, [weeklyDay0]);

  const trackerPlan = planViewMode === 'day' ? flatPlan : weeklyFlatPlan;

  const addonTotals = useMemo(() => (daily?.addons || []).reduce(
    (acc, a) => ({ cal: acc.cal + a.cal, protein: acc.protein + a.protein, carbs: acc.carbs + a.carbs, fat: acc.fat + a.fat }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 },
  ), [daily?.addons]);

  useEffect(() => {
    if (wasGenerating.current && !isGenerating && flatPlan && planViewMode === 'day') {
      const t = calcDayTotals(flatPlan);
      const gap = prefs.proteinTarget - t.protein;
      if (gap > Math.max(10, prefs.proteinTarget * 0.08)) {
        setTimeout(() => {
          document.getElementById('bridge-the-gap')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 500);
      }
    }
    wasGenerating.current = isGenerating;
  }, [isGenerating, flatPlan, planViewMode, prefs.proteinTarget]);

  // ── Onboarding gate (after all hooks) ──
  if (!prefs.onboardingComplete) {
    return (
      <Onboarding
        prefs={prefs}
        setPrefs={(updater) => {
          if (typeof updater === 'function') {
            const current = usePlanStore.getState().userPreferences;
            setPreferences(updater(current));
          } else {
            setPreferences(updater);
          }
        }}
        onComplete={completeOnboarding}
      />
    );
  }

  // ── Handlers (same as original v1) ──
  const handleGenerate = () => {
    if (planViewMode === 'day') doGenerateDayPlan();
    else doGenerateWeeklyPlan();
    if (activeView !== 'plan') setActiveView('plan');
    setTimeout(() => planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  };

  const handleAddBooster = (booster) => {
    if (!daily) return;
    const mealIdx = daily.meals.reduce((minI, m, i, arr) =>
      (m.protein < arr[minI].protein) ? i : minI, 0);
    addBoosterToMeal(mealIdx, {
      text: booster.text, cal: booster.extraCal, protein: booster.extraProtein, carbs: 0, fat: 0,
    });
  };

  const handleAddSwap = (swap) => {
    addAddon({ type: 'swap', name: `${swap.from} → ${swap.to}`, cal: 0, protein: swap.extraProtein, carbs: 0, fat: 0, id: `addon_swap_${Date.now()}` });
  };

  const handleAddShake = (shake) => {
    addAddon({ type: 'shake', name: shake.name || 'Protein Shake', cal: Math.round(shake.macros.cal), protein: Math.round(shake.macros.protein), carbs: Math.round(shake.macros.carbs), fat: Math.round(shake.macros.fat), id: `addon_shake_${Date.now()}` });
  };

  const handleAddProduct = (product) => {
    addAddon({ type: 'product', name: `${product.name} (${product.brand})`, cal: product.calories, protein: product.protein, carbs: product.carbs || 0, fat: product.fat || 0, id: `addon_prod_${Date.now()}` });
  };

  const handleAddShakeToPlan = (shake) => {
    handleAddShake(shake);
    setActiveModal(null);
  };

  // ── Render active section ──
  // The plan view is the original v1 layout. Tracker/Saved/Settings are v2 additions.
  const isMainPlanView = activeView === 'plan';

  return (
    <div className="min-h-screen bg-cream-100 font-sans">
      {isGenerating && <GeneratingOverlay />}

      {/* ── Original V1 ProteinTracker sticky bar ── */}
      <ProteinTracker plan={trackerPlan} prefs={prefs} showGapHint />

      {/* ── Original V1 Header ── */}
      <header className="sticky top-[52px] z-30 bg-white/95 backdrop-blur-md border-b border-cream-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0" aria-hidden>💪</span>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-bark-700 tracking-tight leading-tight font-sans">NourishPlan</h1>
              <p className="text-[10px] text-bark-400 -mt-0.5">Protein-first meal planner</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-wrap justify-end" role="toolbar" aria-label="Planning tools">
            <span className="hidden md:inline text-[10px] font-semibold text-bark-400 uppercase tracking-wider mr-0.5">Tools</span>
            <button type="button" onClick={() => setActiveModal('scanner')} title="Scan food with AI"
              className="flex items-center gap-1 min-h-[44px] min-w-[44px] sm:min-w-0 px-2.5 py-2 text-xs font-semibold bg-white text-protein-600 rounded-lg border border-cream-200 hover:border-protein-300 hover:bg-protein-50 transition-colors">
              <Camera size={14} aria-hidden /> <span className="hidden sm:inline">Scan</span>
            </button>
            <button type="button" onClick={() => setActiveModal('shakeBuilder')} title="Protein shake builder"
              className="flex items-center gap-1 min-h-[44px] min-w-[44px] sm:min-w-0 px-2.5 py-2 text-xs font-semibold bg-white text-terra-600 rounded-lg border border-cream-200 hover:border-terra-300 hover:bg-terra-50 transition-colors">
              <FlaskConical size={14} aria-hidden /> <span className="hidden sm:inline">Shake</span>
            </button>
            <button type="button" onClick={() => setActiveModal('blinkitStore')} title="Protein products"
              className="flex items-center gap-1 min-h-[44px] min-w-[44px] sm:min-w-0 px-2.5 py-2 text-xs font-semibold bg-white text-sage-600 rounded-lg border border-cream-200 hover:border-sage-300 hover:bg-sage-50 transition-colors">
              <ShoppingBag size={14} aria-hidden /> <span className="hidden sm:inline">Store</span>
            </button>

            <div className="hidden sm:flex bg-cream-100 rounded-lg p-0.5 border border-cream-200 ml-1">
              {[{ m: 'day', icon: Calendar, l: 'Day' }, { m: 'week', icon: CalendarDays, l: 'Week' }].map(({ m, icon: Icon, l }) => (
                <button key={m} onClick={() => { setPlanViewMode(m); setActiveView('plan'); }}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    planViewMode === m && isMainPlanView ? 'bg-white text-sage-600 shadow-sm' : 'text-bark-400 hover:text-bark-600'
                  }`}>
                  <Icon size={13} /> {l}
                </button>
              ))}
            </div>

            {/* Auth button — login or user avatar */}
            {user ? (
              <button
                onClick={signOut}
                title={`Signed in as ${user.email} — click to sign out`}
                className="flex items-center gap-1 min-h-[44px] min-w-[44px] sm:min-w-0 px-2.5 py-2 text-xs font-semibold bg-sage-50 text-sage-700 rounded-lg border border-sage-200 hover:bg-sage-100 transition-colors ml-1"
              >
                <div className="w-5 h-5 rounded-full bg-sage-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline truncate max-w-[80px]">{user.email?.split('@')[0]}</span>
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                title="Sign in"
                className="flex items-center gap-1 min-h-[44px] min-w-[44px] sm:min-w-0 px-2.5 py-2 text-xs font-semibold bg-white text-bark-600 rounded-lg border border-cream-200 hover:border-sage-300 hover:bg-sage-50 transition-colors ml-1"
              >
                <User size={14} aria-hidden />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}

            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-cream-100 text-bark-600 rounded-lg border border-cream-200">
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* V2 section tabs + mobile day/week toggle */}
        <div className="max-w-6xl mx-auto px-4 pb-2 flex items-center justify-between gap-2">
          <nav className="flex gap-1 flex-wrap items-center" aria-label="Main sections">
            <span className="hidden md:inline text-[10px] font-semibold text-bark-400 uppercase tracking-wider mr-1">App</span>
            {[
              { key: 'plan', label: 'Plan', icon: CalendarDays },
              { key: 'saved', label: 'Saved', icon: Bookmark },
              { key: 'settings', label: 'Settings', icon: Settings },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" onClick={() => setActiveView(key)}
                className={`flex items-center gap-1 px-3 py-1.5 min-h-[40px] text-xs font-semibold rounded-full transition-all ${
                  activeView === key ? 'bg-sage-500 text-white' : 'bg-cream-100 text-bark-400 hover:text-bark-600'
                }`}>
                <Icon size={12} aria-hidden /> {label}
              </button>
            ))}
          </nav>
          <div className="sm:hidden flex gap-1">
            {[{ m: 'day', l: '📅 Day' }, { m: 'week', l: '📆 Week' }].map(({ m, l }) => (
              <button key={m} onClick={() => { setPlanViewMode(m); setActiveView('plan'); }}
                className={`px-4 py-1 text-xs font-semibold rounded-full transition-all ${
                  planViewMode === m && isMainPlanView ? 'bg-sage-500 text-white' : 'bg-cream-100 text-bark-400'
                }`}>{l}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {isMainPlanView ? (
          /* ── ORIGINAL V1 PLAN VIEW with sidebar ── */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar with FilterPanel */}
            <aside className={`lg:w-80 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-[160px] bg-white rounded-2xl border border-cream-200 shadow-sm p-5 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
                <h2 className="text-sm font-bold text-bark-600 mb-4 flex items-center gap-2">
                  <Settings size={14} /> Preferences
                </h2>
                <FilterPanel
                  prefs={prefs}
                  setPrefs={(updater) => {
                    if (typeof updater === 'function') {
                      const current = usePlanStore.getState().userPreferences;
                      setPreferences(updater(current));
                    } else {
                      setPreferences(updater);
                    }
                  }}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />
              </div>
            </aside>

            {/* Main plan content */}
            <div className="flex-1 min-w-0">
              {/* Quick action cards — unified flat cards (single visual system) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                <button type="button" onClick={() => setActiveModal('scanner')}
                  className="bg-white border border-cream-200 rounded-xl p-3.5 text-left hover:border-protein-300 hover:bg-protein-50/40 transition-all active:scale-[0.98] shadow-sm">
                  <Camera size={20} className="text-protein-500 mb-1" aria-hidden />
                  <h3 className="text-xs font-bold text-bark-800">Scan & Add</h3>
                  <p className="text-[9px] text-bark-400 mt-0.5">AI food analysis</p>
                </button>
                <button type="button" onClick={() => setActiveModal('shakeBuilder')}
                  className="bg-white border border-cream-200 rounded-xl p-3.5 text-left hover:border-terra-300 hover:bg-terra-50/40 transition-all active:scale-[0.98] shadow-sm">
                  <FlaskConical size={20} className="text-terra-500 mb-1" aria-hidden />
                  <h3 className="text-xs font-bold text-bark-800">Shake Builder</h3>
                  <p className="text-[9px] text-bark-400 mt-0.5">Custom protein shakes</p>
                </button>
                <button type="button" onClick={() => setActiveModal('blinkitStore')}
                  className="bg-white border border-cream-200 rounded-xl p-3.5 text-left hover:border-sage-300 hover:bg-sage-50/40 transition-all active:scale-[0.98] shadow-sm">
                  <ShoppingBag size={20} className="text-sage-500 mb-1" aria-hidden />
                  <h3 className="text-xs font-bold text-bark-800">Protein Store</h3>
                  <p className="text-[9px] text-bark-400 mt-0.5">85+ Blinkit products</p>
                </button>
                <button type="button" onClick={handleGenerate}
                  className="bg-white border-2 border-sage-300 rounded-xl p-3.5 text-left hover:bg-sage-50 transition-all active:scale-[0.98] shadow-sm">
                  <Zap size={20} className="text-sage-600 mb-1" aria-hidden />
                  <h3 className="text-xs font-bold text-bark-800">Quick Generate</h3>
                  <p className="text-[9px] text-bark-400 mt-0.5">One-click meal plan</p>
                </button>
              </div>

              {/* Use my favorites toggle */}
              {favorites.length > 0 && (
                <div className="flex items-center justify-between bg-white rounded-xl p-3 mb-5 border border-cream-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className={`${preferFavorites ? 'fill-red-400 text-red-400' : 'text-bark-400'} transition-colors`} />
                    <div>
                      <span className="text-xs font-bold text-bark-700">Use my favorites</span>
                      <p className="text-[10px] text-bark-400">Generate plans using your {favorites.length} saved meal{favorites.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreferFavorites(!preferFavorites)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                      preferFavorites ? 'bg-red-400' : 'bg-cream-300'
                    }`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      preferFavorites ? 'left-[22px]' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              )}

              {/* Plan content or empty state */}
              {!hasPlan ? (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                  <div className="text-6xl mb-4">💪</div>
                  <h2 className="text-xl font-bold text-bark-700 mb-2">Ready to plan your meals?</h2>
                  <p className="text-sm text-bark-400 max-w-sm mb-6">
                    Set your targets and hit Generate for a protein-optimized plan using 200+ real meals.
                  </p>
                  <button onClick={handleGenerate}
                    className="px-8 py-3 bg-gradient-to-r from-sage-500 to-sage-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-sage-600 hover:to-sage-700 transition-all active:scale-[0.98] flex items-center gap-2">
                    <Zap size={18} /> Generate Meal Plan
                  </button>
                </div>
              ) : (
                <div ref={planRef} data-plan-ref className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-lg font-bold text-bark-800 font-sans tracking-tight">
                      {planViewMode === 'day' ? '📅 Your day plan' : '📆 Weekly plan'}
                    </h2>
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => {
                        const doSave = () => { quickSavePlan(); setShowSaved(true); setTimeout(() => setShowSaved(false), 2000); };
                        if (requireAuth(doSave)) doSave();
                      }}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          showSaved ? 'bg-sage-500 text-white border-sage-500' : 'bg-sage-50 text-sage-600 border-sage-200 hover:bg-sage-100'
                        }`}>
                        <Save size={12} /> {showSaved ? 'Saved!' : 'Save Plan'}
                      </button>
                      <button onClick={handleGenerate}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-terra-50 text-terra-600 rounded-lg hover:bg-terra-100 border border-terra-200 transition-colors">
                        <RefreshCw size={12} /> Regenerate
                      </button>
                      {planViewMode === 'week' && weekly && (
                        <button onClick={() => setActiveModal('grocery')}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-sage-50 text-sage-600 rounded-lg hover:bg-sage-100 border border-sage-200 transition-colors">
                          <ShoppingCart size={12} /> Grocery
                        </button>
                      )}
                      <button onClick={() => setActiveModal('export')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-bark-50 text-bark-600 rounded-lg hover:bg-bark-100 border border-bark-200 transition-colors">
                        <Download size={12} /> Export
                      </button>
                    </div>
                  </div>

                  {planViewMode === 'day' && daily && (
                    <>
                      <MacroRings plan={flatPlan} prefs={prefs} />
                      <DayTotalsBreakdown meals={daily.meals} addons={daily.addons || []} />
                      <BridgeTheGap plan={flatPlan} prefs={prefs}
                        onAddBooster={handleAddBooster} onAddSwap={handleAddSwap}
                        onAddShake={handleAddShake} onAddProduct={handleAddProduct} />

                      {(daily.addons || []).length > 0 && (
                        <div className="bg-white rounded-xl border-2 border-sage-200 p-4 shadow-sm">
                          <h3 className="text-xs font-bold text-sage-700 uppercase tracking-wider mb-2">Added to Your Plan</h3>
                          <div className="space-y-1.5">
                            {daily.addons.map(a => (
                              <div key={a.id} className="flex items-center gap-2 bg-sage-50 rounded-lg px-3 py-2">
                                <span className="text-[10px] font-bold text-white bg-sage-500 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                  {a.type === 'shake' ? '🥤' : a.type === 'product' ? '🛒' : a.type === 'swap' ? '🔄' : '💪'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-bark-700 truncate">{a.name}</p>
                                  <p className="text-[10px] text-bark-400">+{a.protein}g protein · +{a.cal} cal</p>
                                </div>
                                <button onClick={() => removeAddon(a.id)}
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

                      <div className="grid gap-3 lg:grid-cols-2">
                        {daily.meals.map((meal, i) => (
                          <MealCard
                            key={`${meal.id}-${i}`}
                            meal={meal}
                            index={i}
                            onSwap={() => doSwapMeal(i)}
                            onToggleFav={() => toggleFavorite(meal.id)}
                            isFav={favSet.has(meal.id)}
                            onViewRecipe={() => setActiveModal({ type: 'recipe', meal })}
                            onRemoveBooster={(boosterId) => removeBoosterFromMeal(i, boosterId)}
                            isPinned={meal.isPinned}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {planViewMode === 'week' && weekly && (
                    <Suspense fallback={<div className="py-12 text-center text-bark-400">Loading weekly plan...</div>}>
                      <WeeklyView
                        weekPlan={weekly.days.map(d => d.meals)}
                        weekDays={weekly.days}
                        prefs={prefs}
                        onSwapMeal={doSwapWeekMeal}
                        favorites={favSet}
                        onToggleFav={toggleFavorite}
                        onViewRecipe={(meal) => setActiveModal({ type: 'recipe', meal })}
                        onAddBooster={(dayIdx, booster) => {
                          const dayMeals = weekly.days[dayIdx].meals;
                          const mealIdx = dayMeals.reduce((minI, m, i, arr) =>
                            (m.protein < arr[minI].protein) ? i : minI, 0);
                          addBoosterToWeekMeal(dayIdx, mealIdx, {
                            text: booster.text, cal: booster.extraCal, protein: booster.extraProtein, carbs: 0, fat: 0,
                          });
                        }}
                        onAddSwap={(dayIdx, swap) => {
                          addWeekAddon(dayIdx, { type: 'swap', name: `${swap.from} → ${swap.to}`, cal: 0, protein: swap.extraProtein, carbs: 0, fat: 0, id: `addon_swap_${Date.now()}` });
                        }}
                        onAddShake={(dayIdx, shake) => {
                          addWeekAddon(dayIdx, { type: 'shake', name: shake.name || 'Protein Shake', cal: Math.round(shake.macros.cal), protein: Math.round(shake.macros.protein), carbs: Math.round(shake.macros.carbs), fat: Math.round(shake.macros.fat), id: `addon_shake_${Date.now()}` });
                        }}
                        onAddProduct={(dayIdx, product) => {
                          addWeekAddon(dayIdx, { type: 'product', name: `${product.name} (${product.brand})`, cal: product.calories, protein: product.protein, carbs: product.carbs || 0, fat: product.fat || 0, id: `addon_prod_${Date.now()}` });
                        }}
                        onRemoveBooster={(dayIdx, mealIdx, boosterId) => removeBoosterFromWeekMeal(dayIdx, mealIdx, boosterId)}
                        onRemoveAddon={(dayIdx, addonId) => removeWeekAddon(dayIdx, addonId)}
                      />
                    </Suspense>
                  )}
                </div>
              )}

              {/* Custom foods section */}
              {customFoods.length > 0 && (
                <div className="mt-6 bg-white rounded-xl border border-cream-200 p-4">
                  <h3 className="text-xs font-bold text-bark-500 uppercase tracking-wider mb-2">📋 Your Custom Foods ({customFoods.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {customFoods.slice(-6).map(f => (
                      <span key={f.id} className="px-2 py-1 text-[10px] font-medium bg-cream-100 text-bark-600 rounded-lg border border-cream-200">
                        {f.name} · {f.protein}g P
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved shakes section */}
              {savedShakes.length > 0 && (
                <div className="mt-3 bg-white rounded-xl border border-cream-200 p-4">
                  <h3 className="text-xs font-bold text-bark-500 uppercase tracking-wider mb-2">🥤 Saved Shakes ({savedShakes.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {savedShakes.map(s => (
                      <div key={s.id} className="flex items-center gap-1.5 px-2 py-1 bg-terra-50 text-terra-600 rounded-lg border border-terra-200">
                        <span className="text-[10px] font-medium">{s.name} · {s.macros?.protein || 0}g P</span>
                        <button onClick={() => setActiveModal('shakeBuilder')}
                          className="text-bark-400 hover:text-protein-600 transition-colors" title="Edit">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button onClick={() => deleteShake(s.id)}
                          className="text-bark-400 hover:text-red-500 transition-colors" title="Delete">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeView === 'saved' ? (
          <Suspense fallback={<div className="p-8 text-center text-bark-400">Loading saved plans...</div>}>
            <SavedPlansView />
          </Suspense>
        ) : activeView === 'settings' ? (
          <Suspense fallback={<div className="p-8 text-center text-bark-400">Loading settings...</div>}>
            <SettingsView />
          </Suspense>
        ) : null}
      </main>

      {/* ── All modals ── */}
      <Suspense fallback={null}>
        {activeModal === 'grocery' && weekly && <GroceryList weekPlan={weekly.days.map(d => d.meals)} onClose={() => setActiveModal(null)} />}
        {activeModal === 'blinkitStore' && <BlinkitStore prefs={prefs} onClose={() => setActiveModal(null)} onAddProduct={handleAddProduct} hasPlan={hasPlan} />}
        {activeModal === 'scanner' && <PhotoScanner onClose={() => setActiveModal(null)} onSaveFood={(food) => addCustomFood(food)} />}
        {activeModal === 'shakeBuilder' && <ShakeBuilder onClose={() => setActiveModal(null)} onSave={(shake) => saveShake(shake)} onEditShake={(shake) => editShake(shake.id, shake)} onDeleteShake={(id) => deleteShake(id)} onAddToPlan={handleAddShakeToPlan} hasPlan={hasPlan} savedShakes={savedShakes} />}
        {activeModal?.type === 'recipe' && <RecipeModal meal={activeModal.meal} onClose={() => setActiveModal(null)} />}
        {activeModal === 'savePlan' && <SavePlanModal onClose={() => setActiveModal(null)} />}
        {activeModal === 'export' && <ExportModal onClose={() => setActiveModal(null)} />}
        {activeModal === 'quickTargets' && (
          <QuickTargetsSheet
            prefs={prefs}
            setPrefs={(updater) => {
              if (typeof updater === 'function') {
                const current = usePlanStore.getState().userPreferences;
                setPreferences(updater(current));
              } else {
                setPreferences(updater);
              }
            }}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            onClose={() => setActiveModal(null)}
          />
        )}
      </Suspense>

      {isMainPlanView && (
        <button
          type="button"
          onClick={() => setActiveModal('quickTargets')}
          className="lg:hidden fixed bottom-5 right-4 z-40 flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full bg-sage-600 text-white text-sm font-bold shadow-lg hover:bg-sage-700 active:scale-95 border border-sage-700"
          aria-label="Edit calorie and protein targets"
        >
          <SlidersHorizontal size={18} aria-hidden />
          Targets
        </button>
      )}

      <footer className="text-center py-6 text-xs text-bark-400 border-t border-cream-200 mt-8 pb-24 lg:pb-6">
        NourishPlan V2 — Protein-first meal planning with AI food scanning, shake builder & 200+ meals. All data stored locally.
      </footer>
    </div>
  );
}
