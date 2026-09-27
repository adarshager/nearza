/**
 * Nearza — Reusable Card Component
 * Supports standard white cards, light-blue secondary surface cards, and interactive hover states.
 */



export function Card({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  ...props
}) {
  const variantStyles = {
    default: 'bg-white border-slate-100 shadow-sm',
    secondary: 'bg-sky-50/60 border-sky-100/80 shadow-none',
    outline: 'bg-transparent border-slate-200 shadow-none',
    elevated: 'bg-white border-transparent shadow-md hover:shadow-lg',
  }[variant] || 'bg-white border-slate-100 shadow-sm';

  const hoverStyles = hoverable
    ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-sky-200'
    : '';

  return (
    <div
      className={`rounded-2xl border ${variantStyles} ${hoverStyles} overflow-hidden ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pb-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
  return (
    <Component className={`text-lg font-bold text-slate-900 tracking-tight ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm text-slate-500 mt-1 ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pt-0 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`p-5 pt-3 border-t border-slate-100/80 bg-slate-50/40 flex items-center justify-between gap-3 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
