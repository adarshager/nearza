/**
 * Nearza — Forgot & Reset Password Page
 * 2-step password recovery flow using cryptographic tokens.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: request token, 2: enter token & new password
  const [email, setEmail] = useState('');
  const [uidb64, setUidb64] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  const { forgotPassword, resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Step 1: Request reset instructions
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      toast.success(res.message || 'Password reset instructions have been generated.');

      // In dev environment, backend includes uidb64 and token in res.data for easy testing
      if (res.data?.uidb64 && res.data?.token) {
        setUidb64(res.data.uidb64);
        setToken(res.data.token);
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to process reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Confirm password reset with token
  const handleConfirmReset = async (e) => {
    e.preventDefault();

    if (!uidb64.trim() || !token.trim() || !newPassword) {
      toast.warning('Please provide all token and password fields.');
      return;
    }

    if (newPassword.length < 8) {
      toast.warning('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(
        uidb64.trim(),
        token.trim(),
        newPassword,
        newPasswordConfirm
      );
      toast.success(res.message || 'Password has been reset successfully!');
      setResetCompleted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset token invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 sm:p-10 shadow-lg shadow-sky-950/5 border-slate-100">
          {resetCompleted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset Complete</h2>
              <p className="text-xs text-slate-500 mb-6">
                Your password has been securely updated. You can now log in with your new credentials.
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Proceed to Sign In
              </Button>
            </div>
          ) : step === 1 ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Reset Password
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your account email to receive reset instructions
                </p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="name@example.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSubmitting}
                >
                  Send Reset Token
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
                >
                  Already have a reset token? Enter code
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Set New Password
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your token and configure your new secure password
                </p>
              </div>

              <form onSubmit={handleConfirmReset} className="space-y-4">
                <Input
                  label="User Identifier (UID)"
                  placeholder="e.g. MQ or user key"
                  value={uidb64}
                  onChange={(e) => setUidb64(e.target.value)}
                  required
                />

                <Input
                  label="Reset Token"
                  placeholder="Paste reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 8 characters"
                  icon={Lock}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  icon={Lock}
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSubmitting}
                >
                  Update Password
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Back to email entry
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
