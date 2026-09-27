/**
 * Nearza — Fullscreen Loading Page
 * Shown during initial app bootstrapping, route lazy loading, or slow network state transitions.
 */

import { motion } from 'framer-motion';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function LoadingPage({ message = 'Loading Nearza...' }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <span className="text-white font-extrabold text-2xl tracking-tight">N</span>
          </div>
          <div className="absolute -inset-1 bg-sky-400/20 rounded-2xl blur-md -z-10 animate-pulse" />
        </div>

        {/* Spinner */}
        <LoadingSpinner size="md" className="mb-4" />

        <h2 className="text-base font-bold text-slate-800 tracking-tight mb-1">
          {message}
        </h2>
        <p className="text-xs text-slate-400">
          Fetching local prices and nearby merchant inventory...
        </p>
      </motion.div>
    </div>
  );
}

export default LoadingPage;
