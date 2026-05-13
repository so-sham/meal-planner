import { supabase } from './supabase';

/**
 * Sync layer between Zustand store and Supabase Postgres.
 *
 * Tables expected (see supabase-schema.sql):
 *   - profiles          (user_preferences, active_plan, plan_view_mode, prefer_favorites)
 *   - saved_plans       (id, user_id, name, tags, notes, type, plan_data, prefs, created_at)
 *   - favorites         (user_id, meal_id)
 *   - custom_foods      (user_id, food jsonb)
 *   - saved_shakes      (user_id, shake jsonb)
 */

// ─── Profile (preferences + active plan) ────────────────────────────

export async function fetchProfile(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') console.error('fetchProfile:', error);
  return data;
}

export async function upsertProfile(userId, state) {
  if (!supabase) return;
  const { error } = await supabase.from('profiles').upsert({
    user_id: userId,
    user_preferences: state.userPreferences,
    active_plan: state.activePlan,
    plan_view_mode: state.planViewMode,
    prefer_favorites: state.preferFavorites,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) console.error('upsertProfile:', error);
}

// ─── Saved Plans ────────────────────────────────────────────────────

export async function fetchSavedPlans(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('saved_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchSavedPlans:', error); return []; }
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    tags: row.tags || [],
    notes: row.notes || '',
    type: row.type,
    createdAt: row.created_at,
    planData: row.plan_data,
    prefs: row.prefs,
  }));
}

export async function upsertSavedPlans(userId, plans) {
  if (!supabase || !plans.length) return;
  const rows = plans.map(p => ({
    id: p.id,
    user_id: userId,
    name: p.name,
    tags: p.tags || [],
    notes: p.notes || '',
    type: p.type,
    plan_data: p.planData,
    prefs: p.prefs,
    created_at: p.createdAt,
  }));
  const { error } = await supabase.from('saved_plans').upsert(rows, { onConflict: 'id' });
  if (error) console.error('upsertSavedPlans:', error);
}

export async function deleteSavedPlan(planId) {
  if (!supabase) return;
  const { error } = await supabase.from('saved_plans').delete().eq('id', planId);
  if (error) console.error('deleteSavedPlan:', error);
}

// ─── Favorites ──────────────────────────────────────────────────────

export async function fetchFavorites(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('meal_id')
    .eq('user_id', userId);
  if (error) { console.error('fetchFavorites:', error); return []; }
  return (data || []).map(r => r.meal_id);
}

export async function syncFavorites(userId, mealIds) {
  if (!supabase) return;
  // Replace all — delete then insert
  await supabase.from('favorites').delete().eq('user_id', userId);
  if (mealIds.length) {
    const rows = mealIds.map(meal_id => ({ user_id: userId, meal_id }));
    const { error } = await supabase.from('favorites').insert(rows);
    if (error) console.error('syncFavorites:', error);
  }
}

// ─── Custom Foods ───────────────────────────────────────────────────

export async function fetchCustomFoods(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('custom_foods')
    .select('food')
    .eq('user_id', userId);
  if (error) { console.error('fetchCustomFoods:', error); return []; }
  return (data || []).map(r => r.food);
}

export async function syncCustomFoods(userId, foods) {
  if (!supabase) return;
  await supabase.from('custom_foods').delete().eq('user_id', userId);
  if (foods.length) {
    const rows = foods.map(food => ({ user_id: userId, food }));
    const { error } = await supabase.from('custom_foods').insert(rows);
    if (error) console.error('syncCustomFoods:', error);
  }
}

// ─── Saved Shakes ───────────────────────────────────────────────────

export async function fetchSavedShakes(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('saved_shakes')
    .select('shake')
    .eq('user_id', userId);
  if (error) { console.error('fetchSavedShakes:', error); return []; }
  return (data || []).map(r => r.shake);
}

export async function syncSavedShakes(userId, shakes) {
  if (!supabase) return;
  await supabase.from('saved_shakes').delete().eq('user_id', userId);
  if (shakes.length) {
    const rows = shakes.map(shake => ({ user_id: userId, shake }));
    const { error } = await supabase.from('saved_shakes').insert(rows);
    if (error) console.error('syncSavedShakes:', error);
  }
}

// ─── Full pull (on login) ───────────────────────────────────────────

export async function pullAllUserData(userId) {
  const [profile, plans, favorites, customFoods, shakes] = await Promise.all([
    fetchProfile(userId),
    fetchSavedPlans(userId),
    fetchFavorites(userId),
    fetchCustomFoods(userId),
    fetchSavedShakes(userId),
  ]);
  return { profile, plans, favorites, customFoods, shakes };
}

// ─── Full push (save everything) ────────────────────────────────────

export async function pushAllUserData(userId, state) {
  await Promise.all([
    upsertProfile(userId, state),
    upsertSavedPlans(userId, state.savedPlans || []),
    syncFavorites(userId, state.favorites || []),
    syncCustomFoods(userId, state.customFoods || []),
    syncSavedShakes(userId, state.savedShakes || []),
  ]);
}
