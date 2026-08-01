import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon = 'inbox',
  title = 'Nothing here yet',
  subtitle,
  actionText,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-xl px-lg text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-lg">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">{title}</h3>
      {subtitle && (
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-lg">{subtitle}</p>
      )}
      {actionText && onAction && (
        <Button variant="primary" icon={actionIcon} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
