import { meals } from '../data/meals';

const PROTEIN_SIDES = [
  { name: "Air-fried paneer (100g)", cal: 200, protein: 18, carbs: 3, fat: 14, isVeg: true, dairy: true, soy: false },
  { name: "Boiled eggs ×2", cal: 140, protein: 12, carbs: 2, fat: 10, isVeg: false, dairy: false, soy: false },
  { name: "Grilled chicken breast (100g)", cal: 165, protein: 25, carbs: 0, fat: 7, isVeg: false, dairy: false, soy: false },
  { name: "Soy chunk fry (50g dry)", cal: 170, protein: 26, carbs: 10, fat: 1, isVeg: true, dairy: false, soy: true },
  { name: "Tandoori paneer tikka (80g)", cal: 170, protein: 14, carbs: 3, fat: 12, isVeg: true, dairy: true, soy: false },
  { name: "Greek yogurt bowl (150g)", cal: 135, protein: 15, carbs: 8, fat: 5, isVeg: true, dairy: true, soy: false },
  { name: "Egg white omelette (3 whites)", cal: 50, protein: 10, carbs: 0, fat: 0, isVeg: false, dairy: false, soy: false },
  { name: "Sprouts salad (100g)", cal: 100, protein: 8, carbs: 14, fat: 1, isVeg: true, dairy: false, soy: false },
  { name: "Tofu stir-fry (100g)", cal: 76, protein: 12, carbs: 2, fat: 4, isVeg: true, dairy: false, soy: true },
  { name: "Roasted chana (50g)", cal: 180, protein: 10, carbs: 25, fat: 3, isVeg: true, dairy: false, soy: false },
  { name: "Chicken tikka (100g)", cal: 150, protein: 22, carbs: 3, fat: 6, isVeg: false, dairy: false, soy: false },
  { name: "Protein shake (whey + water)", cal: 120, protein: 24, carbs: 3, fat: 1, isVeg: true, dairy: true, soy: false },
  { name: "Curd + peanuts (100g + 20g)", cal: 180, protein: 10, carbs: 8, fat: 11, isVeg: true, dairy: true, soy: false },
  { name: "Masoor dal side (1 cup)", cal: 150, protein: 12, carbs: 20, fat: 1, isVeg: true, dairy: false, soy: false },
];

function getEligibleSides(prefs) {
  return PROTEIN_SIDES.filter(s => {
    if (prefs.dietType === 'vegetarian' && !s.isVeg) return false;
    if (prefs.dietType === 'eggetarian' && !s.isVeg && s.name.indexOf('egg') === -1 && s.name.indexOf('Egg') === -1) return false;
    if (!prefs.dairyOk && s.dairy) return false;
    if (!prefs.soyOk && s.soy) return false;
    return true;
  });
}

const SLOT_CONFIGS = {
  3: [
    { key: 'breakfast', label: 'Breakfast', types: ['breakfast'], calPct: 0.30, protPct: 0.25 },
    { key: 'lunch', label: 'Lunch', types: ['lunch'], calPct: 0.40, protPct: 0.40 },
    { key: 'dinner', label: 'Dinner', types: ['dinner'], calPct: 0.30, protPct: 0.35 },
  ],
  4: [
    { key: 'breakfast', label: 'Breakfast', types: ['breakfast'], calPct: 0.25, protPct: 0.20 },
    { key: 'lunch', label: 'Lunch', types: ['lunch'], calPct: 0.35, protPct: 0.35 },
    { key: 'snack', label: 'Snack', types: ['snack'], calPct: 0.10, protPct: 0.15 },
    { key: 'dinner', label: 'Dinner', types: ['dinner'], calPct: 0.30, protPct: 0.30 },
  ],
  5: [
    { key: 'breakfast', label: 'Breakfast', types: ['breakfast'], calPct: 0.22, protPct: 0.18 },
    { key: 'morningSnack', label: 'Morning Snack', types: ['snack'], calPct: 0.08, protPct: 0.12 },
    { key: 'lunch', label: 'Lunch', types: ['lunch'], calPct: 0.30, protPct: 0.30 },
    { key: 'eveningSnack', label: 'Evening Snack', types: ['snack'], calPct: 0.10, protPct: 0.12 },
    { key: 'dinner', label: 'Dinner', types: ['dinner'], calPct: 0.30, protPct: 0.28 },
  ],
  6: [
    { key: 'breakfast', label: 'Breakfast', types: ['breakfast'], calPct: 0.20, protPct: 0.16 },
    { key: 'morningSnack', label: 'Morning Snack', types: ['snack'], calPct: 0.07, protPct: 0.10 },
    { key: 'lunch', label: 'Lunch', types: ['lunch'], calPct: 0.25, protPct: 0.26 },
    { key: 'afternoonSnack', label: 'Afternoon Snack', types: ['snack'], calPct: 0.08, protPct: 0.10 },
    { key: 'eveningSnack', label: 'Evening Snack', types: ['snack'], calPct: 0.10, protPct: 0.12 },
    { key: 'dinner', label: 'Dinner', types: ['dinner'], calPct: 0.30, protPct: 0.26 },
  ],
};

