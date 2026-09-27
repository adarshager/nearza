/**
 * Nearza — Customer Notifications Page
 * Displays neighborhood deals, local price drop alerts, verified stock restocks, and system notices.
 * Design: White + sky-blue aesthetic.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  TrendingDown,
  PackageCheck,
  Tag,
  Info,
  Trash2,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notifications';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    async function loadNotifs() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await getNotifications();
        setNotifications(res?.results || []);
        setUnreadCount(res?.unread_count || 0);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifs();
  }, [isAuthenticated]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error('Could not mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.info('Notification dismissed');
    } catch {
      toast.error('Could not dismiss notification');
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="w-5 h-5 text-emerald-600" />;
      case 'restock':
        return <PackageCheck className="w-5 h-5 text-sky-600" />;
      case 'deal':
        return <Tag className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-sky-600" />;
    }
  };

  const filteredNotifs = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50/50">
        <Card className="max-w-md w-full bg-white p-8 rounded-3xl text-center shadow-xs border border-sky-100">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Check Notifications</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Sign in to get neighborhood stock updates, flash price cuts from verified nearby stores, and inventory verification alerts.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button variant="primary" as={Link} to="/login" fullWidth>
              Sign In to View Alerts
            </Button>
            <Button variant="ghost" as={Link} to="/" fullWidth>
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-sky-50/60 to-white border-b border-sky-100/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center border border-sky-200/80">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <Badge variant="sky" size="sm" className="font-extrabold">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Stay updated on local deals, price drops, and verified restocks
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-sky-700 border-sky-200 hover:bg-sky-50"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Mark All as Read
              </Button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'unread'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading alerts...</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-16 text-center bg-slate-50/50 rounded-3xl border border-slate-200/60 max-w-md mx-auto">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {filter === 'unread' ? 'No unread alerts' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              When prices change at your saved shops or local stores update stock, you will receive updates here.
            </p>
            <Button variant="primary" as={Link} to="/nearby">
              Explore Nearby Stores
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((notif) => (
              <Card
                key={notif.id}
                className={`bg-white border p-4 sm:p-5 rounded-2xl shadow-xs transition-all flex items-start gap-4 ${
                  !notif.is_read
                    ? 'border-sky-300 bg-sky-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotifIcon(notif.notification_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Dismiss"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs flex-wrap">
                    <span className="text-[11px] text-slate-400">
                      {new Date(notif.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:underline"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark read
                        </button>
                      )}

                      {notif.data?.route && (
                        <Link
                          to={notif.data.route}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
