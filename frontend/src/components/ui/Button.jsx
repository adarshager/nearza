/**
 * Nearza — Reusable Button Component
 * Follows Nearza Design System: Sky blue primary, light blue secondary, white surfaces.
 */

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-sm hover:shadow-md shadow-sky-500/10 focus-visible:ring-sky-400',
  secondary:
    'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/70 focus-visible:ring-sky-300',
  outline:
    'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-sky-300 hover:text-sky-600 focus-visible:ring-sky-300',
  ghost:
    'bg-transparent hover:bg-sky-50/70 text-slate-600 hover:text-sky-600 focus-visible:ring-sky-200',
  danger:
    'bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:shadow-md shadow-rose-500/10 focus-visible:ring-rose-400',
  white:
    'bg-white hover:bg-slate-50 text-slate-800 shadow-sm border border-slate-100 focus-visible:ring-sky-300',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3.5 py-1.5 text-xs font-medium rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base font-semibold rounded-2xl gap-2.5',
};

export const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon: Icon,
    rightIcon: RightIcon,
    fullWidth = false,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.md;
  const widthStyles = fullWidth ? 'w-full' : '';

  const isButton = Component === 'button';

  return (
    <Component
      ref={ref}
      {...(isButton ? { type, disabled: disabled || isLoading } : {})}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      {children && <span>{children}</span>}

      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </Component>
  );
});

export default Button;