export function getSlotConfig(numMeals) {
  return SLOT_CONFIGS[numMeals] || SLOT_CONFIGS[4];
}

export function filterMeals(prefs, customFoods = []) {
  const allMeals = [...meals, ...customFoods];
  return allMeals.filter(m => {
    if (prefs.dietType === 'vegetarian') {
      if (!m.isVeg) return false;
      if (m.hasEgg && prefs.eggPref === 'no-egg') return false;
    }
    if (prefs.dietType === 'eggetarian') {
      if (!m.isVeg && !m.hasEgg) return false;
    }
    if (prefs.dairyOk === false && m.dairy) return false;
    if (prefs.soyOk === false && m.soy) return false;
    if (prefs.cuisines.length > 0 && !prefs.cuisines.includes('mixed')) {
      if (!prefs.cuisines.includes(m.cuisine)) return false;
    }
    return true;
  });
}

function scoreMeal(meal, targetCal, targetProtein, favoriteIds, prefs, preferFavorites = false) {
  const calDiff = Math.abs(meal.cal - targetCal) / Math.max(targetCal, 1);
  const protDiff = Math.abs(meal.protein - targetProtein) / Math.max(targetProtein, 1);

  let score = calDiff * 0.25 + protDiff * 0.75;

  const pd = meal.proteinDensity || (meal.protein / meal.cal * 100);
  if (pd > 8) score *= 0.82;
  if (pd > 12) score *= 0.78;

  if (favoriteIds.has(meal.id)) {
    score *= preferFavorites ? 0.15 : 0.80;
  } else if (preferFavorites) {
    score *= 3.0;
  }

  if (targetProtein > 15 && meal.protein >= targetProtein * 0.85) score *= 0.70;
  if (targetProtein > 15 && meal.protein < 8) score *= 2.0;

  if (prefs?.carbPref === 'low' && meal.carbs > 40) score *= 1.3;
  if (prefs?.carbPref === 'moderate' && meal.carbs > 55) score *= 1.15;
  if (prefs?.fatPref === 'low' && meal.fat > 18) score *= 1.2;
  if (prefs?.fatPref === 'moderate' && meal.fat > 25) score *= 1.1;

  return score;
}

export function generateDayPlan(prefs, favoriteIds = new Set(), excludeIds = new Set(), customFoods = [], preferFavorites = false) {
  const targetCal = prefs.calorieTarget;
  const targetProt = prefs.proteinTarget;

  let bestPlan = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < 8; attempt++) {
    const plan = generateOnePlan(prefs, favoriteIds, excludeIds, customFoods, attempt, preferFavorites);
    const totals = calcDayTotals(plan);

    const calPct = totals.cal / targetCal;
    const protPct = totals.protein / targetProt;
    const calErr = Math.abs(1 - calPct);
    const protErr = Math.abs(1 - protPct);
    const score = protErr * 0.7 + calErr * 0.3;

    if (protPct >= 0.93 && calPct >= 0.88 && calPct <= 1.12) {
      return plan;
    }
    if (score < bestScore) {
      bestScore = score;
      bestPlan = plan;
    }
  }

  // If still below 95% protein, try attaching protein sides
  const totals = calcDayTotals(bestPlan);
  const protGap = targetProt - totals.protein;
  const calBudget = targetCal * 1.05 - totals.cal;

  if (protGap > 5 && calBudget > 50) {
    const sides = getEligibleSides(prefs);
    for (const side of sides) {
      if (side.protein >= protGap * 0.5 && side.cal <= calBudget) {
        const lowestProtIdx = bestPlan.reduce((minI, m, i, arr) =>
          (m.protein < arr[minI].protein && m.slotKey !== 'morningSnack' && m.slotKey !== 'afternoonSnack' && m.slotKey !== 'eveningSnack') ? i : minI, 0);
        const meal = bestPlan[lowestProtIdx];
        bestPlan[lowestProtIdx] = {
          ...meal,
          name: `${meal.name} + ${side.name}`,
          desc: `${meal.desc} With a protein side of ${side.name.toLowerCase()}.`,
          cal: meal.cal + side.cal,
          protein: meal.protein + side.protein,
          carbs: meal.carbs + (side.carbs || 0),
          fat: meal.fat + (side.fat || 0),
          proteinDensity: Math.round(((meal.protein + side.protein) / (meal.cal + side.cal)) * 100 * 10) / 10,
          tags: [...(meal.tags || []), 'protein-boosted'],
        };
        break;
      }
    }
  }

  return bestPlan;
}

