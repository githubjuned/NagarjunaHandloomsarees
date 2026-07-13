import React, { useState, useMemo } from 'react';
import { 
  InventoryItem, 
  Order 
} from '../types';
import { 
  Package, 
  ShoppingCart, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight,
  MoreVertical,
  CheckCircle,
  Truck,
  Clock,
  ExternalLink
} from 'lucide-react';

interface OverviewTabProps {
  items: InventoryItem[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onNavigateToInventory: () => void;
  triggerToast: (msg: string, type?: 'success' | 'error') => void;
  onOpenNewBatch: () => void;
}

export default function OverviewTab({ 
  items, 
  orders, 
  setOrders, 
  onNavigateToInventory,
  triggerToast,
  onOpenNewBatch
}: OverviewTabProps) {
  // Actions dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Dynamic statistics based on state
  const totalProducts = useMemo(() => {
    return 1278 + items.length;
  }, [items]);

  const totalOrdersCount = useMemo(() => {
    return 448 + orders.length;
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'Pending').length + 14;
  }, [orders]);

  const totalRevenue = useMemo(() => {
    // Starting baseline of ₹8.2M + sum of any new or custom orders
    const baseRevenue = 8200000;
    const additional = orders.reduce((sum, order) => {
      const val = parseInt(order.price.replace(/[^\d]/g, ''), 10) || 0;
      return sum + val;
    }, 0);
    const total = baseRevenue + additional;
    return `₹${(total / 1000000).toFixed(1)}M`;
  }, [orders]);

  // Dynamic breakdown for Donut Chart
  const donutData = useMemo(() => {
    const total = items.length || 1;
    const outOfStock = items.filter(i => i.available === 0).length;
    const lowStock = items.filter(i => i.available > 0 && i.available <= i.threshold).length;
    const inStock = items.filter(i => i.available > i.threshold).length;

    const inStockPct = Math.round((inStock / total) * 100);
    const lowStockPct = Math.round((lowStock / total) * 100);
    const outOfStockPct = 100 - inStockPct - lowStockPct;

    return {
      inStock: inStockPct,
      lowStock: lowStockPct,
      outOfStock: outOfStockPct,
      totalCount: items.reduce((sum, i) => sum + i.available, 0)
    };
  }, [items]);

  // SVG Circled Donut offset helper
  // circumference is 2 * pi * r = 2 * 3.14159 * 15.9155 = 100
  const inStockOffset = 0;
  const lowStockOffset = 100 - donutData.inStock;
  const outOfStockOffset = 100 - donutData.inStock - donutData.lowStock;

