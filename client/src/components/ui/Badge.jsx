import React from 'react';

const variantClasses = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-error-container text-on-error-container',
  neutral: 'bg-surface-container-high text-on-surface-variant',
  info: 'bg-primary-fixed text-on-primary-fixed',
  active: 'bg-green-50 text-green-600',
  draft: 'bg-secondary-fixed text-on-secondary-fixed',
};

const Badge = ({ variant = 'neutral', children, className = '', dot = false }) => {
  return (
    <span className={`inline-flex items-center gap-[4px] px-sm py-xs text-[10px] font-bold rounded-sm uppercase tracking-wider ${variantClasses[variant] || variantClasses.neutral} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' || variant === 'active' ? 'bg-green-500' :
          variant === 'warning' ? 'bg-yellow-500' :
          variant === 'error' ? 'bg-error' :
          variant === 'info' ? 'bg-primary' :
          'bg-on-surface-variant'
        }`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
