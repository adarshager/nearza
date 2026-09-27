/**
 * Nearza — Generic Error Page
 * Displayed when an unhandled application error occurs.
 */

import { motion } from 'framer-motion';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ErrorPage({
  error,
  resetErrorBoundary,
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred while rendering this view. Please try refreshing the page.',
}) {
  const isDev = import.meta.env.DEV;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-lg w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-sm text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-6">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          {title}
        </h1>

        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Development Error Details */}
        {isDev && error && (
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left overflow-x-auto text-xs text-rose-600 font-mono">
            <p className="font-bold mb-1">{error.toString()}</p>
            {error.stack && (
              <pre className="text-[11px] text-slate-500 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={() => {
              if (resetErrorBoundary) {
                resetErrorBoundary();
              } else {
                window.location.reload();
              }
            }}
          >
            Try Again
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Home}
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Go to Homepage
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default ErrorPage;
