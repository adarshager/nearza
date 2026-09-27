/**
 * Nearza — 403 Unauthorized Access Page
 * Shown when an authenticated user attempts to access a route restricted to another role.
 */

import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function UnauthorizedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-lg w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-sm text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-block mb-3">
          <Badge variant="warning" size="sm">
            Access Restricted
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Insufficient Permissions
        </h1>

        <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
          Your current account role (
          <span className="font-semibold text-slate-700 capitalize">
            {user?.role || 'Guest'}
          </span>
          ) does not have authorization to access this management area.
        </p>

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
            Return to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default UnauthorizedPage;
