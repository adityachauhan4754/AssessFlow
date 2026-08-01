import React from 'react';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  rows,
  options,
  icon,
  ...props
}) => {
  const inputBaseClasses = `w-full bg-surface-container-lowest border rounded-lg p-md font-body-md text-body-md text-on-surface outline-none transition-all
    focus:border-primary focus:ring-1 focus:ring-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-error' : 'border-outline-variant'}
    ${inputClassName}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows || 4}
          className={`${inputBaseClasses} resize-y min-h-[100px]`}
          {...props}
        />
      );
    }

    if (type === 'select') {
      return (
        <div className="relative">
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${inputBaseClasses} pr-8 appearance-none cursor-pointer w-full`}
            {...props}
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
            expand_more
          </span>
        </div>
      );
    }

    return (
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputBaseClasses} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
    );
  };

  return (
    <div className={`mb-md ${className}`}>
      {label && (
        <label htmlFor={name} className="block font-label-md text-label-md text-on-surface mb-xs">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="flex items-center gap-xs mt-xs text-[13px] text-error">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-xs text-[13px] text-on-surface-variant">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;
