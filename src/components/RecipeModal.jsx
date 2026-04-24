import React from 'react';
import { X, Clock, Users, ChefHat, Flame } from 'lucide-react';
import { CUISINES } from '../data/meals';

const cuisineEmojiMap = Object.fromEntries(CUISINES.map(c => [c.id, c.emoji]));

const INGREDIENT_QUANTITIES = {
  'paneer': '200g (1 cup cubed)',
  'chicken': '250g (boneless)',
  'chicken breast': '200g (1 large piece)',
  'chicken mince': '250g',
  'chicken thigh': '200g (boneless)',
  'mutton': '250g (bone-in)',
  'fish': '200g (1 fillet)',
  'fish fillet': '200g',
  'prawns': '200g (cleaned)',
  'white fish': '200g',
  'eggs': '2 large',
  'egg': '1 large',
  'egg whites': '3 large (90ml)',
  'tofu': '200g (1 block)',
  'wheat flour': '1 cup (120g, for 2 rotis)',
  'bajra flour': '1 cup (100g)',
  'jowar flour': '1 cup (100g)',
  'ragi flour': '1 cup (100g)',
  'maida': '1 cup (120g)',
  'rice flour': '½ cup (60g)',
  'besan': '¾ cup (90g)',
  'basmati rice': '1 cup dry (200g)',
  'rice': '1 cup dry (200g)',
  'brown rice': '1 cup dry (200g)',
  'jasmine rice': '1 cup dry (200g)',
  'sushi rice': '1 cup dry (200g)',
  'arborio rice': '1 cup dry (200g)',
  'quinoa': '½ cup dry (90g)',
  'bulgur': '½ cup dry (70g)',
  'farro': '½ cup dry (80g)',
  'couscous': '¾ cup dry (130g)',
  'toor dal': '¾ cup dry (150g)',
  'moong dal': '½ cup dry (100g)',
  'masoor dal': '½ cup dry (100g)',
  'chana dal': '½ cup dry (100g)',
  'green moong dal': '½ cup dry (100g)',
  'urad dal': '½ cup dry (100g)',
  'mixed dal': '¾ cup dry (150g)',
  'black urad dal': '¾ cup dry (150g)',
  'rajma': '½ cup dry (100g)',
  'red lentils': '¾ cup dry (150g)',
  'kidney beans': '¾ cup (cooked, 150g)',
  'chickpeas': '1 cup (cooked, 200g)',
  'black beans': '¾ cup (cooked, 150g)',
  'pinto beans': '¾ cup (cooked, 150g)',
  'cannellini beans': '½ cup (cooked, 100g)',
  'refried beans': '½ cup (120g)',
  'moth beans': '½ cup dry (100g)',
  'peas': '½ cup (75g)',
  'mixed sprouts': '1 cup (100g)',
  'onion': '1 medium (100g, finely chopped)',
  'tomato': '2 medium (150g, pureed)',
  'potato': '2 medium (200g)',
  'spinach': '2 cups packed (100g)',
  'cauliflower': '2 cups florets (200g)',
  'okra': '1.5 cups (150g)',
  'bell peppers': '1 large (150g, sliced)',
  'bell pepper': '1 medium (120g)',
  'capsicum': '1 medium (120g)',
  'mixed vegetables': '1.5 cups (200g)',
  'vegetables': '1.5 cups (200g)',
  'roasted vegetables': '2 cups (250g)',
  'mushrooms': '1 cup sliced (100g)',
  'broccoli': '1.5 cups florets (150g)',
  'cabbage': '1 cup shredded (100g)',
  'carrots': '1 medium (80g, diced)',
  'zucchini': '1 medium (150g)',
  'eggplant': '1 medium (200g)',
  'asparagus': '6 spears (100g)',
  'sweet potato': '1 medium (200g)',
  'corn': '½ cup kernels (80g)',
  'cherry tomatoes': '1 cup (150g)',
  'romaine': '3 cups torn (150g)',
  'mixed greens': '2 cups (60g)',
  'lettuce': '1 cup shredded (50g)',
  'kale': '2 cups (60g)',
  'avocado': '½ medium (75g)',
  'cucumber': '½ medium (100g)',
  'coconut': '2 tbsp grated (20g)',
  'coconut milk': '1 cup (240ml)',
  'curd': '½ cup (125g)',
  'yogurt': '½ cup (125g)',
  'cream': '2 tbsp (30ml)',
  'butter': '1 tbsp (15g)',
  'ghee': '1 tsp (5g)',
  'oil': '1 tbsp (15ml)',
  'olive oil': '1 tbsp (15ml)',
  'soy sauce': '1.5 tbsp (22ml)',
  'chili sauce': '1 tbsp (15ml)',
  'sesame oil': '1 tsp (5ml)',
  'tamarind': '1 tbsp paste (15g)',
  'cheese': '30g (2 slices)',
  'mozzarella': '100g (shredded)',
  'parmesan': '2 tbsp grated (15g)',
  'cheddar': '60g (shredded)',
  'feta': '50g (crumbled)',
  'ricotta': '½ cup (125g)',
  'halloumi': '100g (sliced)',
  'cottage cheese': '100g',
  'peanuts': '2 tbsp (20g)',
  'peanut butter': '2 tbsp (32g)',
  'almonds': '10 pieces (15g)',
  'cashews': '10 pieces (15g)',
  'walnuts': '6 halves (15g)',
  'pine nuts': '1 tbsp (10g)',
  'pumpkin seeds': '1 tbsp (10g)',
  'tahini': '1 tbsp (15g)',
  'hummus': '¼ cup (60g)',
  'spices': 'to taste (salt, turmeric, chili, garam masala)',
  'garam masala': '½ tsp',
  'cumin': '½ tsp seeds or powder',
  'turmeric': '¼ tsp',
  'mustard seeds': '½ tsp',
  'curry leaves': '8-10 leaves',
  'green chili': '1-2 (chopped)',
  'garlic': '3-4 cloves (minced)',
  'ginger': '1-inch piece (grated)',
  'coriander': '2 tbsp fresh (chopped)',
  'cilantro': '2 tbsp fresh (chopped)',
  'basil': '6-8 fresh leaves',
  'herbs': '2 tbsp fresh mixed',
  'mint': '2 tbsp fresh leaves',
  'mint chutney': '2 tbsp',
  'green chutney': '2 tbsp',
  'chutney podi': '1 tbsp',
  'lemon': '1 (juiced)',
  'lime': '1 (juiced)',
  'pickle': '1 tbsp',
  'saffron': '4-5 strands',
  'kadai masala': '1 tbsp',
  'kasuri methi': '1 tsp (dried)',
  'sambar powder': '1 tbsp',
  'whole spices': '1 bay leaf, 2 cardamom, 2 cloves, 1-inch cinnamon',
  'red chili': '2 dried or ½ tsp flakes',
  'chili flakes': '½ tsp',
  'black pepper': '½ tsp freshly ground',
  'fennel': '½ tsp seeds',
  'flour': '1 cup (120g)',
  'bread': '2 slices (whole wheat)',
  'sourdough': '2 slices',
  'ciabatta': '1 small roll',
  'brioche bun': '1 bun',
  'pita bread': '2 small rounds',
  'corn tortillas': '3 small (6-inch)',
  'flour tortilla': '1 large (10-inch)',
  'tortilla chips': '30g (1 small handful)',
  'noodles': '200g (dried)',
  'egg noodles': '150g (dried)',
  'rice noodles': '150g (dried)',
  'udon noodles': '200g',
  'ramen noodles': '1 pack (80g)',
  'soba noodles': '100g (dried)',
  'instant noodles': '1 pack (70g)',
  'spaghetti': '150g (dried)',
  'penne': '150g (dried)',
  'fusilli': '150g (dried)',
  'pasta': '150g (dried)',
  'lasagna sheets': '6 sheets',
  'macaroni': '150g (dried)',
  'pizza dough': '200g (for 1 medium base)',
  'pav buns': '2 buns',
  'soy granules': '50g dry',
  'soy chunks': '50g dry',
  'cornflour': '2 tbsp (for coating)',
  'breadcrumbs': '½ cup (50g)',
  'semolina puris': '6 small',
  'rava': '¾ cup (120g)',
  'rolled oats': '½ cup (40g)',
  'flattened rice': '1.5 cups (100g)',
  'vermicelli': '50g',
  'sabudana': '¾ cup (soaked, 100g)',
  'foxtail millet': '¾ cup dry (120g)',
  'little millet': '¾ cup dry (120g)',
  'barnyard millet': '¾ cup dry (120g)',
  'kodo millet': '¾ cup dry (120g)',
  'cornmeal': '1 cup (120g, for 2 makki rotis)',
  'grape leaves': '10-12 leaves',
  'rice paper': '6 sheets',
  'seaweed': '2 sheets (nori)',
  'nori': '1 sheet',
  'edamame': '½ cup (75g)',
  'bean sprouts': '½ cup (50g)',
  'spring onions': '2 stalks (sliced)',
  'sugar': '1 tsp',
  'jaggery': '1 tbsp (grated)',
  'honey': '1 tsp',
  'maple syrup': '2 tbsp',
  'buttermilk': '1 glass (250ml)',
  'milk': '1 cup (250ml)',
  'sour cream': '2 tbsp (30g)',
  'banana': '1 medium',
  'berries': '½ cup (75g)',
  'pomegranate': '2 tbsp arils',
  'mango': '½ cup sliced',
  'frozen berries': '½ cup (75g)',
  'apple': '1 medium',
  'dates': '3-4 pieces',
  'raisins': '1 tbsp',
  'cranberries': '1 tbsp',
  'dark chocolate': '15g (2 squares)',
  'chocolate chips': '1 tbsp',
  'cocoa powder': '1 tbsp',
  'ketchup': '1 tbsp',
  'mayo': '1 tbsp',
  'teriyaki sauce': '2 tbsp (30ml)',
  'marinara': '½ cup (120g)',
  'tomato sauce': '½ cup (120g)',
  'enchilada sauce': '½ cup (120g)',
  'green curry paste': '1 tbsp',
  'miso paste': '1 tbsp',
  'gochujang': '1 tbsp',
  'salsa': '3 tbsp (45g)',
  'pico de gallo': '3 tbsp',
  'guacamole': '3 tbsp (45g)',
  'chipotle mayo': '1 tbsp',
  'garlic sauce': '2 tbsp',
  'ranchero sauce': '¼ cup (60g)',
  'salsa verde': '¼ cup (60g)',
  'caesar dressing': '2 tbsp',
  'chipotle ranch': '2 tbsp',
  'balsamic': '1 tbsp',
  'dashi': '2 cups (500ml)',
  'wine': '2 tbsp',
  'white wine': '2 tbsp',
  'plant-based patty': '1 patty (100g)',
  'turkey': '100g (sliced)',
  'bacon': '2 strips',
  'beef steak': '150g',
  'tuna': '150g (sashimi grade)',
  'salmon': '150g fillet',
  'anchovy': '1 tsp paste',
  'scallions': '2 stalks',
  'curry roux': '2 cubes (40g)',
  'acai': '1 packet (100g frozen)',
  'açaí': '1 packet (100g frozen)',
  'granola': '30g (¼ cup)',
  'chia seeds': '1 tbsp (10g)',
  'flaxseed': '1 tbsp (10g)',
  'protein powder': '1 scoop (30g)',
  'whey protein': '1 scoop (30g)',
  'ice': 'as needed',
  'cardamom': '2 pods',
  'rose water': '½ tsp',
  'star anise': '1 piece',
  'cinnamon': '1-inch stick or ½ tsp powder',
  'khoya': '100g',
  'cornflakes': '1 cup (30g)',
  'biscuits': '4 pieces',
  'tea': '1 tsp leaves',
  'masala seasoning': '1 packet',
  'dabeli masala': '1 tbsp',
  'sev': '2 tbsp',
  'farsan': '2 tbsp',
  'fenugreek leaves': '½ cup fresh (chopped)',
  'chaat masala': '½ tsp',
  'red chili powder': '½ tsp',
  'red chutney': '2 tbsp',
  'tamarind chutney': '2 tbsp',
  'sesame': '1 tsp seeds',
  'sesame seeds': '1 tsp',
  'papad': '1 piece',
  'boondi': '2 tbsp',
  'coconut chutney': '2 tbsp',
  'sambar': '1 cup',
  'tzatziki': '3 tbsp (50g)',
  'olives': '6-8 pieces',
  'pickles': '2 tbsp',
  'pickled onion': '2 tbsp',
  'fried onions': '2 tbsp',
  'microgreens': '1 tbsp',
  'parsley': '1 tbsp fresh (chopped)',
  'dill': '1 tbsp fresh',
  'thyme': '½ tsp dried',
  'chives': '1 tbsp (chopped)',
};

