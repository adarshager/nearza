/**
 * Nearza — Reusable Badge Component
 * Used for status, tags, verified indicators, and category labels.
 */

const VARIANTS = {
  sky: 'bg-sky-50 text-sky-700 border-sky-200/80',
  primary: 'bg-sky-50 text-sky-700 border-sky-200/80',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200/70',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  outline: 'bg-white text-slate-700 border-slate-300',
  solid: 'bg-sky-500 text-white border-transparent',
};

const DOT_COLORS = {
  sky: 'bg-sky-500',
  primary: 'bg-sky-500',
  secondary: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  outline: 'bg-slate-400',
  solid: 'bg-white',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px] font-medium rounded-md gap-1',
  md: 'px-2.5 py-1 text-xs font-semibold rounded-lg gap-1.5',
  lg: 'px-3 py-1.5 text-sm font-semibold rounded-xl gap-2',
};

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;
  const dotColor = DOT_COLORS[variant] || DOT_COLORS.primary;

  return (
    <span
      className={`inline-flex items-center border font-medium select-none ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
