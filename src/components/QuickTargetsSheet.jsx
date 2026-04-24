import React, { useRef, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import FilterPanel from './FilterPanel';

/**
 * Mobile-friendly sheet for editing targets without hunting the sidebar.
 */
export default function QuickTargetsSheet({ prefs, setPrefs, onGenerate, isGenerating, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-targets-title"
    >
      <div className="bg-cream-50 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl sm:animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-cream-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-sage-600" />
            <h2 id="quick-targets-title" className="font-bold text-bark-700 text-lg">
              Targets & preferences
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-bark-400 hover:text-bark-600 rounded-lg"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-bark-400 mb-4">
            Adjust calories and protein, then regenerate. For full diet & cuisine options, use <strong className="text-bark-600">Settings</strong>.
          </p>
          <FilterPanel
            prefs={prefs}
            setPrefs={setPrefs}
            onGenerate={() => {
              onGenerate();
              onClose();
            }}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}
