/**
 * Nearza — Reusable Loading Spinner Component
 */

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-sky-100 border-t-sky-500 shrink-0 ${selectedSize} ${className}`.trim()}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default LoadingSpinner;
