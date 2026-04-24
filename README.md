# NourishPlan V2

A protein-first meal planning web app built with React. Generates optimized daily and weekly meal plans from a database of 200+ real Indian and international meals, with intelligent protein gap analysis, shake building, AI food scanning, and Blinkit-friendly product recommendations.

## Features

### Meal Plan Generation
- **Daily & Weekly plans** with protein-optimized algorithm (multiple attempts, best-fit selection)
- **Smart matching**: filters by diet type, cuisines, dairy/soy tolerance; ranks by protein density
- **Calorie ±10% and protein ±5% targeting** with dynamic protein side attachment
- **Favorites-first mode**: toggle to prefer hearted meals during generation
- **Swap any meal** individually without regenerating the full plan

### Protein Enhancement
- **Bridge the Gap panel**: when protein is below target, suggests add-ons, shakes, swaps, and Blinkit products ranked by protein-per-calorie
- **Per-meal boosters**: attach protein boosters to individual meals; removable with macro recalculation
- **Smart Protein Swaps**: e.g. regular atta → protein atta, rice → quinoa
- **85+ Blinkit/quick commerce products** database with filtering by diet preferences

### Shake Builder
- Interactive builder with base, protein source, and 12+ add-ins
- Live macro counter updates as ingredients are added/removed
- 6 preset recipes (The Basics, Peanut Butter Power, Sattu Cooler, etc.)
- Save custom shakes for reuse; add directly to meal plan

### AI Food Scanner
- Upload a photo of any meal for Claude API (`claude-sonnet-4-20250514`) analysis
- Returns identified items, portions, macros, and confidence level
- Editable estimates before saving as a custom food entry
- Manual food entry form with full macro inputs
- Nutrition label extraction from packaged food photos

### Saved Plans & Favorites
- Heart meals to save as favorites (visible in Saved section)
- Quick-save current plan or save with name, tags, and notes
- Load, duplicate, rename, or delete saved plans
- Reorder and remove individual meals within saved plans (including per-day for weekly plans)
- Generate new plans biased toward favorited meals

### Export
- **PDF**: formatted document via `@react-pdf/renderer`
- **CSV**: spreadsheet for Excel/Google Sheets
- **Image**: PNG screenshot via `html2canvas`
- **Text**: copy to clipboard
- **JSON**: raw data export/import

### Settings & Data
- Full preference editor (goals, diet, cuisines, meals, carb/fat prefs)
- Export/import all data as JSON backup
- Clear all data with confirmation
- Stats dashboard (saved plans, favorites, custom foods, shakes)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Vite) |
| State | Zustand with `persist` middleware (localStorage) |
| Styling | Tailwind CSS 3 (custom palette: cream, sage, terra, protein, bark) |
| Charts | Recharts (macro donut, progress bars) |
| Icons | lucide-react |
| PDF | @react-pdf/renderer |
| Image Export | html2canvas |
| IDs | uuid |
| AI | Claude API (photo scanning only) |

## Project Structure

```
src/
├── App.jsx                       # Main app shell, routing, plan view
├── main.jsx                      # React entry point
├── index.css                     # Tailwind directives + custom styles
│
├── components/
│   ├── Onboarding.jsx            # 4-screen setup wizard
│   ├── FilterPanel.jsx           # Preferences sidebar (goals, diet, cuisines)
│   ├── MealCard.jsx              # Individual meal display with swap/fav/boost/recipe
│   ├── MacroRings.jsx            # Circular progress rings with deviation indicators
│   ├── ProgressRing.jsx          # Reusable SVG ring component
│   ├── ProteinTracker.jsx        # Sticky protein/calorie progress bar
│   ├── BridgeTheGap.jsx          # Protein gap analysis + add-on suggestions
│   ├── WeeklyView.jsx            # 7-day plan with day tabs, boosters, glance chart
│   ├── ShakeBuilder.jsx          # Interactive shake builder with presets
│   ├── BlinkitStore.jsx          # Protein product store (85+ items)
│   ├── PhotoScanner.jsx          # AI food photo analysis (Claude API)
│   ├── RecipeModal.jsx           # Full recipe with ingredient quantities
│   ├── GroceryList.jsx           # Aggregated grocery checklist for weekly plans
│   ├── SavedPlansView.jsx        # Favorites + saved plans management
│   ├── SavePlanModal.jsx         # Save with name, tags, notes
│   ├── ExportModal.jsx           # PDF/CSV/Image/Text/JSON export
│   ├── SettingsView.jsx          # Preferences editor + data management
│   └── PlanPDF.jsx               # PDF document template
│
├── store/
│   └── usePlanStore.js           # Zustand store (all app state, persisted to localStorage)
│
├── data/
│   ├── meals.js                  # 200+ meal database with full macro/tag data
│   ├── blinkitProducts.js        # 85+ protein products from quick commerce
│   ├── proteinBoosters.js        # Protein boosters and smart swaps
│   └── shakeData.js              # Shake bases, proteins, add-ins, presets
│
└── utils/
    ├── algorithm.js              # Plan generation, scoring, swapping, grocery list
    ├── export.js                 # Text, CSV, JSON export formatters
    └── storage.js                # API key storage helpers for photo scanner
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

The app runs at **http://localhost:8080** and binds to `0.0.0.0` for LAN access.

### Build for Production

```bash
npm run build
npm run preview
```

## How It Works

### Meal Generation Algorithm

1. **Filter** the 200+ meal database by diet type, egg/dairy/soy preferences, and selected cuisines
2. **Score** each meal by protein density (protein per 100 cal), calorie fit, and protein fit — with 75% weight on protein accuracy
3. **Generate** plans via multiple attempts (5 for daily, 3 full-week attempts for weekly), selecting the best-fit plan
4. **Attach** protein sides dynamically to meals when the protein gap is large
5. **Favorites boost**: when enabled, favorited meals get a 6.7x scoring advantage

### State Persistence

All state lives in a single Zustand store persisted to `localStorage` with:
- Custom storage wrapper with `QuotaExceededError` handling
- Migration from legacy `np2_*` localStorage keys
- Transient state (`isGenerating`, `activeModal`) excluded from persistence

## Configuration

### Photo Scanner
The food scanner requires a Claude API key. Enter it in the scanner modal on first use — it's saved to `localStorage` and never sent anywhere except to the Anthropic API.

### Preferences
All dietary preferences can be changed anytime via the sidebar (plan view) or Settings tab. Changes take effect on the next plan generation.
