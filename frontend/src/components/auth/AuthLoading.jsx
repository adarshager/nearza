/**
 * Nearza — Authentication Loading State
 * Rendered when checking session tokens or bootstrapping user auth.
 */

import { motion } from 'framer-motion';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function AuthLoading({ message = 'Authenticating session...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center text-center max-w-xs"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center shadow-md shadow-sky-500/20 mb-4">
          <span className="text-white font-extrabold text-xl">N</span>
        </div>

        <LoadingSpinner size="md" className="mb-3" />

        <p className="text-sm font-semibold text-slate-800">{message}</p>
        <p className="text-xs text-slate-400 mt-1">Verifying encrypted token...</p>
      </motion.div>
    </div>
  );
}

export default AuthLoading;
