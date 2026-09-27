/**
 * Nearza — Reusable Input, Textarea, and Select Components
 * Consistent form controls with sky-blue focus accents and accessible labels.
 */

import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    required = false,
    disabled = false,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`w-full rounded-xl border bg-white text-slate-800 placeholder:text-slate-400 text-sm transition-all duration-150 py-2.5 px-3.5 focus:outline-none ${
            Icon ? 'pl-10' : ''
          } ${rightElement ? 'pr-11' : ''} ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20'
              : 'border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/20'
          } ${
            disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : ''
          } ${className}`.trim()}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    required = false,
    disabled = false,
    rows = 4,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        disabled={disabled}
        className={`w-full rounded-xl border bg-white text-slate-800 placeholder:text-slate-400 text-sm transition-all duration-150 py-2.5 px-3.5 focus:outline-none resize-y ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20'
            : 'border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/20'
        } ${
          disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : ''
        } ${className}`.trim()}
        {...props}
      />

      {error ? (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    required = false,
    disabled = false,
    className = '',
    id,
    children,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full rounded-xl border bg-white text-slate-800 text-sm appearance-none transition-all duration-150 py-2.5 pl-3.5 pr-10 focus:outline-none cursor-pointer ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20'
              : 'border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/20'
          } ${
            disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : ''
          } ${className}`.trim()}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
