import React, { useState } from 'react';
import { buildGroceryList } from '../utils/algorithm';
import { X, Copy, Check, ShoppingCart } from 'lucide-react';

export default function GroceryList({ weekPlan, onClose }) {
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const items = buildGroceryList(weekPlan);

  const toggle = (name) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const copyToClipboard = () => {
    const text = items
      .map(i => `${checkedItems.has(i.name) ? '✅' : '⬜'} ${i.name} (×${i.count})`)
      .join('\n');
    navigator.clipboard.writeText(`🛒 Weekly Grocery List\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="flex items-center justify-between p-4 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-sage-600" />
            <div>
              <h2 className="font-bold text-bark-700 text-lg">Grocery List</h2>
              <p className="text-[10px] text-bark-400">
                {items.length} items · {checkedItems.size} checked
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-sage-50 text-sage-600 rounded-lg hover:bg-sage-100 transition-colors border border-sage-200"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-bark-400 hover:text-bark-600 hover:bg-cream-200 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {items.map(item => {
            const isChecked = checkedItems.has(item.name);
            return (
              <label
                key={item.name}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-sage-50 border border-sage-200'
                    : 'bg-white border border-cream-200 hover:border-sage-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(item.name)}
                  className="w-4 h-4 rounded border-bark-300 text-sage-500 focus:ring-sage-400 accent-sage-500"
                />
                <span
                  className={`flex-1 text-sm ${
                    isChecked ? 'line-through text-bark-400' : 'text-bark-700'
                  }`}
                >
                  {item.name}
                </span>
                <span className="text-[10px] text-bark-400 bg-cream-100 px-1.5 py-0.5 rounded font-medium">
                  ×{item.count}
                </span>
              </label>
            );
          })}
          {items.length === 0 && (
            <p className="text-center text-sm text-bark-400 py-8">
              No ingredients in this plan
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
