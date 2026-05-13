import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './lib/AuthContext';
import { supabase } from './lib/supabase';
import { pullAllUserData, pushAllUserData } from './lib/supabaseSync';
import usePlanStore from './store/usePlanStore';
import App from './App';

const AuthModal = React.lazy(() => import('./components/AuthModal'));

/**
 * AppShell handles:
 *  1. Cloud sync when user is logged in.
 *  2. Auth modal (shown on demand, not as a gate).
 *  App always renders — onboarding and planning work without login.
 */
export default function AppShell() {
  const { user, showAuthModal } = useAuth();
  const hasSynced = useRef(false);
  const pushTimer = useRef(null);

  // Pull cloud data on first login
  useEffect(() => {
    if (!user || hasSynced.current) return;
    hasSynced.current = true;

    pullAllUserData(user.id).then((cloud) => {
      if (!cloud.profile) {
        pushAllUserData(user.id, usePlanStore.getState());
        return;
      }

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

  return (
    <>
      <App />
      {showAuthModal && (
        <React.Suspense fallback={null}>
          <AuthModal />
        </React.Suspense>
      )}
    </>
  );
}