function getQuantity(ingredient) {
  const key = ingredient.toLowerCase().trim();
  if (INGREDIENT_QUANTITIES[key]) return INGREDIENT_QUANTITIES[key];
  for (const [k, v] of Object.entries(INGREDIENT_QUANTITIES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return 'as needed';
}

export default function RecipeModal({ meal, onClose }) {
  if (!meal) return null;

  const ingredients = meal.ingredients || [];
  const totalMacroCalories = (meal.protein * 4) + (meal.carbs * 4) + (meal.fat * 9);
  const proteinPct = totalMacroCalories > 0 ? Math.round((meal.protein * 4) / totalMacroCalories * 100) : 0;
  const carbsPct = totalMacroCalories > 0 ? Math.round((meal.carbs * 4) / totalMacroCalories * 100) : 0;
  const fatPct = totalMacroCalories > 0 ? Math.round((meal.fat * 9) / totalMacroCalories * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream-50 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-4 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{cuisineEmojiMap[meal.cuisine] || '🍽️'}</span>
            <div>
              <h2 className="font-bold text-bark-700 text-lg leading-tight">{meal.name}</h2>
              <p className="text-[10px] text-bark-400">{meal.serving}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-bark-400 hover:text-bark-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {meal.desc && (
            <p className="text-sm text-bark-500 leading-relaxed">{meal.desc}</p>
          )}

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-terra-50 rounded-xl p-3 text-center border border-terra-200">
              <Flame size={14} className="text-terra-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-terra-600">{meal.cal}</div>
              <div className="text-[9px] text-bark-400 uppercase">Calories</div>
            </div>
            <div className="bg-sage-50 rounded-xl p-3 text-center border border-sage-200">
              <div className="text-lg font-bold text-sage-600">{meal.protein}g</div>
              <div className="text-[9px] text-bark-400 uppercase">Protein</div>
              <div className="text-[9px] text-sage-500 font-semibold">{proteinPct}%</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
              <div className="text-lg font-bold text-blue-500">{meal.carbs}g</div>
              <div className="text-[9px] text-bark-400 uppercase">Carbs</div>
              <div className="text-[9px] text-blue-500 font-semibold">{carbsPct}%</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
              <div className="text-lg font-bold text-amber-500">{meal.fat}g</div>
              <div className="text-[9px] text-bark-400 uppercase">Fat</div>
              <div className="text-[9px] text-amber-500 font-semibold">{fatPct}%</div>
            </div>
          </div>

          <div className="flex gap-3 text-xs text-bark-500">
            {meal.prepTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-bark-400" />
                {meal.prepTime} min prep
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={14} className="text-bark-400" />
              1 serving
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-bark-700 mb-3 flex items-center gap-1.5">
              <ChefHat size={16} className="text-sage-500" />
              Ingredients & Quantities
            </h3>
            <div className="bg-white rounded-xl border border-cream-200 divide-y divide-cream-100">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm text-bark-700 capitalize">{ing}</span>
                  <span className="text-xs text-bark-400 text-right ml-2 flex-shrink-0">{getQuantity(ing)}</span>
                </div>
              ))}
            </div>
          </div>

          {meal.proteinBoosters && meal.proteinBoosters.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-bark-700 mb-2">💪 Protein Boost Options</h3>
              <div className="space-y-1.5">
                {meal.proteinBoosters.map((b, i) => (
                  <div key={i} className="bg-sage-50 rounded-lg px-3 py-2 text-xs text-sage-700 border border-sage-200">
                    {b}
                  </div>
                ))}
              </div>
            </div>
          )}

          {meal.blinkitPairings && meal.blinkitPairings.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-bark-700 mb-2">🛒 Blinkit Pairings</h3>
              <div className="flex flex-wrap gap-2">
                {meal.blinkitPairings.map((p, i) => (
                  <span key={i} className="px-2.5 py-1.5 text-xs font-medium bg-terra-50 text-terra-600 rounded-lg border border-terra-200">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-cream-100 rounded-xl p-3 text-[10px] text-bark-400 leading-relaxed">
            <strong>Note:</strong> Quantities are for 1 serving to approximately match the calorie count shown.
            Adjust oil, butter, and cream to fine-tune calories. Using less oil/ghee can save 50-100 cal.
          </div>
        </div>
      </div>
    </div>
  );
}
