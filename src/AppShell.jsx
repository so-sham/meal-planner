import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './lib/AuthContext';
import { supabase } from './lib/supabase';
import { pullAllUserData, pushAllUserData } from './lib/supabaseSync';
import usePlanStore from './store/usePlanStore';
import App from './App';

const AuthScreen = React.lazy(() => import('./components/AuthScreen'));

/**
 * AppShell handles:
 *  1. Auth gate — if Supabase is configured, require login; else run offline.
 *  2. On login, pull cloud data → merge into Zustand store.
 *  3. Debounced push of store changes back to Supabase.
 */
export default function AppShell() {
  const { user, loading } = useAuth();
  const hasSynced = useRef(false);
  const pushTimer = useRef(null);

  // Pull cloud data on first login
  useEffect(() => {
    if (!user || hasSynced.current) return;
    hasSynced.current = true;

    pullAllUserData(user.id).then((cloud) => {
      if (!cloud.profile) {
        // First login — push current local state to cloud
        pushAllUserData(user.id, usePlanStore.getState());
        return;
      }

      // Merge cloud → store
      const state = usePlanStore.getState();
      usePlanStore.setState({
        userPreferences: cloud.profile.user_preferences ?? state.userPreferences,
        activePlan: cloud.profile.active_plan ?? state.activePlan,
        planViewMode: cloud.profile.plan_view_mode ?? state.planViewMode,
        preferFavorites: cloud.profile.prefer_favorites ?? state.preferFavorites,
        savedPlans: cloud.plans.length ? cloud.plans : state.savedPlans,
        favorites: cloud.favorites.length ? cloud.favorites : state.favorites,
        customFoods: cloud.customFoods.length ? cloud.customFoods : state.customFoods,
        savedShakes: cloud.shakes.length ? cloud.shakes : state.savedShakes,
      });
    }).catch((err) => {
      console.error('NourishPlan: cloud sync failed, using local data.', err);
    });
  }, [user]);

  // Reset sync flag on logout
  useEffect(() => {
    if (!user) hasSynced.current = false;
  }, [user]);

  // Debounced push on store changes
  const schedulePush = useCallback(() => {
    if (!user) return;
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      pushAllUserData(user.id, usePlanStore.getState()).catch((err) =>
        console.error('NourishPlan: push failed', err)
      );
    }, 2000);
  }, [user]);

  useEffect(() => {
    if (!user || !supabase) return;
    const unsub = usePlanStore.subscribe(schedulePush);
    return () => {
      unsub();
      clearTimeout(pushTimer.current);
    };
  }, [user, schedulePush]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-bark-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If Supabase is configured but user not logged in → auth screen
  if (supabase && !user) {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-cream-100 flex items-center justify-center">
          <div className="w-10 h-10 border-[3px] border-sage-200 border-t-sage-600 rounded-full animate-spin" />
        </div>
      }>
        <AuthScreen />
      </React.Suspense>
    );
  }

  // Authenticated (or Supabase not configured → offline mode)
  return <App />;
}
