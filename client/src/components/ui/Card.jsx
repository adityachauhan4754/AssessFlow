import React from 'react';

const Card = ({ children, className = '', accent = false, elevated = false, onClick, ...props }) => {
  return (
    <div
      className={`bg-surface border border-outline-variant rounded-xl ${elevated ? 'shadow-sm' : ''} ${accent ? 'border-l-4 border-l-primary bg-surface-container-low' : ''} ${onClick ? 'cursor-pointer hover:border-primary transition-all' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const StatCard = ({ icon, iconBg = 'bg-primary-fixed', iconColor = 'text-on-primary-fixed', label, value, tag, tagVariant = 'neutral', className = '' }) => {
  return (
    <Card className={`p-lg ${className}`}>
      <div className="flex justify-between items-start mb-md">
        <div className={`p-sm ${iconBg} rounded-lg ${iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {tag && (
          <span className={`text-label-sm font-label-sm px-sm py-xs rounded-full ${
            tagVariant === 'success' ? 'text-green-600 bg-green-50' :
            tagVariant === 'warning' ? 'text-yellow-600 bg-yellow-50' :
            'text-on-surface-variant bg-surface-container-low'
          }`}>
            {tag}
          </span>
        )}
      </div>
      <p className="text-label-md font-label-md text-on-surface-variant">{label}</p>
      <h3 className="text-headline-xl font-headline-xl text-on-surface">{value}</h3>
    </Card>
  );
};

export { Card, StatCard };
export default Card;
