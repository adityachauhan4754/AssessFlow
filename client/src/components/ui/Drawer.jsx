import React, { useEffect, useRef } from 'react';

const Drawer = ({
  open = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className = '',
}) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && open) onClose?.();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 bg-on-surface/40 z-[60] backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className={`absolute top-0 right-0 h-full w-full max-w-full md:max-w-lg bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${open ? 'translate-x-0' : 'translate-x-full'} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-lg py-xl border-b border-outline-variant flex items-center justify-between shrink-0">
          <div>
            {title && (
              <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
            )}
            {subtitle && (
              <p className="text-label-md text-outline mt-xs">{subtitle}</p>
            )}
          </div>
          <button
            className="p-sm hover:bg-surface-container-high rounded-full transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-lg custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-lg py-lg border-t border-outline-variant bg-surface-container-lowest flex gap-md justify-end shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
