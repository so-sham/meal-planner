import React, { useState, useMemo, useRef, useEffect } from 'react';
import usePlanStore from '../store/usePlanStore';
import { X, Bookmark, Tag } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function buildSuggestedName(planViewMode, activePlan, prefs) {
  const dayName = DAY_NAMES[new Date().getDay()];
  const cal = prefs.calorieTarget || 1800;
  const prefix = planViewMode === 'week' ? 'Weekly' : dayName;
  return `${prefix} ${cal}cal Plan`;
}

function buildAutoTags(planViewMode, activePlan, prefs) {
  const tags = new Set();

  if (prefs.dietType) tags.add(prefs.dietType);

  const calRange = prefs.calorieTarget <= 1500 ? 'low-cal' : prefs.calorieTarget <= 2000 ? 'moderate-cal' : 'high-cal';
  tags.add(calRange);

  const protRange = prefs.proteinTarget <= 80 ? 'low-protein' : prefs.proteinTarget <= 130 ? 'moderate-protein' : 'high-protein';
  tags.add(protRange);

  const meals =
    planViewMode === 'week'
      ? (activePlan.weekly?.days || []).flatMap((d) => d.meals || [])
      : activePlan.daily?.meals || [];

  const cuisines = new Set();
  for (const m of meals) {
    if (m.cuisine && m.cuisine !== 'mixed') cuisines.add(m.cuisine);
  }
  for (const c of cuisines) tags.add(c);

  return [...tags];
}

export default function SavePlanModal({ onClose }) {
  const planViewMode = usePlanStore((s) => s.planViewMode);
  const activePlan = usePlanStore((s) => s.activePlan);
  const userPreferences = usePlanStore((s) => s.userPreferences);
  const savePlan = usePlanStore((s) => s.savePlan);
  const overlayRef = useRef(null);

  const suggestedName = useMemo(
    () => buildSuggestedName(planViewMode, activePlan, userPreferences),
    [planViewMode, activePlan, userPreferences],
  );

  const autoTags = useMemo(
    () => buildAutoTags(planViewMode, activePlan, userPreferences),
    [planViewMode, activePlan, userPreferences],
  );

  const [name, setName] = useState(suggestedName);
  const [tags, setTags] = useState(autoTags);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  function handleSave() {
    const finalName = name.trim() || suggestedName;
    savePlan(finalName, tags, notes.trim());
    onClose();
  }

  const isWeekly = planViewMode === 'week';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-cream-50 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <Bookmark size={20} className="text-sage-500" />
            <h2 className="font-bold text-bark-700 text-lg">Save Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-bark-400 hover:text-bark-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              isWeekly
                ? 'bg-protein-100 text-protein-700 border border-protein-200'
                : 'bg-sage-100 text-sage-700 border border-sage-200'
            }`}>
              {isWeekly ? 'Weekly' : 'Daily'}
            </span>
            <span className="text-[10px] text-bark-400">auto-detected from current view</span>
          </div>

          {/* Plan name */}
          <div>
            <label className="block text-xs font-semibold text-bark-600 mb-1.5">Plan Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={suggestedName}
              className="w-full px-3 py-2.5 text-sm bg-white border border-cream-200 rounded-xl text-bark-700
                placeholder:text-bark-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400 transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-bark-600 mb-1.5">
              <Tag size={12} className="text-bark-400" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-terra-50 text-terra-600 rounded-full border border-terra-200"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-terra-400 hover:text-terra-700 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add custom tag…"
                className="flex-1 px-3 py-2 text-xs bg-white border border-cream-200 rounded-lg text-bark-700
                  placeholder:text-bark-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400 transition-all"
              />
              <button
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="px-3 py-2 text-xs font-semibold bg-sage-100 text-sage-700 rounded-lg border border-sage-200
                  hover:bg-sage-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-bark-600 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this plan…"
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-white border border-cream-200 rounded-xl text-bark-700
                placeholder:text-bark-300 focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-sage-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-cream-200">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-bark-500 bg-cream-100 border border-cream-200
              rounded-xl hover:bg-cream-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-sage-500 rounded-xl
              hover:bg-sage-600 active:scale-[0.98] transition-all shadow-sm"
          >
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}
