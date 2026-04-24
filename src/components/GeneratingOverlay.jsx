import React from 'react';

export default function GeneratingOverlay({ message = 'Building your plan…' }) {
  return (
    <div
      className="fixed inset-0 z-[70] bg-bark-900/40 backdrop-blur-[2px] flex items-center justify-center px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="bg-white rounded-2xl border border-cream-200 shadow-xl px-8 py-6 max-w-sm w-full text-center">
        <div className="w-10 h-10 border-[3px] border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-bark-700">{message}</p>
        <p className="text-xs text-bark-400 mt-1">Optimizing protein and calories for your goals</p>
      </div>
    </div>
  );
}
