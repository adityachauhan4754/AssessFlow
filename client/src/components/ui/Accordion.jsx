import React, { useState, createContext, useContext } from 'react';

const AccordionContext = createContext({ expandedItems: {}, toggle: () => {} });

const Accordion = ({ children, className = '', defaultExpanded = [] }) => {
  const [expandedItems, setExpandedItems] = useState(() => {
    const initial = {};
    defaultExpanded.forEach(id => { initial[id] = true; });
    return initial;
  });

  const toggle = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <AccordionContext.Provider value={{ expandedItems, toggle }}>
      <div className={`space-y-sm ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({
  id,
  label,
  statusIcon,
  statusColor = 'text-primary',
  children,
  className = '',
  borderColor = 'border-primary',
}) => {
  const { expandedItems, toggle } = useContext(AccordionContext);
  const isExpanded = !!expandedItems[id];

  return (
    <div className={`border border-outline-variant rounded-xl overflow-hidden ${className}`}>
      <button
        className="w-full flex items-center justify-between p-md bg-surface-container-low hover:bg-surface-container transition-colors text-left"
        onClick={() => toggle(id)}
      >
        <div className="flex items-center gap-md pr-4">
          {statusIcon && (
            <span className={`material-symbols-outlined text-[20px] ${statusColor}`}>
              {statusIcon}
            </span>
          )}
          <span className="font-label-md text-on-surface line-clamp-1">{label}</span>
        </div>
        <span
          className="material-symbols-outlined transition-transform duration-200 shrink-0"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-outline-variant bg-surface-container-lowest">
          {children}
        </div>
      )}
    </div>
  );
};

export { Accordion, AccordionItem };
export default Accordion;
