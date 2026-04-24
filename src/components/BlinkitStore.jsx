import React, { useState, useMemo } from 'react';
import { blinkitProducts, BLINKIT_CATEGORIES } from '../data/blinkitProducts';
import { X, Search, Plus, Check } from 'lucide-react';

export default function BlinkitStore({ prefs, onClose, onAddProduct, hasPlan }) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());

  const filtered = useMemo(() => {
    return blinkitProducts.filter(p => {
      if (prefs.dietType === 'vegetarian' && !p.isVeg) return false;
      if (prefs.dietType === 'eggetarian' && !p.isVeg && !p.hasEgg) return false;
      if (prefs.dairyOk === false && p.dairy) return false;
      if (prefs.soyOk === false && p.soy) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [prefs, category, search]);

  const maxProteinByCategory = useMemo(() => {
    const map = {};
    blinkitProducts.forEach(p => {
      map[p.category] = Math.max(map[p.category] || 0, p.protein);
    });
    return map;
  }, []);

  const categoryOptions = [
    { k: 'all', l: 'All' },
    ...Object.entries(BLINKIT_CATEGORIES).map(([k, v]) => ({
      k,
      l: typeof v === 'string' ? v : v.label || v,
    })),
  ];

  const handleAdd = (product) => {
    if (addedIds.has(product.id)) return;
    setAddedIds(prev => new Set([...prev, product.id]));
    onAddProduct?.(product);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream-50 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-cream-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-bark-700 text-lg">🛒 Protein Store</h2>
              <p className="text-xs text-bark-400">Blinkit / Zepto / Instamart{hasPlan && ' — tap + to add to plan'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-bark-400 hover:text-bark-600 hover:bg-cream-200 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-300" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-cream-200 rounded-lg bg-white focus:outline-none focus:border-sage-400"
            />
          </div>

          <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-hide pb-1">
            {categoryOptions.map(o => (
              <button
                key={o.k}
                onClick={() => setCategory(o.k)}
                className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all ${
                  category === o.k
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-bark-500 border-cream-200 hover:border-sage-300'
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.map(p => {
            const maxP = maxProteinByCategory[p.category] || p.protein;
            const barWidth = maxP > 0 ? (p.protein / maxP) * 100 : 0;
            const isAdded = addedIds.has(p.id);

            return (
              <div
                key={p.id}
                className={`bg-white rounded-lg p-3 border transition-colors ${
                  isAdded ? 'border-sage-300 bg-sage-50/50' : 'border-cream-200 hover:border-sage-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sage-700 font-bold text-sm">{p.protein}g</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-bark-700 truncate">{p.name}</h4>
                    <p className="text-[10px] text-bark-400">
                      {p.brand} · {p.serving} · {p.calories} cal
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-bark-600">{p.price}</div>
                      <div className="text-[10px] text-bark-400">
                        P{p.protein} · C{p.carbs} · F{p.fat}
                      </div>
                    </div>
                    {hasPlan && (
                      <button
                        onClick={() => handleAdd(p)}
                        disabled={isAdded}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isAdded
                            ? 'bg-sage-100 text-sage-600'
                            : 'bg-sage-500 text-white hover:bg-sage-600 active:scale-90'
                        }`}
                        title={isAdded ? 'Added' : 'Add to plan'}
                      >
                        {isAdded ? <Check size={14} /> : <Plus size={14} />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-1 bg-cream-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sage-400 rounded-full transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-bark-400 py-8">
              No products matching your filters
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