function generateOnePlan(prefs, favoriteIds, excludeIds, customFoods, attempt, preferFavorites = false) {
  const filtered = filterMeals(prefs, customFoods);
  const slots = getSlotConfig(prefs.numMeals);
  const plan = [];
  const usedIds = new Set(excludeIds);
  let remainingCal = prefs.calorieTarget;
  let remainingProtein = prefs.proteinTarget;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const isLast = i === slots.length - 1;

    let candidates = filtered.filter(m =>
      m.types.some(t => slot.types.includes(t)) && !usedIds.has(m.id)
    );
    if (candidates.length === 0) candidates = filtered.filter(m => !usedIds.has(m.id));
    if (candidates.length === 0) candidates = filtered;

    const targetCal = isLast ? Math.max(remainingCal, 100) : prefs.calorieTarget * slot.calPct;
    const targetProtein = isLast ? Math.max(remainingProtein, 5) : prefs.proteinTarget * slot.protPct;

    const scored = candidates.map(m => ({
      meal: m, score: scoreMeal(m, targetCal, targetProtein, favoriteIds, prefs, preferFavorites),
    })).sort((a, b) => a.score - b.score);

    // Less randomness on later attempts for tighter convergence
    const topN = attempt < 3 ? Math.min(4, scored.length) : Math.min(2, scored.length);
    const pick = scored[Math.floor(Math.random() * topN)].meal;
    const label = prefs.mealLabels?.[i] || slot.label;

    plan.push({ ...pick, slotKey: slot.key, slotLabel: label });
    usedIds.add(pick.id);
    remainingCal -= pick.cal;
    remainingProtein -= pick.protein;
  }
  return plan;
}

export function generateDayPlanWithPins(prefs, pins, favoriteIds = new Set(), excludeIds = new Set(), customFoods = []) {
  const filtered = filterMeals(prefs, customFoods);
  const slots = getSlotConfig(prefs.numMeals);
  const plan = new Array(slots.length).fill(null);
  const usedIds = new Set(excludeIds);

  let pinnedCal = 0, pinnedProt = 0;
  for (let i = 0; i < slots.length; i++) {
    if (pins[i]) {
      plan[i] = { ...pins[i], slotKey: slots[i].key, slotLabel: prefs.mealLabels?.[i] || slots[i].label };
      usedIds.add(pins[i].id);
      pinnedCal += pins[i].cal || 0;
      pinnedProt += pins[i].protein || 0;
    }
  }

  const emptySlots = slots.map((s, i) => ({ slot: s, idx: i })).filter((_, i) => !plan[i]);
  const remainCal = prefs.calorieTarget - pinnedCal;
  const remainProt = prefs.proteinTarget - pinnedProt;
  const totalPctCal = emptySlots.reduce((a, { slot }) => a + slot.calPct, 0) || 1;
  const totalPctProt = emptySlots.reduce((a, { slot }) => a + slot.protPct, 0) || 1;

  let leftCal = remainCal, leftProt = remainProt;
  for (let j = 0; j < emptySlots.length; j++) {
    const { slot, idx } = emptySlots[j];
    const isLast = j === emptySlots.length - 1;
    let candidates = filtered.filter(m => m.types.some(t => slot.types.includes(t)) && !usedIds.has(m.id));
    if (candidates.length === 0) candidates = filtered.filter(m => !usedIds.has(m.id));
    if (candidates.length === 0) candidates = filtered;

    const targetCal = isLast ? Math.max(leftCal, 100) : remainCal * (slot.calPct / totalPctCal);
    const targetProt = isLast ? Math.max(leftProt, 5) : remainProt * (slot.protPct / totalPctProt);
    const scored = candidates.map(m => ({ meal: m, score: scoreMeal(m, targetCal, targetProt, favoriteIds, prefs) })).sort((a, b) => a.score - b.score);
    const topN = Math.min(3, scored.length);
    const pick = scored[Math.floor(Math.random() * topN)].meal;
    plan[idx] = { ...pick, slotKey: slot.key, slotLabel: prefs.mealLabels?.[idx] || slot.label };
    usedIds.add(pick.id);
    leftCal -= pick.cal;
    leftProt -= pick.protein;
  }

  return plan;
}

