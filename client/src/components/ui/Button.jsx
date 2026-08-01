import React from 'react';

const baseClasses = 'inline-flex items-center justify-center gap-sm font-label-md text-label-md rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses = {
  primary: 'bg-primary-container text-on-primary-container hover:shadow-lg active:scale-95',
  'primary-emphasis': 'bg-primary text-on-primary hover:shadow-md active:scale-95',
  secondary: 'bg-surface border border-outline-variant text-on-surface hover:bg-primary-container hover:text-on-primary-container hover:border-primary active:scale-95',
  destructive: 'bg-error text-on-error hover:opacity-90 active:scale-95',
  'destructive-outline': 'bg-surface border border-outline-variant text-on-surface hover:text-error hover:border-error active:scale-95',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container-high active:scale-95',
  icon: 'bg-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full active:scale-95',
};

const sizeClasses = {
  sm: 'px-md py-xs text-[13px]',
  md: 'px-lg py-sm',
  lg: 'px-xl py-md text-[16px]',
  icon: 'p-sm',
};

const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  icon,
  iconRight,
  as: Component = 'button',
  ...props
}, ref) => {
  const isIconOnly = variant === 'icon';
  const finalSize = isIconOnly ? 'icon' : size;

  return (
    <Component
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[finalSize]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
      {!loading && iconRight && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </Component>
  );
});

Button.displayName = 'Button';

export default Button;
