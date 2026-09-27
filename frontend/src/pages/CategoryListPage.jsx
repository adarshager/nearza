/**
 * Nearza — Category Directory & Browser Page
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { productsService } from '../services/products';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await productsService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Categories
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore products organized by department across neighborhood merchants
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Link to={`/search?category=${cat.slug}`}>
                <Card
                  hoverable
                  className="p-5 text-center bg-white border-slate-100 hover:border-sky-200 transition-all flex flex-col items-center justify-between h-full group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-all overflow-hidden shadow-2xs">
                    {cat.icon_url ? (
                      <img
                        src={cat.icon_url}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package className="w-7 h-7 text-sky-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {cat.products_count} {cat.products_count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryListPage;
