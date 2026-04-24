import React from 'react';
import ProgressRing from './ProgressRing';
import { calcDayTotals, getDeviationColor } from '../utils/algorithm';

const DEV_STYLES = {
  green: { dot: 'bg-sage-400', text: 'text-sage-600' },
  yellow: { dot: 'bg-amber-400', text: 'text-amber-600' },
  red: { dot: 'bg-red-400', text: 'text-red-500' },
};

function MacroRing({ color, value, max, label, unit = '', isHighlight }) {
  const dev = getDeviationColor(value, max);
  const s = DEV_STYLES[dev];
  const diff = value - max;
  const sign = diff > 0 ? '+' : '';

  return (
    <div className={`flex flex-col items-center gap-1.5 ${isHighlight ? 'scale-105' : ''}`}>
      <ProgressRing color={color} value={value} max={max} label={label} unit={unit} />
      <div className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        <span className={`text-[10px] font-semibold ${s.text}`}>
          {sign}{diff}{unit} of {max}{unit}
        </span>
      </div>
    </div>
  );
}

export default function MacroRings({ plan, prefs }) {
  const totals = calcDayTotals(plan);
  const carbTarget = Math.round((prefs.calorieTarget * 0.45) / 4);
  const fatTarget = Math.round((prefs.calorieTarget * 0.30) / 9);

  return (
    <div className="bg-white rounded-xl border border-cream-200 shadow-sm p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 justify-items-center">
        <MacroRing color="terra" value={totals.cal} max={prefs.calorieTarget} label="Calories" />
        <MacroRing color="sage" value={totals.protein} max={prefs.proteinTarget} label="Protein" unit="g" isHighlight />
        <MacroRing color="protein" value={totals.carbs} max={carbTarget} label="Carbs" unit="g" />
        <MacroRing color="terra" value={totals.fat} max={fatTarget} label="Fat" unit="g" />
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-bark-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 inline-block" /> Within 10%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> 10–20% off
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> &gt;20% off
        </span>
      </div>
    </div>
  );
}
