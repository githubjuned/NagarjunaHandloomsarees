/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  AlertCircle,
  Plus,
  Download,
  Package,
  ShoppingCart,
  Users,
  Settings,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import OverviewTab from './components/OverviewTab';
import InventoryTab from './components/InventoryTab';
import ProductsTab from './components/ProductsTab';
import NewBatchModal from './components/NewBatchModal';
import AdjustStockModal from './components/AdjustStockModal';
import BoutiqueHome from './components/BoutiqueHome';
import OrdersTab from './components/OrdersTab';

import { InventoryItem, ActivityLogEntry, Order, AdjustmentType } from './types';
import { INITIAL_INVENTORY, INITIAL_LOGS, INITIAL_ORDERS } from './data';

export default function App() {
  // Navigation & Page State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('sri_padma_admin_logged_in') === 'true' || localStorage.getItem('akhil_admin_logged_in') === 'true';
  });
  const [viewMode, setViewMode] = useState<'boutique' | 'admin'>('boutique');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory' | 'customers' | 'settings'>('overview');

  // Enforce admin login requirement
  useEffect(() => {
    if (viewMode === 'admin' && !isAdminLoggedIn) {
      setViewMode('boutique');
    }
  }, [viewMode, isAdminLoggedIn]);
  
  // Data State
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('sri_padma_inventory_items') || localStorage.getItem('akhil_inventory_items');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [logs, setLogs] = useState<ActivityLogEntry[]>(() => {
    const saved = localStorage.getItem('sri_padma_inventory_logs') || localStorage.getItem('akhil_inventory_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sri_padma_inventory_orders') || localStorage.getItem('akhil_inventory_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Modal & Popup States
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('sri_padma_inventory_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('sri_padma_inventory_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('sri_padma_inventory_orders', JSON.stringify(orders));
  }, [orders]);

  // Global trigger helper for notifications
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Export CSV Data Generator
  const handleExportCSV = () => {
    const headers = ['Product Name', 'Category', 'SKU', 'Retail Price', 'Available Stock', 'Specs', 'Status', 'Threshold'];
    const rows = items.map(item => [
      `"${item.name}"`,
      `"${item.category}"`,
      `"${item.sku}"`,
      item.price || 0,
      item.available,
      `"${item.specs}"`,
      `"${item.status}"`,
      item.threshold
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sri_padma_inventory_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Administrative report successfully exported to CSV.");
  };

  // Stock update adjustment save handler
  const handleSaveStockAdjustment = (
    itemId: string,
    adjustType: AdjustmentType,
    qty: number,
    note: string
  ) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        let newQty = item.available;
        const isIncrement = adjustType.includes('+');

        if (isIncrement) {
          newQty += qty;
        } else {
          newQty = Math.max(0, item.available - qty);
        }

        // Compute live status
        let newStatus = item.status;
        if (newQty === 0) {
          newStatus = 'OUT OF STOCK';
        } else if (newQty <= item.threshold) {
          newStatus = 'LOW STOCK';
        } else {
          newStatus = item.status === 'PRE-ORDER' ? 'PRE-ORDER' : 'IN STOCK';
        }

        // Register in activity log
        const now = new Date();
        const timeStr = `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        const label = isIncrement ? 'Added' : 'Removed';
        const newLog: ActivityLogEntry = {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          type: isIncrement ? 'add' : 'adjustment',
          message: `Stock ${label}: ${isIncrement ? '+' : '-'}${qty} units of "${item.name}" - ${note || 'Manual override'}`,
          user: 'Admin_RG'
        };
        setLogs(l => [newLog, ...l]);

        triggerToast(`Successfully adjusted ${item.name} stock to ${newQty} units.`);
        return { ...item, available: newQty, status: newStatus };
      }
      return item;
    }));

    setEditingItem(null);
  };

  // Create brand new batch saree SKU handler
  const handleCreateNewBatch = (newBatchData: {
    name: string;
    sku: string;
    category: string;
    available: number;
    specs: string;
    threshold: number;
    imagePreset: number;
    price: number;
  }) => {
    // Check uniqueness of SKU identifier
    if (items.some(item => item.sku.toUpperCase() === newBatchData.sku.toUpperCase())) {
      triggerToast(`Master SKU ${newBatchData.sku} already exists in catalog.`, "error");
      return;
    }

    const IMAGE_PRESETS = [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590156221122-c748c78f2a41?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ];

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: newBatchData.name,
      category: newBatchData.category,
      sku: newBatchData.sku.toUpperCase(),
      status: newBatchData.available === 0 
        ? 'OUT OF STOCK' 
        : newBatchData.available <= newBatchData.threshold 
          ? 'LOW STOCK' 
          : 'IN STOCK',
      available: newBatchData.available,
      specs: newBatchData.specs,
      imageUrl: IMAGE_PRESETS[newBatchData.imagePreset] || IMAGE_PRESETS[0],
      threshold: newBatchData.threshold,
      price: newBatchData.price
    };

    setItems(prev => [newItem, ...prev]);

    // Create entry logs
    const now = new Date();
    const timeStr = `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    const newLog: ActivityLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      type: 'add',
      message: `Batch Created: Introduced new SKU "${newItem.sku}" (${newItem.name}) with ${newBatchData.available} units.`,
      user: 'Admin_RG'
    };
    setLogs(l => [newLog, ...l]);

    setIsNewBatchOpen(false);
    triggerToast(`Created handloom batch master "${newItem.name}" successfully!`);
  };

  const handleBoutiqueOrderPlaced = (orderDetails: {
    orderId: string;
    customerName: string;
    price: string;
    items: { sku: string; name: string; quantity: number }[];
  }) => {
    // 1. Create a new administrative Order
    const initials = orderDetails.customerName
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CU';

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newAdminOrder: Order = {
      id: `order-${Date.now()}`,
      orderId: orderDetails.orderId,
      customerName: orderDetails.customerName,
      initials,
      date: dateStr,
      price: orderDetails.price,
      status: 'Pending'
    };

    setOrders(prev => [newAdminOrder, ...prev]);

    // 2. Reduce inventory stock for the ordered items, update status, and create logs
    const newLogs: ActivityLogEntry[] = [];
    const now = new Date();
    const timeStr = `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    setItems(prevItems => prevItems.map(item => {
      const orderItem = orderDetails.items.find(oi => oi.sku === item.sku);
      if (orderItem) {
        const newQty = Math.max(0, item.available - orderItem.quantity);
        
        let newStatus = item.status;
        if (newQty === 0) {
          newStatus = 'OUT OF STOCK';
        } else if (newQty <= item.threshold) {
          newStatus = 'LOW STOCK';
        } else {
          newStatus = 'IN STOCK';
        }

        // Add log entry
        newLogs.push({
          id: `log-${Date.now()}-${item.sku}`,
          timestamp: timeStr,
          type: 'adjustment',
          message: `Auto-Sale: Reduced stock by ${orderItem.quantity} units for "${item.name}" (SKU: ${item.sku}) due to Boutique Order ${orderDetails.orderId}`,
          user: 'System'
        });

        return {
          ...item,
          available: newQty,
          status: newStatus as any
        };
      }
      return item;
    }));

    // Prepend logs
    if (newLogs.length > 0) {
      setLogs(prevLogs => [...newLogs, ...prevLogs]);
    }
  };

  if (viewMode === 'boutique') {
    return (
      <div className="bg-[#f8f9fa] text-on-surface font-sans min-h-screen relative antialiased flex flex-col">
        {/* Dynamic Toast System */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
                toast.type === 'success' 
                  ? 'bg-primary text-white border-primary-container' 
                  : 'bg-error-container text-on-error-container border-error/20'
              }`}
            >
              {toast.type === 'success' ? (
                <div className="w-5 h-5 rounded-full bg-primary-container/40 flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5" />
                </div>
              ) : (
                <AlertCircle className="w-5 h-5 text-error" />
              )}
              <p className="font-sans font-semibold text-sm tracking-wide">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
 
        <BoutiqueHome 
          items={items}
          onEnterAdminMode={() => {
            if (isAdminLoggedIn) {
              setViewMode('admin');
            } else {
              triggerToast("Access Denied: Owner login required to access Admin Panel.", "error");
            }
          }}
          triggerToast={triggerToast}
          onOrderPlaced={handleBoutiqueOrderPlaced}
          isAdminLoggedIn={isAdminLoggedIn}
          onAdminLoginChange={(val) => {
            setIsAdminLoggedIn(val);
            if (val) {
              localStorage.setItem('sri_padma_admin_logged_in', 'true');
            } else {
              localStorage.removeItem('sri_padma_admin_logged_in');
              localStorage.removeItem('akhil_admin_logged_in');
              setViewMode('boutique');
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-sans min-h-screen relative antialiased flex flex-col">
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
              toast.type === 'success' 
                ? 'bg-primary text-white border-primary-container' 
                : 'bg-error-container text-on-error-container border-error/20'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-primary-container/40 flex items-center justify-center text-white">
                <Check className="w-3.5 h-3.5" />
              </div>
            ) : (
              <AlertCircle className="w-5 h-5 text-error" />
            )}
            <p className="font-sans font-semibold text-sm tracking-wide">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => {
          setIsAdminLoggedIn(false);
          localStorage.removeItem('sri_padma_admin_logged_in');
          localStorage.removeItem('akhil_admin_logged_in');
          setViewMode('boutique');
          triggerToast("Successfully logged out of active session.", "success");
        }} 
        onViewStorefront={() => setViewMode('boutique')}
      />

      {/* Main Container */}
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-0 flex-1 flex flex-col bg-background">
        
        {/* Shared Aesthetic Responsive Header */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md px-margin-mobile md:px-margin-desktop py-6 flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant">
          <div>
            <h2 className="font-display text-3xl font-bold text-primary tracking-tight">
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'products' && 'Product Management'}
              {activeTab === 'inventory' && 'Inventory & Stock Control'}
              {activeTab === 'orders' && 'Artisan Orders Tracker'}
              {activeTab === 'customers' && 'Luxury Customer Directory'}
              {activeTab === 'settings' && 'System Configuration Panel'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-tertiary"></span>
              <p className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                {activeTab === 'overview' && "Welcome back. Here's what's happening with Sri Padma Handloom Saree Store today."}
                {activeTab === 'products' && 'Create, view, modify, and manage saree product records in the system catalog.'}
                {activeTab === 'inventory' && 'Real-time artisan production tracker'}
                {activeTab === 'orders' && 'Global fulfillment and dispatch control logs'}
                {activeTab === 'customers' && 'View premium clientele engagement indices'}
                {activeTab === 'settings' && 'Configure automated email limits and safety thresholds'}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-outline-variant/60 text-primary rounded-xl font-sans text-xs font-bold hover:bg-surface-container-low transition-all uppercase cursor-pointer"
            >
              <Download className="w-4 h-4 text-tertiary" />
              {activeTab === 'overview' || activeTab === 'products' ? 'Export Report' : 'Export CSV'}
            </button>
            <button 
              onClick={() => setIsNewBatchOpen(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl font-sans text-xs font-bold hover:shadow-md transition-all active:scale-98 cursor-pointer uppercase tracking-wider border border-primary/10"
            >
              <Plus className="w-4 h-4 text-tertiary-fixed" />
              {activeTab === 'overview' || activeTab === 'products' ? 'New Product' : 'New Batch'}
            </button>
          </div>
        </header>

        {/* Tab Switching Body */}
        {activeTab === 'overview' && (
          <OverviewTab 
            items={items}
            orders={orders}
            setOrders={setOrders}
            onNavigateToInventory={() => setActiveTab('inventory')}
            triggerToast={triggerToast}
            onOpenNewBatch={() => setIsNewBatchOpen(true)}
          />
        )}

        {activeTab === 'products' && (
          <div className="p-margin-mobile md:p-margin-desktop">
            <ProductsTab 
              items={items}
              onAddItem={() => setIsNewBatchOpen(true)}
              onEditItem={(updatedItem) => {
                setItems(prev => prev.map(it => it.id === updatedItem.id ? updatedItem : it));
                
                const now = new Date();
                const timeStr = `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
                const newLog: ActivityLogEntry = {
                  id: `log-${Date.now()}`,
                  timestamp: timeStr,
                  type: 'adjustment',
                  message: `Product Updated: General record adjustments for "${updatedItem.name}" (${updatedItem.sku}).`,
                  user: 'Admin_RG'
                };
                setLogs(l => [newLog, ...l]);
                triggerToast(`Saved changes for ${updatedItem.name} successfully.`);
              }}
              onDeleteItem={(itemId) => {
                const deletedItem = items.find(it => it.id === itemId);
                setItems(prev => prev.filter(it => it.id !== itemId));
                
                if (deletedItem) {
                  const now = new Date();
                  const timeStr = `Today, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
                  const newLog: ActivityLogEntry = {
                    id: `log-${Date.now()}`,
                    timestamp: timeStr,
                    type: 'adjustment',
                    message: `Product Deleted: Removed "${deletedItem.name}" (${deletedItem.sku}) from catalog.`,
                    user: 'Admin_RG'
                  };
                  setLogs(l => [newLog, ...l]);
                  triggerToast(`Removed product ${deletedItem.name} from catalog.`, "success");
                }
              }}
            />
          </div>
        )}

        {activeTab === 'inventory' && (
          <InventoryTab 
            items={items}
            setItems={setItems}
            logs={logs}
            setLogs={setLogs}
            onEditItem={setEditingItem}
            triggerToast={triggerToast}
          />
        )}

        {activeTab === 'orders' && (
          <div className="p-margin-mobile md:p-margin-desktop">
            <OrdersTab 
              orders={orders}
              setOrders={setOrders}
              triggerToast={triggerToast}
            />
          </div>
        )}

        {(activeTab === 'customers' || activeTab === 'settings') && (
          <div className="p-margin-mobile md:p-margin-desktop flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4">
            <div className="p-4 bg-primary-fixed rounded-full text-primary">
              {activeTab === 'customers' && <Users className="w-10 h-10" />}
              {activeTab === 'settings' && <Settings className="w-10 h-10" />}
            </div>
            <h3 className="font-display text-2xl text-primary font-bold">
              {activeTab === 'customers' && 'Client Portfolio'}
              {activeTab === 'settings' && 'Admin Configuration'}
            </h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
              This panel is dynamically configured within the master controller. Real-time database operations and stock alerts are fully operational under the <span className="font-bold text-primary">Inventory</span> and <span className="font-bold text-primary">Overview</span> tabs.
            </p>
            <button 
              onClick={() => setActiveTab('overview')}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-sans text-xs font-bold shadow hover:opacity-95 cursor-pointer uppercase"
            >
              Return to Overview
            </button>
          </div>
        )}

        {/* Dynamic Footer with Administrative Context */}
        <footer className="w-full mt-auto border-t border-outline-variant bg-surface-container-lowest py-12 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter mb-8">
            <div className="col-span-1 md:col-span-2">
              <h2 className="font-display text-3xl font-bold text-primary tracking-tighter uppercase mb-4">SRI PADMA HANDLOOM SAREE STORE</h2>
              <p className="font-sans text-xs font-medium text-on-secondary-container max-w-sm mb-6 leading-relaxed">
                Managing the digital legacy of Sri Padma Handloom Saree Store's finest handloom artistry. For internal administrative use only.
              </p>
              <div className="text-on-secondary-container text-xs font-bold uppercase tracking-widest opacity-80">
                © 2024 Sri Padma Handloom Saree Store. All Rights Reserved.
              </div>
            </div>
            <div>
              <h4 className="font-sans text-xs font-bold text-primary mb-4 uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-2 flex flex-col">
                <li><a className="font-sans text-xs font-bold text-on-secondary-container hover:text-primary transition-all uppercase" href="#">The Craft</a></li>
                <li><a className="font-sans text-xs font-bold text-on-secondary-container hover:text-primary transition-all uppercase" href="#">Sustainability</a></li>
                <li><a className="font-sans text-xs font-bold text-on-secondary-container hover:text-primary transition-all uppercase" href="#">Shipping Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-xs font-bold text-primary mb-4 uppercase tracking-widest">Support</h4>
              <ul className="space-y-2 flex flex-col">
                <li><a className="font-sans text-xs font-bold text-on-secondary-container hover:text-primary transition-all uppercase" href="#">Privacy Policy</a></li>
                <li><a className="font-sans text-xs font-bold text-on-secondary-container hover:text-primary transition-all uppercase" href="#">Contact Us</a></li>
                <li><a className="font-sans text-xs font-bold text-on-secondary-container hover:text-primary transition-all uppercase" href="#">System Status</a></li>
              </ul>
            </div>
          </div>

          <div className="relative border-t border-outline-variant pt-6 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-sans text-[10px] font-bold text-on-secondary-container opacity-80 font-mono">© 2024 Sri Padma Handloom Saree Store. All Rights Reserved.</p>
            
            <div className="flex flex-col items-center gap-1.5 md:absolute md:left-1/2 md:-translate-x-1/2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] tracking-[0.25em] uppercase font-sans font-medium text-[#c5a85c] flex items-center gap-2">
                  ✦ <span className="text-primary font-bold">AUTHENEX</span> ✦
                </span>
              </div>
              <span className="text-[9px] font-bold text-on-secondary-container opacity-60 uppercase tracking-[0.2em] font-sans">
                Designed by <span className="text-primary font-extrabold hover:text-[#c5a85c] transition-colors duration-300">AUTHENEX</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="font-sans text-[9px] font-bold text-on-secondary-container opacity-60 uppercase tracking-widest">SYSTEM SECURE</span>
              <div className="h-1.5 w-1.5 rounded-full bg-[#c5a85c]"></div>
            </div>
          </div>
        </footer>

      </main>

      {/* Global Modals System */}
      <NewBatchModal 
        isOpen={isNewBatchOpen}
        onClose={() => setIsNewBatchOpen(false)}
        onSave={handleCreateNewBatch}
        triggerToast={triggerToast}
      />

      <AdjustStockModal 
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveStockAdjustment}
        triggerToast={triggerToast}
      />

    </div>
  );
}
