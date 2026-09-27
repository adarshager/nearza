/**
 * Nearza — How It Works Page
 * Detailed walkthrough of Nearza's hyperlocal commerce discovery,
 * price comparison engine, and inventory confidence scoring.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  ArrowUpDown,
  ShieldCheck,
  Store,
  Phone,
  Navigation,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function HowItWorksPage() {
  useDocumentTitle(
    'How It Works',
    'Learn how Nearza connects local shoppers with neighborhood stores, compares real-time local prices, and calculates inventory confidence.'
  );

  const steps = [
    {
      number: '01',
      title: 'Search for a Product',
      icon: Search,
      color: 'sky',
      description:
        'Type any item you need—from daily staples like Aashirvaad Atta and Amul Milk to smartphones, stationery, and medicines. Nearza searches across live inventories in your local neighborhood.',
      tip: 'Use specific brands or generic product names to see all available options.',
    },
    {
      number: '02',
      title: 'Discover Nearby Stores',
      icon: Store,
      color: 'blue',
      description:
        'Enable your location to see registered neighborhood shops that currently have the product in stock, ordered by exact walking or driving distance from where you are.',
      tip: 'Filter by distance radius (1km, 3km, 5km, 10km) to find what is closest.',
    },
    {
      number: '03',
      title: 'Compare Prices Side-by-Side',
      icon: ArrowUpDown,
      color: 'emerald',
      description:
        'Stop visiting store to store just to compare prices. Nearza shows you the exact prices offered by each local merchant side-by-side, highlighting potential savings and best deals.',
      tip: 'Sort by lowest price or closest distance depending on whether speed or savings matters most.',
    },
    {
      number: '04',
      title: 'Check Inventory Confidence',
      icon: ShieldCheck,
      color: 'amber',
      description:
        'Every listed product features an automated Inventory Confidence score based on how recently the merchant verified or updated their stock records.',
      tip: 'Look for High Confidence badges for items updated within the past 24 hours.',
    },
    {
      number: '05',
      title: 'View Shop Profile & Catalog',
      icon: ShoppingBag,
      color: 'indigo',
      description:
        'Click into any merchant store to view their full catalog, customer ratings, operating hours, physical address, and store verification status.',
      tip: 'Check other products stocked by the same merchant to combine your local errands.',
    },
    {
      number: '06',
      title: 'Direct Merchant Contact',
      icon: Phone,
      color: 'violet',
      description:
        'Need to reserve an item or confirm batch availability? One-tap direct communication connects you with the shop owner via normal phone call or WhatsApp with pre-filled product details.',
      tip: 'WhatsApp inquiries automatically include product name and unit for immediate shopkeeper replies.',
    },
    {
      number: '07',
      title: 'Get Turn-by-Turn Directions',
      icon: Navigation,
      color: 'rose',
      description:
        'When you are ready to pick up your purchase, tap "Directions" to open turn-by-turn navigation in Google Maps leading directly to the storefront.',
      tip: 'Support your local community and take home your product immediately without waiting days for delivery.',
    },
  ];

  const confidenceTiers = [
    {
      tier: 'High Confidence',
      score: '85% – 99%',
      timeframe: 'Updated within 24 Hours',
      badgeVariant: 'success',
      badgeText: 'High Confidence',
      borderClass: 'border-emerald-200',
      bgClass: 'bg-emerald-50/50',
      description:
        'The merchant has actively confirmed, received, or adjusted inventory for this item within the last 24 hours. The stock level and price are very fresh.',
      actionAdvice: 'Safe to visit directly. High likelihood of immediate availability.',
    },
    {
      tier: 'Medium Confidence',
      score: '60% – 84%',
      timeframe: 'Updated within 1 to 3 Days',
      badgeVariant: 'warning',
      badgeText: 'Medium Confidence',
      borderClass: 'border-amber-200',
      bgClass: 'bg-amber-50/50',
      description:
        'The item was updated within the last 1 to 3 days. Typical staple goods usually remain in stock, but fast-moving goods may fluctuate.',
      actionAdvice: 'Good availability. If traveling a long distance, a quick WhatsApp ping is recommended.',
    },
    {
      tier: 'Moderate / Review',
      score: 'Below 60%',
      timeframe: 'Older than 7 Days',
      badgeVariant: 'secondary',
      badgeText: 'Call to Confirm',
      borderClass: 'border-slate-200',
      bgClass: 'bg-slate-50',
      description:
        'The listing has not been updated in over a week. The merchant may still stock it, but pricing or shelf counts could have shifted.',
      actionAdvice: 'Tap "Call" or "WhatsApp" before visiting to ensure the merchant has the exact variant.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Hyperlocal Shopping Simplified</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          How Nearza Works
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Find products available right now in neighborhood shops, compare local prices, and support your local retailers—all without the wait of multi-day delivery.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" as={Link} to="/search" size="md">
            <Search className="w-4 h-4 mr-1.5" />
            Start Browsing
          </Button>
          <Button variant="secondary" as={Link} to="/compare" size="md">
            <ArrowUpDown className="w-4 h-4 mr-1.5" />
            Compare Prices
          </Button>
        </div>
      </div>

      {/* 7-Step Interactive Walkthrough */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              The 7-Step Shopper Journey
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              From searching on your phone to walking into the store counter
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100">
            Step-by-step
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
              >
                <Card
                  hoverable
                  className="p-6 h-full flex flex-col justify-between bg-white border-slate-200/80 hover:border-sky-300 transition-all rounded-2xl shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black tracking-widest text-slate-400">
                        STEP {step.number}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-sky-800 bg-sky-50/60 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      <strong>Pro tip:</strong> {step.tip}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Deep Dive: Inventory Confidence Explained */}
      <section className="mb-20">
        <div className="bg-gradient-to-br from-sky-50/70 via-white to-sky-50/40 rounded-3xl border border-sky-100 p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Transparent Hyperlocal Metrics
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Understanding "Inventory Confidence"
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Unlike online megastores that operate automated robotic warehouses, local neighborhood shops manage live walk-in physical counters. Nearza calculates a dynamic <strong>Confidence Score</strong> for every listed product based on update recency.
            </p>
          </div>

          {/* Important Transparency Notice */}
          <div className="mb-8 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Important Disclaimer:</strong> Nearza does <em>not</em> claim or guarantee 100% real-time stock availability. Availability information is calculated from merchant-provided inventory updates and recorded updates. For rare or high-value items, use Nearza’s built-in <strong>Call</strong> or <strong>WhatsApp</strong> buttons to verify prior to visiting.
            </div>
          </div>

          {/* 3 Confidence Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {confidenceTiers.map((tier) => (
              <div
                key={tier.tier}
                className={`p-6 rounded-2xl border ${tier.borderClass} ${tier.bgClass} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={tier.badgeVariant} size="sm" dot>
                      {tier.badgeText}
                    </Badge>
                    <span className="text-xs font-black text-slate-500">
                      {tier.score}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {tier.tier}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tier.timeframe}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {tier.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-slate-700">
                  <span className="text-sky-700 block mb-0.5">Recommendation:</span>
                  {tier.actionAdvice}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Merchants Onboarding Card */}
      <section>
        <Card className="p-8 sm:p-10 bg-slate-900 text-white rounded-3xl overflow-hidden relative border-0">
          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2 block">
              Local Retailers & Shop Owners
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Grow Your Store’s Walk-In Footfall with Nearza
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Showcase your physical products to thousands of shoppers searching nearby. Update your pricing, publish current stock, and let neighborhood customers discover your store effortlessly.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                as={Link}
                to="/register"
                size="md"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
              >
                Register Your Shop Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button
                variant="secondary"
                as={Link}
                to="/login"
                size="md"
                className="bg-slate-800 text-white hover:bg-slate-700 border-slate-700"
              >
                Merchant Sign In
              </Button>
            </div>
          </div>

          <div className="hidden lg:block absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        </Card>
      </section>
    </div>
  );
}

export default HowItWorksPage;
