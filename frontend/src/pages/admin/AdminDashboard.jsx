/**
 * Nearza — Complete Administrator Operations & Security Governance Panel
 *
 * Implements:
 * 1. Overview Dashboard: Users, Merchants, Shops, Products, Reports, Reviews, Activity
 * 2. Merchant Verification: Pending, Approved, Rejected, Suspended workflows
 * 3. Product & Category Moderation: Status toggles, category CRUD
 * 4. User Reports: Incorrect Price, Wrong Stock, Fake Shop, Inappropriate Content, Other
 * 5. Review Moderation: Approve, Unapprove, Delete reviews
 * 6. User Management: Block, Unblock, Role inspection
 * 7. Immutable Admin Action Audit Trail: All actions logged with timestamp and admin credentials
 *
 * Design: White + sky-blue aesthetic with server-side RBAC enforcement.
 */

import { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Users,
  Store,
  Package,
  AlertTriangle,
  MessageSquare,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ShieldAlert,
  UserX,
  UserCheck,
  Tag,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  MERCHANT_STATUS,
  MERCHANT_STATUS_LABELS,
  normalizeMerchantStatus,
} from '../../constants/merchantStatus';
import { adminService } from '../../services/admin';

export function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'merchants' | 'products' | 'categories' | 'reports' | 'reviews' | 'users' | 'audit'

  // Loading states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Tab Data States
  // Merchant Pipeline (Single Authoritative Source of Truth)
  const [merchants, setMerchants] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(MERCHANT_STATUS.ALL);
  const [merchantSearch, setMerchantSearch] = useState('');
  const [merchantSearchInput, setMerchantSearchInput] = useState('');
  const [merchantPage, setMerchantPage] = useState(1);
  const [merchantPageSize] = useState(10);
  const [merchantTotalCount, setMerchantTotalCount] = useState(0);
  const [merchantTotalPages, setMerchantTotalPages] = useState(1);
  const [merchantCounts, setMerchantCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [merchantsError, setMerchantsError] = useState(null);
  const [verifyingShopId, setVerifyingShopId] = useState(null);

  // Stale-response & Race condition protection
  const merchantRequestSeq = useRef(0);
  const merchantAbortController = useRef(null);

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportReasonFilter, setReportReasonFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');
  const [loadingReports, setLoadingReports] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Load Dashboard Stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load administrative overview statistics.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Loaders
  const loadMerchants = async ({
    status = verificationStatus,
    search = merchantSearch,
    page = merchantPage,
  } = {}) => {
    // 1. Abort previous in-flight request
    if (merchantAbortController.current) {
      merchantAbortController.current.abort();
    }
    const controller = new AbortController();
    merchantAbortController.current = controller;

    // 2. Increment sequence token
    const currentSeq = ++merchantRequestSeq.current;

    // 3. Update loading/error state
    setLoadingMerchants(true);
    setMerchantsError(null);

    try {
      const canonicalStatus = normalizeMerchantStatus(status);
      const params = {
        page,
        page_size: merchantPageSize,
      };
      if (canonicalStatus !== MERCHANT_STATUS.ALL) {
        params.status = canonicalStatus;
      }
      if (search && search.trim()) {
        params.q = search.trim();
      }

      const res = await adminService.getMerchants(params, { signal: controller.signal });

      // 4. Stale-response guard: only commit if this request is still the active one
      if (currentSeq === merchantRequestSeq.current) {
        setMerchants(res.results || []);
        setMerchantTotalCount(res.count ?? (res.results?.length || 0));
        setMerchantTotalPages(res.total_pages || 1);
        setMerchantPage(res.current_page || page || 1);
        if (res.counts) {
          setMerchantCounts(res.counts);
        }
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.message === 'canceled') {
        return; // Superseded by a newer request
      }
      if (currentSeq === merchantRequestSeq.current) {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          'Could not load merchant verification queue.';
        setMerchantsError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      if (currentSeq === merchantRequestSeq.current) {
        setLoadingMerchants(false);
      }
    }
  };

  const handleFilterChange = (newStatus) => {
    const canonical = normalizeMerchantStatus(newStatus);
    setVerificationStatus(canonical);
    setMerchantPage(1); // RESET PAGINATION TO PAGE 1
    loadMerchants({ status: canonical, search: merchantSearch, page: 1 });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = merchantSearchInput.trim();
    setMerchantSearch(query);
    setMerchantPage(1); // RESET PAGINATION TO PAGE 1
    loadMerchants({ status: verificationStatus, search: query, page: 1 });
  };

  const handleSearchClear = () => {
    setMerchantSearchInput('');
    setMerchantSearch('');
    setMerchantPage(1);
    loadMerchants({ status: verificationStatus, search: '', page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > merchantTotalPages || newPage === merchantPage) return;
    setMerchantPage(newPage);
    loadMerchants({ status: verificationStatus, search: merchantSearch, page: newPage });
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = {};
      if (productSearch.trim()) params.q = productSearch.trim();
      const res = await adminService.getProducts(params);
      setProducts(res.results || []);
    } catch {
      toast.error('Could not load product catalog.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await adminService.getCategories();
      setCategories(res.results || []);
    } catch {
      toast.error('Could not load categories.');
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const params = {};
      if (reportStatusFilter !== 'all') params.status = reportStatusFilter;
      if (reportReasonFilter !== 'all') params.reason = reportReasonFilter;
      const res = await adminService.getReports(params);
      setReports(res.results || []);
    } catch {
      toast.error('Could not load user reports.');
    } finally {
      setLoadingReports(false);
    }
  };

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const params = {};
      if (reviewFilter === 'approved') params.is_approved = 'true';
      if (reviewFilter === 'unapproved') params.is_approved = 'false';
      const res = await adminService.getReviews(params);
      setReviews(res.results || []);
    } catch {
      toast.error('Could not load customer reviews.');
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userSearch.trim()) params.q = userSearch.trim();
      const res = await adminService.getUsers(params);
      setUsersList(res.results || []);
    } catch {
      toast.error('Could not load user directory.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await adminService.getAuditLogs();
      setAuditLogs(res.results || []);
    } catch {
      toast.error('Could not load immutable audit trail.');
    } finally {
      setLoadingAudit(false);
    }
  };

  // Tab change triggers
  useEffect(() => {
    if (activeTab === 'merchants') {
      loadMerchants({ status: verificationStatus, search: merchantSearch, page: merchantPage });
    }
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'reviews') loadReviews();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab]);

  // Actions
  const handleVerifyMerchant = async (shopId, newStatus) => {
    if (verifyingShopId) return; // Prevent double-clicks
    const promptMsg =
      newStatus === 'approved'
        ? 'Approve this merchant? (Optional review notes):'
        : newStatus === 'rejected'
        ? 'Reject this merchant? (Reason/Notes):'
        : 'Suspend this merchant? (Reason/Notes):';
    const notes = prompt(promptMsg);
    if (notes === null) return; // User cancelled prompt

    setVerifyingShopId(shopId);
    try {
      const res = await adminService.verifyMerchant(shopId, {
        status: newStatus,
        notes: notes.trim() || `Status updated to ${newStatus} by admin`,
      });
      toast.success(res.message);
      // Reload current filtered dataset and counts
      loadMerchants({ status: verificationStatus, search: merchantSearch, page: merchantPage });
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.detail || 'Verification update failed.');
    } finally {
      setVerifyingShopId(null);
    }
  };

  const handleToggleProduct = async (productId) => {
    try {
      const res = await adminService.toggleProductActive(productId);
      toast.success(res.message);
      loadProducts();
      fetchStats();
    } catch {
      toast.error('Failed to toggle product status.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await adminService.createCategory({
        name: newCategoryName.trim(),
        slug: newCategorySlug.trim() || newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
      });
      toast.success('Category created successfully.');
      setNewCategoryName('');
      setNewCategorySlug('');
      setShowCategoryModal(false);
      loadCategories();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.name?.[0] || 'Category creation failed.');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await adminService.deleteCategory(catId);
      toast.success(`Category "${catName}" deleted.`);
      loadCategories();
      fetchStats();
    } catch {
      toast.error('Failed to delete category.');
    }
  };

  const handleResolveReport = async (reportId, newStatus) => {
    const notes = prompt('Enter resolution notes for reporter:') || 'Reviewed and resolved by administration.';
    try {
      const res = await adminService.resolveReport(reportId, {
        status: newStatus,
        resolution_notes: notes,
      });
      toast.success(res.message);
      loadReports();
      fetchStats();
    } catch {
      toast.error('Failed to resolve report.');
    }
  };

  const handleModerateReview = async (reviewId, isApproved) => {
    try {
      const res = await adminService.moderateReview(reviewId, { is_approved: isApproved });
      toast.success(res.message);
      loadReviews();
      fetchStats();
    } catch {
      toast.error('Review moderation failed.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to permanently delete this inappropriate review?')) return;
    try {
      await adminService.deleteReview(reviewId);
      toast.success('Inappropriate review deleted.');
      loadReviews();
      fetchStats();
    } catch {
      toast.error('Failed to delete review.');
    }
  };

  const handleToggleUserActive = async (targetUserId, currentActive) => {
    const actionName = currentActive ? 'suspend' : 'reactivate';
    if (!confirm(`Are you sure you want to ${actionName} this user account?`)) return;
    try {
      const res = await adminService.toggleUserActive(targetUserId);
      toast.success(res.message);
      loadUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.');
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'merchants', label: 'Merchant Verification', icon: Store, badge: stats?.merchants?.pending_verification },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'categories', label: 'Categories', icon: Tag },
    { key: 'reports', label: 'Reports', icon: AlertTriangle, badge: stats?.reports?.pending },
    { key: 'reviews', label: 'Reviews', icon: MessageSquare, badge: stats?.reviews?.unapproved },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'audit', label: 'Audit Trail', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-800">
      {/* Top Admin Header */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Nearza System Governance & Moderation
                  </h1>
                  <Badge variant="sky" size="sm" className="font-extrabold uppercase">
                    Admin Guard
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Logged in as <span className="font-semibold text-sky-700">{user?.email}</span> (Server-side RBAC Verified)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchStats();
                  if (activeTab === 'merchants') loadMerchants();
                  if (activeTab === 'products') loadProducts();
                  if (activeTab === 'reports') loadReports();
                  if (activeTab === 'reviews') loadReviews();
                  if (activeTab === 'users') loadUsers();
                  if (activeTab === 'audit') loadAuditLogs();
                }}
              >
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge != null && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================= */}
        {/* 1. OVERVIEW DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Users KPI */}
              <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Users
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats?.users?.total ?? 0}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="text-emerald-700 font-semibold">{stats?.users?.active ?? 0} active</span>
                    <span>•</span>
                    <span>{stats?.users?.merchants ?? 0} merchants</span>
                  </div>
                </div>
              </Card>

              {/* Merchants & Shops KPI */}
              <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Local Shops
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats?.shops?.total ?? 0}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                      {stats?.merchants?.pending_verification ?? 0} pending review
                    </span>
                  </div>
                </div>
              </Card>

              {/* Products KPI */}
              <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Catalog Items
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {stats?.products?.total ?? 0}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="text-emerald-700 font-semibold">{stats?.products?.active ?? 0} active</span>
                    <span>•</span>
                    <span>{stats?.products?.categories ?? 0} categories</span>
                  </div>
                </div>
              </Card>

              {/* Reports KPI */}
              <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Flagged Reports
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-rose-600 tracking-tight">
                    {stats?.reports?.pending ?? 0}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>{stats?.reports?.resolved ?? 0} resolved</span>
                    <span>•</span>
                    <span>{stats?.reviews?.unapproved ?? 0} unapproved reviews</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Moderation Queue Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Verification Queue Summary */}
              <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-sky-600" />
                    Merchant Verification Status
                  </h3>
                  <button
                    onClick={() => setActiveTab('merchants')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                  >
                    Open Queue →
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <button
                    onClick={() => {
                      setVerificationStatus(MERCHANT_STATUS.PENDING);
                      setMerchantPage(1);
                      setActiveTab('merchants');
                      loadMerchants({ status: MERCHANT_STATUS.PENDING, page: 1 });
                    }}
                    className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl text-center transition-colors cursor-pointer"
                  >
                    <span className="text-lg font-black text-amber-900">
                      {stats?.merchants?.pending_verification ?? 0}
                    </span>
                    <p className="text-[11px] font-bold text-amber-700">Pending</p>
                  </button>
                  <button
                    onClick={() => {
                      setVerificationStatus(MERCHANT_STATUS.APPROVED);
                      setMerchantPage(1);
                      setActiveTab('merchants');
                      loadMerchants({ status: MERCHANT_STATUS.APPROVED, page: 1 });
                    }}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-center transition-colors cursor-pointer"
                  >
                    <span className="text-lg font-black text-emerald-900">
                      {stats?.merchants?.approved ?? 0}
                    </span>
                    <p className="text-[11px] font-bold text-emerald-700">Approved</p>
                  </button>
                  <button
                    onClick={() => {
                      setVerificationStatus(MERCHANT_STATUS.REJECTED);
                      setMerchantPage(1);
                      setActiveTab('merchants');
                      loadMerchants({ status: MERCHANT_STATUS.REJECTED, page: 1 });
                    }}
                    className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl text-center transition-colors cursor-pointer"
                  >
                    <span className="text-lg font-black text-rose-900">
                      {stats?.merchants?.rejected ?? 0}
                    </span>
                    <p className="text-[11px] font-bold text-rose-700">Rejected</p>
                  </button>
                  <button
                    onClick={() => {
                      setVerificationStatus(MERCHANT_STATUS.SUSPENDED);
                      setMerchantPage(1);
                      setActiveTab('merchants');
                      loadMerchants({ status: MERCHANT_STATUS.SUSPENDED, page: 1 });
                    }}
                    className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-center transition-colors cursor-pointer"
                  >
                    <span className="text-lg font-black text-slate-800">
                      {stats?.merchants?.suspended ?? 0}
                    </span>
                    <p className="text-[11px] font-bold text-slate-600">Suspended</p>
                  </button>
                </div>
              </Card>

              {/* Security Audit Trail Snippet */}
              <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sky-600" />
                    Recent Audited Admin Actions
                  </h3>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                  >
                    View All Logs →
                  </button>
                </div>

                <div className="space-y-2">
                  {stats?.activity && stats.activity.length > 0 ? (
                    stats.activity.slice(0, 4).map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-bold text-slate-800">
                            {act.action_type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-slate-500 ml-1">
                            on {act.target_type} by {act.admin_email}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No recent actions recorded.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. MERCHANT VERIFICATION */}
        {/* ========================================================= */}
        {activeTab === 'merchants' && (
          <div className="space-y-6">
            <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Merchant Verification Pipeline
                    </h2>
                    <button
                      onClick={() => {
                        loadMerchants({ status: verificationStatus, search: merchantSearch, page: merchantPage });
                        fetchStats();
                      }}
                      disabled={loadingMerchants}
                      title="Refresh merchant queue"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingMerchants ? 'animate-spin text-sky-600' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Review, approve, or suspend local physical shops with live status synchronization
                  </p>
                </div>

                {/* Filter Pills with Independent Real-Time Counts */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { key: MERCHANT_STATUS.ALL, label: 'All', count: merchantCounts.all },
                    { key: MERCHANT_STATUS.PENDING, label: 'Pending', count: merchantCounts.pending },
                    { key: MERCHANT_STATUS.APPROVED, label: 'Approved', count: merchantCounts.approved },
                    { key: MERCHANT_STATUS.REJECTED, label: 'Rejected', count: merchantCounts.rejected },
                    { key: MERCHANT_STATUS.SUSPENDED, label: 'Suspended', count: merchantCounts.suspended },
                  ].map((tab) => {
                    const isActive = verificationStatus === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => handleFilterChange(tab.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-sky-500 text-white shadow-xs ring-2 ring-sky-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive
                              ? 'bg-white/25 text-white'
                              : 'bg-slate-200/80 text-slate-700'
                          }`}
                        >
                          {tab.count ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Bar & Active Filter Bar */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80 flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search shop, city, phone, email..."
                    value={merchantSearchInput}
                    onChange={(e) => setMerchantSearchInput(e.target.value)}
                    className="w-full pl-9 pr-16 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                  {merchantSearchInput && (
                    <button
                      type="button"
                      onClick={handleSearchClear}
                      className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-sky-500 text-white text-[11px] font-bold hover:bg-sky-600 transition-colors"
                  >
                    Find
                  </button>
                </form>

                <div className="text-xs text-slate-500 flex items-center gap-2 self-end sm:self-center">
                  <span>Filtered: <strong className="text-slate-800 capitalize">{verificationStatus}</strong></span>
                  {merchantSearch && (
                    <>
                      <span>•</span>
                      <span>Query: <strong className="text-slate-800">"{merchantSearch}"</strong></span>
                      <button
                        onClick={handleSearchClear}
                        className="text-xs text-rose-600 hover:underline font-medium ml-1"
                      >
                        Reset search
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* 1. Loading State */}
            {loadingMerchants ? (
              <div className="space-y-3">
                <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-600">Loading {verificationStatus} merchants...</p>
                  <p className="text-[11px] text-slate-400 mt-1">Applying real-time query filters</p>
                </div>
              </div>
            ) : merchantsError ? (
              /* 2. Error State (Never confuse API error with empty state!) */
              <Card className="p-8 text-center bg-rose-50/50 border border-rose-200 rounded-2xl">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-rose-900 mb-1">Failed to Load Merchants</h4>
                <p className="text-xs text-rose-700 max-w-md mx-auto mb-4">{merchantsError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadMerchants({ status: verificationStatus, search: merchantSearch, page: merchantPage })}
                  className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retry Request
                </Button>
              </Card>
            ) : merchants.length === 0 ? (
              /* 3. Empty State (Only when query truly returned 0 matching results) */
              <Card className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800 mb-1">No Merchants Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  {merchantSearch
                    ? `No merchants matching "${merchantSearch}" with status "${verificationStatus}".`
                    : `There are currently no merchants with status "${verificationStatus}".`}
                </p>
                {(merchantSearch || verificationStatus !== MERCHANT_STATUS.ALL) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSearchClear();
                      handleFilterChange(MERCHANT_STATUS.ALL);
                    }}
                  >
                    View All Merchants
                  </Button>
                )}
              </Card>
            ) : (
              /* 4. Success State with Merchant Data */
              <div className="space-y-4">
                <div className="space-y-3">
                  {merchants.map((shop) => {
                    const isVerifying = verifyingShopId === shop.id;
                    return (
                      <Card
                        key={shop.id}
                        className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-base font-bold text-slate-900">{shop.name}</span>
                            <Badge
                              variant={
                                shop.verification_status === 'approved'
                                  ? 'success'
                                  : shop.verification_status === 'pending'
                                  ? 'warning'
                                  : shop.verification_status === 'suspended'
                                  ? 'secondary'
                                  : 'danger'
                              }
                              size="sm"
                              className="capitalize font-bold"
                            >
                              {shop.verification_status}
                            </Badge>
                            {shop.is_active ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                Active Store
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                Inactive Store
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 truncate mb-2">
                            {shop.address}, {shop.city} • PIN: {shop.pincode}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                            <span>Owner: <strong className="text-slate-800">{shop.merchant?.full_name || shop.merchant?.email}</strong></span>
                            <span>•</span>
                            <span>Phone: <strong className="text-slate-800">{shop.phone}</strong></span>
                            <span>•</span>
                            <span>Products: <strong>{shop.products_count ?? 0}</strong></span>
                            {shop.whatsapp_number && (
                              <>
                                <span>•</span>
                                <span>WhatsApp: <strong>{shop.whatsapp_number}</strong></span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action buttons with double-click protection */}
                        <div className="flex items-center gap-2 shrink-0">
                          {shop.verification_status !== 'approved' && (
                            <button
                              disabled={!!verifyingShopId}
                              onClick={() => handleVerifyMerchant(shop.id, 'approved')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                            >
                              {isVerifying ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              Approve
                            </button>
                          )}

                          {shop.verification_status !== 'rejected' && (
                            <button
                              disabled={!!verifyingShopId}
                              onClick={() => handleVerifyMerchant(shop.id, 'rejected')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                            >
                              {isVerifying ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              Reject
                            </button>
                          )}

                          {shop.verification_status !== 'suspended' && (
                            <button
                              disabled={!!verifyingShopId}
                              onClick={() => handleVerifyMerchant(shop.id, 'suspended')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                            >
                              {isVerifying ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5" />
                              )}
                              Suspend
                            </button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {merchantTotalCount > 0 && (
                  <Card className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">
                      Showing{' '}
                      <strong className="text-slate-800">
                        {Math.min((merchantPage - 1) * merchantPageSize + 1, merchantTotalCount)}
                      </strong>{' '}
                      to{' '}
                      <strong className="text-slate-800">
                        {Math.min(merchantPage * merchantPageSize, merchantTotalCount)}
                      </strong>{' '}
                      of <strong className="text-slate-800">{merchantTotalCount}</strong> merchants
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={merchantPage <= 1 || loadingMerchants}
                        onClick={() => handlePageChange(merchantPage - 1)}
                        className="h-8 px-2.5 text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        Previous
                      </Button>

                      <span className="px-3 py-1 font-bold text-slate-700 bg-slate-100 rounded-lg">
                        {merchantPage} / {merchantTotalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={merchantPage >= merchantTotalPages || loadingMerchants}
                        onClick={() => handlePageChange(merchantPage + 1)}
                        className="h-8 px-2.5 text-xs"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. PRODUCT MODERATION */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Product Catalog Moderation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enable or disable items from appearing in customer search
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800"
                  />
                </div>
              </div>
            </Card>

            {loadingProducts ? (
              <div className="p-16 text-center">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading products...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((prod) => (
                  <Card
                    key={prod.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden p-1">
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{prod.name}</h4>
                          <Badge variant={prod.is_active ? 'success' : 'secondary'} size="sm">
                            {prod.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          {prod.category_name} • {prod.brand || 'General'} • {prod.shops_count} shops stocking
                        </p>
                      </div>
                    </div>

                    <Button
                      variant={prod.is_active ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleProduct(prod.id)}
                    >
                      {prod.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. CATEGORIES MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Department Categories</h2>
                <p className="text-xs text-slate-500">Add, edit, or remove store departments</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCategoryModal(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Category
              </Button>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                    <p className="text-xs text-slate-400">{cat.slug} • {cat.products_count} items</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>

            {/* Add Category Modal */}
            {showCategoryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                <Card className="max-w-md w-full bg-white p-6 rounded-3xl shadow-2xl border border-sky-100">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Add Department Category</h3>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Category Name</label>
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Organic Dairy"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Slug (optional)</label>
                      <input
                        type="text"
                        value={newCategorySlug}
                        onChange={(e) => setNewCategorySlug(e.target.value)}
                        placeholder="e.g. organic-dairy"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button variant="ghost" size="sm" type="button" onClick={() => setShowCategoryModal(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" type="submit">
                        Create Category
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. REPORTS MODERATION */}
        {/* ========================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">User Report Moderation</h2>
                  <p className="text-xs text-slate-500">
                    Resolve complaints regarding incorrect price, wrong stock, fake shop, or inappropriate content
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={reportReasonFilter}
                    onChange={(e) => {
                      setReportReasonFilter(e.target.value);
                      loadReports();
                    }}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white"
                  >
                    <option value="all">All Reasons</option>
                    <option value="incorrect_price">Incorrect Price</option>
                    <option value="wrong_stock">Wrong Stock</option>
                    <option value="fake_shop">Fake Shop</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="other">Other</option>
                  </select>

                  <select
                    value={reportStatusFilter}
                    onChange={(e) => {
                      setReportStatusFilter(e.target.value);
                      loadReports();
                    }}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>
            </Card>

            {loadingReports ? (
              <div className="p-16 text-center">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <Card className="p-12 text-center bg-white border-slate-200/80">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">No active reports</h4>
                <p className="text-xs text-slate-400 mt-1">All user complaints have been addressed.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <Card
                    key={rep.id}
                    className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                            {rep.reason.replace(/_/g, ' ')}
                          </span>
                          <Badge
                            variant={
                              rep.status === 'resolved'
                                ? 'success'
                                : rep.status === 'pending'
                                ? 'danger'
                                : 'secondary'
                            }
                            size="sm"
                            className="capitalize"
                          >
                            {rep.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                          {rep.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>Reported by: <strong>{rep.reporter_email}</strong></span>
                          <span>•</span>
                          <span>Target: {rep.report_type} ({rep.target_id.slice(0, 8)})</span>
                          <span>•</span>
                          <span>{new Date(rep.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {rep.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleResolveReport(rep.id, 'resolved')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                          >
                            Mark Resolved
                          </button>
                          <button
                            onClick={() => handleResolveReport(rep.id, 'dismissed')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. REVIEWS MODERATION */}
        {/* ========================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Customer Review Moderation</h2>
                <p className="text-xs text-slate-500">Audit customer reviews and remove inappropriate content</p>
              </div>

              <select
                value={reviewFilter}
                onChange={(e) => {
                  setReviewFilter(e.target.value);
                  loadReviews();
                }}
                className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white"
              >
                <option value="all">All Reviews</option>
                <option value="approved">Approved</option>
                <option value="unapproved">Pending Moderation</option>
              </select>
            </Card>

            {loadingReviews ? (
              <div className="p-16 text-center">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <Card className="p-12 text-center bg-white border-slate-200/80">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">No reviews found</h4>
              </Card>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <Card
                    key={rev.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">
                          ★ {rev.rating}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{rev.shop_name}</span>
                        <Badge variant={rev.is_approved ? 'success' : 'warning'} size="sm">
                          {rev.is_approved ? 'Approved' : 'Unapproved'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-700 italic">"{rev.comment || 'No comment text'}"</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        By {rev.user_name || rev.user_email} • {new Date(rev.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant={rev.is_approved ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleModerateReview(rev.id, !rev.is_approved)}
                      >
                        {rev.is_approved ? 'Unapprove' : 'Approve'}
                      </Button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete inappropriate review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. USER MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">User Account Administration</h2>
                  <p className="text-xs text-slate-500">Manage user status, inspect roles, and suspend fraudulent accounts</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      loadUsers();
                    }}
                    className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="merchant">Merchants</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>
              </div>
            </Card>

            {loadingUsers ? (
              <div className="p-16 text-center">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading user records...</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {usersList.map((usr) => {
                  const isCurrentAdmin = usr.id === user?.id;
                  return (
                    <Card
                      key={usr.id}
                      className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {usr.full_name || usr.email}
                          </span>
                          <Badge
                            variant={
                              usr.role === 'admin'
                                ? 'danger'
                                : usr.role === 'merchant'
                                ? 'sky'
                                : 'secondary'
                            }
                            size="sm"
                            className="capitalize"
                          >
                            {usr.role}
                          </Badge>
                          <Badge variant={usr.is_active ? 'success' : 'danger'} size="sm">
                            {usr.is_active ? 'Active' : 'Suspended'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{usr.email}</p>
                      </div>

                      {!isCurrentAdmin ? (
                        <Button
                          variant={usr.is_active ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleUserActive(usr.id, usr.is_active)}
                        >
                          {usr.is_active ? 'Suspend Account' : 'Reactivate'}
                        </Button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400">Current Session</span>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. IMMUTABLE AUDIT TRAIL */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <Card className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Administrative Action Audit Log</h2>
                  <p className="text-xs text-slate-500">
                    Immutable security record of all verification, moderation, and suspension events
                  </p>
                </div>
              </div>
            </Card>

            {loadingAudit ? (
              <div className="p-16 text-center">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading audit records...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <Card className="p-12 text-center bg-white border-slate-200/80">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">No audit logs found</h4>
              </Card>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <Card
                    key={log.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-slate-900 bg-sky-50 text-sky-800 px-2 py-0.5 rounded-md uppercase">
                          {log.action_type.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold text-slate-700">Target: {log.target_type}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({log.target_id.slice(0, 8)})</span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate">
                        By <strong className="text-slate-700">{log.admin_email}</strong> • Details: {JSON.stringify(log.details)}
                      </p>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
