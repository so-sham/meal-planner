export const BOOSTERS = [
  { id: 1, text: "Add 100g paneer to your meal", extraProtein: 18, extraCal: 265, isVeg: true, dairy: true, soy: false },
  { id: 2, text: "Add 2 boiled eggs as a side", extraProtein: 12, extraCal: 140, isVeg: false, dairy: false, soy: false },
  { id: 3, text: "Add 1 scoop whey to morning oats", extraProtein: 24, extraCal: 120, isVeg: true, dairy: true, soy: false },
  { id: 4, text: "Swap regular curd with Greek yogurt", extraProtein: 8, extraCal: 20, isVeg: true, dairy: true, soy: false },
  { id: 5, text: "Add handful of roasted soy nuts (50g)", extraProtein: 18, extraCal: 200, isVeg: true, dairy: false, soy: true },
  { id: 6, text: "Top dal with 50g soy granules", extraProtein: 26, extraCal: 170, isVeg: true, dairy: false, soy: true },
  { id: 7, text: "Add 30g pumpkin seeds as topping", extraProtein: 9, extraCal: 170, isVeg: true, dairy: false, soy: false },
  { id: 8, text: "Add a protein shake between meals", extraProtein: 24, extraCal: 150, isVeg: true, dairy: true, soy: false },
  { id: 9, text: "Add 50g roasted chana as snack", extraProtein: 10, extraCal: 180, isVeg: true, dairy: false, soy: false },
  { id: 10, text: "Add 2 tbsp peanut butter to toast", extraProtein: 8, extraCal: 190, isVeg: true, dairy: false, soy: false },
  { id: 11, text: "Add 100g tofu to stir-fry", extraProtein: 12, extraCal: 76, isVeg: true, dairy: false, soy: true },
  { id: 12, text: "Add 1 scoop sattu to water/lassi", extraProtein: 10, extraCal: 190, isVeg: true, dairy: false, soy: false },
  { id: 13, text: "Add a protein bar as evening snack", extraProtein: 20, extraCal: 220, isVeg: true, dairy: true, soy: false },
  { id: 14, text: "Drink Amul Protein Lassi with lunch", extraProtein: 20, extraCal: 140, isVeg: true, dairy: true, soy: false },
  { id: 15, text: "Add 3 egg whites to breakfast", extraProtein: 10, extraCal: 50, isVeg: false, dairy: false, soy: false },
];

export const SWAPS = [
  { from: "Regular atta roti", to: "Protein atta roti (Aashirvaad)", extraProtein: 3, unit: "per roti" },
  { from: "Regular pasta", to: "Protein pasta (TWT / Slurrp Farm)", extraProtein: 10, unit: "per serving" },
  { from: "Regular bread", to: "Protein bread (Epigamia / TWT)", extraProtein: 6, unit: "per 2 slices" },
  { from: "White rice", to: "Quinoa", extraProtein: 5, unit: "per cup cooked" },
  { from: "Regular milk", to: "Amul Protein Lassi", extraProtein: 14, unit: "per 200ml" },
  { from: "Regular granola", to: "Yoga Bar Protein Granola", extraProtein: 8, unit: "per serving" },
  { from: "Regular curd", to: "Amul High Protein Curd", extraProtein: 10, unit: "per 100g" },
  { from: "Regular bread", to: "Whole wheat + PB toast", extraProtein: 8, unit: "per 2 slices" },
];

export function getFilteredBoosters(prefs) {
  return BOOSTERS.filter(b => {
    if (prefs.dietType === 'vegetarian' && !b.isVeg) return false;
    if (prefs.dietType === 'eggetarian' && !b.isVeg) return false;
    if (!prefs.dairyOk && b.dairy) return false;
    if (!prefs.soyOk && b.soy) return false;
    return true;
  });
}
