import { useState } from 'react';
import { 
  LayoutDashboard,
  Package, 
  ShoppingCart, 
  Warehouse, 
  Users, 
  Settings, 
  LogOut,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'overview' | 'products' | 'orders' | 'inventory' | 'customers' | 'settings';
  setActiveTab: (tab: 'overview' | 'products' | 'orders' | 'inventory' | 'customers' | 'settings') => void;
  onLogout: () => void;
  onViewStorefront: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, onViewStorefront }: SidebarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;


  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 left-0 right-0 h-16 bg-white border-b border-outline-variant/60 z-30 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 hover:bg-surface-container-low rounded-xl text-primary cursor-pointer active:scale-95 transition-all"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-xs font-black text-primary uppercase tracking-wider leading-none">SRI PADMA HANDLOOM</h1>
            <span className="font-sans text-[8px] font-bold text-[#8C6D41] tracking-wider uppercase opacity-85 mt-0.5 block">Admin Portal</span>
          </div>
        </div>

        {/* Return Storefront quick action button on top */}
        <button 
          onClick={onViewStorefront}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-primary to-[#001f54] text-white rounded-full font-sans text-[9px] font-bold uppercase tracking-wider hover:opacity-95 shadow-sm active:scale-95 transition-all cursor-pointer border border-primary/10"
        >
          <Sparkles className="w-3 h-3 text-tertiary-fixed-dim" />
          <span>Return Store</span>
        </button>
      </div>

      {/* Mobile Drawer Overlay and Panel */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer Panel content */}
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-white shadow-2xl p-6 border-r border-outline-variant/60 animate-in slide-in-from-left duration-200">
            {/* Close trigger and logo */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">
              <div>
                <h1 className="font-display text-base text-primary font-bold tracking-wider uppercase leading-tight">SRI PADMA HANDLOOM</h1>
                <p className="font-sans text-[8px] font-bold text-on-surface-variant tracking-widest uppercase opacity-80 mt-1">
                  Heritage Admin Portal
                </p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-surface-container-low rounded-lg text-primary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* View Storefront trigger */}
            <button 
              onClick={() => {
                setIsDrawerOpen(false);
                onViewStorefront();
              }}
              className="w-full mb-6 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary to-[#001f54] text-white rounded-xl font-sans text-[10px] font-bold uppercase tracking-widest hover:opacity-95 shadow-md transition-all cursor-pointer border border-primary/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-tertiary-fixed-dim" />
              View Storefront
            </button>

            {/* List items exactly matching desktop */}
            <nav className="flex flex-col gap-1.5 overflow-y-auto flex-grow no-scrollbar">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer text-left group ${
                      isActive
                        ? 'bg-primary text-white font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-tertiary-fixed stroke-[2.2px]' : 'stroke-[1.8px] group-hover:text-primary transition-colors'}`} />
                      <span className="font-sans text-[10px] font-bold tracking-wider uppercase">{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container shadow-sm" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Admin Profile Details exactly matching desktop */}
            <div className="mt-auto p-4 flex items-center gap-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
              <img 
                className="w-10 h-10 rounded-full object-cover border-2 border-primary" 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" 
                alt="Padma Admin profile"
                referrerPolicy="no-referrer"
              />
              <div className="flex-grow min-w-0">
                <span className="font-sans text-[11px] font-extrabold text-primary block truncate">Padma Admin</span>
                <span className="font-sans text-[9px] text-on-surface-variant block truncate tracking-wide">Chief Curator</span>
              </div>
              <button 
                onClick={() => {
                  setIsDrawerOpen(false);
                  onLogout();
                }}
                className="text-on-surface-variant hover:text-error transition-colors p-1.5 hover:bg-error-container/30 rounded-lg cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col gap-base p-6 h-screen w-64 fixed left-0 top-0 bg-white border-r border-outline-variant/60 z-40">
        <div className="px-2 py-4 border-b border-outline-variant/30 mb-4 space-y-4">
          <div>
            <h1 className="font-display text-xl text-primary font-bold tracking-wider leading-tight uppercase">SRI PADMA HANDLOOM</h1>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              <p className="font-sans text-[9px] font-bold text-on-surface-variant tracking-widest uppercase opacity-80">
                Heritage Admin Portal
              </p>
            </div>
          </div>

          <button 
            onClick={onViewStorefront}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-primary to-[#001f54] text-white rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider hover:opacity-95 shadow-sm shadow-primary/20 transition-all cursor-pointer border border-primary/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-tertiary-fixed-dim" />
            View Storefront
          </button>
        </div>
        
        <nav className="flex flex-col gap-1.5 overflow-y-auto flex-grow no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer text-left group ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-tertiary-fixed stroke-[2.2px]' : 'stroke-[1.8px] group-hover:text-primary transition-colors'}`} />
                  <span className="font-sans text-[11px] font-semibold tracking-wider uppercase">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 flex items-center gap-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
          <img 
            className="w-10 h-10 rounded-full object-cover border-2 border-primary" 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" 
            alt="Padma Admin profile"
            referrerPolicy="no-referrer"
          />
          <div className="flex-grow min-w-0">
            <span className="font-sans text-xs font-bold text-primary block truncate">Padma Admin</span>
            <span className="font-sans text-[10px] text-on-surface-variant block truncate tracking-wide">Chief Curator</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-on-surface-variant hover:text-error transition-colors p-1.5 hover:bg-error-container/30 rounded-lg"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Bottom Nav Bar for Mobile Only */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 bg-white z-40 shadow-lg border-t border-outline-variant/40 rounded-t-2xl pb-safe">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 cursor-pointer transition-all duration-150 rounded-lg ${
                isActive ? 'text-primary font-bold scale-102 bg-primary/5' : 'text-on-surface-variant'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary stroke-[2.2px]' : 'stroke-[1.8px]'}`} />
              <span className="font-sans text-[9px] mt-1 tracking-wider uppercase font-semibold">
                {item.id === 'overview' ? 'Home' : item.label}
              </span>
            </button>
          );
        })}
        <button 
          onClick={onViewStorefront}
          className="flex flex-col items-center justify-center py-1.5 px-3 cursor-pointer transition-all duration-150 rounded-lg text-tertiary font-bold hover:bg-tertiary/5"
        >
          <Sparkles className="w-4 h-4 text-tertiary stroke-[2.2px]" />
          <span className="font-sans text-[9px] mt-1 tracking-wider uppercase font-semibold">Store</span>
        </button>
      </nav>
    </>
  );
}
