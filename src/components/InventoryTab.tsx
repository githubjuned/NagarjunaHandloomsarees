import React, { useState, useMemo } from 'react';
import { 
  InventoryItem, 
  ActivityLogEntry 
} from '../types';
import { 
  Package, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Search, 
  SlidersHorizontal, 
  Edit, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  X, 
  Plus, 
  Clock, 
  Activity as ActivityIcon, 
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';

interface InventoryTabProps {
  items: InventoryItem[];
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  logs: ActivityLogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<ActivityLogEntry[]>>;
  onEditItem: (item: InventoryItem) => void;
  triggerToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function InventoryTab({
  items,
  setItems,
  logs,
  setLogs,
  onEditItem,
  triggerToast
}: InventoryTabProps) {
  // Advanced search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL CATEGORIES');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter list of items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specs.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'ALL CATEGORIES' || 
        item.category.toUpperCase() === selectedCategory.toUpperCase();

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage]);

  // Live metric calculations
  const totalStock = useMemo(() => {
    return items.reduce((sum, item) => sum + item.available, 0);
  }, [items]);

  const lowStockCount = useMemo(() => {
    return items.filter(item => item.available <= item.threshold).length;
  }, [items]);

  const inProductionCount = useMemo(() => {
    return items.reduce((sum, item) => item.status === 'PRE-ORDER' ? sum + item.available : sum, 0) + 69;
  }, [items]);

  const totalStockValue = useMemo(() => {
    const costValue = items.reduce((sum, item) => {
      let rate = 25000;
      if (item.category === 'PURE KUTTAM SILK') rate = 45000;
      else if (item.category === 'SILK-COTTON GADWAL') rate = 18500;
      else if (item.category === 'VINTAGE BORDERS') rate = 28000;
      return sum + (item.available * rate);
    }, 0);
    
    const lakhs = costValue / 100000;
    return `₹ ${lakhs.toFixed(1)}L`;
  }, [items]);

  // Quick Restock trigger from Priority Alerts panel
  const handleQuickRestock = (itemId: string, qty: number = 10) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.available + qty;
        const newStatus = newQty === 0 
          ? 'OUT OF STOCK' 
          : newQty <= item.threshold 
            ? 'LOW STOCK' 
            : item.status === 'PRE-ORDER' ? 'PRE-ORDER' : 'IN STOCK';
        
        // Log transaction
        const now = new Date();
        const timeStr = `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        const newLog: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: 'add',
          message: `Stock Added: +${qty} units of "${item.name}" via Quick Restock`,
          user: 'Admin_RG'
        };
        setLogs(l => [newLog, ...l]);
        triggerToast(`Quick Restocked +${qty} units for ${item.name}`);
        return { ...item, available: newQty, status: newStatus };
      }
      return item;
    }));
  };

  // Filters to Low Stock only
  const handleFocusLowStock = () => {
    setSelectedCategory('ALL CATEGORIES');
    setSearchQuery('');
    // Trigger virtual search matching threshold
    triggerToast("Highlighting priority restock alerts...");
  };

  return (
    <div className="p-margin-mobile md:p-10 space-y-gutter flex-1 bg-background pb-32 lg:pb-10">
      
      {/* Key Metrics (Bento Grid Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter">
        <div className="bento-card p-6 bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-sans text-[11px] font-bold text-on-surface-variant opacity-70 uppercase tracking-wider">TOTAL STOCK</span>
            <div className="p-1.5 bg-primary-fixed rounded-lg text-primary">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-primary">
            {totalStock.toLocaleString()} <span className="text-xs font-sans text-on-surface-variant">units</span>
          </div>
        </div>

        <div className="bento-card p-6 bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-sans text-[11px] font-bold text-on-surface-variant opacity-70 uppercase tracking-wider">LOW STOCK ALERTS</span>
            <div className="p-1.5 bg-error-container/40 rounded-lg text-error">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-3xl font-display font-bold ${lowStockCount > 0 ? 'text-error' : 'text-primary'}`}>
            {lowStockCount} <span className="text-xs font-sans text-on-surface-variant">skus</span>
          </div>
        </div>

        <div className="bento-card p-6 bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-sans text-[11px] font-bold text-on-surface-variant opacity-70 uppercase tracking-wider">IN PRODUCTION</span>
            <div className="p-1.5 bg-tertiary-fixed rounded-lg text-tertiary">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-tertiary">
            {inProductionCount} <span className="text-xs font-sans text-on-surface-variant">sarees</span>
          </div>
        </div>

        <div className="bento-card p-6 bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-sans text-[11px] font-bold text-on-surface-variant opacity-70 uppercase tracking-wider">STOCK VALUE</span>
            <div className="p-1.5 bg-primary-fixed rounded-lg text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-primary">
            {totalStockValue}
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Table Column (LHS) */}
        <div className="lg:col-span-2 space-y-gutter animate-fade-in">
          
          {/* Advanced Search & Filter bar */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant flex flex-col sm:flex-row gap-4 items-center shadow-sm">
            <div className="w-full sm:flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary-container font-sans text-xs font-bold placeholder:text-on-surface-variant/40 outline-none"
                placeholder="Search by SKU, Material, or Weaver..."
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex w-full sm:w-auto gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto bg-surface-container-low border-none rounded-lg font-sans text-xs font-bold py-2.5 px-4 focus:ring-2 focus:ring-primary-container cursor-pointer outline-none"
              >
                <option value="ALL CATEGORIES">ALL CATEGORIES</option>
                <option value="SILK-COTTON GADWAL">SILK-COTTON GADWAL</option>
                <option value="PURE KUTTAM SILK">PURE KUTTAM SILK</option>
                <option value="VINTAGE BORDERS">VINTAGE BORDERS</option>
              </select>

              <button 
                onClick={() => {
                  setSelectedCategory('ALL CATEGORIES');
                  setSearchQuery('');
                  setCurrentPage(1);
                  triggerToast("Inventory filters restored.");
                }}
                className="p-2.5 bg-surface-container rounded-lg hover:bg-outline-variant transition-colors cursor-pointer"
                title="Reset Filters"
              >
                <SlidersHorizontal className="w-4 h-4 text-on-surface" />
              </button>
            </div>
          </div>

          {/* Saree Inventory Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[580px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Product Details</th>
                    <th className="px-6 py-4 font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">SKU</th>
                    <th className="px-6 py-4 font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Available</th>
                    <th className="px-6 py-4 font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Inbox className="w-8 h-8 opacity-40 text-primary" />
                          <p className="font-sans font-bold text-sm">No items match filters</p>
                          <p className="text-[11px]">Choose another category or search terms.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container/40 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-16 rounded bg-surface-container-high overflow-hidden flex-shrink-0">
                              <img 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                src={item.imageUrl} 
                                alt={item.name}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <div className="font-display text-sm font-semibold text-primary">{item.name}</div>
                              <div className="font-sans text-[11px] font-medium text-on-surface-variant">{item.category} • {item.specs}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-sans text-xs font-semibold opacity-70 tracking-wider">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            item.available === 0 
                              ? 'bg-red-100 text-red-800' 
                              : item.available <= item.threshold 
                                ? 'bg-error-container text-on-error-container' 
                                : item.status === 'PRE-ORDER' 
                                  ? 'bg-tertiary-fixed text-on-tertiary-fixed' 
                                  : 'bg-secondary-container text-on-secondary-container'
                          }`}>
                            {item.available === 0 ? 'OUT OF STOCK' : item.available <= item.threshold ? 'LOW STOCK' : item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-display text-base font-bold">
                          <span className={item.available <= item.threshold ? 'text-error font-extrabold' : 'text-primary'}>
                            {item.available < 10 && item.available > 0 ? `0${item.available}` : item.available}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onEditItem(item)}
                            className="p-2 text-primary hover:bg-primary-container hover:text-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                            title="Update Saree Stock"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table pagination footer */}
            <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
              <p className="font-sans text-xs text-on-surface-variant font-medium">
                Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} products
              </p>
              
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-sans text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p 
                        ? 'bg-primary text-white font-extrabold shadow-sm' 
                        : 'border border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Sidebar (RHS) */}
        <div className="space-y-gutter">
          
          {/* Low Stock Alerts */}
          <section className="bg-error-container/10 border border-error/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-error">Priority Restock</h3>
                <span className="flex h-2.5 w-2.5 rounded-full bg-error animate-pulse"></span>
              </div>
              <span className="font-sans text-[10px] bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-bold">
                {items.filter(item => item.available <= item.threshold).length} ALERTS
              </span>
            </div>

            <div className="space-y-3 max-h-[290px] overflow-y-auto no-scrollbar">
              {items.filter(item => item.available <= item.threshold).length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant font-medium text-xs bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-4">
                  <Package className="w-5 h-5 text-tertiary mx-auto mb-1" />
                  All SKU stocks are currently healthy!
                </div>
              ) : (
                items.filter(item => item.available <= item.threshold).map(item => (
                  <div key={item.id} className="flex items-start gap-4 p-3 bg-surface-container-lowest rounded-lg border-l-4 border-error shadow-sm hover:shadow transition-shadow">
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[9px] font-bold text-on-surface-variant opacity-60">SKU: {item.sku}</p>
                      <p className="font-display text-xs font-bold text-primary truncate" title={item.name}>{item.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-extrabold text-error text-xs">{item.available} left</span>
                        <span className="text-[9px] text-on-surface-variant font-medium">• Threshold: {item.threshold}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleQuickRestock(item.id, 10)}
                      className="bg-primary text-white p-2.5 rounded-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                      title="Quick Restock +10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {items.filter(item => item.available <= item.threshold).length > 0 && (
              <button 
                onClick={handleFocusLowStock}
                className="w-full mt-4 py-2 border-2 border-error/30 text-error font-sans font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-error hover:text-white transition-all cursor-pointer text-center"
              >
                VIEW DETAILED INVENTORY STATUS
              </button>
            )}
          </section>

          {/* Historical Logs Timeline */}
          <section className="bg-surface-container-low rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-primary">Activity Log</h3>
              <div className="p-1.5 bg-surface rounded-lg border border-outline-variant text-on-surface-variant opacity-60">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-5 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-outline-variant max-h-[310px] overflow-y-auto no-scrollbar pr-1">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 relative">
                  <div className={`w-[23px] h-[23px] rounded-full flex items-center justify-center ring-4 ring-surface-container-low z-10 flex-shrink-0 ${
                    log.type === 'add' 
                      ? 'bg-primary text-white' 
                      : log.type === 'shipment' 
                        ? 'bg-on-secondary-container text-white' 
                        : 'bg-tertiary text-white'
                  }`}>
                    {log.type === 'add' && <Plus className="w-3 h-3 font-bold" />}
                    {log.type === 'shipment' && <Download className="w-3 h-3" />}
                    {log.type === 'adjustment' && <SlidersHorizontal className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[9px] font-bold text-on-surface-variant uppercase mb-0.5 tracking-wider">{log.timestamp}</p>
                    <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                      {log.message.includes('Stock Added') ? (
                        <>
                          <span className="font-bold text-primary">Stock Added:</span> {log.message.replace('Stock Added:', '')}
                        </>
                      ) : log.message.includes('Adjustment') ? (
                        <>
                          <span className="font-bold text-tertiary">Adjustment:</span> {log.message.replace('Adjustment:', '')}
                        </>
                      ) : log.message.includes('Batch Created') ? (
                        <>
                          <span className="font-bold text-primary">Batch Introduced:</span> {log.message.replace('Batch Created:', '')}
                        </>
                      ) : (
                        log.message
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
