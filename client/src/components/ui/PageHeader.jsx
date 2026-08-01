import React from 'react';
import Breadcrumb from './Breadcrumb';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  titleSize = 'xl',
  className = '',
}) => {
  return (
    <div className={`mb-xl ${className}`}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="mb-sm" />
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className={`${titleSize === 'xl' ? 'font-headline-xl text-headline-xl' : 'font-headline-lg text-headline-lg'} text-on-surface`}>
            {title}
          </h1>
          {subtitle && (
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-md shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
