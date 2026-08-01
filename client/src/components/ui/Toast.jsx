import React from 'react';
import toast from 'react-hot-toast';

const iconMap = {
  success: { icon: 'check_circle', borderColor: 'border-l-green-500', iconColor: 'text-green-600' },
  error: { icon: 'error', borderColor: 'border-l-error', iconColor: 'text-error' },
  info: { icon: 'info', borderColor: 'border-l-primary', iconColor: 'text-primary' },
  warning: { icon: 'warning', borderColor: 'border-l-yellow-500', iconColor: 'text-yellow-600' },
};

const CustomToast = ({ t, message, type = 'info' }) => {
  const { icon, borderColor, iconColor } = iconMap[type] || iconMap.info;

  return (
    <div
      className={`max-w-sm w-full bg-surface shadow-lg rounded-lg border border-outline-variant border-l-4 ${borderColor} pointer-events-auto flex items-start gap-md p-md ${
        t.visible ? 'animate-slideInRight' : 'animate-slideOutRight'
      }`}
    >
      <span className={`material-symbols-outlined text-[20px] ${iconColor} shrink-0 mt-0.5`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-label-md text-label-md text-on-surface">{message}</p>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

// Helper functions that replace the old toast service
export const showToast = {
  success: (message) => toast.custom((t) => <CustomToast t={t} message={message} type="success" />, { duration: 4000 }),
  error: (message) => toast.custom((t) => <CustomToast t={t} message={message} type="error" />, { duration: 5000 }),
  info: (message) => toast.custom((t) => <CustomToast t={t} message={message} type="info" />, { duration: 4000 }),
  warning: (message) => toast.custom((t) => <CustomToast t={t} message={message} type="warning" />, { duration: 4500 }),
};

export default CustomToast;
