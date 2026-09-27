/**
 * Nearza — Customer Search History Page
 * Displays user's recent search queries with quick rerun and individual/bulk removal.
 * Design: White + sky-blue aesthetic.
 */

import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  History,
  Search,
  Trash2,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  getSearchHistory,
  removeSearchQuery,
  clearSearchHistory,
} from '../utils/search-history';
import { useToast } from '../contexts/ToastContext';

export default function SearchHistoryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [historyItems, setHistoryItems] = useState(() => getSearchHistory());
  const now = useMemo(() => Date.now(), []);

  const handleRunSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleRemove = (id) => {
    const updated = removeSearchQuery(id);
    setHistoryItems(updated);
  };

  const handleClearAll = () => {
    clearSearchHistory();
    setHistoryItems([]);
    toast.info('Search history cleared.');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const diffMs = now - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-sky-50/60 to-white border-b border-sky-100/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center border border-sky-200/80">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Search History
                </h1>
                <p className="text-xs text-slate-500">
                  Review and rerun your recent product and store searches
                </p>
              </div>
            </div>

            {historyItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear All History
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {historyItems.length === 0 ? (
          <div className="p-16 text-center bg-slate-50/50 rounded-3xl border border-slate-200/60 max-w-md mx-auto">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No recent searches</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              When you search for products, brands, or nearby merchants, your queries will appear here for fast re-access.
            </p>
            <Button variant="primary" as={Link} to="/search">
              Start Searching
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {historyItems.map((item) => (
              <Card
                key={item.id}
                className="bg-white border border-slate-200/80 hover:border-sky-300 p-4 rounded-2xl shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <button
                  onClick={() => handleRunSearch(item.query)}
                  className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                      {item.query}
                    </p>
                    {item.timestamp && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.timestamp)}
                      </p>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunSearch(item.query)}
                    className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove query"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
