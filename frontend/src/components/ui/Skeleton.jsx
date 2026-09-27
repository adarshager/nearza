/**
 * Nearza — Reusable Skeleton Loading Components
 * Animated shimmering placeholders for loading states.
 */

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`.trim()}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`.trim()}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${
            i === lines - 1 ? 'w-3/5' : i === 0 ? 'w-full' : 'w-4/5'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size] || 'w-10 h-10';

  return (
    <Skeleton className={`rounded-full shrink-0 ${sizeClasses} ${className}`.trim()} />
  );
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <Skeleton className="w-full aspect-square rounded-xl mb-3.5" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3 rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonShopCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-3.5 mb-4">
        <SkeletonAvatar size="lg" className="rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-2/3 rounded-md" />
          <Skeleton className="h-3 w-1/3 rounded-md" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-4/5 rounded-md" />
      </div>
    </div>
  );
}

export default Skeleton;
