import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Package,
  X
} from 'lucide-react';
import { InventoryItem } from '../types';

interface ProductsTabProps {
  items: InventoryItem[];
  onAddItem: () => void;
  onEditItem: (updatedItem: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function ProductsTab({ items, onAddItem, onEditItem, onDeleteItem }: ProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Edit State
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Pagination Config
  const itemsPerPage = 4;

  // Filter Categories
  const categories = ['ALL', ...Array.from(new Set(items.map(item => item.category)))];

  // Filtering Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specs && item.specs.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Status Badge Styling
  const getStatusBadge = (status: string, available: number) => {
    if (available === 0 || status === 'OUT OF STOCK') {
      return (
        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[9px] font-bold bg-error/5 text-error border border-error/20 uppercase tracking-wider">
          <span className="w-1 h-1 rounded-full bg-error" />
          Out of Stock
        </span>
      );
    }
    if (status === 'LOW STOCK' || available <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[9px] font-bold bg-tertiary-fixed/30 text-tertiary border border-tertiary/30 uppercase tracking-wider">
          <span className="w-1 h-1 rounded-full bg-tertiary animate-pulse" />
          Low Stock
        </span>
      );
    }
    if (status === 'PRE-ORDER') {
      return (
        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[9px] font-bold bg-primary-fixed-dim/20 text-primary border border-primary/20 uppercase tracking-wider">
          <span className="w-1 h-1 rounded-full bg-primary" />
          Pre-Order
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
        <span className="w-1 h-1 rounded-full bg-emerald-600" />
        In Stock
      </span>
    );
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onEditItem(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-8 rounded-2xl border border-outline-variant/60 shadow-sm relative overflow-hidden">
        {/* Subtle decorative golden accent bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-tertiary to-primary" />
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-extrabold text-primary tracking-wide">Product Catalog</h2>
            <span className="text-tertiary font-serif text-lg">✦</span>
            <span className="font-sans text-[10px] font-bold text-tertiary tracking-widest uppercase bg-tertiary/5 px-2 py-0.5 rounded border border-tertiary/20">Active</span>
          </div>
          <p className="font-sans text-xs text-on-surface-variant max-w-xl">
            Manage your master list of Gadwal handloom sarees. Adjust pricing, categories, and weavers' specifications.
          </p>
        </div>
        <button
          onClick={onAddItem}
          className="flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-white hover:bg-primary-container rounded-xl font-sans text-[11px] font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-250 cursor-pointer self-start md:self-auto border border-primary/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5px] text-tertiary-fixed" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="relative md:col-span-8">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant/75 pointer-events-none">
            <Search className="w-4 h-4 text-primary" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by saree name, SKU code, or weave count..."
            className="w-full bg-white border border-outline-variant/70 rounded-xl font-sans text-xs font-medium py-3.5 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-primary placeholder-on-surface-variant/50"
          />
        </div>

        {/* Category Selector */}
        <div className="relative md:col-span-4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant/75 pointer-events-none">
            <Filter className="w-4 h-4 text-primary" />
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-outline-variant/70 rounded-xl font-sans text-xs font-bold py-3.5 pl-11 pr-4 outline-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-primary"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Weaving Categories' : cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/60 border-b border-outline-variant/60">
                <th className="py-4 px-6 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Master Product</th>
                <th className="py-4 px-6 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Weaving Category</th>
                <th className="py-4 px-6 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Retail Price</th>
                <th className="py-4 px-6 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Stock Level</th>
                <th className="py-4 px-6 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-lowest/80 transition-colors duration-150 group">
                    {/* Saree Name & details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container-low flex-shrink-0 relative">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <span className="font-display text-sm font-bold text-primary block leading-tight group-hover:text-primary-container transition-colors">{item.name}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-[9px] font-bold bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">{item.sku}</span>
                          </div>
                          {item.specs && (
                            <span className="font-sans text-[10px] text-on-surface-variant/70 block mt-1.5 italic">{item.specs}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 font-sans text-xs font-semibold text-primary-container">
                      {item.category}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 font-sans text-sm font-bold text-primary tracking-wide">
                      ₹{(item.price || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Stock Status */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(item.status, item.available)}
                        <span className="font-sans text-[10px] text-on-surface-variant/75 mt-0.5">
                          {item.available} units left
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 hover:bg-primary-container hover:text-white rounded-lg text-on-surface-variant transition-all cursor-pointer"
                          title="Edit Saree Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to permanently delete "${item.name}"?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-2 hover:bg-error/15 hover:text-error rounded-lg text-on-surface-variant transition-all cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="w-10 h-10 text-on-surface-variant/40" />
                      <p className="font-sans text-xs font-medium text-on-surface-variant">
                        No saree products matched your filter search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-6 bg-white border-t border-outline-variant/60">
          <span className="font-sans text-[11px] font-semibold text-on-surface-variant">
            Showing <span className="text-primary font-bold">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="text-primary font-bold">{totalItems}</span> masterpieces
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-outline-variant/60 rounded-xl hover:bg-surface transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-primary bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-sans text-[11px] font-bold text-primary px-4 py-1.5 bg-surface-container-low rounded-xl border border-outline-variant/40">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-outline-variant/60 rounded-xl hover:bg-surface transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-primary bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inline Saree Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-primary/30 backdrop-blur-sm transition-opacity" 
            onClick={() => setEditingItem(null)}
          />
          
          <div className="relative w-full max-w-lg bg-white p-6 md:p-8 rounded-2xl shadow-2xl border border-outline-variant/60 animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Subtle premium golden banner top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-tertiary to-primary" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-primary tracking-wide">Modify Masterpiece</h3>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  Adjust general catalog specifications, pricing, and active status.
                </p>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Saree Name
                  </label>
                  <input 
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl font-sans text-xs font-semibold py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    SKU Code
                  </label>
                  <input 
                    type="text"
                    value={editingItem.sku}
                    onChange={(e) => setEditingItem({ ...editingItem, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl font-sans text-xs font-semibold py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Weaving Category
                  </label>
                  <select 
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="Silk Gadwal">Silk Gadwal</option>
                    <option value="Sico Gadwal">Sico Gadwal</option>
                    <option value="Heritage Collection">Heritage Collection</option>
                    <option value="Pure Kuttam Silk">Pure Kuttam Silk</option>
                    <option value="Vintage Borders">Vintage Borders</option>
                    <option value="Silk-Cotton Gadwal">Silk-Cotton Gadwal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Material Specifications
                  </label>
                  <input 
                    type="text"
                    value={editingItem.specs}
                    onChange={(e) => setEditingItem({ ...editingItem, specs: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl font-sans text-xs font-semibold py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Retail Price (₹)
                  </label>
                  <input 
                    type="number"
                    min="0"
                    value={editingItem.price ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Available Stock
                  </label>
                  <input 
                    type="number"
                    min="0"
                    value={editingItem.available}
                    onChange={(e) => {
                      const avail = parseInt(e.target.value, 10) || 0;
                      let stat = editingItem.status;
                      if (avail === 0) stat = 'OUT OF STOCK';
                      else if (avail <= editingItem.threshold) stat = 'LOW STOCK';
                      else stat = 'IN STOCK';
                      
                      setEditingItem({ 
                        ...editingItem, 
                        available: avail,
                        status: stat as any
                      });
                    }}
                    className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Alert Threshold Level
                  </label>
                  <input 
                    type="number"
                    min="1"
                    value={editingItem.threshold}
                    onChange={(e) => setEditingItem({ ...editingItem, threshold: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Active Catalog Status
                  </label>
                  <select 
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full bg-surface-container-low border border-outline-variant/70 rounded-xl font-sans text-xs font-bold py-3 px-4 outline-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  >
                    <option value="IN STOCK">IN STOCK</option>
                    <option value="LOW STOCK">LOW STOCK</option>
                    <option value="OUT OF STOCK">OUT OF STOCK</option>
                    <option value="PRE-ORDER">PRE-ORDER</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-outline-variant/50">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-sans text-xs font-bold shadow-lg hover:bg-primary-container active:scale-98 transition-all cursor-pointer uppercase tracking-wider border border-primary/20"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-sans text-xs font-bold hover:bg-surface-container-low transition-all cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
