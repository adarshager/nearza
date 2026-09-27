/**
 * Nearza — Privacy Policy Page
 * Clear, transparent documentation of user privacy, location permissions,
 * data storage, and security on the Nearza hyperlocal commerce platform.
 */

import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Database,
  Lock,
  Eye,
  Trash2,
  FileText,
  UserCheck,
  Server,
  ArrowLeft,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function PrivacyPolicyPage() {
  useDocumentTitle(
    'Privacy Policy',
    'Review Nearza’s Privacy Policy to understand how your location permissions, account information, and search activity are processed and protected.'
  );

  const lastUpdated = 'September 2026';

  const sections = [
    {
      id: 'scope',
      title: '1. Application Scope & Project Identity',
      icon: FileText,
      content: (
        <>
          <p>
            Nearza is a hyperlocal product discovery and price comparison web application designed to connect local consumers directly with neighborhood retail shops. This Privacy Policy outlines how the Nearza application collects, processes, and protects information when you browse catalog items, search for nearby stores, or register as a customer or merchant.
          </p>
          <p className="mt-2 text-slate-500 text-xs">
            This document reflects the real, active technical implementation of the Nearza project. Nearza does not make unfounded legal claims or claim third-party certifications not actively possessed.
          </p>
        </>
      ),
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      icon: UserCheck,
      content: (
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">A. Account Information</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              When you register for an account (as a customer or merchant), we collect your full name, email address, chosen role, and a securely hashed password. Passwords are never stored in plaintext.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm">B. Precise Location Data (Coordinates)</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              To calculate accurate distances to neighborhood stores, Nearza requests permission to access your device’s browser geolocation (latitude and longitude).
            </p>
            <div className="mt-1.5 p-3 rounded-xl bg-sky-50 text-sky-900 text-xs border border-sky-100">
              <strong>Strict Privacy Standard:</strong> Location access is requested <em>only</em> upon explicit user interaction (e.g. clicking "Detect Location" or visiting Nearby Stores). Nearza <strong>never</strong> tracks your location continuously in the background. If location permission is denied, Nearza continues to function normally using manual address or catalog filters.
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm">C. Search & Browsing Activity</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Search queries, filter preferences (category, distance, price range), and recently viewed items are processed to display relevant local products.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm">D. Merchant Store Information</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Registered merchants submit store name, street address, operating city, postal code, shop phone number, WhatsApp contact number, catalog listings, inventory counts, and price points. This business information is publicly displayed to facilitate customer discovery.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm">E. Customer Reviews & Inventory Reports</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Authenticated users may post store ratings, reviews, and inventory feedback to assist fellow neighborhood shoppers.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'how-used',
      title: '3. How Information Is Used',
      icon: Eye,
      content: (
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
          <li><strong>Proximity Calculation:</strong> Calculating spherical distance (in kilometers) between your coordinates and registered retail shops.</li>
          <li><strong>Price Comparison:</strong> Providing transparent side-by-side local price comparisons across neighborhood retailers.</li>
          <li><strong>Direct Merchant Communication:</strong> Generating deep links to native mobile phone dialers (tel:) and WhatsApp messaging (wa.me) so you can confirm availability directly with the shop owner.</li>
          <li><strong>Inventory Confidence Scoring:</strong> Computing freshness metrics based on how recently shop inventory records were updated.</li>
          <li><strong>Account Management:</strong> Authenticating logins, issuing secure session JWT tokens, and saving personal favorites.</li>
        </ul>
      ),
    },
    {
      id: 'storage-processing',
      title: '4. Data Storage, Backend Processing & Supabase',
      icon: Server,
      content: (
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            Nearza uses a decoupled architecture ensuring optimal security and isolation:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Relational Database:</strong> Core database records (users, shops, products, inventory junction records, reviews) are managed in a PostgreSQL database hosted via Supabase infrastructure and managed through Django ORM.</li>
            <li><strong>Media & Product Photography:</strong> Product images are stored in protected Supabase Storage buckets, optimized in WebP format, and served via public storage endpoints.</li>
            <li><strong>Client-Side LocalStorage:</strong> For speed and privacy, your recent searches and recently viewed items are stored directly within your local web browser’s LocalStorage and can be cleared by you at any time.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sharing',
      title: '5. Data Sharing & Third-Party Disclosure',
      icon: Database,
      content: (
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            Nearza operates on a strict non-monetization-of-privacy model:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>We do <strong>not</strong> sell, rent, or trade your personal data, search history, or location coordinates to third-party data brokers or marketing networks.</li>
            <li><strong>Navigation Handoff:</strong> When you click "Directions", standard destination coordinates are passed to Google Maps in accordance with Google’s standard public navigation APIs.</li>
            <li><strong>Direct Messaging Handoff:</strong> When you click "WhatsApp", a standard URL pre-populating product inquiry text is opened in your device’s WhatsApp client. Nearza does not log or monitor private WhatsApp conversations.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'security',
      title: '6. Security Safeguards',
      icon: Lock,
      content: (
        <p className="text-xs text-slate-600 leading-relaxed">
          Nearza implements industry-standard technical measures including HTTPS encryption in transit, secure JSON Web Token (JWT) authorization, role-based API access controls, SQL-injection prevention through Django’s parameterized queries, and Cross-Origin Resource Sharing (CORS) whitelisting. Privileged Supabase service keys are strictly confined to backend execution environments and never exposed to the frontend.
        </p>
      ),
    },
    {
      id: 'user-choices',
      title: '7. Your Choices & Account Management',
      icon: Trash2,
      content: (
        <div className="space-y-2 text-xs text-slate-600">
          <p>You maintain full control over your information:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Location Permissions:</strong> You can grant, deny, or revoke location access at any time through your browser or device system settings.</li>
            <li><strong>Clear Search History:</strong> Clear your local search history and recently viewed items with one click on the Search History page.</li>
            <li><strong>Account Profile & Deletion:</strong> You can edit profile information in your Profile dashboard or submit an account closure request through platform support.</li>
          </ul>
        </div>
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
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
            Trust & Transparency
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Effective Date: {lastUpdated} • Nearza Hyperlocal Commerce Platform
        </p>
      </div>

      {/* Summary Box */}
      <Card className="p-5 sm:p-6 bg-sky-50/60 border-sky-100 rounded-2xl mb-8">
        <h3 className="text-sm font-bold text-sky-950 mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
          Privacy at a Glance
        </h3>
        <p className="text-xs text-sky-900/80 leading-relaxed">
          Nearza uses your location solely to calculate distances to nearby local stores on your direct command. We never track you in the background, we do not sell your personal data, and we provide transparent metrics so you can verify product pricing with neighborhood retailers.
        </p>
      </Card>

      {/* Document Sections */}
      <div className="space-y-6">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Card
              key={sec.id}
              id={sec.id}
              className="p-6 sm:p-7 bg-white border-slate-200/80 rounded-2xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {sec.title}
                </h2>
              </div>
              <div className="text-xs sm:text-sm leading-relaxed text-slate-600">
                {sec.content}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <p>Questions regarding our privacy practices?</p>
        <div className="flex items-center gap-4">
          <Link to="/support" className="text-sky-600 hover:underline font-semibold">
            Visit Help Center
          </Link>
          <span>•</span>
          <Link to="/terms" className="text-slate-600 hover:text-sky-600 font-medium">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
