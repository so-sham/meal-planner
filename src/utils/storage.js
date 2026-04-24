const PK = 'np2_prefs', FK = 'np2_favs', AK = 'np2_apikey', CK = 'np2_custom_foods', SK = 'np2_saved_shakes', BK = 'np2_blinkit_favs';

export function loadPreferences() {
  try { const r = localStorage.getItem(PK); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function savePreferences(p) { localStorage.setItem(PK, JSON.stringify(p)); }

export function loadFavorites() {
  try { const r = localStorage.getItem(FK); return r ? new Set(JSON.parse(r)) : new Set(); } catch { return new Set(); }
}
export function saveFavorites(s) { localStorage.setItem(FK, JSON.stringify([...s])); }

export function loadApiKey() {
  try { return localStorage.getItem(AK) || ''; } catch { return ''; }
}
export function saveApiKey(k) { localStorage.setItem(AK, k); }

export function loadCustomFoods() {
  try { const r = localStorage.getItem(CK); return r ? JSON.parse(r) : []; } catch { return []; }
}
export function saveCustomFoods(foods) { localStorage.setItem(CK, JSON.stringify(foods)); }

export function loadSavedShakes() {
  try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : []; } catch { return []; }
}
export function saveSavedShakes(shakes) { localStorage.setItem(SK, JSON.stringify(shakes)); }

export function loadBlinkitFavs() {
  try { const r = localStorage.getItem(BK); return r ? new Set(JSON.parse(r)) : new Set(); } catch { return new Set(); }
}
export function saveBlinkitFavs(s) { localStorage.setItem(BK, JSON.stringify([...s])); }