  // Handle Order Status change
  const handleUpdateOrderStatus = (orderId: string, nextStatus: Order['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        triggerToast(`Order ${o.orderId} status updated to ${nextStatus}.`);
        return { ...o, status: nextStatus };
      }
      return o;
    }));
    setActiveDropdownId(null);
  };

  // Mock sales data with interactive hovers
  const salesData = [
    { month: 'Jan', revenue: '₹3.2L', pct: '40%' },
    { month: 'Feb', revenue: '₹4.8L', pct: '60%' },
    { month: 'Mar', revenue: '₹3.6L', pct: '45%' },
    { month: 'Apr', revenue: '₹6.8L', pct: '85%' },
    { month: 'May', revenue: '₹5.6L', pct: '70%' },
    { month: 'Jun', revenue: '₹8.2L', pct: '100%', highlight: true }
  ];

  return (
    <div className="space-y-8 flex-1 p-margin-mobile md:p-8 pb-32 lg:pb-10 bg-[#f8f9fa]">
      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Products Stat */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col gap-2 bento-card relative overflow-hidden">
          {/* Top border accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-primary/5 text-primary rounded-xl border border-primary/10">
              <Package className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+12%</span>
          </div>
          <h3 className="text-on-surface-variant font-sans text-[10px] font-bold uppercase tracking-widest mt-4">Total Products</h3>
          <p className="font-display text-3xl font-extrabold text-primary leading-none mt-1">{totalProducts}</p>
        </div>

        {/* Total Orders Stat */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col gap-2 bento-card relative overflow-hidden">
          {/* Top border accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary/50 to-tertiary" />
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-tertiary/5 text-tertiary rounded-xl border border-tertiary/10">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full border border-tertiary/20">+5.2%</span>
          </div>
          <h3 className="text-on-surface-variant font-sans text-[10px] font-bold uppercase tracking-widest mt-4">Total Orders</h3>
          <p className="font-display text-3xl font-extrabold text-primary leading-none mt-1">{totalOrdersCount}</p>
        </div>

        {/* Pending Orders Stat */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col gap-2 bento-card relative overflow-hidden">
          {/* Top border accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error/50 to-error" />
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-error/5 text-error rounded-xl border border-error/10">
              <AlertCircle className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold text-error bg-error-container/40 px-2 py-0.5 rounded-full border border-error-container/50">High</span>
          </div>
          <h3 className="text-on-surface-variant font-sans text-[10px] font-bold uppercase tracking-widest mt-4">Pending Orders</h3>
          <p className="font-display text-3xl font-extrabold text-primary leading-none mt-1">{pendingOrdersCount}</p>
        </div>

        {/* Revenue Stat */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col gap-2 bento-card relative overflow-hidden">
          {/* Top border accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary" />
          <div className="flex items-center justify-between">
            <span className="p-2.5 bg-primary/5 text-primary rounded-xl border border-primary/10">
              <TrendingUp className="w-5 h-5 text-tertiary" />
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+22%</span>
          </div>
          <h3 className="text-on-surface-variant font-sans text-[10px] font-bold uppercase tracking-widest mt-4">Revenue</h3>
          <p className="font-display text-3xl font-extrabold text-primary leading-none mt-1">{totalRevenue}</p>
        </div>
      </div>

      {/* CHARTS & INVENTORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly Sales Bar Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-0.5">
              <h4 className="font-display text-lg font-bold text-primary">Monthly Sales Revenue</h4>
              <p className="text-[9px] font-sans font-bold text-on-surface-variant opacity-75 uppercase tracking-widest">
                Aggregated billing index
              </p>
            </div>
            <select className="bg-surface-container-low/70 border border-outline-variant/40 rounded-xl font-sans text-xs font-bold py-2 px-3 focus:ring-1 focus:ring-primary cursor-pointer outline-none text-primary">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          {/* Visual representation of a bar chart using flexbox */}
          <div className="h-64 flex items-end justify-between gap-4 mt-4">
            {salesData.map((data, idx) => (
              <div key={data.month} className="w-full flex flex-col items-center gap-2 group relative">
                {/* Custom Tooltip */}
                <div className="absolute bottom-full mb-2 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-10">
                  {data.revenue} Sales
                </div>
                
                <div 
                  style={{ height: data.pct }}
                  className={`w-full transition-all duration-500 rounded-t-xl cursor-pointer ${
                    data.highlight 
                      ? 'bg-gradient-to-t from-primary-container to-primary shadow-lg shadow-primary/10' 
                      : 'bg-surface-container hover:bg-primary-container/20'
                  }`}
                />
                
                <span className={`text-[10px] font-sans font-bold uppercase tracking-wider mt-1 ${
                  data.highlight ? 'text-primary font-extrabold' : 'text-on-surface-variant'
                }`}>
                  {data.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status Donut (Fully Reactive Visual) */}
        <div className="bg-white p-8 rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
          <h4 className="font-display text-lg font-bold text-primary mb-4">Inventory Status</h4>
          
          <div className="relative flex-grow flex items-center justify-center my-6">
            {/* SVG Donut */}
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle 
                className="text-surface-container-high" 
                cx="18" 
                cy="18" 
                r="15.9155" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              
              {/* In Stock Segment */}
              {donutData.inStock > 0 && (
                <circle 
                  className="text-primary" 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  strokeDasharray={`${donutData.inStock} 100`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
              )}

              {/* Low Stock Segment */}
              {donutData.lowStock > 0 && (
                <circle 
                  className="text-tertiary-container" 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  strokeDasharray={`${donutData.lowStock} 100`}
                  strokeDashoffset={`-${donutData.inStock}`}
                  strokeLinecap="round"
                />
              )}

              {/* Out of Stock Segment */}
              {donutData.outOfStock > 0 && (
                <circle 
                  className="text-surface-container-highest" 
                  cx="18" 
                  cy="18" 
                  r="15.9155" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  strokeDasharray={`${donutData.outOfStock} 100`}
                  strokeDashoffset={`-${donutData.inStock + donutData.lowStock}`}
                  strokeLinecap="round"
                />
              )}
            </svg>
            
            <div className="absolute flex flex-col items-center text-center">
              <span className="font-display text-3xl font-extrabold text-primary">{(donutData.totalCount / 1000).toFixed(1)}K</span>
              <span className="text-[9px] font-sans font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Total Units</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-on-surface font-sans font-semibold">Healthy In Stock</span>
              </div>
              <span className="font-bold text-primary">{donutData.inStock}%</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-tertiary-container"></div>
                <span className="text-on-surface font-sans font-semibold">Low Stock Restocks</span>
              </div>
              <span className="font-bold text-tertiary">{donutData.lowStock}%</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-surface-container-highest"></div>
                <span className="text-on-surface font-sans font-semibold">Out of Stock Variants</span>
              </div>
              <span className="font-bold text-on-surface-variant">{donutData.outOfStock}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <section className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-outline-variant/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-lg font-bold text-primary">Recent Orders</h4>
              <span className="text-tertiary text-xs">✦</span>
            </div>
            <p className="text-[9px] font-sans font-bold text-on-surface-variant opacity-75 uppercase tracking-widest mt-1">
              Active luxury buyer purchases
            </p>
          </div>
          <button 
            onClick={() => triggerToast("Directing to bulk order logs...")}
            className="font-sans text-[11px] font-bold text-primary hover:text-primary-container transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            View All Orders
            <ArrowUpRight className="w-4 h-4 text-tertiary" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-surface-container-low/60 border-b border-outline-variant/40">
              <tr>
                <th className="px-8 py-4 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-4 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Customer</th>
                <th className="px-8 py-4 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Price</th>
                <th className="px-8 py-4 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 font-sans text-[9px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-lowest/80 transition-colors">
                  <td className="px-8 py-5 font-sans text-xs font-bold text-primary tracking-wide">
                    {order.orderId}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-[11px]">
                        {order.initials}
                      </div>
                      <span className="font-sans text-xs font-bold text-on-surface">{order.customerName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-sans text-xs font-medium">
                    {order.date}
                  </td>
                  <td className="px-8 py-5 font-sans text-xs font-bold text-primary tracking-wide">
                    {order.price}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      order.status === 'Processing' 
                        ? 'bg-tertiary-fixed/30 text-tertiary border-tertiary/20' 
                        : order.status === 'Shipped' 
                          ? 'bg-primary-fixed-dim/20 text-primary border-primary/20' 
                          : order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-error/5 text-error border-error/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right relative">
                    <button 
                      onClick={() => setActiveDropdownId(prev => prev === order.id ? null : order.id)}
                      className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-container cursor-pointer inline-flex items-center justify-center"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Status adjustment micro dropdown */}
                    {activeDropdownId === order.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setActiveDropdownId(null)}
                        />
                        <div className="absolute right-8 top-12 bg-white border border-outline-variant/60 shadow-xl rounded-xl p-2 w-44 z-50 text-left">
                          <p className="font-sans text-[9px] font-bold text-on-surface-variant uppercase p-2 border-b border-outline-variant/40">Update Status</p>
                          <div className="flex flex-col gap-1 mt-1">
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Processing')}
                              className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg w-full text-left cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-tertiary" />
                              Processing
                            </button>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Shipped')}
                              className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg w-full text-left cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5 text-primary" />
                              Shipped
                            </button>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                              className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg w-full text-left cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Delivered
                            </button>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Pending')}
                              className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg w-full text-left cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-error" />
                              Pending
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
