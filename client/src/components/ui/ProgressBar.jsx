import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'sm',
  color = 'primary',
  showLabel = false,
  className = '',
  animated = false,
}) => {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';

  const colorClass = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-error',
    secondary: 'bg-secondary',
  }[color] || 'bg-primary';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-end mb-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Progress</span>
          <span className="font-label-md text-label-md font-bold text-primary">{percent}%</span>
        </div>
      )}
      <div className={`${heightClass} w-full bg-surface-container-highest rounded-full overflow-hidden`}>
        <div
          className={`${heightClass} ${colorClass} rounded-full transition-all duration-300 relative overflow-hidden`}
          style={{ width: `${percent}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
