import React, { useEffect, useRef } from 'react';

const Modal = ({
  open = false,
  onClose,
  title,
  subtitle,
  size = 'sm',
  children,
  footer,
  icon,
  iconBg = 'bg-surface-container-high',
  iconColor = 'text-on-surface-variant',
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

  if (!open) return null;

  const sizeClass = size === 'md' ? 'w-full max-w-full sm:max-w-md' : 'w-full max-w-full sm:max-w-sm';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className={`${sizeClass} w-full bg-surface rounded-xl shadow-lg border border-outline-variant animate-scaleIn ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-xl">
          {icon && (
            <div className={`w-12 h-12 rounded-full ${iconBg} ${iconColor} flex items-center justify-center mb-md mx-auto`}>
              <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
          )}
          {title && (
            <h3 className={`font-headline-md text-headline-md text-on-surface mb-xs ${icon ? 'text-center' : ''}`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-body-md text-on-surface-variant mb-lg ${icon ? 'text-center' : ''}`}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {footer && (
          <div className="px-xl pb-xl pt-0 flex justify-end gap-md">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
