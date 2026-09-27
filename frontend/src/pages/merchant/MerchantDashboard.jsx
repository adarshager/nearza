/**
 * Nearza — Complete Merchant Dashboard
 * Features:
 * - Real-time KPIs: total products, active products, low-stock, out-of-stock
 * - Engagement analytics: shop views, product views, WhatsApp clicks, Call clicks, Directions clicks
 * - Interactive 14-day conversion & traffic SVG chart
 * - Automated inventory confidence score breakdown (high, medium, low)
 * - Quick action shortcuts & low-stock inventory alerts
 * - Fully responsive with desktop sidebar & mobile dock compatibility
 */

import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Store,
  Eye,
  MessageSquare,
  Phone,
  Navigation,
  AlertTriangle,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats } from '../../services/merchant';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export function MerchantDashboard() {
  const { user } = useAuth();
  const outletCtx = useOutletContext();
  const shopFromCtx = outletCtx?.shop;

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('all'); // 'all' | 'views' | 'clicks'
  const [hoveredDay, setHoveredDay] = useState(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load merchant metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const shop = stats?.shop || shopFromCtx;
  const hasShop = stats?.has_shop ?? Boolean(shop);

  // Compute maximum values for responsive chart scaling
  const dailyTrends = stats?.daily_trends || [];
  const maxViews = Math.max(...dailyTrends.map((d) => d.views || 0), 10);
  const maxClicks = Math.max(...dailyTrends.map((d) => d.clicks || 0), 5);
  const chartMax = Math.max(maxViews, maxClicks);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Not Registered Shop Banner
  if (!hasShop) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-5 border border-sky-100 shadow-sm">
          <Store className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Setup Your Store on Nearza
        </h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Register your physical shop address, phone number, and opening hours to start showcasing in-store inventory and price comparison to local shoppers.
        </p>
        <Link to="/merchant/shop">
          <Button variant="primary" size="lg" icon={PlusCircle} className="mx-auto shadow-md shadow-sky-500/20">
            Register My Shop Profile
          </Button>
        </Link>
      </div>
    );
  }

  const {
    total_products = 0,
    active_products = 0,
    low_stock_products = 0,
    out_of_stock_products = 0,
    shop_views = 0,
    product_views = 0,
    whatsapp_clicks = 0,
    call_clicks = 0,
    directions_clicks = 0,
    total_clicks = 0,
    confidence_breakdown = { high: 0, medium: 0, low: 0 },
  } = stats || {};

  const totalViews = shop_views + product_views;
  const totalConfidenceItems =
    confidence_breakdown.high + confidence_breakdown.medium + confidence_breakdown.low || 1;
  const highConfPct = Math.round((confidence_breakdown.high / totalConfidenceItems) * 100);
  const medConfPct = Math.round((confidence_breakdown.medium / totalConfidenceItems) * 100);
  const lowConfPct = Math.round((confidence_breakdown.low / totalConfidenceItems) * 100);

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. Header & Quick Actions */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {shop?.name || 'Store Operations'}
            </h1>
            {shop?.verification_status === 'approved' ? (
              <Badge variant="success" size="sm" dot>
                Verified Merchant
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" dot>
                Verification Pending
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Store overview, customer inquiries, and inventory confidence metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadStats}
            title="Refresh statistics"
          >
            Refresh
          </Button>

          <Link to="/merchant/inventory">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Low stock warning banner if any item needs restock */}
      {(low_stock_products > 0 || out_of_stock_products > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Inventory Stock Alert: {low_stock_products} low stock, {out_of_stock_products} out of stock
              </p>
              <p className="text-[11px] text-amber-700">
                Update quantities to keep your shop ranking high in local discovery results.
              </p>
            </div>
          </div>

          <Link to="/merchant/inventory?filter=low_stock">
            <Button size="sm" variant="secondary" className="whitespace-nowrap text-xs">
              Review Stock →
            </Button>
          </Link>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. Key Metrics Grid (8 KPI Cards) */}
      {/* =================================================================== */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Inventory & Customer Engagement
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Total Products */}
          <Card className="p-4 sm:p-5 bg-white border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">Total Products</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {total_products}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                {active_products} active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Listed in your shop catalog</p>
          </Card>

          {/* Active Products */}
          <Card className="p-4 sm:p-5 bg-white border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">Active Live</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {active_products}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                / {total_products}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Visible to nearby customers</p>
          </Card>

          {/* Low Stock Products */}
          <Card className="p-4 sm:p-5 bg-white border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">Low Stock Alert</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${low_stock_products > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {low_stock_products}
              </span>
              {out_of_stock_products > 0 && (
                <span className="text-[11px] font-bold text-rose-500">
                  ({out_of_stock_products} out)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Items needing inventory restock</p>
          </Card>

          {/* Total Views */}
          <Card className="p-4 sm:p-5 bg-white border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">Customer Views</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {totalViews}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                ({shop_views} shop, {product_views} prod)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Shop and product impressions</p>
          </Card>

          {/* WhatsApp Clicks */}
          <Card className="p-4 sm:p-5 bg-white border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">WhatsApp Inquiries</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                {whatsapp_clicks}
              </span>
              <span className="text-[11px] font-medium text-slate-400">clicks</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Customers starting WhatsApp chats</p>
          </Card>

          {/* Call Clicks */}
          <Card className="p-4 sm:p-5 bg-white border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">Call Clicks</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-sky-600 tracking-tight">
                {call_clicks}
              </span>
              <span className="text-[11px] font-medium text-slate-400">dials</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Phone inquiries placed by buyers</p>
          </Card>

          {/* Directions Clicks */}
          <Card className="p-4 sm:p-5 bg-white border-slate-100 hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">Directions Clicks</span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-violet-600 tracking-tight">
                {directions_clicks}
              </span>
              <span className="text-[11px] font-medium text-slate-400">routes</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Shoppers navigating to your physical store</p>
          </Card>

          {/* Total Conversions / Actions */}
          <Card className="p-4 sm:p-5 bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-sm shadow-sky-500/20">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-sky-100 uppercase tracking-wider">
                Total Direct Inquiries
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {total_clicks}
              </span>
              <span className="text-[11px] font-semibold text-sky-100">leads</span>
            </div>
            <p className="text-[10px] text-sky-100/90 mt-1">WhatsApp + Calls + Store Navigation</p>
          </Card>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. Interactive Charts: 14-Day Traffic & Conversion Trend */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Trend Line / Bar Chart */}
        <Card className="lg:col-span-8 p-6 bg-white border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  14-Day Traffic & Conversion Trends
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily customer views compared against direct inquiries (WhatsApp, Calls, Directions)
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedMetric('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedMetric === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric('views')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedMetric === 'views' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Views
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric('clicks')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedMetric === 'clicks' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                Inquiries
              </button>
            </div>
          </div>

          {/* SVG Visual Chart */}
          <div className="relative h-56 w-full flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 border-b border-slate-100">
            {dailyTrends.map((d, idx) => {
              const viewHeight = Math.max((d.views / chartMax) * 100, 4);
              const clickHeight = Math.max((d.clicks / chartMax) * 100, 4);
              const isHovered = hoveredDay?.date === d.date;

              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Bars */}
                  <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                    {/* Views Bar */}
                    {(selectedMetric === 'all' || selectedMetric === 'views') && (
                      <div
                        style={{ height: `${viewHeight}%` }}
                        className={`w-full max-w-[14px] rounded-t-md transition-all duration-300 ${
                          isHovered ? 'bg-sky-600' : 'bg-sky-400/80 group-hover:bg-sky-500'
                        }`}
                      />
                    )}

                    {/* Inquiries Bar */}
                    {(selectedMetric === 'all' || selectedMetric === 'clicks') && (
                      <div
                        style={{ height: `${clickHeight}%` }}
                        className={`w-full max-w-[14px] rounded-t-md transition-all duration-300 ${
                          isHovered ? 'bg-emerald-600' : 'bg-emerald-500 group-hover:bg-emerald-600'
                        }`}
                      />
                    )}
                  </div>

                  {/* Day Label */}
                  <span className="text-[10px] text-slate-400 font-medium mt-2 truncate w-full text-center">
                    {idx % 2 === 0 ? d.label.split(' ')[1] : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hover Tooltip / Status Display */}
          <div className="mt-3 flex items-center justify-between text-xs min-h-[28px]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" /> Views
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Inquiries (WhatsApp/Call/Maps)
              </span>
            </div>

            {hoveredDay ? (
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                {hoveredDay.label}: {hoveredDay.views} views, {hoveredDay.clicks} inquiries
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">Hover over bars for daily breakdown</span>
            )}
          </div>
        </Card>

        {/* Inventory Confidence Score Breakdown Card */}
        <Card className="lg:col-span-4 p-6 bg-white border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Inventory Confidence
              </h3>
              <Badge variant="sky" size="sm">Auto-Ranked</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Nearza calculates confidence based on how recently you updated stock and pricing. Fresh items rank higher in nearby search.
            </p>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden mb-4">
              <div
                style={{ width: `${highConfPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`High Confidence: ${confidence_breakdown.high}`}
              />
              <div
                style={{ width: `${medConfPct}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Medium Confidence: ${confidence_breakdown.medium}`}
              />
              <div
                style={{ width: `${lowConfPct}%` }}
                className="bg-rose-400 transition-all duration-500"
                title={`Low Confidence: ${confidence_breakdown.low}`}
              />
            </div>

            {/* Confidence Legend Details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-emerald-900">High Confidence (&lt;24h)</span>
                </div>
                <span className="font-extrabold text-emerald-800">
                  {confidence_breakdown.high} items ({highConfPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="font-semibold text-amber-900">Medium (1–3 days)</span>
                </div>
                <span className="font-extrabold text-amber-800">
                  {confidence_breakdown.medium} items ({medConfPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="font-semibold text-rose-900">Low Confidence (&gt;3 days)</span>
                </div>
                <span className="font-extrabold text-rose-800">
                  {confidence_breakdown.low} items ({lowConfPct}%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link to="/merchant/inventory">
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>Update Inventory Timestamps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* =================================================================== */}
      {/* 4. Quick Action Shortcuts Section */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          to="/merchant/inventory"
          className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-sky-300 hover:shadow-sm transition-all group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
              Product & Stock Catalog
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add products, adjust live pricing, and update stock counts
            </p>
          </div>
        </Link>

        <Link
          to="/merchant/shop"
          className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-emerald-300 hover:shadow-sm transition-all group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
              Store Profile & Hours
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Update opening hours, address, phone, and store banner
            </p>
          </div>
        </Link>

        {shop?.id && (
          <Link
            to={`/shops/${shop.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-violet-300 hover:shadow-sm transition-all group flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ExternalLink className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-violet-600 transition-colors">
                Live Store Page
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                View your shop as it appears to customers on Nearza
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default MerchantDashboard;
