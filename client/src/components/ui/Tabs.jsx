import React, { useState } from 'react';

const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id || '');
  const currentTab = activeTab ?? internalActive;

  const handleChange = (id) => {
    if (onChange) {
      onChange(id);
    } else {
      setInternalActive(id);
    }
  };

  const activeTabObj = tabs.find(t => t.id === currentTab);

  return (
    <div className={className}>
      <div className="flex border-b border-outline-variant">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleChange(tab.id)}
              className={`px-lg py-sm font-label-md text-label-md transition-colors relative whitespace-nowrap
                ${isActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
                }`}
            >
              <span className="flex items-center gap-sm">
                {tab.icon && (
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                )}
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
      {activeTabObj?.content && (
        <div className="pt-lg">
          {activeTabObj.content}
        </div>
      )}
    </div>
  );
};

export default Tabs;
