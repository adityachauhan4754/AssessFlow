import React from 'react';

const Skeleton = ({ variant = 'text', width, height, className = '', count = 1 }) => {
  const baseClass = 'bg-surface-container-highest animate-pulse';

  const variantClasses = {
    text: `${baseClass} h-4 rounded-lg`,
    'text-lg': `${baseClass} h-6 rounded-lg`,
    card: `${baseClass} rounded-xl`,
    'stat-card': `${baseClass} h-[140px] rounded-xl`,
    'table-row': `${baseClass} h-16 rounded-lg`,
    circle: `${baseClass} rounded-full`,
    avatar: `${baseClass} w-10 h-10 rounded-full`,
    button: `${baseClass} h-10 rounded-lg w-24`,
    rectangle: `${baseClass} rounded-xl`,
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`${variantClasses[variant] || variantClasses.text} ${className}`}
          style={{
            width: width || (variant === 'text' ? '100%' : undefined),
            height: height || undefined,
          }}
        />
      ))}
    </>
  );
};

/** Pre-composed skeleton layouts */

const TableRowSkeleton = ({ columns = 4, className = '' }) => (
  <tr className={className}>
    {Array.from({ length: columns }, (_, i) => (
      <td key={i} className="px-lg py-lg">
        <div className="flex items-center gap-md">
          {i === 0 && <Skeleton variant="avatar" />}
          <Skeleton variant="text" width={i === 0 ? '60%' : '80%'} />
        </div>
      </td>
    ))}
  </tr>
);

const StatCardSkeleton = ({ className = '' }) => (
  <div className={`bg-surface p-lg rounded-xl border border-outline-variant ${className}`}>
    <div className="flex justify-between items-start mb-md">
      <Skeleton variant="rectangle" width="40px" height="40px" className="rounded-lg" />
      <Skeleton variant="text" width="60px" />
    </div>
    <Skeleton variant="text" width="70%" className="mb-sm" />
    <Skeleton variant="text-lg" width="40%" />
  </div>
);

const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-surface rounded-xl border border-outline-variant overflow-hidden ${className}`}>
    <div className="p-lg space-y-md">
      <div className="flex justify-between items-start">
        <Skeleton variant="rectangle" width="48px" height="48px" className="rounded-lg" />
        <Skeleton variant="text" width="60px" />
      </div>
      <Skeleton variant="text-lg" width="70%" />
      <Skeleton variant="text" count={2} className="mb-sm" />
      <Skeleton variant="text" width="50%" />
    </div>
    <div className="p-md bg-surface-container-low border-t border-outline-variant flex gap-sm">
      <Skeleton variant="button" className="flex-1" />
      <Skeleton variant="button" className="flex-[1.5]" />
    </div>
  </div>
);

export { Skeleton, TableRowSkeleton, StatCardSkeleton, CardSkeleton };
export default Skeleton;
