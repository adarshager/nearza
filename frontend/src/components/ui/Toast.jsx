/**
 * Nearza — Reusable Toast Item Component
 * Styled toast notification with icons, clear typography, and close button.
 */

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
};

const STYLES = {
  success: 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10',
  error: 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10',
  warning: 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10',
  info: 'bg-white border-sky-200 text-slate-800 shadow-sky-500/10',
};

export function Toast({ id, type = 'info', message, title, onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg ${
        STYLES[type] || STYLES.info
      }`}
    >
      <div className="mt-0.5">{ICONS[type] || ICONS.info}</div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-bold text-slate-900 leading-snug">{title}</h4>
        )}
        <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{message}</p>
      </div>

      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="p-1 -mr-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

export default Toast;
