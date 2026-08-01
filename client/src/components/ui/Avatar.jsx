import React from 'react';

const sizeClasses = {
  sm: 'w-8 h-8 text-[12px]',
  md: 'w-10 h-10 text-[14px]',
  lg: 'w-16 h-16 text-[20px]',
};

const bgVariants = [
  'bg-primary-fixed-dim text-on-primary-fixed',
  'bg-secondary-fixed-dim text-on-secondary-fixed',
  'bg-tertiary-fixed-dim text-on-tertiary-fixed',
  'bg-primary-fixed text-on-primary-fixed',
  'bg-secondary-fixed text-on-secondary-fixed',
];

const Avatar = ({
  src,
  name = '',
  size = 'md',
  className = '',
  colorIndex,
}) => {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Deterministic color based on name
  const bgIdx = colorIndex != null
    ? colorIndex % bgVariants.length
    : (name.charCodeAt(0) || 0) % bgVariants.length;

  if (src) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border border-outline-variant ${className}`}>
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold ${bgVariants[bgIdx]} ${className}`}>
      {initials || '?'}
    </div>
  );
};

export default Avatar;
