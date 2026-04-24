import React from 'react';

const COLOR_HEX = {
  sage: '#6B8E55',
  protein: '#4A90D9',
  terra: '#C67C4E',
  amber: '#F59E0B',
};

export default function ProgressRing({
  value,
  max,
  size = 80,
  strokeWidth = 6,
  color = 'sage',
  label,
  unit = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  const dashoffset = circumference * (1 - ratio);
  const strokeColor = COLOR_HEX[color] || COLOR_HEX.sage;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F5F0E8"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-sm font-bold text-bark-700 leading-none">
          {value}{unit}
        </span>
        {label && (
          <span className="text-[9px] text-bark-400 mt-0.5">{label}</span>
        )}
      </div>
    </div>
  );
}
