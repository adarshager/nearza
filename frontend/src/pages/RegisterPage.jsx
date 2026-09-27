/**
 * Nearza — Register Page
 * Account creation with explicit role selection (Customer vs Merchant) and client validation.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Store, ShoppingBag, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function RegisterPage() {
  const [role, setRole] = useState('customer'); // 'customer' | 'merchant'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      toast.warning('Password must be at least 8 characters long.');
      return;
    }

    if (password !== passwordConfirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        role, // Backend rigorously validates role (only customer/merchant allowed)
        password,
        password_confirm: passwordConfirm,
      };

      const user = await register(payload);
      toast.success(`Account created! Welcome to Nearza, ${user.full_name}.`);

      if (user.role === 'merchant') {
        navigate('/merchant/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.message ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.non_field_errors?.[0] ||
        'Registration failed. Please check the provided information.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg"
      >
        <Card className="p-8 sm:p-10 shadow-lg shadow-sky-950/5 border-slate-100">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-extrabold text-xl">N</span>
              </div>
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Your Nearza Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Join the local price comparison and neighborhood shopping network
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start cursor-pointer ${
                  role === 'customer'
                    ? 'border-sky-500 bg-sky-50/70 text-sky-900 ring-2 ring-sky-400/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Shopper / Customer</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Find nearby deals</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('merchant')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start cursor-pointer ${
                  role === 'merchant'
                    ? 'border-sky-500 bg-sky-50/70 text-sky-900 ring-2 ring-sky-400/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Store Merchant</span>
                <span className="text-[11px] text-slate-400 mt-0.5">List shop & inventory</span>
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name or Store Contact"
              placeholder={role === 'merchant' ? 'John Doe (Store Manager)' : 'John Doe'}
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="e.g. 9876543210"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              helperText="Used for customer-merchant order communication."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                icon={Lock}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSubmitting}
              icon={UserPlus}
              className="mt-3"
            >
              Complete Registration
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-bold text-sky-600 hover:text-sky-700 transition-colors"
            >
              Sign In Instead
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
