/**
 * Nearza — Support & Help Center Page
 * Frequently Asked Questions, account troubleshooting, merchant onboarding assistance,
 * location permission guides, and customer support resources.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Search,
  ChevronDown,
  User,
  Store,
  MapPin,
  ArrowUpDown,
  ShieldCheck,
  MessageSquare,
  Lock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Phone,
  LifeBuoy,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function SupportPage() {
  useDocumentTitle(
    'Support & Help',
    'Get answers to frequently asked questions about Nearza, troubleshoot location permissions, learn how to list your store, and get help.'
  );

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState(null);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'shoppers', label: 'Shoppers & Discovery', icon: Search },
    { id: 'stock-pricing', label: 'Stock & Pricing', icon: ArrowUpDown },
    { id: 'location', label: 'Location & Map', icon: MapPin },
    { id: 'merchants', label: 'Merchant Stores', icon: Store },
    { id: 'account', label: 'Account & Security', icon: User },
  ];

  const faqs = [
    {
      id: 'faq-1',
      category: 'shoppers',
      question: 'How do I find products available in my neighborhood?',
      answer:
        'Simply click the search bar at the top of Nearza or tap "Nearby Stores". When you allow location access, Nearza automatically discovers which neighborhood shops stock your item, calculated by exact walking or driving distance.',
    },
    {
      id: 'faq-2',
      category: 'shoppers',
      question: 'Can I purchase items directly through the Nearza website?',
      answer:
        'Nearza is a local product discovery and price comparison engine that directs you straight to physical neighborhood stores. Rather than waiting days for courier delivery, you can check availability, call or WhatsApp the shopkeeper directly, and pick up the item immediately or arrange local delivery directly with the merchant.',
    },
    {
      id: 'faq-3',
      category: 'stock-pricing',
      question: 'What does the "Inventory Confidence" score mean?',
      answer:
        'Inventory Confidence is calculated from the recency of the merchant’s stock update. High Confidence (85%–99%) means the merchant updated stock within 24 hours. Medium Confidence (60%–84%) was updated within 3 days. Scores below 60% indicate updates older than a week, so we recommend a quick phone call or WhatsApp message before visiting.',
    },
    {
      id: 'faq-4',
      category: 'stock-pricing',
      question: 'What if a store’s price is different from what is shown on Nearza?',
      answer:
        'Merchants maintain their own pricing on Nearza. While we encourage merchants to keep prices synchronized with their offline checkout counters, occasional price shifts can occur. If you notice a price discrepancy, you can notify the shopkeeper or submit feedback so the merchant can adjust their listing.',
    },
    {
      id: 'faq-5',
      category: 'location',
      question: 'Why is Nearza asking for my location permission?',
      answer:
        'Nearza uses your latitude and longitude coordinates exclusively to calculate proximity distances to nearby retail shops. Location is only requested when you interact with location-based features (like "Detect Location" or "Nearby"). We never track your location continuously in the background.',
    },
    {
      id: 'faq-6',
      category: 'location',
      question: 'How do I fix location permission errors in my browser?',
      answer:
        'If you accidentally clicked "Block" or location failed: In Chrome/Edge, click the padlock or tune icon on the left side of the address bar, toggle "Location" to "Allow", and reload the page. On mobile Safari, go to iOS Settings > Safari > Location and select "Ask" or "Allow".',
    },
    {
      id: 'faq-7',
      category: 'merchants',
      question: 'How can a local store owner register their shop on Nearza?',
      answer:
        'Joining Nearza is free for local retailers! Click "List Your Store" or visit the registration page, choose the "Merchant" account role, enter your business address, phone number, and WhatsApp contact, and begin publishing your catalog.',
    },
    {
      id: 'faq-8',
      category: 'merchants',
      question: 'How do merchants update their stock and prices?',
      answer:
        'Once logged in to the Merchant Portal (/merchant/dashboard), tap "Inventory Management". You can search the master product catalog, set your shop price, enter quantity, mark items as In Stock, Low Stock, or Out of Stock, and instantly update your Confidence Score.',
    },
    {
      id: 'faq-9',
      category: 'account',
      question: 'I forgot my account password. How do I reset it?',
      answer:
        'Click "Sign In" at the top of the page, then click "Forgot Password?". Enter your registered email address to receive secure instructions to set a new password.',
    },
    {
      id: 'faq-10',
      category: 'account',
      question: 'How do I save products to my Favorites list?',
      answer:
        'Click the heart icon on any product card or detail page. When signed in, saved items are stored in your personal Favorites list (/favorites) for instant reference whenever you prepare your shopping list.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 mb-4">
          <LifeBuoy className="w-3.5 h-3.5 text-sky-600" />
          <span>Helpdesk & Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          How Can We Help You?
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Find instant answers to common questions about finding local products, verifying store stock, and managing your merchant catalog.
        </p>

        {/* Live Search Bar */}
        <div className="mt-6 max-w-xl mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs (e.g., location, pricing, inventory, merchant)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        <Card
          hoverable
          as={Link}
          to="/search"
          className="p-5 bg-white border-slate-200/80 rounded-2xl flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              Browse Products
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore 50+ real retail products across 11 neighborhood categories.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-sky-600">
            <span>Explore catalog</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>

        <Card
          hoverable
          as={Link}
          to="/compare"
          className="p-5 bg-white border-slate-200/80 rounded-2xl flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              Compare Prices
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Side-by-side local price comparisons across neighborhood retailers.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <span>Compare deals</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>

        <Card
          hoverable
          as={Link}
          to="/register"
          className="p-5 bg-white border-slate-200/80 rounded-2xl flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              List Your Store
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Register as a local merchant to showcase your offline inventory.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-700">
            <span>Merchant signup</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>

        <Card
          hoverable
          as={Link}
          to="/how-it-works"
          className="p-5 bg-white border-slate-200/80 rounded-2xl flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              How It Works
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Learn about our 7-step discovery model and confidence scores.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600">
            <span>Read overview</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </div>

      {/* FAQ Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="max-w-4xl mx-auto space-y-3 mb-16">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8">
            <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No matching answers found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try searching with a different term or select "All Topics".
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs hover:border-sky-200"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="text-sm font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support Assistance & Contact Guide */}
      <section className="max-w-4xl mx-auto">
        <Card className="p-8 sm:p-10 bg-slate-50 border-slate-200/80 rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                  Platform Assistance & Community
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Need Dedicated Help with Your Store?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl leading-relaxed">
                Registered merchants can manage listings, update store coordinates, and request verification directly from the Merchant Portal. Shoppers can report store updates or price differences from individual product pages.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button variant="primary" as={Link} to="/login" size="md">
                Sign In to Portal
              </Button>
              <Button variant="secondary" as={Link} to="/register" size="md">
                Register Store
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default SupportPage;
