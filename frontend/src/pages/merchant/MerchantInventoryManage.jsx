/**
 * Nearza — Merchant Inventory & Product Management
 * Comprehensive CRUD & Inventory Control:
 * - Add new products (catalog or custom with name, category, brand, unit, image)
 * - Full edit of product details, pricing, quantities, stock status, and SKU
 * - Delete product with confirmation modal dialog
 * - Inline quick price and quantity adjustment
 * - Multi-criteria filters: search, category, stock status, inventory confidence
 * - Automated inventory confidence rating (<24h, 1-3d, >3d) & last updated tracking
 * - Empty states & responsive table/card layout
 */

import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Upload,
  AlertTriangle,
  CheckCircle,
  Filter,
  X,
  Clock,
  Layers,
  Sparkles,
  ArrowUpDown,
  Tag,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { merchantService } from '../../services/merchant';
import { productsService } from '../../services/products';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

export function MerchantInventoryManage() {
  const toast = useToast();
  const outletContext = useOutletContext();
  const shop = outletContext?.shop;

  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');
  const [selectedConfidence, setSelectedConfidence] = useState('all');
  const [sortBy, setSortBy] = useState('updated_desc');

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State for Add Product
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('piece');
  const [unitValue, setUnitValue] = useState('1.0');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [stockStatus, setStockStatus] = useState('in_stock');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Full Edit Modal State
  const [editItem, setEditItem] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editUnit, setEditUnit] = useState('piece');
  const [editUnitValue, setEditUnitValue] = useState('1.0');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editStockStatus, setEditStockStatus] = useState('in_stock');
  const [editSku, setEditSku] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [invData, catData] = await Promise.all([
        merchantService.getInventory(),
        productsService.getCategories(),
      ]);
      setInventory(invData);
      setCategories(catData);
      if (catData.length > 0 && !categoryId) {
        setCategoryId(catData[0].id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load shop inventory. Please ensure your shop profile is created.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & Sorted Inventory
  const filteredInventory = useMemo(() => {
    return inventory
      .filter((item) => {
        const prod = item.product || {};
        const matchesQuery =
          !searchQuery.trim() ||
          prod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prod.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' ||
          prod.category?.id === selectedCategory ||
          prod.category?.slug === selectedCategory;

        const matchesStock =
          selectedStockStatus === 'all' || item.stock_status === selectedStockStatus;

        const matchesConfidence =
          selectedConfidence === 'all' ||
          item.inventory_confidence === selectedConfidence;

        return matchesQuery && matchesCategory && matchesStock && matchesConfidence;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'qty_asc') return Number(a.quantity) - Number(b.quantity);
        if (sortBy === 'qty_desc') return Number(b.quantity) - Number(a.quantity);
        if (sortBy === 'name') return (a.product?.name || '').localeCompare(b.product?.name || '');
        // default: updated_desc
        return new Date(b.last_updated || 0) - new Date(a.last_updated || 0);
      });
  }, [inventory, searchQuery, selectedCategory, selectedStockStatus, selectedConfidence, sortBy]);

  // Image Upload Handler
  const handleImageUpload = async (e, target = 'add') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image size exceeds 15MB. Please upload a smaller file.');
      return;
    }

    setIsUploading(true);
    try {
      const productId = target === 'edit' ? editItem?.product?.id : undefined;
      const res = await merchantService.uploadImage(file, 'product', {
        shop_id: shop?.id,
        product_id: productId,
      });
      if (target === 'add') {
        setImageUrl(res.url);
      } else {
        setEditImageUrl(res.url);
      }
      toast.success('Product image uploaded and optimized successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Product image upload failed. Please try another image.';
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !price || !categoryId) {
      toast.warning('Please enter product name, price, and category.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      product_name: productName.trim(),
      product_category_id: categoryId,
      product_brand: brand.trim(),
      product_unit: unit,
      product_unit_value: Number(unitValue) || 1.0,
      product_image_url: imageUrl.trim(),
      price: Number(price),
      quantity: Number(quantity) || 0,
      stock_status: stockStatus,
      sku: sku.trim(),
    };

    try {
      await merchantService.addInventoryItem(payload);
      toast.success(`"${productName}" added to store inventory!`);
      setIsAddModalOpen(false);
      resetAddForm();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product to inventory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setProductName('');
    setBrand('');
    setUnit('piece');
    setUnitValue('1.0');
    setPrice('');
    setQuantity('10');
    setStockStatus('in_stock');
    setSku('');
    setImageUrl('');
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditItem(item);
    setEditProductName(item.product?.name || '');
    setEditBrand(item.product?.brand || '');
    setEditCategoryId(item.product?.category?.id || '');
    setEditUnit(item.product?.unit || 'piece');
    setEditUnitValue(String(item.product?.unit_value || '1.0'));
    setEditPrice(String(item.price || ''));
    setEditQuantity(String(item.quantity ?? ''));
    setEditStockStatus(item.stock_status || 'in_stock');
    setEditSku(item.sku || '');
    setEditImageUrl(item.product?.image_url || '');
  };

  // Save Full Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;

    setIsEditing(true);
    const payload = {
      price: Number(editPrice),
      quantity: Number(editQuantity) || 0,
      stock_status: editStockStatus,
      sku: editSku.trim(),
      product_name: editProductName.trim(),
      product_brand: editBrand.trim(),
      product_category_id: editCategoryId,
      product_unit: editUnit,
      product_unit_value: Number(editUnitValue) || 1.0,
      product_image_url: editImageUrl.trim(),
    };

    try {
      await merchantService.updateInventoryItem(editItem.id, payload);
      toast.success('Product details & inventory updated live!');
      setEditItem(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setIsEditing(false);
    }
  };

  // Quick Inline Quantity/Price update
  const handleQuickAdjust = async (item, field, deltaOrValue) => {
    let newPayload = {};
    if (field === 'quantity') {
      const currentQty = Number(item.quantity) || 0;
      const nextQty = Math.max(0, currentQty + deltaOrValue);
      let nextStatus;
      if (nextQty === 0) nextStatus = 'out_of_stock';
      else if (nextQty <= 5) nextStatus = 'low_stock';
      else nextStatus = 'in_stock';

      newPayload = { quantity: nextQty, stock_status: nextStatus };
    }

    try {
      await merchantService.updateInventoryItem(item.id, newPayload);
      setInventory((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, ...newPayload, last_updated: new Date().toISOString(), inventory_confidence: 'high' } : it))
      );
      toast.success('Stock adjusted! Confidence refreshed.');
    } catch {
      toast.error('Failed to update stock quantity.');
    }
  };

  // Delete Action Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await merchantService.deleteInventoryItem(deleteTarget.id);
      toast.success(`"${deleteTarget.product?.name}" removed from inventory.`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const confidenceBadgeMap = {
    high: { variant: 'success', label: 'High Confidence (<24h)' },
    medium: { variant: 'warning', label: 'Medium (1–3 days)' },
    low: { variant: 'secondary', label: 'Low (>3 days)' },
  };

  const stockBadgeMap = {
    in_stock: { variant: 'success', label: 'In Stock' },
    low_stock: { variant: 'warning', label: 'Low Stock' },
    out_of_stock: { variant: 'danger', label: 'Out of Stock' },
  };

  // Metric summaries for top bar
  const totalCount = inventory.length;
  const inStockCount = inventory.filter((i) => i.stock_status === 'in_stock').length;
  const lowStockCount = inventory.filter((i) => i.stock_status === 'low_stock').length;
  const outStockCount = inventory.filter((i) => i.stock_status === 'out_of_stock').length;

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. Header & Add Product Trigger */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Price Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain live pricing, stock counts, and keep high inventory confidence for local shoppers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
            isLoading={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-sm shadow-sky-500/20"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Metric Mini-Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Total Items</span>
          <span className="font-extrabold text-slate-900 text-sm">{totalCount}</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-emerald-700 font-medium">In Stock</span>
          <span className="font-extrabold text-emerald-600 text-sm">{inStockCount}</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-amber-700 font-medium">Low Stock</span>
          <span className="font-extrabold text-amber-600 text-sm">{lowStockCount}</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between">
          <span className="text-xs text-rose-700 font-medium">Out of Stock</span>
          <span className="font-extrabold text-rose-600 text-sm">{outStockCount}</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. Filters & Search Bar */}
      {/* =================================================================== */}
      <Card className="p-4 bg-white border-slate-100 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, brand, or SKU..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low_stock">Low Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>

          {/* Confidence Filter */}
          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Confidence Levels</option>
            <option value="high">High Confidence (&lt;24h)</option>
            <option value="medium">Medium Confidence (1–3d)</option>
            <option value="low">Low Confidence (&gt;3d)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="updated_desc">Recently Updated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="qty_asc">Quantity: Low to High</option>
            <option value="qty_desc">Quantity: High to Low</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {/* Active Filters Clear Button */}
        {(searchQuery || selectedCategory !== 'all' || selectedStockStatus !== 'all' || selectedConfidence !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400">Filtering results:</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStockStatus('all');
                setSelectedConfidence('all');
              }}
              className="text-sky-600 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </Card>

      {/* =================================================================== */}
      {/* 3. Products Table & Empty States */}
      {/* =================================================================== */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredInventory.length === 0 ? (
        <Card className="p-12 text-center bg-white border-slate-100">
          <Package className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 mb-1">
            {inventory.length === 0
              ? 'Your store inventory is empty'
              : 'No matching products found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {inventory.length === 0
              ? 'Add products and publish your local prices to appear on Nearza comparison searches.'
              : 'Try clearing your search query or adjusting your category and stock status filters.'}
          </p>
          {inventory.length === 0 ? (
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add First Product
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStockStatus('all');
                setSelectedConfidence('all');
              }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredInventory.map((item) => {
                  const prod = item.product || {};
                  const conf = confidenceBadgeMap[item.inventory_confidence] || confidenceBadgeMap.low;
                  const stock = stockBadgeMap[item.stock_status] || stockBadgeMap.in_stock;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Product Visual & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {prod.image_url ? (
                              <img
                                src={prod.image_url}
                                alt={prod.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-sky-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate max-w-[220px]">
                              {prod.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>{prod.brand || 'Store Item'}</span>
                              <span>•</span>
                              <span>
                                {prod.unit_value} {prod.unit}
                              </span>
                              {item.sku && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-[10px]">SKU: {item.sku}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹{item.price}
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4">
                        <Badge variant={stock.variant} size="sm">
                          {stock.label}
                        </Badge>
                      </td>

                      {/* Quantity with quick +/- */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item, 'quantity', -1)}
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
                            title="Decrease quantity by 1"
                          >
                            -
                          </button>
                          <span className="font-bold text-slate-800 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item, 'quantity', 1)}
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
                            title="Increase quantity by 1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Inventory Confidence Badge */}
                      <td className="py-3.5 px-4">
                        <Badge variant={conf.variant} size="sm" dot>
                          {conf.label}
                        </Badge>
                      </td>

                      {/* Last Updated Timestamp */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {item.last_updated
                          ? new Date(item.last_updated).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just added'}
                      </td>

                      {/* Actions: Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            title="Edit product details & inventory"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete from shop catalog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing <strong className="text-slate-800">{filteredInventory.length}</strong> of{' '}
              <strong className="text-slate-800">{inventory.length}</strong> items
            </span>
            <span className="text-[11px] text-slate-400">
              Prices and quantities update in real time across customer searches
            </span>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. Add Product Modal */}
      {/* =================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Product to Store Catalog"
        description="Publish a product with verified local price and stock quantity"
        size="md"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <Input
            label="Product Name *"
            placeholder="e.g. Amul Taaza Fresh Milk"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category *"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Input
              label="Brand"
              placeholder="e.g. Amul, Fortune, Cadbury"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Unit Value"
              type="number"
              step="any"
              value={unitValue}
              onChange={(e) => setUnitValue(e.target.value)}
              required
            />

            <Select
              label="Unit Type"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="piece">Piece</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">Litre</option>
              <option value="mL">mL</option>
              <option value="pack">Pack</option>
              <option value="dozen">Dozen</option>
              <option value="box">Box</option>
            </Select>

            <Input
              label="Price (₹) *"
              type="number"
              step="any"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <Input
              label="Quantity *"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Stock Status"
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </Select>

            <Input
              label="SKU / Barcode"
              placeholder="e.g. SKU-9402"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Image
            </label>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <div className="relative w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : null}
              <input
                type="text"
                placeholder="Paste image URL or upload file"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
              <label
                className={`px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer flex items-center gap-1.5 ${
                  isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Processing...' : 'Browse'}</span>
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'add')}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Upload any normal image — Nearza will automatically optimize and crop it.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Add Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* 5. Full Edit Product Modal */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        title="Edit Product & Stock Details"
        description="Update pricing, stock availability, or product specs"
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Product Title *"
            value={editProductName}
            onChange={(e) => setEditProductName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Input
              label="Brand"
              value={editBrand}
              onChange={(e) => setEditBrand(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Unit Value"
              type="number"
              step="any"
              value={editUnitValue}
              onChange={(e) => setEditUnitValue(e.target.value)}
            />

            <Select
              label="Unit Type"
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
            >
              <option value="piece">Piece</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">Litre</option>
              <option value="mL">mL</option>
              <option value="pack">Pack</option>
              <option value="dozen">Dozen</option>
              <option value="box">Box</option>
            </Select>

            <Input
              label="Live Price (₹) *"
              type="number"
              step="any"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              required
            />

            <Input
              label="Quantity in Stock *"
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Stock Status"
              value={editStockStatus}
              onChange={(e) => setEditStockStatus(e.target.value)}
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </Select>

            <Input
              label="SKU / Barcode"
              value={editSku}
              onChange={(e) => setEditSku(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Image
            </label>
            <div className="flex items-center gap-3">
              {editImageUrl ? (
                <div className="relative w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                  <img
                    src={editImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : null}
              <input
                type="text"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="Image URL"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
              <label
                className={`px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer flex items-center gap-1.5 ${
                  isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Processing...' : 'Browse'}</span>
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'edit')}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Upload any normal image — Nearza will automatically optimize and crop it.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isEditing}>
              Save Live Updates
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* 6. Confirmation Dialog for Delete */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remove Product from Catalog?"
        description="Destructive action confirmation"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="font-bold">"{deleteTarget?.product?.name}"</strong> from your store
              catalog? This item will immediately stop showing in nearby price comparisons.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MerchantInventoryManage;