export function swapMeal(plan, slotIndex, prefs, favoriteIds = new Set(), customFoods = []) {
  const cur = plan[slotIndex];
  const usedIds = new Set(plan.map(m => m.id));
  const filtered = filterMeals(prefs, customFoods);
  const slots = getSlotConfig(prefs.numMeals);

  let candidates = filtered.filter(m =>
    m.types.some(t => {
      const slot = slots.find(s => s.key === cur.slotKey);
      return slot && slot.types.includes(t);
    }) && !usedIds.has(m.id)
  );
  if (candidates.length === 0) candidates = filtered.filter(m => m.id !== cur.id);

  const otherCals = plan.reduce((s, m, i) => i === slotIndex ? s : s + m.cal, 0);
  const otherProt = plan.reduce((s, m, i) => i === slotIndex ? s : s + m.protein, 0);

  const scored = candidates.map(m => ({
    meal: m, score: scoreMeal(m, prefs.calorieTarget - otherCals, prefs.proteinTarget - otherProt, favoriteIds, prefs),
  })).sort((a, b) => a.score - b.score);

  const topN = Math.min(3, scored.length);
  const pick = scored[Math.floor(Math.random() * topN)].meal;
  const newPlan = [...plan];
  newPlan[slotIndex] = { ...pick, slotKey: cur.slotKey, slotLabel: cur.slotLabel };
  return newPlan;
}

export function generateWeeklyPlan(prefs, favoriteIds = new Set(), customFoods = [], preferFavorites = false) {
  const targetCal = prefs.calorieTarget;
  const targetProt = prefs.proteinTarget;

  let bestWeek = null;
  let bestWeekScore = Infinity;

  for (let attempt = 0; attempt < 3; attempt++) {
    const week = [];
    const recentIds = new Set();

    for (let d = 0; d < 7; d++) {
      const dp = generateDayPlan(prefs, favoriteIds, recentIds, customFoods, preferFavorites);
      week.push(dp);
      dp.forEach(m => recentIds.add(m.id));
      if (d >= 1) week[Math.max(0, d - 1)].forEach(m => recentIds.delete(m.id));
    }

    let totalScore = 0;
    for (const day of week) {
      const totals = calcDayTotals(day);
      const calErr = Math.abs(1 - totals.cal / targetCal);
      const protErr = Math.abs(1 - totals.protein / targetProt);
      totalScore += protErr * 0.7 + calErr * 0.3;
    }
    const avgScore = totalScore / 7;

    if (avgScore < bestWeekScore) {
      bestWeekScore = avgScore;
      bestWeek = week;
    }
  }

  return bestWeek;
}

export function buildGroceryList(weekPlan) {
  const map = new Map();
  weekPlan.forEach(dp => dp.forEach(m => {
    (m.ingredients || []).forEach(ig => {
      const k = ig.toLowerCase().trim();
      map.set(k, (map.get(k) || 0) + 1);
    });
  }));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

export function calcDayTotals(plan) {
  return plan.reduce((a, m) => ({
    cal: a.cal + (m.cal || 0), protein: a.protein + (m.protein || 0),
    carbs: a.carbs + (m.carbs || 0), fat: a.fat + (m.fat || 0),
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
}

export function getDeviationColor(actual, target) {
  if (target === 0) return 'green';
  const pct = Math.abs(actual - target) / target;
  if (pct <= 0.10) return 'green';
  if (pct <= 0.20) return 'yellow';
  return 'red';
}

export function getProteinGapSuggestions(plan, prefs, blinkitProducts) {
  const totals = calcDayTotals(plan);
  const gap = prefs.proteinTarget - totals.protein;
  if (gap <= 5) return { gap: 0, suggestions: [] };

  const calBudget = prefs.calorieTarget - totals.cal;
  const products = blinkitProducts
    .filter(p => {
      if (prefs.dietType === 'vegetarian' && !p.isVeg) return false;
      if (!prefs.dairyOk && p.dairy) return false;
      if (!prefs.soyOk && p.soy) return false;
      return true;
    })
    .map(p => ({ ...p, ratio: p.protein / Math.max(p.calories, 1) }))
    .sort((a, b) => b.ratio - a.ratio);

  const suggestions = [];
  let remaining = gap;
  for (const p of products) {
    if (remaining <= 0) break;
    if (p.calories <= calBudget && p.protein > 0) {
      suggestions.push(p);
      remaining -= p.protein;
    }
    if (suggestions.length >= 5) break;
  }

  return { gap, suggestions };
}
