const SLOT_EMOJIS = {
  breakfast: '☀️',
  'morning snack': '🌅',
  lunch: '🌤️',
  'afternoon snack': '🍵',
  'evening snack': '🌇',
  dinner: '🌙',
  snack: '🍵',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${DAY_NAMES[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function calcTotals(meals) {
  return (meals || []).reduce((acc, m) => {
    let bc = 0, bp = 0, bcarbs = 0, bf = 0;
    for (const b of m.boosters || []) {
      bc += b.cal || 0;
      bp += b.protein || 0;
      bcarbs += b.carbs || 0;
      bf += b.fat || 0;
    }
    return {
      cal: acc.cal + (m.cal || 0) + bc,
      protein: acc.protein + (m.protein || 0) + bp,
      carbs: acc.carbs + (m.carbs || 0) + bcarbs,
      fat: acc.fat + (m.fat || 0) + bf,
    };
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });
}

function slotEmoji(label) {
  if (!label) return '🍽️';
  return SLOT_EMOJIS[label.toLowerCase()] || '🍽️';
}

function formatDayText(meals, addons, date, prefs) {
  const lines = [];
  lines.push(`🍽️ My Meal Plan — ${formatDate(date)}`);
  lines.push(`Target: ${prefs.calorieTarget} cal | ${prefs.proteinTarget}g protein`);
  lines.push('');

  for (const meal of meals || []) {
    const emoji = slotEmoji(meal.slotLabel);
    lines.push(`${emoji} ${meal.slotLabel}: ${meal.name}`);
    lines.push(`   → ${meal.cal} cal | ${meal.protein}g P | ${meal.carbs}g C | ${meal.fat}g F`);
    if (meal.boosters?.length) {
      for (const b of meal.boosters) {
        const label = b.text || b.name || 'Booster';
        lines.push(`   📦 Booster: +${label} (+${b.protein}g P)`);
      }
    }
    lines.push('');
  }

  if (addons?.length) {
    lines.push('📎 Add-ons:');
    for (const a of addons) {
      lines.push(`   • ${a.name} — +${a.protein}g P | +${a.cal} cal`);
    }
    lines.push('');
  }

  const allItems = [...(meals || []), ...(addons || []).map(a => ({ ...a, boosters: [] }))];
  const totals = calcTotals(allItems);
  lines.push(`✅ Daily Total: ${totals.cal} cal | ${totals.protein}g protein | ${totals.carbs}g carbs | ${totals.fat}g fat`);

  return lines.join('\n');
}

export function exportAsText(planData, prefs, isWeekly) {
  if (!planData) return '';

  if (isWeekly && planData.days) {
    const sections = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    sections.push('🍽️ My Weekly Meal Plan');
    sections.push(`Target: ${prefs.calorieTarget} cal | ${prefs.proteinTarget}g protein`);
    sections.push('═'.repeat(40));

    planData.days.forEach((day, i) => {
      sections.push('');
      sections.push(`━━━ ${dayNames[i]} ━━━`);
      sections.push('');
      const dayText = formatDayText(day.meals, day.addons, day.date, prefs);
      const dayLines = dayText.split('\n').slice(2);
      sections.push(dayLines.join('\n'));
    });

    return sections.join('\n');
  }

  return formatDayText(planData.meals, planData.addons, planData.date, prefs);
}

export function exportAsCSV(planData, prefs, isWeekly) {
  const headers = ['Day', 'Slot', 'Meal', 'Cuisine', 'Calories', 'Protein', 'Carbs', 'Fat', 'Ingredients', 'Boosters'];
  const rows = [headers.join(',')];

  function escapeCSV(val) {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function addMealsToRows(meals, dayLabel) {
    for (const meal of meals || []) {
      const ingredients = (meal.ingredients || []).join('; ');
      const boosters = (meal.boosters || []).map(b => {
        const label = b.text || b.name || 'Booster';
        return `${label} (+${b.protein}g P)`;
      }).join('; ');

      rows.push([
        escapeCSV(dayLabel),
        escapeCSV(meal.slotLabel),
        escapeCSV(meal.name),
        escapeCSV(meal.cuisine),
        meal.cal || 0,
        meal.protein || 0,
        meal.carbs || 0,
        meal.fat || 0,
        escapeCSV(ingredients),
        escapeCSV(boosters),
      ].join(','));
    }
  }

  if (isWeekly && planData?.days) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    planData.days.forEach((day, i) => {
      addMealsToRows(day.meals, dayNames[i]);
    });
  } else if (planData?.meals) {
    addMealsToRows(planData.meals, formatDate(planData.date));
  }

  return rows.join('\n');
}

export function exportAsJSON(planData, prefs) {
  const exportObj = {
    exportedAt: new Date().toISOString(),
    preferences: {
      calorieTarget: prefs.calorieTarget,
      proteinTarget: prefs.proteinTarget,
      dietType: prefs.dietType,
      cuisines: prefs.cuisines,
      numMeals: prefs.numMeals,
    },
    plan: planData,
  };
  return JSON.stringify(exportObj, null, 2);
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateAutoName(planData, prefs, isWeekly) {
  const cal = prefs.calorieTarget || 1800;
  if (isWeekly) return `Weekly ${cal}cal Plan`;
  const dayName = DAY_NAMES[new Date().getDay()];
  return `${dayName} ${cal}cal Plan`;
}

export function generateAutoTags(planData, prefs) {
  const tags = new Set();

  if (prefs.dietType) tags.add(prefs.dietType);

  const cal = prefs.calorieTarget || 1800;
  tags.add(cal <= 1500 ? 'low-cal' : cal <= 2000 ? 'moderate-cal' : 'high-cal');

  const prot = prefs.proteinTarget || 120;
  tags.add(prot <= 80 ? 'low-protein' : prot <= 130 ? 'moderate-protein' : 'high-protein');

  const allMeals = planData?.days
    ? planData.days.flatMap(d => d.meals || [])
    : planData?.meals || [];

  const cuisines = new Set();
  for (const m of allMeals) {
    if (m.cuisine && m.cuisine !== 'mixed') cuisines.add(m.cuisine);
  }
  for (const c of cuisines) tags.add(c);

  return [...tags];
}
