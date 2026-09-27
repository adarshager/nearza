/**
 * Nearza — Terms of Service Page
 * Rules, responsibilities, and disclaimers governing use of the Nearza
 * hyperlocal product discovery and price comparison platform.
 */

import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldAlert,
  Store,
  User,
  AlertCircle,
  HelpCircle,
  Scale,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function TermsOfServicePage() {
  useDocumentTitle(
    'Terms of Service',
    'Review the Terms of Service for Nearza, governing customer discovery, merchant inventory listings, and platform usage.'
  );

  const lastUpdated = 'September 2026';

  const clauses = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: Scale,
      content: (
        <p>
          By creating an account, browsing product catalogs, comparing prices, or listing a merchant store on Nearza, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue using the platform.
        </p>
      ),
    },
    {
      id: 'nature-of-service',
      title: '2. Role of the Platform: Discovery & Price Comparison',
      icon: Store,
      content: (
        <div className="space-y-2">
          <p>
            Nearza is a hyperlocal software application providing catalog search, proximity discovery, and price comparison across independent neighborhood merchants.
          </p>
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-amber-900 text-xs">
            <strong>Key Clarification:</strong> Nearza is <strong>not</strong> an online retail store or direct seller. Nearza does not physically purchase, inspect, package, warehouse, or deliver goods. All retail purchases, exchanges, and financial transactions occur directly between you (the customer) and the physical store merchant at their retail counter.
          </div>
        </div>
      ),
    },
    {
      id: 'pricing-inventory-disclaimer',
      title: '3. Pricing & Inventory Availability Disclaimer',
      icon: AlertCircle,
      content: (
        <div className="space-y-2">
          <p>
            While Nearza strives to provide accurate local data:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li><strong>Merchant Responsibility:</strong> Prices, shelf stock counts, and stock status are entered, published, and updated by registered merchants.</li>
            <li><strong>Dynamic Changes:</strong> Due to continuous offline walk-in sales at physical stores, inventory counts and prices may fluctuate between digital updates.</li>
            <li><strong>Inventory Confidence Metric:</strong> Nearza’s "Confidence Score" (High, Medium, Low) represents the recency of the last merchant inventory update and does <em>not</em> constitute a legal guarantee of real-time shelf stock.</li>
            <li><strong>Verification Recommended:</strong> For high-demand or urgent items, shoppers are strongly advised to tap the "Call" or "WhatsApp" action on the product card to confirm stock before traveling.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'customer-conduct',
      title: '4. Customer Responsibilities',
      icon: User,
      content: (
        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
          <li><strong>Accurate Registration:</strong> If registering an account, provide authentic contact information.</li>
          <li><strong>Respectful Communication:</strong> When initiating telephone calls or WhatsApp chats with storekeepers, maintain civil, professional, and respectful conduct.</li>
          <li><strong>Authentic Feedback:</strong> Ratings, reviews, and inventory condition reports must reflect genuine shopping experiences. False, defamatory, or competitor-sabotaging reviews are strictly prohibited.</li>
        </ul>
      ),
    },
    {
      id: 'merchant-obligations',
      title: '5. Merchant Store Obligations',
      icon: Store,
      content: (
        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
          <li><strong>Lawful Operations:</strong> Merchants must hold valid local business licenses and only list goods permitted by Indian law.</li>
          <li><strong>Accurate Representation:</strong> Merchants agree to keep pricing and stock indications reasonably updated to prevent misleading neighborhood customers.</li>
          <li><strong>Fair Pricing:</strong> Posted prices should accurately reflect the merchant’s in-store retail price without artificial inflation or undisclosed surcharges.</li>
        </ul>
      ),
    },
    {
      id: 'prohibited-activities',
      title: '6. Prohibited Activities',
      icon: ShieldAlert,
      content: (
        <div className="space-y-1 text-slate-600">
          <p>Users and automated systems agree NOT to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Engage in aggressive web scraping, data extraction, or automated crawling without express written consent.</li>
            <li>Interfere with or compromise the security, integrity, or availability of the Nearza API or database.</li>
            <li>Create fictitious merchant profiles, fake store locations, or fraudulent product offerings.</li>
            <li>Impersonate any person, business entity, or platform administrator.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'intellectual-property',
      title: '7. Intellectual Property & Brand Names',
      icon: FileText,
      content: (
        <p className="text-slate-600">
          Product brand names, logos, and trademarks displayed on Nearza (e.g., Aashirvaad, Amul, Tata, boAt, JBL) belong to their respective registered trademark holders. Their inclusion in Nearza’s catalog is solely for descriptive, identification, and local retail comparison purposes.
        </p>
      ),
    },
    {
      id: 'third-party-services',
      title: '8. Third-Party Integrations',
      icon: HelpCircle,
      content: (
        <p className="text-slate-600">
          Nearza integrates standard web hooks and deep links to third-party services including Google Maps for navigation and WhatsApp for direct customer-merchant messaging. Your usage of those respective external services is governed by their independent terms of service and privacy policies.
        </p>
      ),
    },
    {
      id: 'limitation-liability',
      title: '9. Limitation of Liability',
      icon: Scale,
      content: (
        <p className="text-slate-600">
          To the maximum extent permitted by applicable law, Nearza and its developers provide the software service on an "AS IS" and "AS AVAILABLE" basis. Nearza shall not be liable for any indirect, incidental, or consequential damages resulting from store price discrepancies, out-of-stock items, product quality disputes with merchants, or store closures.
        </p>
      ),
    },
    {
      id: 'modifications',
      title: '10. Modifications to Terms',
      icon: FileText,
      content: (
        <p className="text-slate-600">
          Nearza reserves the right to revise or update these terms as platform capabilities expand. Continued use of the platform after updates constitutes acceptance of the modified terms.
        </p>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-16">
      {/* Header */}
      <div className="mb-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-sky-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
            Platform Agreement
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Last Revised: {lastUpdated} • Nearza Hyperlocal Commerce Platform
        </p>
      </div>

      {/* Key Notice Banner */}
      <Card className="p-5 sm:p-6 bg-slate-50 border-slate-200/80 rounded-2xl mb-8">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
          Quick Summary of Terms
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Nearza is a local product discovery and price comparison utility. We help you find which local store has the items you need at what price. Nearza is not the physical seller; products are purchased directly from independent merchants.
        </p>
      </Card>

      {/* Terms Sections */}
      <div className="space-y-6">
        {clauses.map((clause) => {
          const Icon = clause.icon;
          return (
            <Card
              key={clause.id}
              id={clause.id}
              className="p-6 sm:p-7 bg-white border-slate-200/80 rounded-2xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {clause.title}
                </h2>
              </div>
              <div className="text-xs sm:text-sm leading-relaxed text-slate-600">
                {clause.content}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <p>Need clarification on any policy?</p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="text-slate-600 hover:text-sky-600 font-medium">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/support" className="text-sky-600 hover:underline font-semibold">
            Support & Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TermsOfServicePage;
