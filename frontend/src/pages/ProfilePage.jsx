/**
 * Nearza — User Profile Page
 * Displays verified account information, role badges, profile update form, and password changing.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Save,
  LogOut,
  CheckCircle2,
  Heart,
  History,
  Bell,
  ArrowUpDown,
  MapPin,
  Store,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function ProfilePage() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const toast = useToast();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.warning('Full name cannot be blank.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl.trim(),
      });
      toast.success('Profile details updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.warning('Please enter current and new password.');
      return;
    }

    if (newPassword.length < 8) {
      toast.warning('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword, newPasswordConfirm);
      toast.success('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.old_password?.[0] ||
        'Password change failed.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-12">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal credentials, contact details, and account security
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={
              user?.role === 'admin'
                ? 'danger'
                : user?.role === 'merchant'
                ? 'sky'
                : 'secondary'
            }
            size="md"
            dot
          >
            {user?.role?.toUpperCase()} ACCOUNT
          </Badge>

          <Button
            variant="outline"
            size="sm"
            icon={LogOut}
            onClick={logout}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Overview Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-sky-500/20">
              {user?.full_name?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
            </div>

            <h3 className="text-base font-bold text-slate-900">{user?.full_name}</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs text-left">
              <div className="flex items-center justify-between text-slate-500">
                <span>Account Role:</span>
                <span className="font-semibold text-slate-700 capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Status:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Security:</span>
                <span className="font-semibold text-sky-600">JWT Verified</span>
              </div>
            </div>
          </Card>

          {/* Customer Hub Shortcuts */}
          <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2">
              Customer Hub
            </h4>
            <div className="space-y-1">
              <Link
                to="/favorites"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Saved Favorites
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/history"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-sky-600" />
                  Search History
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/notifications"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-sky-600" />
                  Notifications & Deals
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/compare"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <ArrowUpDown className="w-4 h-4 text-sky-600" />
                  Price Comparison
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/nearby"
                className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  Nearby Discovery
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              {user?.role === 'merchant' && (
                <Link
                  to="/merchant/dashboard"
                  className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-sky-800 bg-sky-50/80 hover:bg-sky-100 transition-colors mt-2"
                >
                  <span className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-sky-600" />
                    Merchant Portal
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
                </Link>
              )}
            </div>
          </Card>

          <Card variant="secondary" className="p-5 border-sky-100/80 bg-sky-50/60">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-0.5">
                  Server-Enforced RBAC
                </span>
                Roles cannot be altered through client-side forms. Backend permission checks strictly enforce authorization on every API transaction.
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  icon={Mail}
                  helperText="Email address is tied to your primary identity and cannot be changed directly."
                />

                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={User}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                />

                <Input
                  label="Avatar URL (Optional)"
                  type="url"
                  placeholder="https://images.example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isUpdatingProfile}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="outline"
                    size="md"
                    isLoading={isChangingPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
