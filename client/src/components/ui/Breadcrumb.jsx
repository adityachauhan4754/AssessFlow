import React from 'react';

const Breadcrumb = ({ items = [], className = '' }) => {
  return (
    <nav className={`flex items-center gap-xs text-on-surface-variant font-label-sm text-label-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            )}
            {item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ) : item.href && !isLast ? (
              <a href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </a>
            ) : (
              <span className={isLast ? 'text-primary' : ''}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
