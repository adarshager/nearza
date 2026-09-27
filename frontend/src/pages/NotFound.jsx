/**
 * Nearza — 404 Not Found Page
 * Clean, user-friendly 404 page with navigation actions.
 */

import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="text-center max-w-lg mx-auto bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm"
      >
        {/* Sky-gradient 404 Indicator */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4 border border-sky-100">
          Error 404
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Page Not Found
        </h1>

        <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
          The product, store, or page you are looking for doesn’t exist or might have been relocated.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Home}
            as={Link}
            to="/"
          >
            Return Home
          </Button>
        </div>

        {/* Quick Help */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <Link to="/search" className="flex items-center gap-1.5 hover:text-sky-600 transition-colors">
            <Search className="w-3.5 h-3.5 text-sky-500" />
            <span>Search Catalog</span>
          </Link>
          <span>•</span>
          <Link to="/support" className="hover:text-sky-600 transition-colors">
            Support & Help
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
