import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User, 
  ArrowRight, 
  Mail, 
  Phone, 
  Settings, 
  Check, 
  Filter, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  X,
  SlidersHorizontal,
  Star,
  Bell,
  Truck,
  MapPin,
  Home,
  Grid,
  Copy
} from 'lucide-react';
import { InventoryItem } from '../types';

interface BoutiqueHomeProps {
  items: InventoryItem[];
  onEnterAdminMode: () => void;
  triggerToast: (msg: string, type?: 'success' | 'error') => void;
  onOrderPlaced: (orderDetails: {
    orderId: string;
    customerName: string;
    price: string;
    items: { sku: string; name: string; quantity: number }[];
  }) => void;
  isAdminLoggedIn: boolean;
  onAdminLoginChange: (loggedIn: boolean) => void;
}

export default function BoutiqueHome({ 
  items, 
  onEnterAdminMode, 
  triggerToast,
  onOrderPlaced,
  isAdminLoggedIn,
  onAdminLoginChange
}: BoutiqueHomeProps) {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'home' | 'shop' | 'cart' | 'contact' | 'order-confirmed' | 'orders' | 'product-detail' | 'checkout' | 'profile'>('home');
  
  // Checkout Form states
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutCity, setCheckoutCity] = useState('');
  const [checkoutState, setCheckoutState] = useState('Telangana');
  const [checkoutPincode, setCheckoutPincode] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [copiedDetails, setCopiedDetails] = useState(false);
  
  // Confirmed Order details for the custom success screen
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    items: CartItem[];
    subtotal: number;
    discountAmount: number;
    tax: number;
    grandTotal: number;
    customerName: string;
    email: string;
    phone: string;
    address: string;
  } | null>(null);

  // Custom customer orders list for history & tracking
  interface Order {
    orderId: string;
    items: CartItem[];
    subtotal: number;
    discountAmount: number;
    tax: number;
    grandTotal: number;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    status: 'PLACED' | 'DYEING' | 'WEAVING' | 'QUALITY_CHECK' | 'DISPATCHED' | 'DELIVERED';
    date: string;
    estimatedDelivery: string;
    trackingNumber: string;
    courier: string;
  }

  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  const [trackedOrderId, setTrackedOrderId] = useState<string>('');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  
  // Search & Cart states
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Owner Login states
  const [loginTab, setLoginTab] = useState<'customer' | 'owner'>('customer');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerError, setOwnerError] = useState('');

  // Product Detail States
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem>({
    id: 'default-gadwal',
    name: 'Pure Gadwal Silk Saree with Zari Border',
    category: 'Pure Mulberry Silk',
    sku: 'RG-SLK-ROY',
    status: 'IN STOCK',
    available: 12,
    specs: 'Traditional Temple Border | 5.5 Meters',
    imageUrl: '/images/saree1.jpg',
    threshold: 5,
    price: 32500
  });
  const [activeImage, setActiveImage] = useState<number>(0);
  const [detailQty, setDetailQty] = useState<number>(1);
  const [specsExpanded, setSpecsExpanded] = useState<boolean>(true);
  const [careExpanded, setCareExpanded] = useState<boolean>(false);
  const [zoomOrigin, setZoomOrigin] = useState<string>('center center');

  // Customer Reviews
  const [reviews, setReviews] = useState([
    {
      name: 'ANITA SHARMA',
      time: '2 days ago',
      rating: 5,
      comment: 'The drape of this Gadwal saree is absolutely stunning. The silk is incredibly soft yet has that traditional stiffness in the border that defines a true Gadwal. Excellent craftsmanship.'
    },
    {
      name: 'PRIYA R.',
      time: '1 week ago',
      rating: 5,
      comment: 'Purchased this for my daughter\'s wedding. The gold zari work is very intricate and fine. It looks much more expensive in person. Highly recommended!'
    }
  ]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Structured shopping cart item structure
  interface CartItem {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    imageUrl: string;
    quantity: number;
    specs?: string;
  }

  // Preloaded luxury items in the shopping bag
  const [cart, setCart] = useState<CartItem[]>(() => []);

  // Derived count of total items in shopping bag
  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Google Authenticated User state
  const [googleUser, setGoogleUser] = useState<{
    name: string;
    email: string;
    picture: string;
  } | null>(() => {
    const saved = localStorage.getItem('sri_padma_google_user') || localStorage.getItem('akhil_google_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Dynamically load Google GSI client library
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-gsi-client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleCredentialResponse = (response: any) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
      
      setGoogleUser(userData);
      localStorage.setItem('sri_padma_google_user', JSON.stringify(userData));
      triggerToast(`Namaste ${decoded.name}! Successfully signed in with Google.`, 'success');
    } catch (err) {
      console.error('Failed to parse Google credential:', err);
      triggerToast('Google Sign-In failed to parse account details.', 'error');
    }
  };

  const initializeGoogleSignIn = () => {
    if ((window as any).google) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '1043329623868-h6p1mrtjghclonb067fsc0df8on67it2.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        });
        const btnContainer = document.getElementById('google-signin-btn');
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(
            btnContainer,
            { theme: 'outline', size: 'large', width: '280' }
          );
        }
      } catch (err) {
        console.error('Failed to initialize Google accounts:', err);
      }
    }
  };

  useEffect(() => {
    if (currentTab === 'profile') {
      const timer = setTimeout(() => {
        initializeGoogleSignIn();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentTab, googleUser]);

  const handleGoogleSignOut = () => {
    setGoogleUser(null);
    localStorage.removeItem('sri_padma_google_user');
    localStorage.removeItem('akhil_google_user');
    triggerToast('Signed out successfully.', 'success');
  };

  // Scroll smoothly to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);


  // Promo Code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // discount percent (e.g. 10 for 10% off)
  const [promoError, setPromoError] = useState('');
  
  // Advanced Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number>(150000);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('newest');
  
  // Quick View Modal State
  const [quickViewItem, setQuickViewItem] = useState<InventoryItem | null>(null);

  // Contact Form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Bespoke Order Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const colorsList = [
    { name: 'Maroon', hex: '#800000' },
    { name: 'Emerald', hex: '#004d40' },
    { name: 'Mustard', hex: '#ffeb3b' },
    { name: 'Royal Blue', hex: '#123e8c' },
    { name: 'Magenta', hex: '#e91e63' }
  ];

  // Wishlist logic
  const toggleFavorite = (id: string, name: string) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(f => f !== id));
      triggerToast(`Removed ${name} from your wishlist.`);
    } else {
      setFavorites(prev => [...prev, id]);
      triggerToast(`Added ${name} to your wishlist.`, 'success');
    }
  };

  // Cart logic
  const addToCart = (item: InventoryItem) => {
    const existing = cart.find(i => i.id === item.id || i.sku === item.sku);
    if (existing) {
      triggerToast(`Increased quantity of "${item.name}" in your shopping bag.`, 'success');
    } else {
      triggerToast(`Added "${item.name}" to your shopping bag!`, 'success');
    }

    setCart(prev => {
      const alreadyExists = prev.find(i => i.id === item.id || i.sku === item.sku);
      if (alreadyExists) {
        return prev.map(i => (i.id === item.id || i.sku === item.sku) ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prev, {
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          price: item.price || 0,
          imageUrl: item.imageUrl,
          quantity: 1,
          specs: item.specs || "Charming handloom weave with signature contrast borders"
        }];
      }
    });
  };

  const addToCartWithQty = (item: InventoryItem, qty: number) => {
    const existing = cart.find(i => i.id === item.id || i.sku === item.sku);
    if (existing) {
      triggerToast(`Added ${qty} more of "${item.name}" to your shopping bag.`, 'success');
    } else {
      triggerToast(`Added "${item.name}" to your shopping bag!`, 'success');
    }

    setCart(prev => {
      const alreadyExists = prev.find(i => i.id === item.id || i.sku === item.sku);
      if (alreadyExists) {
        return prev.map(i => (i.id === item.id || i.sku === item.sku) ? { ...i, quantity: i.quantity + qty } : i);
      } else {
        return [...prev, {
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          price: item.price || 0,
          imageUrl: item.imageUrl,
          quantity: qty,
          specs: item.specs || "Charming handloom weave with signature contrast borders"
        }];
      }
    });
  };

  const updateCartQty = (id: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeCartItem = (id: string, name: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    triggerToast(`Removed "${name}" from your shopping bag.`);
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'GIFT2024' || code === 'HERITAGE10' || code === 'PADMA' || code === 'AKHIL') {
      setAppliedDiscount(10);
      setPromoError('');
      triggerToast("Promo code applied successfully! 10% discount granted.", "success");
    } else {
      setPromoError("Invalid promo code. Try 'GIFT2024'.");
      triggerToast("Invalid promo code entered.", "error");
    }
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((acc, curr) => acc + ((curr.price || 0) * curr.quantity), 0);
  const cartDiscountAmount = Math.round(cartSubtotal * (appliedDiscount / 100));
  const cartTax = Math.round((cartSubtotal - cartDiscountAmount) * 0.05); // GST 5%
  const cartGrandTotal = cartSubtotal - cartDiscountAmount + cartTax;

  // Newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    triggerToast(`Thank you for subscribing to Sri Padma Handloom Saree Store inner circle!`, 'success');
    setNewsletterEmail('');
  };

  // Contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      triggerToast("Please fill out all required fields.", "error");
      return;
    }
    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSubmitted(true);
      triggerToast("Message sent successfully! We will get in touch shortly.", "success");
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSubject('Bespoke Order Inquiry');
      
      setTimeout(() => {
        setContactSubmitted(false);
      }, 4000);
    }, 1200);
  };

  // Clear filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceLimit(150000);
    setSelectedColor(null);
    setSelectedOccasion(null);
    setSearchQuery('');
    triggerToast("All boutique filters cleared.");
  };

  // Filter category toggler
  const toggleCategoryFilter = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(prev => prev.filter(c => c !== cat));
    } else {
      setSelectedCategories(prev => [...prev, cat]);
    }
  };

  // Master Filter & Sort function for shop view
  const filteredShopItems = items.filter(item => {
    // Category match
    const categoryMatch = selectedCategories.length === 0 || 
      selectedCategories.some(cat => {
        if (cat === 'Pure Silk Gadwal') return item.category.toLowerCase().includes('silk');
        if (cat === 'Sico (Silk-Cotton)') return item.category.toLowerCase().includes('sico');
        if (cat === 'Cotton Gadwal') return item.category.toLowerCase().includes('cotton');
        return false;
      });
    
    // Price match
    const priceMatch = (item.price || 0) <= priceLimit;

    // Color match (semi-deterministic mapping to make standard list colorful)
    const colorMatch = !selectedColor || (() => {
      const colorLower = selectedColor.toLowerCase();
      const searchStr = `${item.name} ${item.specs || ''}`.toLowerCase();
      if (colorLower === 'maroon') return searchStr.includes('maroon') || searchStr.includes('red') || searchStr.includes('rose') || item.price % 5 === 0;
      if (colorLower === 'emerald') return searchStr.includes('emerald') || searchStr.includes('green') || searchStr.includes('sage') || item.price % 5 === 1;
      if (colorLower === 'mustard') return searchStr.includes('mustard') || searchStr.includes('yellow') || searchStr.includes('gold') || item.price % 5 === 2;
      if (colorLower === 'royal blue') return searchStr.includes('blue') || searchStr.includes('royal') || item.price % 5 === 3;
      if (colorLower === 'magenta') return searchStr.includes('magenta') || searchStr.includes('pink') || searchStr.includes('purple') || item.price % 5 === 4;
      return true;
    })();

    // Occasion match
    const occasionMatch = !selectedOccasion || (() => {
      const occLower = selectedOccasion.toLowerCase();
      const searchStr = `${item.name} ${item.specs || ''}`.toLowerCase();
      if (occLower === 'wedding wear') return searchStr.includes('wedding') || searchStr.includes('pattu') || item.price > 40000;
      if (occLower === 'festive collection') return searchStr.includes('festive') || searchStr.includes('festival') || (item.price > 20000 && item.price <= 40000);
      if (occLower === 'bridal special') return searchStr.includes('bridal') || searchStr.includes('bride') || item.price > 60000;
      return true;
    })();

    // Search query match
    const searchMatch = !searchQuery.trim() || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specs && item.specs.toLowerCase().includes(searchQuery.toLowerCase()));

    return categoryMatch && priceMatch && colorMatch && occasionMatch && searchMatch;
  });

  // Sort logic
  const sortedShopItems = [...filteredShopItems].sort((a, b) => {
    if (sortOrder === 'low-high') return a.price - b.price;
    if (sortOrder === 'high-low') return b.price - a.price;
    if (sortOrder === 'bestsellers') {
      return b.available - a.available;
    }
    // newest / fallback
    return b.sku.localeCompare(a.sku);
  });

  // Utility to map semi-deterministic badges
  const getItemBadge = (item: InventoryItem) => {
    if (item.available === 0) return 'Sold Out';
    if (item.price > 75000) return 'Bridal Choice';
    if (item.available <= item.threshold) return 'Last Few Pieces';
    if (item.price > 45000 && item.price <= 75000) return 'Bestseller';
    return 'New Arrival';
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans text-on-surface selection:bg-primary-container selection:text-white flex flex-col justify-between">
      
      {/* Top Header & Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-md border-b border-stone-200/40 shadow-[0_2px_15px_rgba(0,0,0,0.02)] transition-all py-4">
        <div className="flex justify-between items-center w-full px-6 md:px-12 py-1 max-w-7xl mx-auto">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => setCurrentTab('home')}
              className="flex flex-col items-start leading-none group cursor-pointer outline-none"
            >
              <span className="font-display text-xl md:text-2xl text-primary font-black tracking-[0.08em] uppercase transition-all group-hover:text-tertiary">
                SRI PADMA
              </span>
              <span className="font-sans text-[8px] tracking-[0.25em] text-tertiary font-bold uppercase mt-0.5">
                HANDLOOM SAREE STORE
              </span>
            </button>
            
            {/* Desktop Navigation links */}
            <div className="hidden md:flex gap-8 items-center pt-1">
              <button 
                onClick={() => setCurrentTab('home')} 
                className={`font-sans text-[11px] uppercase tracking-[0.18em] relative py-1.5 transition-all duration-300 cursor-pointer ${
                  currentTab === 'home' ? 'text-primary font-bold' : 'text-on-surface-variant/85 hover:text-primary font-medium'
                }`}
              >
                Home
                {currentTab === 'home' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-tertiary rounded-full shadow-[0_1px_4px_rgba(217,119,6,0.3)]" />
                )}
              </button>
              <button 
                onClick={() => setCurrentTab('shop')} 
                className={`font-sans text-[11px] uppercase tracking-[0.18em] relative py-1.5 transition-all duration-300 cursor-pointer ${
                  currentTab === 'shop' ? 'text-primary font-bold' : 'text-on-surface-variant/85 hover:text-primary font-medium'
                }`}
              >
                Collections
                {currentTab === 'shop' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-tertiary rounded-full shadow-[0_1px_4px_rgba(217,119,6,0.3)]" />
                )}
              </button>
              <button 
                onClick={() => setCurrentTab('contact')} 
                className={`font-sans text-[11px] uppercase tracking-[0.18em] relative py-1.5 transition-all duration-300 cursor-pointer ${
                  currentTab === 'contact' ? 'text-primary font-bold' : 'text-on-surface-variant/85 hover:text-primary font-medium'
                }`}
              >
                About
                {currentTab === 'contact' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-tertiary rounded-full shadow-[0_1px_4px_rgba(217,119,6,0.3)]" />
                )}
              </button>
              <button 
                onClick={() => setCurrentTab('orders')} 
                className={`font-sans text-[11px] uppercase tracking-[0.18em] relative py-1.5 transition-all duration-300 cursor-pointer ${
                  currentTab === 'orders' ? 'text-primary font-bold' : 'text-on-surface-variant/85 hover:text-primary font-medium'
                }`}
              >
                Orders
                {currentTab === 'orders' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-tertiary rounded-full shadow-[0_1px_4px_rgba(217,119,6,0.3)]" />
                )}
              </button>
              <button 
                onClick={() => setCurrentTab('profile')} 
                className={`font-sans text-[11px] uppercase tracking-[0.18em] relative py-1.5 transition-all duration-300 cursor-pointer ${
                  currentTab === 'profile' ? 'text-primary font-bold' : 'text-on-surface-variant/85 hover:text-primary font-medium'
                }`}
              >
                Profile
                {currentTab === 'profile' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-tertiary rounded-full shadow-[0_1px_4px_rgba(217,119,6,0.3)]" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Desktop search bar */}
            <div className="hidden md:flex relative items-center group">
              <input 
                type="text" 
                placeholder="Search masterpiece weaves..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentTab !== 'shop') setCurrentTab('shop');
                }}
                className="bg-stone-50/80 border border-stone-200/50 rounded-full pl-4 pr-10 py-1.5 text-[11px] font-medium focus:bg-white focus:border-tertiary focus:ring-2 focus:ring-tertiary/10 w-44 lg:w-60 transition-all duration-300 focus:w-68 text-primary outline-none placeholder:text-stone-400 font-sans"
              />
              <Search className="w-3.5 h-3.5 absolute right-3.5 text-stone-400 group-focus-within:text-tertiary cursor-pointer transition-colors" />
            </div>

            <div className="flex items-center gap-4">
              {/* Admin Panel Entry */}
              {isAdminLoggedIn && (
                <button 
                  onClick={onEnterAdminMode}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#E6DFD5] text-[#8C6D41] rounded-full text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm hover:shadow active:scale-95"
                  title="Admin Control Panel"
                >
                  <Settings className="w-3 h-3 text-[#8C6D41]" />
                  Admin Hub
                </button>
              )}

              <div className="relative">
                <Heart 
                  onClick={() => setCurrentTab('shop')}
                  className="w-[18px] h-[18px] text-on-surface-variant hover:text-primary cursor-pointer hover:scale-115 active:scale-90 transition-all duration-300" 
                />
                {favorites.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-tertiary text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-bounce">
                    {favorites.length}
                  </span>
                )}
              </div>

              <div className="relative">
                <ShoppingBag 
                  onClick={() => setCurrentTab('cart')}
                  className={`w-[18px] h-[18px] cursor-pointer hover:scale-115 active:scale-90 transition-all duration-300 ${
                    currentTab === 'cart' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`} 
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>

              <User 
                onClick={() => setCurrentTab('profile')}
                className={`w-[18px] h-[18px] cursor-pointer hover:scale-115 active:scale-90 transition-all duration-300 ${
                  currentTab === 'profile' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`} 
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container with offset top for fixed header */}
      <main className="mt-[74px] flex-grow">

        {/* ==================== TAB 1: HOME PAGE ==================== */}
        {currentTab === 'home' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative h-[80vh] md:h-[90vh] w-full flex items-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div 
                  className="w-full h-full bg-cover bg-center transition-transform duration-[12000ms] scale-100 hover:scale-105" 
                  style={{ 
                    backgroundImage: "url('/images/hero_bg.jpg')" 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
              </div>

              <div className="relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto text-white">
                <div className="max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse"></span>
                    <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary-fixed">Established 1984</p>
                  </div>
                  <h1 className="font-display text-4xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
                    Sri Padma<br className="hidden md:block"/> Handloom Saree Store
                  </h1>
                  <p className="font-sans text-xs md:text-sm uppercase tracking-[0.2em] text-tertiary-fixed font-bold">
                    Exquisite Handloom Sarees &bull; A Legacy of Craftsmanship
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                      onClick={() => setCurrentTab('shop')} 
                      className="bg-primary hover:bg-primary-container text-white border border-primary-container font-sans text-xs font-bold py-4 px-10 rounded-xl uppercase tracking-widest transition-all duration-300 text-center shadow-lg cursor-pointer"
                    >
                      Shop Now
                    </button>
                    <a 
                      href="#collections" 
                      className="border-2 border-tertiary text-tertiary-fixed font-sans text-xs font-bold py-4 px-10 rounded-xl uppercase tracking-widest hover:bg-tertiary/10 transition-all duration-300 text-center"
                    >
                      Explore Collection
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Curated Collections Bento Block */}
            <section id="collections" className="py-20 bg-white border-t border-b border-outline-variant/30">
              <div className="px-6 md:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-2">
                  <span className="font-sans text-xs font-bold text-tertiary tracking-widest uppercase">Signature Edits</span>
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-primary">Curated Collections</h2>
                  <div className="flex items-center justify-center gap-3 py-4">
                    <div className="w-12 h-[1px] bg-outline-variant"></div>
                    <span className="text-tertiary font-serif">✦</span>
                    <div className="w-12 h-[1px] bg-outline-variant"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Main: Festival Collection */}
                  <div 
                    onClick={() => { setSelectedOccasion('Festive Collection'); setCurrentTab('shop'); }}
                    className="lg:col-span-8 group relative overflow-hidden rounded-2xl shadow-sm cursor-pointer h-[500px]"
                  >
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/25 transition-colors z-10" />
                    <img 
                      className="w-full h-full object-cover transition-transform duration-[6000ms] group-hover:scale-105" 
                      src="/images/saree1.jpg"
                      alt="Festival Collection"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-8 left-8 z-20 space-y-2">
                      <span className="font-sans text-[10px] font-bold text-white bg-tertiary px-3 py-1 rounded-full uppercase tracking-widest">Seasonal Special</span>
                      <h3 className="font-display text-2xl md:text-4xl font-extrabold text-white">Festival Collection</h3>
                      <div className="flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-widest border-b border-white pb-0.5 w-max hover:opacity-85 transition-opacity">
                        Shop Collection <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Best Sellers & New Weaves */}
                  <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    
                    {/* Best Sellers */}
                    <div 
                      onClick={() => { setSortOrder('bestsellers'); setCurrentTab('shop'); }}
                      className="group relative overflow-hidden rounded-2xl shadow-sm cursor-pointer h-[238px]"
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/15 transition-colors z-10" />
                      <img 
                        className="w-full h-full object-cover transition-transform duration-[5000ms] group-hover:scale-105" 
                        src="/images/saree5.jpg"
                        alt="Best Sellers"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl text-center transform translate-y-3 group-hover:translate-y-0 opacity-90 group-hover:opacity-100 transition-all duration-300 shadow-md">
                          <span className="font-sans text-[9px] font-bold text-tertiary uppercase tracking-wider">Timeless Classics</span>
                          <h4 className="font-display text-lg font-bold text-primary mt-1">Best Sellers</h4>
                        </div>
                      </div>
                    </div>

                    {/* New Arrivals */}
                    <div 
                      onClick={() => { setSortOrder('newest'); setCurrentTab('shop'); }}
                      className="group relative overflow-hidden rounded-2xl shadow-sm cursor-pointer h-[238px]"
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/15 transition-colors z-10" />
                      <img 
                        className="w-full h-full object-cover transition-transform duration-[5000ms] group-hover:scale-105" 
                        src="/images/saree3.jpg"
                        alt="New Arrivals"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl text-center transform translate-y-3 group-hover:translate-y-0 opacity-90 group-hover:opacity-100 transition-all duration-300 shadow-md">
                          <span className="font-sans text-[9px] font-bold text-tertiary uppercase tracking-wider">The Latest Weaves</span>
                          <h4 className="font-display text-lg font-bold text-primary mt-1">New Arrivals</h4>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* Micro Boutique Spotlight */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <span className="font-sans text-xs font-bold text-tertiary tracking-widest uppercase">The Heritage Spotlight</span>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-primary">Authentic Handloom Highlights</h2>
                <p className="font-sans text-sm text-on-surface-variant max-w-xl mx-auto font-light">
                  Direct from local clusters. Click any to open in our shop with advanced filters.
                </p>
              </div>

              {/* Spotlight saree grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.slice(0, 4).map(item => {
                  const isFavorite = favorites.includes(item.id);
                  const badge = getItemBadge(item);
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative">
                      <div className="absolute top-3 left-3 z-20">
                        <span className="bg-primary/10 text-primary border border-primary/15 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider block">{badge}</span>
                      </div>

                      <div 
                        onClick={() => {
                          setSelectedProduct(item);
                          setActiveImage(0);
                          setDetailQty(1);
                          setCurrentTab('product-detail');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="aspect-[3/4] bg-surface-container-low overflow-hidden relative cursor-pointer"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2000ms]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 z-20 gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              setSelectedProduct(item);
                              setActiveImage(0);
                              setDetailQty(1);
                              setCurrentTab('product-detail');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-3 py-2 bg-white text-primary rounded-lg font-sans text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-surface transition-all duration-200 cursor-pointer"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => addToCart(item)}
                            disabled={item.available === 0}
                            className="px-3 py-2 bg-primary text-white rounded-lg font-sans text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-primary-container transition-all duration-200 cursor-pointer disabled:opacity-50"
                          >
                            {item.available > 0 ? '+ Bag' : 'Sold Out'}
                          </button>
                          <button 
                            onClick={() => toggleFavorite(item.id, item.name)}
                            className={`p-2 rounded-full shadow-md transition-all cursor-pointer ${isFavorite ? 'bg-error text-white' : 'bg-white text-on-surface hover:text-error'}`}
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div>
                          <span className="font-mono text-[9px] text-on-surface-variant/70 tracking-widest uppercase block">{item.sku}</span>
                          <h4 className="font-display text-base font-bold text-primary group-hover:text-primary-container transition-colors line-clamp-1 mt-1">{item.name}</h4>
                          <p className="font-sans text-[11px] text-on-surface-variant/80 line-clamp-1 mt-1 italic">{item.specs || 'Charming zari border'}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                          <span className="font-sans text-sm font-bold text-primary">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                          <span className="font-sans text-[10px] font-semibold text-on-surface-variant/75">{item.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-4">
                <button 
                  onClick={() => setCurrentTab('shop')}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-container text-white rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary/10 border border-primary/10"
                >
                  View All Masterpieces
                  <ArrowRight className="w-4 h-4 text-tertiary-fixed" />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ==================== TAB 2: SHOP PAGE (NEW EXTENDED VIEW) ==================== */}
        {currentTab === 'shop' && (
          <div className="animate-fade-in max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-8">
            
            {/* Breadcrumbs & Description Header */}
            <header className="space-y-4 border-b border-outline-variant/20 pb-8">
              <nav className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
                <button onClick={() => setCurrentTab('home')} className="hover:text-primary transition-colors cursor-pointer uppercase">Home</button>
                <span>/</span>
                <span className="text-primary">Collections</span>
              </nav>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="font-display text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
                    The Heritage Collection
                  </h1>
                  <p className="font-sans text-xs md:text-sm text-on-surface-variant/90 max-w-2xl font-light leading-relaxed">
                    Discover the timeless elegance of authentic Gadwal handloom sarees. Each piece is a masterclass of craftsmanship, blending traditional Sico & pure Mulberry Silk with interlocked gold zari borders.
                  </p>
                </div>

                {/* Sort By controls */}
                <div className="flex items-center gap-3">
                  <span className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sort By:</span>
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-white border border-outline-variant/60 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-primary cursor-pointer"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                    <option value="bestsellers">Bestsellers</option>
                  </select>
                </div>
              </div>
            </header>

            {/* Layout Split: Left Sidebar Filters + Right Results Grid */}
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Filters Sidebar */}
              <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm h-fit space-y-8 sticky top-24">
                
                {/* Header with Clear All */}
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <SlidersHorizontal className="w-4 h-4 text-tertiary" />
                    <span className="font-sans text-xs uppercase tracking-widest">Filters</span>
                  </div>
                  <button 
                    onClick={clearAllFilters}
                    className="text-[10px] font-bold text-on-surface-variant hover:text-error transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Category Checklist */}
                <div className="space-y-3">
                  <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-wider">Category</h4>
                  <div className="flex flex-col gap-2.5">
                    {['Pure Silk Gadwal', 'Sico (Silk-Cotton)', 'Cotton Gadwal'].map(cat => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategoryFilter(cat)}
                            className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <span className="font-sans text-xs text-on-surface-variant group-hover:text-primary transition-colors">
                            {cat}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-wider">Price Range</h4>
                    <span className="font-mono text-[11px] text-tertiary font-bold">₹{priceLimit.toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    type="range"
                    min="5000"
                    max="150000"
                    step="5000"
                    value={priceLimit}
                    onChange={(e) => setPriceLimit(Number(e.target.value))}
                    className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant/70 font-bold font-mono">
                    <span>₹5,000</span>
                    <span>₹1,50,000</span>
                  </div>
                </div>

                {/* Colors Palette selection */}
                <div className="space-y-3">
                  <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-wider">Color Palette</h4>
                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {colorsList.map(col => {
                      const isSelected = selectedColor === col.name;
                      return (
                        <button
                          key={col.name}
                          onClick={() => setSelectedColor(selectedColor === col.name ? null : col.name)}
                          title={col.name}
                          className={`w-8 h-8 rounded-full border border-outline-variant/50 cursor-pointer relative transition-all duration-200 hover:scale-110 flex items-center justify-center`}
                          style={{ backgroundColor: col.hex }}
                        >
                          {isSelected && (
                            <span className="absolute inset-0 rounded-full border-2 border-white ring-2 ring-primary"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Occasion Selection */}
                <div className="space-y-3">
                  <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-wider">Occasion</h4>
                  <div className="flex flex-col gap-2.5">
                    {['Wedding Wear', 'Festive Collection', 'Bridal Special'].map(occ => {
                      const isSelected = selectedOccasion === occ;
                      return (
                        <label key={occ} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio"
                            name="boutiqueOccasion"
                            checked={isSelected}
                            onChange={() => setSelectedOccasion(isSelected ? null : occ)}
                            onClick={() => setSelectedOccasion(selectedOccasion === occ ? null : occ)}
                            className="border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <span className="font-sans text-xs text-on-surface-variant group-hover:text-primary transition-colors">
                            {occ}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </aside>

              {/* Right Side Results list */}
              <div className="flex-grow space-y-10">
                
                {/* Count and Active filters indicator */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-outline-variant/30 rounded-2xl px-6 py-4 shadow-sm text-xs text-on-surface-variant">
                  <p className="font-medium">
                    Showing <span className="text-primary font-bold">{sortedShopItems.length}</span> stunning handloom sarees
                  </p>
                  
                  {/* Selected Filter Chips */}
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(cat => (
                      <span key={cat} className="bg-primary/5 border border-primary/10 text-primary px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                        {cat}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCategoryFilter(cat)} />
                      </span>
                    ))}
                    {selectedColor && (
                      <span className="bg-primary/5 border border-primary/10 text-primary px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                        Color: {selectedColor}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedColor(null)} />
                      </span>
                    )}
                    {selectedOccasion && (
                      <span className="bg-primary/5 border border-primary/10 text-primary px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                        Occasion: {selectedOccasion}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedOccasion(null)} />
                      </span>
                    )}
                    {priceLimit < 150000 && (
                      <span className="bg-primary/5 border border-primary/10 text-primary px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                        Under ₹{priceLimit.toLocaleString('en-IN')}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceLimit(150000)} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Saree Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {sortedShopItems.length > 0 ? (
                    sortedShopItems.map(item => {
                      const isFavorite = favorites.includes(item.id);
                      const badge = getItemBadge(item);
                      
                      // fake high-end slashes for aesthetic value
                      const fakeOriginalPrice = Math.round((item.price || 0) * 1.35 / 500) * 500;

                      return (
                        <div key={item.id} className="bg-white rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group relative">
                          
                          {/* Badge container */}
                          <div className="absolute top-4 left-4 z-20">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider block ${
                              badge === 'Bridal Choice' 
                                ? 'bg-tertiary text-white shadow-sm'
                                : badge === 'Sold Out'
                                  ? 'bg-error-container text-on-error-container border border-error/25'
                                  : 'bg-primary text-white'
                            }`}>
                              {badge}
                            </span>
                          </div>

                          {/* Heart wishlist toggle */}
                          <button 
                            onClick={() => toggleFavorite(item.id, item.name)}
                            className={`absolute top-4 right-4 z-20 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                              isFavorite 
                                ? 'bg-error text-white' 
                                : 'bg-white/80 hover:bg-white text-primary'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>

                          {/* Image box with quick view slide-in */}
                          <div 
                            onClick={() => {
                              setSelectedProduct(item);
                              setActiveImage(0);
                              setDetailQty(1);
                              setCurrentTab('product-detail');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="aspect-[3/4] bg-surface-container-low overflow-hidden relative cursor-pointer"
                          >
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2000ms]"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Slide-in Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => {
                                  setSelectedProduct(item);
                                  setActiveImage(0);
                                  setDetailQty(1);
                                  setCurrentTab('product-detail');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="flex-1 bg-white hover:bg-surface text-primary font-sans text-[10px] font-bold uppercase py-2.5 rounded-lg transition-colors cursor-pointer text-center"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => addToCart(item)}
                                disabled={item.available === 0}
                                className="flex-1 bg-primary hover:bg-primary-container text-white font-sans text-[10px] font-bold uppercase py-2.5 rounded-lg transition-colors cursor-pointer text-center disabled:opacity-50"
                              >
                                {item.available > 0 ? '+ Bag' : 'Sold Out'}
                              </button>
                            </div>
                          </div>

                          {/* Content Details box */}
                          <div className="p-6 flex-grow flex flex-col justify-between text-center space-y-4 bg-white">
                            <div>
                              <span className="font-mono text-[9px] text-on-surface-variant/70 tracking-widest uppercase block">{item.sku}</span>
                              <h3 className="font-display text-lg font-bold text-primary group-hover:text-primary-container transition-colors mt-1.5 line-clamp-1">
                                {item.name}
                              </h3>
                              
                              {/* Slit original / discounted pricing */}
                              <div className="flex items-center justify-center gap-3 mt-2">
                                <span className="font-sans text-sm font-extrabold text-primary">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                                {item.price !== undefined && item.price < 100000 && (
                                  <span className="font-sans text-xs text-on-surface-variant/60 line-through">₹{fakeOriginalPrice.toLocaleString('en-IN')}</span>
                                )}
                              </div>
                            </div>

                            {/* Cert tag and Category descriptor */}
                            <div className="pt-3 border-t border-outline-variant/20 flex flex-col items-center gap-1 text-[10px] font-bold">
                              <div className="text-tertiary uppercase tracking-wider flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                {item.category} Weave
                              </div>
                              <span className="text-on-surface-variant/70 font-medium font-sans text-[9px] italic">
                                {item.specs || 'Intricate handloom borders'}
                              </span>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-3xl border border-outline-variant/40">
                      <span className="text-4xl text-primary/30 block">✦</span>
                      <h4 className="font-display text-lg font-bold text-primary">No heritage sarees found</h4>
                      <p className="font-sans text-xs text-on-surface-variant max-w-md mx-auto">
                        Try clearing some of your filters or broadening your price search to discover more Gadwal masterworks.
                      </p>
                      <button 
                        onClick={clearAllFilters}
                        className="px-6 py-2.5 bg-primary text-white hover:bg-primary-container rounded-xl font-sans text-xs font-bold transition-all uppercase cursor-pointer border border-primary/10"
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Simulated Beautiful Pagination block matching mock layout */}
                {sortedShopItems.length > 0 && (
                  <div className="mt-16 flex justify-center items-center gap-4 border-t border-outline-variant/20 pt-8">
                    <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex gap-1.5">
                      <button className="w-10 h-10 rounded-full bg-primary text-white font-sans text-xs font-bold">1</button>
                      <button className="w-10 h-10 rounded-full border border-outline-variant text-on-surface-variant hover:bg-primary/5 transition-all font-sans text-xs font-bold">2</button>
                      <button className="w-10 h-10 rounded-full border border-outline-variant text-on-surface-variant hover:bg-primary/5 transition-all font-sans text-xs font-bold">3</button>
                      <span className="w-10 h-10 flex items-center justify-center text-on-surface-variant/70 text-xs">...</span>
                      <button className="w-10 h-10 rounded-full border border-outline-variant text-on-surface-variant hover:bg-primary/5 transition-all font-sans text-xs font-bold">12</button>
                    </div>
                    <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 3: SHOPPING BAG PAGE ==================== */}
        {currentTab === 'cart' && (
          <div className="animate-fade-in max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              <button onClick={() => setCurrentTab('home')} className="hover:text-primary transition-colors cursor-pointer uppercase">Home</button>
              <span>/</span>
              <button onClick={() => setCurrentTab('shop')} className="hover:text-primary transition-colors cursor-pointer uppercase">Collections</button>
              <span>/</span>
              <span className="text-primary">Shopping Bag</span>
            </nav>

            <header className="border-b border-outline-variant/20 pb-6">
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-primary">Shopping Bag</h1>
              <p className="font-sans text-xs md:text-sm text-on-surface-variant italic mt-1.5">
                Curation of your selected handloom masterpieces.
              </p>
            </header>

            {cart.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Cart Items List */}
                <div className="lg:col-span-8 space-y-6">
                  {cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-white border border-outline-variant/40 hover:shadow-md transition-shadow animate-fade-in"
                    >
                      {/* Image Box */}
                      <div className="w-full md:w-40 h-48 rounded-xl overflow-hidden shrink-0 bg-surface-container-low">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          src={item.imageUrl} 
                          alt={item.name}
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Content details */}
                      <div className="flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-display text-xl md:text-2xl font-bold text-primary">{item.name}</h3>
                              <p className="text-[10px] font-sans font-bold text-tertiary uppercase mt-1 tracking-wider">
                                {item.category} • Handwoven SKU: {item.sku}
                              </p>
                            </div>
                            <button 
                              className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-full hover:bg-red-50"
                              onClick={() => removeCartItem(item.id, item.name)}
                              title="Remove masterpiece"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <p className="text-on-surface-variant text-xs mt-3 leading-relaxed max-w-xl font-light">
                            {item.specs}
                          </p>
                        </div>

                        <div className="flex justify-between items-end mt-6 pt-4 border-t border-outline-variant/10">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-outline-variant/50 rounded-xl overflow-hidden bg-[#f8f9fa]">
                            <button 
                              className="px-3 py-1.5 hover:bg-surface-container text-primary font-bold transition-colors cursor-pointer"
                              onClick={() => updateCartQty(item.id, -1)}
                            >
                              -
                            </button>
                            <span className="px-4 py-1.5 font-bold text-primary font-mono text-sm">
                              {item.quantity}
                            </span>
                            <button 
                              className="px-3 py-1.5 hover:bg-surface-container text-primary font-bold transition-colors cursor-pointer"
                              onClick={() => updateCartQty(item.id, 1)}
                            >
                              +
                            </button>
                          </div>

                          {/* Item Total Price */}
                          <div className="text-right">
                            <span className="font-display text-2xl font-bold text-primary">
                              ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-6">
                    <button 
                      onClick={() => setCurrentTab('shop')}
                      className="inline-flex items-center gap-2 text-primary hover:text-tertiary transition-colors font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Continue Exploring Saree Collections
                    </button>
                  </div>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-4">
                  <div className="sticky top-28 bg-white p-8 rounded-3xl border border-outline-variant/40 shadow-lg space-y-6 animate-fade-in">
                    <h2 className="font-display text-2xl font-bold text-primary border-b border-outline-variant/20 pb-4">Order Summary</h2>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                        <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                        <span className="text-primary font-bold font-mono">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                      </div>

                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600 font-bold">
                          <span>Promo Discount ({appliedDiscount}%)</span>
                          <span className="font-mono">- ₹{cartDiscountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                        <span>Shipping Handloom Insurance</span>
                        <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">Complimentary</span>
                      </div>

                      <div className="flex justify-between text-xs text-on-surface-variant font-medium">
                        <span>Estimated Tax (GST 5%)</span>
                        <span className="text-primary font-bold font-mono">₹{cartTax.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="border-t border-outline-variant/30 pt-4 flex justify-between items-center">
                        <span className="font-display text-xl font-bold text-primary">Grand Total</span>
                        <span className="font-display text-2xl font-extrabold text-primary">
                          ₹{cartGrandTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <button 
                        onClick={() => {
                          setCurrentTab('checkout');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                      >
                        Proceed to Checkout
                      </button>

                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-sans text-on-surface-variant leading-relaxed">
                          Secure heritage checkout backed by authentic weaver verification.
                        </span>
                      </div>
                    </div>

                    {/* Promo Code Entry */}
                    <div className="pt-6 border-t border-outline-variant/20">
                      <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Promo Code
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="GIFT2024"
                          className="flex-grow bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:bg-white outline-none text-primary uppercase font-mono"
                        />
                        <button 
                          onClick={handleApplyPromo}
                          className="text-primary border-2 border-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all uppercase tracking-wider cursor-pointer"
                        >
                          APPLY
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[10px] text-error font-medium mt-1.5">{promoError}</p>
                      )}
                      {appliedDiscount > 0 && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1 animate-fade-in">
                          ✓ Promo code is active!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-3xl border border-outline-variant/40 max-w-xl mx-auto p-8 shadow-sm">
                <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center border border-outline-variant/20">
                  <ShoppingBag className="w-8 h-8 text-on-surface-variant/70" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-bold text-primary">Your Bag is Empty</h2>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed font-light">
                    It seems you haven't discovered your next masterpiece yet. Explore our curated collections of authentic handwoven Gadwal sarees.
                  </p>
                </div>
                <button 
                  onClick={() => setCurrentTab('shop')}
                  className="bg-primary hover:bg-primary-container text-white px-8 py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Start Discovering
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: SECURE CHECKOUT ==================== */}
        {currentTab === 'checkout' && (
          <div className="animate-fade-in max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              <button onClick={() => setCurrentTab('home')} className="hover:text-primary transition-colors cursor-pointer uppercase">Home</button>
              <span>/</span>
              <button onClick={() => setCurrentTab('cart')} className="hover:text-primary transition-colors cursor-pointer uppercase">Shopping Bag</button>
              <span>/</span>
              <span className="text-primary">Checkout</span>
            </nav>

            <header className="border-b border-outline-variant/20 pb-6 text-center md:text-left">
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-primary uppercase tracking-tight">Checkout</h1>
              <p className="font-sans text-xs md:text-sm text-on-surface-variant italic mt-1.5">
                Complete your order with secure payment and shipping details.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Form (col-span-8) */}
              <div className="lg:col-span-8 space-y-8">
                {/* Shipping Info Form */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/60 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-8 border-b border-outline-variant/30 pb-4">
                    <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
                    <h2 className="font-display text-xl font-bold text-primary">Shipping Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Phone</label>
                      <input 
                        type="tel" 
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        placeholder="+91 00000 00000"
                        className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Address</label>
                      <textarea 
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        placeholder="Suite, House Number, Street Name"
                        rows={3}
                        className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">City</label>
                      <input 
                        type="text" 
                        value={checkoutCity}
                        onChange={(e) => setCheckoutCity(e.target.value)}
                        placeholder="Hyderabad"
                        className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">State</label>
                      <select 
                        value={checkoutState}
                        onChange={(e) => setCheckoutState(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary appearance-none"
                      >
                        <option value="Telangana">Telangana</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Pincode</label>
                      <input 
                        type="text" 
                        value={checkoutPincode}
                        onChange={(e) => setCheckoutPincode(e.target.value)}
                        placeholder="500001"
                        className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Notes (Optional)</label>
                      <input 
                        type="text" 
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        placeholder="Landmark, Preferred delivery time"
                        className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Heritage Booking Panel */}
                <div className="bg-amber-500/[0.03] p-6 md:p-8 rounded-3xl border border-amber-500/15 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
                    <span className="material-symbols-outlined text-xl">verified_user</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-wide">Direct Heritage Reservation</h4>
                    <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                      Payment methods are disabled for this boutique preview. Your handloom booking will be placed directly and shipping details will be instantly emailed to <strong className="text-primary font-bold">kj1201577@gmail.com</strong> for custom processing and handloom weaver assignment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (col-span-4) */}
              <div className="lg:col-span-4 sticky top-28">
                <div className="bg-[#edeeef] p-6 md:p-8 rounded-3xl border border-outline-variant/40 space-y-6">
                  <h3 className="font-display text-xl font-bold text-primary border-b border-outline-variant/20 pb-4">Order Summary</h3>

                  <div className="space-y-5 max-h-[350px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-16 h-20 bg-white rounded-xl overflow-hidden border border-outline-variant/40 shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-display text-xs font-bold text-primary truncate">{item.name}</p>
                          <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">QTY: {item.quantity}</p>
                          <p className="font-sans text-xs font-bold text-tertiary mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-outline-variant/30 pt-5 space-y-3">
                    <div className="flex justify-between font-sans text-xs text-on-surface-variant">
                      <span>Subtotal</span>
                      <span className="text-primary font-bold">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedDiscount > 0 && (
                      <div className="flex justify-between font-sans text-xs text-emerald-600 font-bold">
                        <span>Promo Discount</span>
                        <span>- ₹{cartDiscountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-sans text-xs text-on-surface-variant">
                      <span>Shipping</span>
                      <span className="text-tertiary font-bold uppercase">FREE</span>
                    </div>

                    <div className="flex justify-between font-sans text-xs text-on-surface-variant">
                      <span>GST (5%)</span>
                      <span className="text-primary font-bold">₹{cartTax.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center text-primary">
                      <span className="font-display text-sm font-bold">Total</span>
                      <span className="font-display text-lg font-extrabold">₹{cartGrandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!checkoutName.trim()) {
                        triggerToast("Please enter your full name.", "error");
                        return;
                      }
                      if (!checkoutPhone.trim()) {
                        triggerToast("Please enter your phone number.", "error");
                        return;
                      }
                      if (!checkoutEmail.trim()) {
                        triggerToast("Please enter your email address.", "error");
                        return;
                      }
                      if (!checkoutAddress.trim()) {
                        triggerToast("Please enter your address.", "error");
                        return;
                      }
                      if (!checkoutCity.trim()) {
                        triggerToast("Please enter your city.", "error");
                        return;
                      }
                      if (!checkoutPincode.trim()) {
                        triggerToast("Please enter your pincode.", "error");
                        return;
                      }

                      setIsPlacingOrder(true);
                      triggerToast("Processing direct reservation booking...", "success");

                      setTimeout(() => {
                        // Generate random order ID matching pattern like #RG-8294105
                        const randomId = `#RG-${Math.floor(1000000 + Math.random() * 9000000)}`;
                        const orderDate = new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
                        const fullAddress = `${checkoutAddress}, ${checkoutCity}, ${checkoutState} - ${checkoutPincode}`;
                        
                        const newOrderObj: Order = {
                          orderId: randomId,
                          items: [...cart],
                          subtotal: cartSubtotal,
                          discountAmount: cartDiscountAmount,
                          tax: cartTax,
                          grandTotal: cartGrandTotal,
                          customerName: checkoutName,
                          email: checkoutEmail,
                          phone: checkoutPhone,
                          address: fullAddress,
                          status: 'PLACED',
                          date: orderDate,
                          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
                          trackingNumber: `TRACK-${randomId.replace('#', '')}`,
                          courier: 'Blue Dart Luxury Delivery'
                        };

                        // Store order details
                        setConfirmedOrder({
                          orderId: randomId,
                          items: [...cart],
                          subtotal: cartSubtotal,
                          discountAmount: cartDiscountAmount,
                          tax: cartTax,
                          grandTotal: cartGrandTotal,
                          customerName: checkoutName,
                          email: checkoutEmail,
                          phone: checkoutPhone,
                          address: fullAddress
                        });

                        // Sync with main administration state
                        onOrderPlaced({
                          orderId: randomId,
                          customerName: checkoutName,
                          price: `₹${cartGrandTotal.toLocaleString('en-IN')}`,
                          items: cart.map(item => ({
                            sku: item.sku,
                            name: item.name,
                            quantity: item.quantity
                          }))
                        });

                        // Add to past orders list and select for tracking
                        setPastOrders(prev => [newOrderObj, ...prev]);
                        setTrackedOrderId(randomId);

                        // Trigger email with filled details to kj1201577@gmail.com
                        const subjectText = `New Sri Padma Handloom Order ${randomId} - ${checkoutName}`;
                        const bodyText = `Dear Boutique Team,\n\nA new heritage handloom order has been placed successfully!\n\n` +
                          `--- CUSTOMER SHIPPING DETAILS ---\n` +
                          `Name: ${checkoutName}\n` +
                          `Phone: ${checkoutPhone}\n` +
                          `Email: ${checkoutEmail}\n` +
                          `Address: ${fullAddress}\n` +
                          `Notes: ${checkoutNotes || 'None'}\n\n` +
                          `--- ORDERED ITEMS ---\n` +
                          cart.map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price.toLocaleString('en-IN')}`).join('\n') + `\n\n` +
                          `--- BILLING BREAKDOWN ---\n` +
                          `Subtotal: ₹${cartSubtotal.toLocaleString('en-IN')}\n` +
                          `Discount: - ₹${cartDiscountAmount.toLocaleString('en-IN')}\n` +
                          `GST (5%): ₹${cartTax.toLocaleString('en-IN')}\n` +
                          `Grand Total: ₹${cartGrandTotal.toLocaleString('en-IN')}\n\n` +
                          `Please coordinate shipping and delivery at the earliest.\n\nThank you!`;
                        
                        const mailtoLink = `mailto:kj1201577@gmail.com?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
                        
                        try {
                          // Attempt opening mailto link via window.open which is much more likely to be allowed in iframe sandboxes, fallback to location href
                          const mailWindow = window.open(mailtoLink, '_blank');
                          if (!mailWindow || mailWindow.closed || typeof mailWindow.closed === 'undefined') {
                            window.location.href = mailtoLink;
                          }
                        } catch (e) {
                          try {
                            window.location.href = mailtoLink;
                          } catch (err) {
                            console.error("Could not trigger mailto automatically", err);
                          }
                        }

                        // Clean cart and transition
                        setCart([]);
                        setAppliedDiscount(0);
                        setIsPlacingOrder(false);
                        setCurrentTab('order-confirmed');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        triggerToast("Thank you! Your direct booking has been placed and details sent to kj1201577@gmail.com", "success");
                      }, 1500);
                    }}
                    disabled={isPlacingOrder}
                    className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        <span>Placing Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order</span>
                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </>
                    )}
                  </button>

                  <div className="mt-6 flex flex-col items-center gap-2 border-t border-outline-variant/20 pt-4">
                    <div className="flex items-center gap-1.5 text-on-surface-variant/80">
                      <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
                      <span className="text-[10px] uppercase font-sans font-bold tracking-tight">Direct Heritage Reservation Booking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: CONTACT US ==================== */}
        {currentTab === 'contact' && (
          <div className="animate-fade-in max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-16">
            
            {/* Connect With Us Header */}
            <header className="text-center space-y-4 max-w-3xl mx-auto">
              <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary tracking-tight">
                Connect With Us
              </h1>
              <p className="font-sans text-sm md:text-base text-on-surface-variant font-light leading-relaxed">
                Experience the artistry of Gadwal. Whether you have an inquiry about a specific weave or wish to visit our boutique, we are here to assist you.
              </p>
            </header>

            {/* Contact Form */}
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-md border border-outline-variant/40 w-full">
              <form onSubmit={handleContactSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-transparent border-b border-outline-variant/80 focus:border-primary focus:ring-0 px-0 py-3 transition-colors outline-none font-sans text-sm placeholder:text-outline-variant text-primary"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-transparent border-b border-outline-variant/80 focus:border-primary focus:ring-0 px-0 py-3 transition-colors outline-none font-sans text-sm placeholder:text-outline-variant text-primary"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Subject</label>
                  <select 
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant/80 focus:border-primary focus:ring-0 px-0 py-3 transition-colors outline-none font-sans text-sm text-primary appearance-none cursor-pointer"
                  >
                    <option value="Bespoke Order Inquiry">Bespoke Order Inquiry</option>
                    <option value="Wholesale Partnerships">Wholesale Partnerships</option>
                    <option value="Order Status">Order Status</option>
                    <option value="Other Feedback">Other Feedback</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant block">Your Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant/80 focus:border-primary focus:ring-0 px-0 py-3 transition-colors outline-none font-sans text-sm resize-none placeholder:text-outline-variant text-primary"
                    placeholder="How can we help you?"
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <p className="text-[11px] text-on-surface-variant/70 italic max-w-sm text-center sm:text-left">
                    By submitting, you agree to our privacy policy regarding data handling.
                  </p>
                  <button 
                    type="submit"
                    disabled={contactSubmitting}
                    className={`font-sans text-xs uppercase tracking-widest px-10 py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-3 shadow-md cursor-pointer ${
                      contactSubmitted 
                        ? 'bg-tertiary text-white hover:bg-tertiary' 
                        : 'bg-primary text-white hover:bg-primary-container'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {contactSubmitting ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                        Sending...
                      </>
                    ) : contactSubmitted ? (
                      <>
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Message Sent
                      </>
                    ) : (
                      <>
                        Send Message
                        <span className="material-symbols-outlined text-sm">send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* ==================== TAB 5: ORDER CONFIRMED ==================== */}
        {currentTab === 'order-confirmed' && (
          <div className="animate-fade-in max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-16">
            {/* Animated Success Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center relative overflow-hidden border border-outline-variant/30">
                <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                <svg className="relative z-10 w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" className="text-primary" />
                </svg>
              </div>
              
              <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary tracking-tight">
                Thank you for your order!
              </h1>
              <p className="font-sans text-sm md:text-base text-on-surface-variant font-light leading-relaxed">
                Your masterpiece of Indian heritage is being prepared for its journey to your home. We are honored to be part of your wardrobe.
              </p>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Order Summary (col-span-7) */}
              <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl border border-outline-variant/40 shadow-md space-y-8">
                {/* Header with Order ID and Confirmed Badge */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-outline-variant/20 gap-4">
                  <div>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                      ORDER ID
                    </span>
                    <h2 className="font-display text-3xl font-extrabold text-primary">
                      {confirmedOrder?.orderId || '#RG-8294105'}
                    </h2>
                  </div>
                  <div>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2 sm:text-right">
                      STATUS
                    </span>
                    <span className="bg-primary text-white font-sans text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm">
                      CONFIRMED
                    </span>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-6">
                  {confirmedOrder && confirmedOrder.items.length > 0 ? (
                    confirmedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-6 items-center pb-6 border-b border-outline-variant/10 last:border-b-0 last:pb-0">
                        <div className="w-24 h-32 flex-shrink-0 bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
                          <img 
                            className="w-full h-full object-cover" 
                            src={item.imageUrl || "/images/saree1.jpg"}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-grow space-y-1">
                          <h3 className="font-display text-lg font-bold text-primary">
                            {item.name}
                          </h3>
                          <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed line-clamp-2">
                            {item.specs || 'Traditional Temple Border | 5.5 Meters'}
                          </p>
                          <span className="inline-block font-sans text-[10px] font-bold text-tertiary uppercase tracking-widest pt-1">
                            SILK MARK CERTIFIED
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-sans text-sm font-bold text-primary block">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-display text-lg font-bold text-primary mt-1 block">
                            ₹{(item.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Default Item Mockup matching User's Image exactly */
                    <div className="flex gap-6 items-center">
                      <div className="w-24 h-32 flex-shrink-0 bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
                        <img 
                          className="w-full h-full object-cover" 
                          src="/images/saree1.jpg"
                          alt="Midnight Blue Pure Silk Gadwal"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow space-y-1">
                        <h3 className="font-display text-lg font-bold text-primary">
                          Midnight Blue Pure Silk Gadwal
                        </h3>
                        <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed">
                          Traditional Temple Border | 5.5 Meters
                        </p>
                        <span className="inline-block font-sans text-[10px] font-bold text-tertiary uppercase tracking-widest pt-1">
                          SILK MARK CERTIFIED
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-display text-lg font-extrabold text-primary">
                          ₹32,500
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Calculation breakdown container with light background */}
                <div className="bg-[#f8f9fa] p-6 rounded-2xl border border-outline-variant/30 space-y-3">
                  <div className="flex justify-between font-sans text-xs text-on-surface-variant font-medium">
                    <span>Subtotal</span>
                    <span className="text-primary font-bold">
                      ₹{(confirmedOrder?.subtotal || 32500).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {confirmedOrder && (confirmedOrder.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between font-sans text-xs text-emerald-600 font-bold">
                      <span>Promo Discount</span>
                      <span>- ₹{(confirmedOrder.discountAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-sans text-xs text-on-surface-variant font-medium">
                    <span>Shipping</span>
                    <span className="text-tertiary font-bold uppercase tracking-wider text-[10px]">
                      Complimentary
                    </span>
                  </div>

                  <div className="flex justify-between font-sans text-xs text-on-surface-variant font-medium pb-2 border-b border-outline-variant/20">
                    <span>Estimated Tax (GST 5%)</span>
                    <span className="text-primary font-bold">
                      ₹{(confirmedOrder?.tax || 1625).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="font-display text-xl font-bold text-primary">Total Paid</span>
                    <span className="font-display text-2xl font-extrabold text-primary">
                      ₹{(confirmedOrder?.grandTotal || 32500).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Delivery and Actions (col-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Order Details Sent Card */}
                <div className="bg-primary p-8 rounded-3xl text-white shadow-lg space-y-6 border border-primary-container/20">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-tertiary-fixed-dim" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-bold">Email Reservation System</h3>
                      <p className="font-sans text-xs text-white/80 font-light leading-relaxed">
                        To guarantee shipping receipt at <strong className="text-white font-bold underline">kj1201577@gmail.com</strong>, please use the direct triggers below.
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp and Email Bubbles */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-3 bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/5 shadow-sm">
                      <Mail className="w-4 h-4 text-white/70" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[9px] uppercase tracking-wider text-white/60 mb-0.5">Boutique Owner Receiver</span>
                        <span className="font-sans text-[11px] font-bold tracking-wider">
                          kj1201577@gmail.com
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/5 shadow-sm">
                      <span className="material-symbols-outlined text-sm text-[#25D366]">chat</span>
                      <div className="flex flex-col leading-none">
                        <span className="text-[9px] uppercase tracking-wider text-white/60 mb-0.5">Customer Contact</span>
                        <span className="font-sans text-[11px] font-bold tracking-wider">
                          {confirmedOrder?.phone || '+91 ••••• ••420'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Triggers */}
                  <div className="space-y-3 pt-1">
                    {/* Native Link Trigger (Guarantees bypass of iframe restrictions) */}
                    <a
                      href={`mailto:kj1201577@gmail.com?subject=${encodeURIComponent(
                        `New Sri Padma Handloom Order ${confirmedOrder?.orderId || '#RG-UNKNOWN'} - ${confirmedOrder?.customerName || 'Arjun Varma'}`
                      )}&body=${encodeURIComponent(
                        `Dear Boutique Team,\n\nA new heritage handloom order has been placed successfully!\n\n` +
                        `--- CUSTOMER SHIPPING DETAILS ---\n` +
                        `Name: ${confirmedOrder?.customerName || 'Arjun Varma'}\n` +
                        `Phone: ${confirmedOrder?.phone || 'N/A'}\n` +
                        `Email: ${confirmedOrder?.email || 'N/A'}\n` +
                        `Address: ${confirmedOrder?.address || 'N/A'}\n\n` +
                        `--- ORDERED ITEMS ---\n` +
                        (confirmedOrder?.items || []).map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.price || 0).toLocaleString('en-IN')}`).join('\n') + `\n\n` +
                        `--- BILLING BREAKDOWN ---\n` +
                        `Subtotal: ₹${(confirmedOrder?.subtotal || 0).toLocaleString('en-IN')}\n` +
                        `GST (5%): ₹${(confirmedOrder?.tax || 0).toLocaleString('en-IN')}\n` +
                        `Grand Total: ₹${(confirmedOrder?.grandTotal || 0).toLocaleString('en-IN')}\n\n` +
                        `Please coordinate shipping and delivery at the earliest.\n\nThank you!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white hover:bg-stone-100 text-primary py-3 px-4 rounded-xl font-sans text-[10px] font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 shadow cursor-pointer decoration-transparent"
                    >
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      Open Email App (Direct)
                    </a>

                    {/* Copy to Clipboard Trigger (100% Fail-safe for any mail setup) */}
                    <button
                      onClick={() => {
                        const bodyText = `Dear Boutique Team,\n\nA new heritage handloom order has been placed successfully!\n\n` +
                          `--- CUSTOMER SHIPPING DETAILS ---\n` +
                          `Name: ${confirmedOrder?.customerName || 'Arjun Varma'}\n` +
                          `Phone: ${confirmedOrder?.phone || 'N/A'}\n` +
                          `Email: ${confirmedOrder?.email || 'N/A'}\n` +
                          `Address: ${confirmedOrder?.address || 'N/A'}\n\n` +
                          `--- ORDERED ITEMS ---\n` +
                          (confirmedOrder?.items || []).map(item => `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.price || 0).toLocaleString('en-IN')}`).join('\n') + `\n\n` +
                          `--- BILLING BREAKDOWN ---\n` +
                          `Subtotal: ₹${(confirmedOrder?.subtotal || 0).toLocaleString('en-IN')}\n` +
                          `GST (5%): ₹${(confirmedOrder?.tax || 0).toLocaleString('en-IN')}\n` +
                          `Grand Total: ₹${(confirmedOrder?.grandTotal || 0).toLocaleString('en-IN')}\n\n` +
                          `Please coordinate shipping and delivery at the earliest.\n\nThank you!`;

                        navigator.clipboard.writeText(bodyText);
                        setCopiedDetails(true);
                        triggerToast("Shipping and order details copied to clipboard!", "success");
                        setTimeout(() => setCopiedDetails(false), 3000);
                      }}
                      className="w-full bg-primary-container/20 hover:bg-primary-container/35 text-white border border-white/20 py-3 rounded-xl font-sans text-[10px] font-bold uppercase tracking-widest transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      {copiedDetails ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Details Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          <span>Copy Order Details</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-[9px] text-white/60 italic text-center leading-normal">
                    * If clicking "Open Email App" does not open your email client, simply click "Copy Order Details" and paste them into your email to send to <strong>kj1201577@gmail.com</strong>.
                  </p>
                </div>

                {/* Shipping Address Card */}
                <div className="bg-white p-8 rounded-3xl border border-outline-variant/40 shadow-sm space-y-4">
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-primary" />
                    Shipping Address
                  </h3>
                  <div className="font-sans text-sm text-on-surface leading-relaxed font-light space-y-1">
                    <p className="font-bold text-primary">{confirmedOrder?.customerName || 'Arjun Varma'}</p>
                    {confirmedOrder?.address ? (
                      <p>{confirmedOrder.address}</p>
                    ) : (
                      <>
                        <p>Plot 12, Jubilee Hills Road No. 36</p>
                        <p>Near Neeru's Emporium</p>
                        <p>Hyderabad, Telangana - 500033</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => {
                      setCurrentTab('orders');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      triggerToast("Viewing your custom handloom order progress timeline.", "success");
                    }}
                    className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    Track Order Status
                  </button>
                  <button 
                    onClick={() => {
                      setConfirmedOrder(null);
                      setCurrentTab('shop');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full border-2 border-tertiary text-tertiary hover:bg-tertiary/5 py-4 rounded-xl font-sans text-xs font-bold uppercase tracking-widest text-center transition-all cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 6: CUSTOMER ORDERS & TRACKING ==================== */}
        {currentTab === 'orders' && (
          <div className="animate-fade-in max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-12">
            
            {/* Header section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">
                SRI PADMA HANDLOOM HERITAGE GATEWAY
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                Track Your Weave's Journey
              </h1>
              <p className="font-sans text-xs md:text-sm text-on-surface-variant font-light leading-relaxed">
                Unlike mass-manufactured garments, every Sri Padma Handloom Saree Store saree is a masterpiece hand-woven by master artisans over weeks. Monitor the live progress of your heritage order below.
              </p>
            </div>

            {/* Quick Look up & Recent Selector */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Search lookup bar */}
                <div className="md:col-span-6 space-y-2">
                  <label className="block font-sans text-xs font-bold text-primary uppercase tracking-wider">
                    Search Order ID or Details
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      placeholder="e.g. #RG-8294105 or Arjun Varma" 
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-outline-variant/50 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-primary"
                    />
                    <Search className="w-4 h-4 absolute left-3.5 text-on-surface-variant" />
                    {orderSearchQuery && (
                      <button 
                        onClick={() => setOrderSearchQuery('')}
                        className="absolute right-3 text-xs text-on-surface-variant hover:text-primary cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick select selector */}
                <div className="md:col-span-6 space-y-2">
                  <label className="block font-sans text-xs font-bold text-primary uppercase tracking-wider">
                    Your Registered Orders
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {pastOrders.map((ord) => (
                      <button
                        key={ord.orderId}
                        onClick={() => {
                          setTrackedOrderId(ord.orderId);
                          setOrderSearchQuery('');
                          triggerToast(`Now tracking order ${ord.orderId}`, 'success');
                        }}
                        className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          trackedOrderId === ord.orderId && !orderSearchQuery
                            ? 'bg-primary text-white shadow-md border border-primary'
                            : 'bg-surface-container hover:bg-outline-variant/20 text-on-surface-variant border border-outline-variant/20'
                        }`}
                      >
                        {ord.orderId} ({ord.status})
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Active Tracked Order Panel */}
            {(() => {
              // Filter orders based on query or selection
              const filteredOrders = pastOrders.filter(ord => {
                if (orderSearchQuery.trim()) {
                  const query = orderSearchQuery.toLowerCase();
                  return (
                    ord.orderId.toLowerCase().includes(query) ||
                    ord.customerName.toLowerCase().includes(query) ||
                    ord.email.toLowerCase().includes(query) ||
                    ord.phone.toLowerCase().includes(query) ||
                    ord.trackingNumber.toLowerCase().includes(query)
                  );
                }
                return ord.orderId === trackedOrderId;
              });

              if (filteredOrders.length === 0) {
                return (
                  <div className="text-center py-16 bg-white rounded-3xl border border-outline-variant/30 space-y-4">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-2xl text-primary">search_off</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-primary">No Matching Order Found</h3>
                    <p className="font-sans text-xs text-on-surface-variant max-w-md mx-auto">
                      We couldn't find any orders matching "{orderSearchQuery}". Please double-check the spelling, order ID format, or try clicking one of the registered orders above.
                    </p>
                  </div>
                );
              }

              // Take the first matching order for tracking display
              const activeOrder = filteredOrders[0];

              // Set stages definitions
              const stages = [
                {
                  key: 'PLACED' as const,
                  title: 'Order Confirmed',
                  subtitle: 'Artisan Assigned',
                  description: 'Your loom request is verified and assigned to a certified master weaver in Gadwal, Telangana.',
                  icon: 'receipt_long'
                },
                {
                  key: 'DYEING' as const,
                  title: 'Yarn Preparation',
                  subtitle: 'Mulberry Thread Dyeing',
                  description: 'Pure silk & cotton hanks are hand-washed, naturally dyed in ceremonial vibrant tones, and dried.',
                  icon: 'colorize'
                },
                {
                  key: 'WEAVING' as const,
                  title: 'Handloom Weaving',
                  subtitle: 'Interlocking Zari Borders',
                  description: 'Weaving body and heavy gold pallu using classic interlocking "Kuttu" joins on a manual pit loom.',
                  icon: 'grid_view'
                },
                {
                  key: 'QUALITY_CHECK' as const,
                  title: 'Silk Mark Audit',
                  subtitle: 'Purity Certification',
                  description: 'Inspected under the Silk Mark Organization guidelines to verify thread purity and zari gold content.',
                  icon: 'verified'
                },
                {
                  key: 'DISPATCHED' as const,
                  title: 'Dispatched',
                  subtitle: 'In-Transit to Gateway',
                  description: 'Saree packed in luxury moisture-locked cedar boxes and shipped via high-priority air logistics.',
                  icon: 'local_shipping'
                },
                {
                  key: 'DELIVERED' as const,
                  title: 'Delivered',
                  subtitle: 'Elegance Reached Home',
                  description: 'Safely delivered with custom care guidelines. Welcome to the Sri Padma Handloom heritage legacy.',
                  icon: 'task_alt'
                }
              ];

              // Helper to check stage status index
              const getStageStatus = (stageKey: string) => {
                const stageOrder = ['PLACED', 'DYEING', 'WEAVING', 'QUALITY_CHECK', 'DISPATCHED', 'DELIVERED'];
                const currentIndex = stageOrder.indexOf(activeOrder.status);
                const stageIndex = stageOrder.indexOf(stageKey);

                if (stageIndex < currentIndex) return 'COMPLETED';
                if (stageIndex === currentIndex) return 'ACTIVE';
                return 'PENDING';
              };

              // Advance state simulation logic
              const advanceStatus = () => {
                const stageOrder: Array<'PLACED' | 'DYEING' | 'WEAVING' | 'QUALITY_CHECK' | 'DISPATCHED' | 'DELIVERED'> = [
                  'PLACED', 'DYEING', 'WEAVING', 'QUALITY_CHECK', 'DISPATCHED', 'DELIVERED'
                ];
                const currentIndex = stageOrder.indexOf(activeOrder.status);
                if (currentIndex < stageOrder.length - 1) {
                  const nextStatus = stageOrder[currentIndex + 1];
                  setPastOrders(prev => prev.map(ord => 
                    ord.orderId === activeOrder.orderId ? { ...ord, status: nextStatus } : ord
                  ));
                  triggerToast(`Order status updated to ${nextStatus}!`, 'success');
                } else {
                  triggerToast("Order has already reached the final stage (Delivered)!", "success");
                }
              };

              const demoteStatus = () => {
                const stageOrder: Array<'PLACED' | 'DYEING' | 'WEAVING' | 'QUALITY_CHECK' | 'DISPATCHED' | 'DELIVERED'> = [
                  'PLACED', 'DYEING', 'WEAVING', 'QUALITY_CHECK', 'DISPATCHED', 'DELIVERED'
                ];
                const currentIndex = stageOrder.indexOf(activeOrder.status);
                if (currentIndex > 0) {
                  const prevStatus = stageOrder[currentIndex - 1];
                  setPastOrders(prev => prev.map(ord => 
                    ord.orderId === activeOrder.orderId ? { ...ord, status: prevStatus } : ord
                  ));
                  triggerToast(`Order status reset to ${prevStatus}`, 'success');
                }
              };

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  
                  {/* Left: Interactive Progress Timeline (col-span-7) */}
                  <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl border border-outline-variant/40 shadow-md space-y-10">
                    
                    {/* Panel Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-outline-variant/20 gap-4">
                      <div>
                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                          LIVE PROGRESS TRACKER
                        </span>
                        <h2 className="font-display text-2xl font-extrabold text-primary flex items-center gap-2">
                          {activeOrder.orderId}
                          <span className="font-sans text-xs font-normal text-on-surface-variant">({activeOrder.date})</span>
                        </h2>
                      </div>
                      <div className="flex flex-col sm:items-end">
                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                          CURRENT PHASE
                        </span>
                        <span className="bg-primary/5 border border-primary/20 text-primary font-sans text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-xl">
                          {activeOrder.status === 'QUALITY_CHECK' ? 'SILK MARK AUDIT' : activeOrder.status}
                        </span>
                      </div>
                    </div>

                    {/* Simulation Panel for demo/testing */}
                    <div className="bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <h4 className="font-sans text-xs font-bold text-primary uppercase">Artisan Loom Control</h4>
                        <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed">
                          Advance stages to test how the real-time weaving and shipping tracker progresses.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={demoteStatus}
                          disabled={activeOrder.status === 'PLACED'}
                          className="px-3 py-1.5 bg-white border border-outline-variant/40 hover:bg-red-50 text-red-700 disabled:opacity-40 disabled:hover:bg-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Prev Step
                        </button>
                        <button 
                          onClick={advanceStatus}
                          disabled={activeOrder.status === 'DELIVERED'}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-container text-white disabled:opacity-40 disabled:hover:bg-primary text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Next Step
                        </button>
                      </div>
                    </div>

                    {/* Timeline Vertical Stepper */}
                    <div className="relative pl-8 space-y-12 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/20">
                      {stages.map((stage, idx) => {
                        const status = getStageStatus(stage.key);
                        return (
                          <div key={stage.key} className="relative flex flex-col sm:flex-row gap-6 items-start">
                            
                            {/* Stepper Dot */}
                            <div className={`absolute -left-[30px] w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                              status === 'COMPLETED' 
                                ? 'bg-primary border-primary text-white' 
                                : status === 'ACTIVE'
                                ? 'bg-white border-tertiary text-tertiary ring-4 ring-tertiary/15 scale-110'
                                : 'bg-white border-outline-variant/40 text-on-surface-variant/40'
                            }`}>
                              {status === 'COMPLETED' ? (
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                              ) : (
                                <span className="font-mono text-xs font-bold">{idx + 1}</span>
                              )}
                            </div>

                            {/* Stage Details */}
                            <div className="flex-grow space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`material-symbols-outlined text-lg ${
                                  status === 'ACTIVE' ? 'text-tertiary animate-pulse' : status === 'COMPLETED' ? 'text-primary' : 'text-on-surface-variant/40'
                                }`}>
                                  {stage.icon}
                                </span>
                                <h3 className={`font-display text-base font-bold ${
                                  status === 'PENDING' ? 'text-on-surface-variant/40' : 'text-primary'
                                }`}>
                                  {stage.title}
                                </h3>
                                <span className={`font-sans text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  status === 'COMPLETED' 
                                    ? 'bg-primary/10 text-primary' 
                                    : status === 'ACTIVE'
                                    ? 'bg-tertiary/10 text-tertiary animate-pulse'
                                    : 'bg-[#f1f3f4] text-on-surface-variant/40'
                                }`}>
                                  {status.toLowerCase()}
                                </span>
                              </div>

                              <h4 className={`font-sans text-[11px] font-bold ${
                                status === 'PENDING' ? 'text-on-surface-variant/40' : 'text-tertiary'
                              }`}>
                                {stage.subtitle}
                              </h4>
                              <p className={`font-sans text-xs font-light leading-relaxed max-w-2xl ${
                                status === 'PENDING' ? 'text-on-surface-variant/30' : 'text-on-surface-variant'
                              }`}>
                                {stage.description}
                              </p>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* Right: Courier, Shipping & Product Details (col-span-5) */}
                  <div className="lg:col-span-5 space-y-8">
                    
                    {/* Courier Logistic Card */}
                    <div className="bg-primary p-8 rounded-3xl text-white shadow-lg space-y-6 border border-primary-container/20">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-2xl text-tertiary-fixed-dim">local_shipping</span>
                        </div>
                        <div className="space-y-1">
                          <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-white/60 block">COURIER & LOGISTICS</span>
                          <h3 className="font-display text-lg font-bold">{activeOrder.courier}</h3>
                          <p className="font-sans text-xs text-white/80 font-light leading-relaxed">
                            {activeOrder.status === 'DELIVERED' 
                              ? 'Delivered with luxury handling.' 
                              : `Estimated home arrival: ${activeOrder.estimatedDelivery}.`}
                          </p>
                        </div>
                      </div>

                      {/* Tracking ID details */}
                      <div className="flex items-center justify-between bg-white/10 px-4 py-3.5 rounded-xl border border-white/5 shadow-sm">
                        <div className="space-y-0.5">
                          <span className="font-sans text-[9px] font-bold tracking-wider text-white/60 block uppercase">AWB NUMBER</span>
                          <span className="font-mono text-xs font-bold tracking-wide">{activeOrder.trackingNumber}</span>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(activeOrder.trackingNumber);
                            triggerToast("Tracking ID copied to clipboard!", "success");
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                          title="Copy AWB Tracking Number"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Saree Details Card */}
                    <div className="bg-white p-8 rounded-3xl border border-outline-variant/40 shadow-sm space-y-6">
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2 border-b border-outline-variant/15 pb-4">
                        <span className="material-symbols-outlined text-lg text-primary">shopping_bag</span>
                        Ordered Saree Masterpieces
                      </h3>

                      <div className="space-y-6">
                        {activeOrder.items.map((item) => (
                          <div key={item.id} className="flex gap-4 items-start">
                            <div className="w-16 h-22 flex-shrink-0 bg-surface-container rounded-xl overflow-hidden border border-outline-variant/20">
                              <img 
                                className="w-full h-full object-cover" 
                                src={item.imageUrl || "/images/saree1.jpg"}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-grow min-w-0 space-y-1">
                              <h4 className="font-display text-sm font-bold text-primary truncate">
                                {item.name}
                              </h4>
                              <p className="font-sans text-[10px] text-on-surface-variant font-light line-clamp-1">
                                {item.specs || 'Traditional Temple Border | 5.5 Meters'}
                              </p>
                              <div className="flex justify-between items-center pt-1.5">
                                <span className="font-sans text-[10px] font-medium text-on-surface-variant">
                                  Qty: {item.quantity}
                                </span>
                                <span className="font-display text-xs font-bold text-primary">
                                  ₹{(item.price || 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary calculations list */}
                      <div className="pt-4 border-t border-outline-variant/15 space-y-2.5">
                        <div className="flex justify-between font-sans text-[11px] text-on-surface-variant">
                          <span>Weaver Subtotal</span>
                          <span className="text-primary font-bold">₹{(activeOrder?.subtotal ?? 0).toLocaleString('en-IN')}</span>
                        </div>
                        {activeOrder && (activeOrder.discountAmount ?? 0) > 0 && (
                          <div className="flex justify-between font-sans text-[11px] text-emerald-600 font-bold">
                            <span>Promo Discount</span>
                            <span>- ₹{(activeOrder.discountAmount ?? 0).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-sans text-[11px] text-on-surface-variant">
                          <span>Insurance Shipping</span>
                          <span className="text-tertiary font-bold uppercase tracking-wider text-[9px]">COMPLIMENTARY</span>
                        </div>
                        <div className="flex justify-between font-sans text-[11px] text-on-surface-variant pb-2">
                          <span>Estimated Tax (GST 5%)</span>
                          <span className="text-primary font-bold">₹{(activeOrder?.tax ?? 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center">
                          <span className="font-display text-sm font-bold text-primary">Grand Total</span>
                          <span className="font-display text-base font-extrabold text-primary">₹{(activeOrder?.grandTotal ?? 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                    </div>

                    {/* Delivery Destination Address Card */}
                    <div className="bg-white p-8 rounded-3xl border border-outline-variant/40 shadow-sm space-y-4">
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-lg text-primary font-bold">map</span>
                        Delivery Destination
                      </h3>
                      <div className="font-sans text-xs text-on-surface leading-relaxed font-light space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-primary">person</span>
                          <span className="font-bold text-primary">{activeOrder.customerName}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-sm text-primary shrink-0">pin_drop</span>
                          <span>{activeOrder.address}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="material-symbols-outlined text-sm text-[#25D366]">chat</span>
                          <span className="font-medium text-on-surface-variant">{activeOrder.phone}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })()}

          </div>
        )}

        {/* ==================== TAB 7: PRODUCT DETAIL PAGE ==================== */}
        {currentTab === 'product-detail' && (() => {
          const getSelectedProductImages = (item: InventoryItem) => {
            if (item.id === 'default-gadwal' || item.sku === 'RG-SLK-ROY' || item.name.toLowerCase().includes('zari border') || item.name.toLowerCase().includes('gadwal silk')) {
              return [
                '/images/saree1.jpg',
                '/images/saree2.jpg',
                '/images/saree3.jpg',
                '/images/saree4.jpg',
                '/images/saree5.jpg'
              ];
            }
            return [
              item.imageUrl,
              '/images/saree2.jpg',
              '/images/saree3.jpg',
              '/images/saree4.jpg'
            ];
          };

          const relatedSarees: InventoryItem[] = [
            {
              id: 'rel-1',
              name: 'Emerald Green Gadwal Masterpiece',
              category: 'Handloom Silk',
              sku: 'RG-SLK-EMG',
              status: 'IN STOCK',
              available: 8,
              specs: 'Symmetric Peacock Buttas | 5.5 Meters',
              imageUrl: '/images/saree3.jpg',
              threshold: 2,
              price: 28900
            },
            {
              id: 'rel-2',
              name: 'Classic Temple Border Silk',
              category: 'Heritage Collection',
              sku: 'RG-SLK-CTB',
              status: 'IN STOCK',
              available: 5,
              specs: 'Symmetric Temple Border | 5.5 Meters',
              imageUrl: '/images/saree2.jpg',
              threshold: 1,
              price: 34200
            },
            {
              id: 'rel-3',
              name: 'Maroon Floral Butta Saree',
              category: 'Silk Mark Certified',
              sku: 'RG-SLK-MFB',
              status: 'IN STOCK',
              available: 12,
              specs: 'Intricate Floral Vine Patterns | 5.5 Meters',
              imageUrl: '/images/saree1.jpg',
              threshold: 3,
              price: 26500
            },
            {
              id: 'rel-4',
              name: 'Vibrant Contrast Border Silk',
              category: 'Festival Special',
              sku: 'RG-SLK-VCB',
              status: 'IN STOCK',
              available: 6,
              specs: 'Vibrant contrast border & body | 5.5 Meters',
              imageUrl: '/images/saree4.jpg',
              threshold: 2,
              price: 29000
            }
          ];

          return (
            <div className="animate-fade-in max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-16">
              
              {/* Breadcrumb Navigation */}
              <div className="flex flex-wrap items-center gap-2 font-sans text-xs font-semibold text-on-surface-variant/70">
                <button onClick={() => { setCurrentTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-primary transition-colors cursor-pointer uppercase tracking-wider">Home</button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <button onClick={() => { setCurrentTab('shop'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-primary transition-colors cursor-pointer uppercase tracking-wider">Handlooms</button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-primary uppercase tracking-wider font-bold truncate max-w-[200px] sm:max-w-none">{selectedProduct.name}</span>
              </div>

              {/* Main Product Details Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Left Side: Product Gallery */}
                <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
                  {/* Thumbnails */}
                  <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto hide-scrollbar max-h-[600px] md:w-24 py-1">
                    {getSelectedProductImages(selectedProduct).map((imgUrl, index) => (
                      <button 
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`w-20 h-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all hover:opacity-90 border-2 outline-none ${
                          activeImage === index ? 'border-primary shadow-sm scale-102' : 'border-outline-variant/30 hover:border-outline-variant/70'
                        }`}
                      >
                        <img 
                          className="w-full h-full object-cover" 
                          src={imgUrl} 
                          alt={`Thumbnail ${index + 1}`} 
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>

                  {/* Main Zoomable Image */}
                  <div 
                    className="order-1 md:order-2 flex-grow overflow-hidden rounded-2xl bg-surface-container-low relative group cursor-zoom-in border border-outline-variant/20 shadow-sm"
                    onMouseMove={(e) => {
                      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - left) / width) * 100;
                      const y = ((e.clientY - top) / height) * 100;
                      setZoomOrigin(`${x}% ${y}%`);
                    }}
                    onMouseLeave={() => setZoomOrigin('center center')}
                  >
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                        HANDWOVEN
                      </span>
                    </div>
                    <img 
                      className="w-full h-auto object-cover aspect-[3/4] transition-transform duration-500 hover:scale-150" 
                      style={{ transformOrigin: zoomOrigin }}
                      src={getSelectedProductImages(selectedProduct)[activeImage] || selectedProduct.imageUrl} 
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Right Side: Product Descriptors */}
                <div className="lg:col-span-5 space-y-8">
                  
                  {/* Brand & Title */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-tertiary font-bold tracking-widest uppercase bg-tertiary/5 border border-tertiary/10 px-3 py-1 rounded-full">
                        {selectedProduct.sku}
                      </span>
                      <span className="font-sans text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">
                        {selectedProduct.category}
                      </span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-primary tracking-tight leading-tight">
                      {selectedProduct.name}
                    </h1>
                    
                    {/* Rating summary */}
                    <div className="flex items-center gap-3">
                      <div className="flex text-tertiary">
                        {[1, 2, 3, 4].map((i) => (
                          <span key={i} className="material-symbols-outlined text-sm font-bold">star</span>
                        ))}
                        <span className="material-symbols-outlined text-sm font-bold">star_half</span>
                      </div>
                      <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                        4.5 Stars • 24 Reviews
                      </span>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="py-6 border-t border-b border-outline-variant/30 flex items-baseline gap-4">
                    <span className="font-display text-3xl font-extrabold text-primary">
                      ₹{(selectedProduct?.price ?? 0).toLocaleString('en-IN')}
                    </span>
                    {(selectedProduct.id === 'default-gadwal' || selectedProduct.sku === 'RG-SLK-ROY' || selectedProduct.name.toLowerCase().includes('zari border') || selectedProduct.name.toLowerCase().includes('gadwal silk')) && (
                      <>
                        <span className="font-display text-lg text-on-surface-variant/60 line-through">
                          ₹45,000
                        </span>
                        <span className="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                          SAVE 28%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Descriptions */}
                  <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed font-light">
                    {(selectedProduct.id === 'default-gadwal' || selectedProduct.sku === 'RG-SLK-ROY' || selectedProduct.name.toLowerCase().includes('zari border') || selectedProduct.name.toLowerCase().includes('gadwal silk'))
                      ? "Experience the heritage of Gadwal with this exquisite hand-loomed silk masterpiece. Featuring a distinctive contrast silk border adorned with heavy gold zari, this saree represents the pinnacle of South Indian weaving traditions."
                      : `${selectedProduct.specs || 'Experience classic South Indian luxury.'} This exclusive handloom marvel from our boutique collection is meticulously woven with premium silk threads, showcasing an authentic contrast weave of outstanding precision and beauty.`}
                  </p>

                  {/* Quantity and Actions */}
                  <div className="space-y-6 pt-2">
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                      
                      {/* Quantity Adjustment */}
                      <div className="space-y-1 shrink-0">
                        <span className="block font-sans text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">Quantity</span>
                        <div className="flex items-center border border-outline-variant/40 rounded-xl overflow-hidden bg-[#f8f9fa] w-32 justify-between">
                          <button 
                            onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                            className="p-3 text-primary hover:bg-outline-variant/10 transition-colors font-bold cursor-pointer outline-none"
                            title="Decrease Quantity"
                          >
                            <span className="material-symbols-outlined text-xs font-bold">remove</span>
                          </button>
                          <span className="font-mono text-xs font-bold text-primary">{detailQty}</span>
                          <button 
                            onClick={() => setDetailQty(Math.min(selectedProduct.available || 10, detailQty + 1))}
                            className="p-3 text-primary hover:bg-outline-variant/10 transition-colors font-bold cursor-pointer outline-none"
                            title="Increase Quantity"
                          >
                            <span className="material-symbols-outlined text-xs font-bold">add</span>
                          </button>
                        </div>
                      </div>

                      {/* Stock summary info */}
                      <div className="flex flex-col justify-end pt-5 sm:pt-0">
                        <span className="font-mono text-[10px] text-on-surface-variant/70 font-semibold">
                          Stock Status: <span className={(selectedProduct.available ?? 10) > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                            {(selectedProduct.available ?? 10) > 0 ? `${selectedProduct.available ?? 10} items left` : 'Out of Stock'}
                          </span>
                        </span>
                        <span className="font-sans text-[9px] text-on-surface-variant/50">Woven on certified manual pit looms</span>
                      </div>

                    </div>

                    {/* Buy Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={() => addToCartWithQty(selectedProduct, detailQty)}
                        disabled={selectedProduct.available === 0}
                        className="flex-1 bg-white border-2 border-primary hover:bg-primary/5 text-primary font-sans text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center"
                      >
                        Add to Shopping Bag
                      </button>
                      <button 
                        onClick={() => {
                          addToCartWithQty(selectedProduct, detailQty);
                          setCurrentTab('cart');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={selectedProduct.available === 0}
                        className="flex-1 bg-primary hover:bg-primary-container text-white font-sans text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center border border-primary/20"
                      >
                        Buy Now
                      </button>
                    </div>

                    {/* WhatsApp Direct Inquiry Button */}
                    <a 
                      href={`https://wa.me/918074400697?text=${encodeURIComponent(
                        `Namaste! I am interested in purchasing/inquiring about the "${selectedProduct.name}" (SKU: ${selectedProduct.sku}) priced at ₹${(selectedProduct.price ?? 0).toLocaleString('en-IN')}. Please guide me with availability and customization options.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25d366] hover:bg-[#20ba5a] text-white font-sans text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2.5 mt-2 text-center"
                    >
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.375 3.469 2.235 2.237 3.465 5.212 3.463 8.381-.003 6.538-5.328 11.86-11.859 11.86h-.001c-2.01-.002-3.987-.546-5.741-1.579L0 24zm6.59-4.846c1.666.988 3.313 1.477 5.26 1.478 5.433 0 9.85-4.414 9.852-9.843.001-2.63-1.021-5.102-2.88-6.964C16.962 1.963 14.49 .94 11.861.94c-5.434 0-9.851 4.414-9.853 9.842-.001 1.992.521 3.93 1.513 5.643l-.995 3.633 3.731-.979zm11.17-6.861c-.302-.15-.1.15-.352-.075l-1.006-.493c-.252-.125-.433-.188-.614.075-.182.262-.705.88-.865 1.063-.159.183-.32.206-.622.056-.302-.15-1.274-.469-2.426-1.496-.897-.798-1.502-1.784-1.678-2.083-.176-.3-.019-.462.132-.612.135-.134.302-.351.453-.526.151-.176.201-.3.302-.5.101-.2.05-.376-.026-.526-.075-.15-.614-1.477-.841-2.028-.221-.53-.443-.457-.614-.466-.159-.008-.342-.01-.524-.01-.182 0-.478.068-.729.342-.252.274-.959.937-.959 2.285 0 1.348.981 2.646 1.119 2.833.139.188 1.928 2.944 4.671 4.127.653.282 1.162.451 1.56.577.656.208 1.253.179 1.724.11.526-.078 1.614-.661 1.84-1.298.227-.639.227-1.187.159-1.298-.068-.112-.251-.188-.553-.338z"/>
                      </svg>
                      Inquire on WhatsApp
                    </a>
                  </div>

                  {/* Interactive Accordion Panels */}
                  <div className="border-t border-outline-variant/30 pt-6 space-y-4">
                    
                    {/* Specifications Accordion */}
                    <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <button 
                        onClick={() => setSpecsExpanded(!specsExpanded)}
                        className="w-full flex justify-between items-center px-6 py-4.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-container-low transition-colors outline-none cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-tertiary">tune</span>
                          Product Specifications
                        </span>
                        <span className="material-symbols-outlined text-base transition-transform duration-300" style={{ transform: specsExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                          keyboard_arrow_down
                        </span>
                      </button>
                      {specsExpanded && (
                        <div className="px-6 pb-5 pt-1 border-t border-outline-variant/15 font-sans text-xs text-on-surface-variant leading-relaxed font-light bg-white">
                          <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 py-2">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Fabric</span>
                              <p className="font-semibold text-primary">{(selectedProduct.id === 'default-gadwal' || selectedProduct.sku === 'RG-SLK-ROY' || selectedProduct.name.toLowerCase().includes('zari border') || selectedProduct.name.toLowerCase().includes('gadwal silk')) ? '100% Pure Mulberry Silk' : 'Premium Handloom Silk Mark'}</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Border Weave</span>
                              <p className="font-semibold text-primary">Interlocked Gold Zari (Kuttu)</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Blouse Piece</span>
                              <p className="font-semibold text-primary">Contrast Running (80cm)</p>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Length</span>
                              <p className="font-semibold text-primary">6.3 Meters (Including Blouse)</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Care Instructions Accordion */}
                    <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <button 
                        onClick={() => setCareExpanded(!careExpanded)}
                        className="w-full flex justify-between items-center px-6 py-4.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-container-low transition-colors outline-none cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-tertiary">dry_cleaning</span>
                          Care Instructions
                        </span>
                        <span className="material-symbols-outlined text-base transition-transform duration-300" style={{ transform: careExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                          keyboard_arrow_down
                        </span>
                      </button>
                      {careExpanded && (
                        <div className="px-6 pb-5 pt-1 border-t border-outline-variant/15 font-sans text-xs text-on-surface-variant leading-relaxed font-light bg-white">
                          <ul className="list-disc pl-4 space-y-2 py-2">
                            <li><strong>Dry clean only</strong> to maintain the premium mulberry silk structure and prevent zari-oxidation.</li>
                            <li>Iron on <strong>low heat settings</strong> only using a clean protective cotton drape.</li>
                            <li>Store wrapped in <strong>breathable cotton/muslin bags</strong> away from damp environments.</li>
                            <li>Avoid applying chemical perfumes directly to the gold zari hanks.</li>
                          </ul>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>

              {/* Related Collections Grid */}
              <div className="space-y-8 pt-6 border-t border-outline-variant/20">
                <div className="text-center md:text-left space-y-1.5">
                  <span className="font-sans text-[9px] font-bold text-tertiary uppercase tracking-[0.2em] block">
                    Curated for you
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary tracking-tight">
                    Related Collections
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {relatedSarees.map((item) => (
                    <div 
                      key={item.id} 
                      className="group bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Saree Image with hover effects */}
                      <div 
                        onClick={() => {
                          setSelectedProduct(item);
                          setActiveImage(0);
                          setDetailQty(1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="aspect-[3/4] bg-surface-container-low overflow-hidden relative cursor-pointer"
                      >
                        <img 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                          src={item.imageUrl} 
                          alt={item.name} 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Saree Info block */}
                      <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                        <div className="space-y-1 cursor-pointer" onClick={() => {
                          setSelectedProduct(item);
                          setActiveImage(0);
                          setDetailQty(1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}>
                          <span className="font-sans text-[9px] text-on-surface-variant font-bold uppercase tracking-widest block">{item.category}</span>
                          <h4 className="font-display text-sm font-bold text-primary group-hover:text-tertiary transition-colors line-clamp-1">{item.name}</h4>
                          <span className="font-sans text-[10px] text-on-surface-variant/70 leading-relaxed font-light line-clamp-1">{item.specs}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                          <span className="font-display text-xs font-extrabold text-primary">₹{(item.price ?? 0).toLocaleString('en-IN')}</span>
                          <button 
                            onClick={() => addToCartWithQty(item, 1)}
                            className="px-3 py-1.5 bg-primary hover:bg-primary-container text-white font-sans text-[9px] font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer border border-primary/10"
                          >
                            Quick Add
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Reviews Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-outline-variant/20 items-start">
                
                {/* Reviews Summary Column */}
                <div className="lg:col-span-4 bg-surface-container-low p-8 rounded-3xl space-y-6 border border-outline-variant/15 text-center lg:text-left">
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-primary">Customer Stories</h3>
                    <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed">
                      Read the personal testaments of handloom connoisseurs who brought our sarees home.
                    </p>
                  </div>

                  <div className="py-6 border-t border-b border-outline-variant/30 flex flex-col items-center lg:items-start gap-1">
                    <span className="font-display text-5xl font-extrabold text-primary">4.8</span>
                    <div className="flex text-tertiary my-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className="material-symbols-outlined text-lg font-bold">star</span>
                      ))}
                    </div>
                    <span className="font-sans text-[9px] font-bold text-on-surface-variant/70 uppercase tracking-widest">
                      BASED ON {reviews.length + 22} REVIEWS
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      setNewReviewName('');
                      setNewReviewRating(5);
                      setNewReviewComment('');
                      setShowReviewModal(true);
                    }}
                    className="w-full bg-primary hover:bg-primary-container text-white font-sans text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer border border-primary/20 text-center block"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Reviews List Column */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="divide-y divide-outline-variant/20">
                    {reviews.map((rev, index) => (
                      <div key={index} className="py-6 first:pt-0 space-y-3 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <h4 className="font-display text-sm font-bold text-primary tracking-wide uppercase">{rev.name}</h4>
                            <span className="font-sans text-[9px] text-on-surface-variant/60 block">{rev.time}</span>
                          </div>
                          <div className="flex text-tertiary">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-sm font-bold">
                                {i < rev.rating ? 'star' : 'star_border'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed font-light">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Load More Trigger */}
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => triggerToast("All heritage customer reviews are fully loaded.", "success")}
                      className="px-6 py-2.5 border border-outline-variant/50 hover:bg-surface-container-low font-sans text-[10px] font-bold uppercase tracking-widest rounded-xl text-primary transition-colors cursor-pointer"
                    >
                      Load More Reviews
                    </button>
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

        {/* Newsletter Section */}
        <section className="bg-white border-t border-b border-outline-variant/40 py-24">
          <div className="px-6 md:px-12 max-w-7xl mx-auto text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto text-primary">
                <Mail className="w-6 h-6 text-tertiary" />
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-primary tracking-wide">Join the Inner Circle</h2>
              <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                Be the first to explore our limited-edition launches, heritage stories, and exclusive boutique events.
              </p>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-4">
                <input 
                  type="email" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="flex-grow bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-5 py-3.5 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-primary text-white font-sans text-xs font-bold py-3.5 px-8 rounded-xl uppercase tracking-widest hover:bg-primary-container hover:shadow-md active:scale-98 transition-all cursor-pointer border border-primary/20"
                >
                  Subscribe
                </button>
              </form>
              <p className="font-sans text-[10px] text-on-surface-variant/60">By subscribing, you agree to our premium member Privacy Policy.</p>
            </div>
          </div>
        </section>

        {/* ==================== TAB 9: PROFILE TAB (GOOGLE SIGN IN) ==================== */}
        {currentTab === 'profile' && (
          <div className="animate-fade-in max-w-4xl mx-auto px-6 md:px-12 py-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">
                Timeless Heritage Accounts
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                Your Sri Padma Profile
              </h1>
              <p className="font-sans text-xs md:text-sm text-on-surface-variant font-light leading-relaxed">
                Unlock custom handloom tailoring, trace your bespoke orders, and manage your artisan weaver preferences.
              </p>
            </div>

            {isAdminLoggedIn ? (
              /* Signed In Owner Profile Card */
              <div className="bg-white p-8 md:p-12 rounded-3xl border border-amber-200 shadow-xl space-y-8 max-w-md mx-auto text-center relative overflow-hidden">
                {/* Decorative background accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-primary"></div>
                
                <div className="relative w-28 h-28 mx-auto">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center border-4 border-amber-400 shadow-md">
                    <span className="font-display text-4xl font-extrabold text-primary">J</span>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-amber-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow" title="Administrator">
                    <Settings className="w-2.5 h-2.5 text-white animate-spin-slow" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="bg-amber-100 text-[#8C6D41] font-sans text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200">
                    Boutique Owner & Administrator
                  </span>
                  <h2 className="font-display text-2xl font-bold text-primary pt-1">Juned</h2>
                  <p className="font-sans text-xs text-on-surface-variant font-medium">9642912613</p>
                  <p className="font-sans text-[11px] text-[#8C6D41] font-medium">kj1201577@gmail.com</p>
                </div>

                <div className="border-t border-outline-variant/20 pt-6 space-y-4">
                  <button
                    onClick={() => {
                      onEnterAdminMode();
                    }}
                    className="w-full bg-gradient-to-r from-primary to-[#001f54] hover:shadow-lg text-white py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-tertiary-fixed-dim" />
                    Go to Admin Dashboard
                  </button>

                  <button
                    onClick={() => {
                      onAdminLoginChange(false);
                      triggerToast("Logged out of Owner Session.", "success");
                    }}
                    className="w-full border border-red-200 text-red-600 hover:bg-red-50/50 py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Sign Out Owner Session
                  </button>
                </div>
              </div>
            ) : googleUser ? (
              /* Signed In Profile Card */
              <div className="bg-white p-8 md:p-12 rounded-3xl border border-outline-variant/30 shadow-lg space-y-8 max-w-md mx-auto text-center">
                <div className="relative w-28 h-28 mx-auto">
                  <img 
                    src={googleUser.picture || "/images/user_avatar.jpg"} 
                    alt={googleUser.name} 
                    className="w-full h-full rounded-full object-cover border-4 border-primary shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1 right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow" title="Active Account">
                    <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="bg-primary/10 text-primary font-sans text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Heritage Club Member
                  </span>
                  <h2 className="font-display text-2xl font-bold text-primary pt-1">{googleUser.name}</h2>
                  <p className="font-sans text-xs text-on-surface-variant font-light">{googleUser.email}</p>
                </div>

                <div className="border-t border-outline-variant/20 pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f8f9fa] p-4 rounded-2xl border border-outline-variant/15">
                      <span className="font-sans text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider block mb-1">Favorites</span>
                      <span className="font-display text-xl font-bold text-primary">{favorites.length} Sarees</span>
                    </div>
                    <div className="bg-[#f8f9fa] p-4 rounded-2xl border border-outline-variant/15">
                      <span className="font-sans text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider block mb-1">Orders</span>
                      <span className="font-display text-xl font-bold text-primary">{pastOrders.length} Tracked</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentTab('shop');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm"
                  >
                    Explore Handloom Gallery
                  </button>

                  <button
                    onClick={handleGoogleSignOut}
                    className="w-full border border-red-200 text-red-600 hover:bg-red-50/50 py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Sign Out Account
                  </button>
                </div>
              </div>
            ) : (
              /* Signed Out State with Real Button Container and Sandbox Simulation */
              <div className="bg-white p-8 md:p-12 rounded-3xl border border-outline-variant/30 shadow-lg space-y-8 max-w-lg mx-auto">
                
                {/* Header Switcher Tabs */}
                <div className="flex border border-outline-variant/60 rounded-2xl overflow-hidden p-1 bg-stone-50">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginTab('customer');
                      setOwnerError('');
                    }}
                    className={`flex-1 text-center py-2.5 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      loginTab === 'customer'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant/70 hover:text-primary'
                    }`}
                  >
                    Customer Access
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginTab('owner');
                      setOwnerError('');
                    }}
                    className={`flex-1 text-center py-2.5 rounded-xl font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      loginTab === 'owner'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant/70 hover:text-primary'
                    }`}
                  >
                    Boutique Owner
                  </button>
                </div>

                {loginTab === 'customer' ? (
                  <>
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-2">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-primary">Access Your Heritage Account</h3>
                      <p className="font-sans text-xs text-on-surface-variant font-light max-w-sm mx-auto">
                        Sign in seamlessly using your Google Account to automatically sync orders, save customized temple motifs, and enjoy direct premium care support.
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 py-4 border-y border-outline-variant/15">
                      {/* Google GSI Sign In Button Container */}
                      <div id="google-signin-btn" className="min-h-[44px] flex items-center justify-center"></div>

                      {/* Sandbox simulation alternative button */}
                      <div className="w-full text-center space-y-2 mt-2">
                        <span className="font-sans text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest block">— OR SIMULATE FOR PREVIEW —</span>
                        <button
                          onClick={() => {
                            const mockUserData = {
                              name: "Arjun Varma",
                              email: "arjun.varma@gmail.com",
                              picture: "/images/user_avatar.jpg"
                            };
                            setGoogleUser(mockUserData);
                            localStorage.setItem('sri_padma_google_user', JSON.stringify(mockUserData));
                            triggerToast("Welcome back, Arjun Varma! (Sandbox Mode Sign-In Successful)", "success");
                          }}
                          className="w-full max-w-[280px] bg-primary/5 hover:bg-primary/10 text-primary py-3 px-4 border border-primary/20 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer mx-auto flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-tertiary" />
                          Sign In (Sandbox Mode)
                        </button>
                      </div>
                    </div>

                    {/* Integration Setup Instructions */}
                    <div className="bg-[#f8f9fa] p-6 rounded-2xl border border-outline-variant/15 space-y-3.5">
                      <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-4 h-4 text-tertiary" />
                        How to configure your live Google Sign-In:
                      </h4>
                      <ul className="font-sans text-[11px] text-on-surface-variant leading-relaxed list-disc pl-5 space-y-2.5 font-light">
                        <li>
                          Create a web OAuth client in your Google Cloud Console Credentials page.
                        </li>
                        <li>
                          Add your authorized javascript origin pointing to this preview application's hosted domain.
                        </li>
                        <li>
                          Set the **VITE_GOOGLE_CLIENT_ID** variable in the Secrets & Settings menu in your AI Studio sidebar.
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  /* Owner Portal Login Form */
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-amber-500/5 rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-200">
                        <Settings className="w-8 h-8 text-[#8C6D41]" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-primary">Boutique Owner Portal</h3>
                      <p className="font-sans text-xs text-on-surface-variant font-light max-w-sm mx-auto">
                        Authorize with your credential number and secure password to open the master administrative dashboard.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="font-sans text-[10px] font-bold text-primary uppercase tracking-widest block">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          placeholder="e.g., 9642912613"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-sans text-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-sans text-[10px] font-bold text-primary uppercase tracking-widest block">Security Password</label>
                        <input
                          type="password"
                          required
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          placeholder="Enter secret password"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-sans text-primary"
                        />
                      </div>

                      {ownerError && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                          <span className="font-sans text-[11px] text-red-600 font-medium">{ownerError}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setOwnerError('');
                        if (ownerPhone === '9642912613' && ownerPassword === 'JUNED@9966') {
                          onAdminLoginChange(true);
                          triggerToast("Welcome back, Juned! Owner Session Authorized successfully.", "success");
                          // Scroll to top
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          setOwnerError("Incorrect owner phone number or password. Please try again.");
                        }
                      }}
                      className="w-full bg-gradient-to-r from-primary to-[#001f54] hover:shadow-lg text-white py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer text-center flex items-center justify-center"
                    >
                      Verify & Open Admin Hub
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Exquisite Footer */}
      <footer className="w-full bg-white border-t border-outline-variant/60">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 md:px-12 py-20 max-w-7xl mx-auto">
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-primary tracking-tighter uppercase">SRI PADMA HANDLOOM SAREE STORE</h2>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Preserving the timeless heritage of Gadwal handlooms since 1984. Crafting elegance, one weave at a time.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2.5 flex flex-col">
              <li><a className="font-sans text-xs font-semibold text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider" href="#">The Craft</a></li>
              <li><a className="font-sans text-xs font-semibold text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider" href="#">Sustainability</a></li>
              <li><a className="font-sans text-xs font-semibold text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider" href="#">Shipping Policy</a></li>
              <li><a className="font-sans text-xs font-semibold text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider" href="#">Privacy Policy</a></li>
              <li><button onClick={() => { setCurrentTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-sans text-xs font-semibold text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider text-left">Contact Us</button></li>
            </ul>
          </div>

          {/* Column 3: Collections */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-widest">Collections</h4>
            <ul className="space-y-2.5 flex flex-col">
              <li><button onClick={() => { setSortOrder('bestsellers'); setCurrentTab('shop'); }} className="font-sans text-xs font-semibold text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider text-left">Best Sellers</button></li>
              <li><button onClick={() => { setSelectedOccasion('Festive Collection'); setCurrentTab('shop'); }} className="font-sans text-xs font-semibold text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider text-left">Festival Edit</button></li>
              <li><button onClick={() => { setSelectedOccasion('Bridal Special'); setCurrentTab('shop'); }} className="font-sans text-xs font-semibold text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider text-left">Bridal Trousseau</button></li>
              <li><button onClick={() => { setSelectedCategories(['Pure Silk Gadwal']); setCurrentTab('shop'); }} className="font-sans text-xs font-semibold text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider text-left">Pure Silk Series</button></li>
            </ul>
          </div>

          {/* Column 4: Boutique Info */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-bold text-primary uppercase tracking-widest">Our Boutique</h4>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Main Road, Gadwal,<br/>
              Telangana - 509125<br/>
              India
            </p>
            <div className="space-y-2 pt-2">
              <a 
                href="https://wa.me/918074400697" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-sans text-xs font-bold uppercase tracking-widest transition-colors duration-200"
              >
                <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.375 3.469 2.235 2.237 3.465 5.212 3.463 8.381-.003 6.538-5.328 11.86-11.859 11.86h-.001c-2.01-.002-3.987-.546-5.741-1.579L0 24zm6.59-4.846c1.666.988 3.313 1.477 5.26 1.478 5.433 0 9.85-4.414 9.852-9.843.001-2.63-1.021-5.102-2.88-6.964C16.962 1.963 14.49 .94 11.861.94c-5.434 0-9.851 4.414-9.853 9.842-.001 1.992.521 3.93 1.513 5.643l-.995 3.633 3.731-.979zm11.17-6.861c-.302-.15-.1.15-.352-.075l-1.006-.493c-.252-.125-.433-.188-.614.075-.182.262-.705.88-.865 1.063-.159.183-.32.206-.622.056-.302-.15-1.274-.469-2.426-1.496-.897-.798-1.502-1.784-1.678-2.083-.176-.3-.019-.462.132-.612.135-.134.302-.351.453-.526.151-.176.201-.3.302-.5.101-.2.05-.376-.026-.526-.075-.15-.614-1.477-.841-2.028-.221-.53-.443-.457-.614-.466-.159-.008-.342-.01-.524-.01-.182 0-.478.068-.729.342-.252.274-.959.937-.959 2.285 0 1.348.981 2.646 1.119 2.833.139.188 1.928 2.944 4.671 4.127.653.282 1.162.451 1.56.577.656.208 1.253.179 1.724.11.526-.078 1.614-.661 1.84-1.298.227-.639.227-1.187.159-1.298-.068-.112-.251-.188-.553-.338z"/>
                </svg>
                WhatsApp Us
              </a>
              <a 
                href="tel:+918074400697" 
                className="flex items-center gap-2 text-primary hover:text-primary-container font-sans text-xs font-bold uppercase tracking-widest transition-colors duration-200"
              >
                <Phone className="w-4 h-4 text-tertiary" />
                +91 80744 00697
              </a>
            </div>
          </div>
        </div>

        <div className="relative px-6 md:px-12 py-8 border-t border-outline-variant/40 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[10px] font-bold text-on-surface-variant/70 font-mono">© 2024 Sri Padma Handloom Saree Store. All Rights Reserved.</p>
          
          <div className="flex flex-col items-center gap-1.5 md:absolute md:left-1/2 md:-translate-x-1/2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] tracking-[0.25em] uppercase font-sans font-medium text-[#c5a85c] flex items-center gap-2">
                ✦ <span className="text-primary font-bold">AUTHENEX</span> ✦
              </span>
            </div>
            <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] font-sans">
              Designed by <span className="text-primary font-extrabold hover:text-[#c5a85c] transition-colors duration-300">AUTHENEX</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-sans text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest">SECURE PAYMENTS</span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
          </div>
        </div>
      </footer>

      {/* Quick View Modal */}
      {quickViewItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border border-outline-variant/50 shadow-2xl flex flex-col md:flex-row relative animate-scale-up">
            
            {/* Close trigger */}
            <button 
              onClick={() => setQuickViewItem(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left side: visual */}
            <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto md:h-auto bg-surface-container-low overflow-hidden">
              <img 
                src={quickViewItem.imageUrl} 
                alt={quickViewItem.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right side: descriptors */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[9px] text-tertiary font-bold tracking-widest uppercase bg-tertiary/5 border border-tertiary/10 px-2 py-0.5 rounded-full">
                    {quickViewItem.sku}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-primary mt-2">{quickViewItem.name}</h2>
                  <p className="font-sans text-xs text-on-surface-variant font-semibold mt-1">{quickViewItem.category} Handloom</p>
                </div>

                <div className="text-xl font-extrabold text-primary">
                  ₹{(quickViewItem.price || 0).toLocaleString('en-IN')}
                </div>

                <div className="space-y-2">
                  <h4 className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary">Masterpiece Specs:</h4>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    {quickViewItem.specs || 'This saree features intricate gold zari temple borders intertwined with silk tassels and floral buttis throughout the handloom base, embodying true South Indian heritage.'}
                  </p>
                </div>

                <div className="space-y-1 bg-[#f8f9fa] border border-outline-variant/30 rounded-xl p-3.5 text-[11px] text-on-surface-variant font-medium">
                  <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Pure Mulberry Silk Mark certification</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Interlocked Kuttu joinery</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Premium designer zari weaves</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => { addToCart(quickViewItem); setQuickViewItem(null); }}
                  disabled={quickViewItem.available === 0}
                  className="w-full py-3.5 bg-primary hover:bg-primary-container text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {quickViewItem.available > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}
                </button>
                <div className="text-center">
                  <span className="font-mono text-[10px] text-on-surface-variant/70">
                    Stock Availability: {quickViewItem.available > 0 ? `${quickViewItem.available} pieces remaining` : 'Temporarily Unavailable'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-outline-variant/50 shadow-2xl p-8 relative animate-scale-up space-y-6">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-outline-variant/20 text-primary flex items-center justify-center cursor-pointer shadow-sm transition-colors outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <span className="font-sans text-[10px] font-bold text-tertiary uppercase tracking-wider">SHARE YOUR EXPERIENCE</span>
              <h3 className="font-display text-2xl font-bold text-primary">Write a Review</h3>
              <p className="font-sans text-xs text-on-surface-variant font-light">
                Tell the world about the drape, the texture, and the weave of your masterpiece.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newReviewName.trim() || !newReviewComment.trim()) {
                triggerToast("Please fill out all fields.", "error");
                return;
              }
              const newReviewObj = {
                name: newReviewName.toUpperCase(),
                time: 'Just now',
                rating: newReviewRating,
                comment: newReviewComment
              };
              setReviews(prev => [newReviewObj, ...prev]);
              setShowReviewModal(false);
              triggerToast("Review submitted successfully! Thank you for sharing your story.", "success");
            }} className="space-y-4">
              
              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold text-primary uppercase tracking-wider">Your Name</label>
                <input 
                  type="text" 
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  placeholder="e.g. Anita Sharma"
                  className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold text-primary uppercase tracking-wider">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((starsCount) => (
                    <button
                      key={starsCount}
                      type="button"
                      onClick={() => setNewReviewRating(starsCount)}
                      className="p-1 outline-none text-tertiary cursor-pointer hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-2xl font-bold">
                        {starsCount <= newReviewRating ? 'star' : 'star_border'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold text-primary uppercase tracking-wider">Your Experience</label>
                <textarea 
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="The color is vibrant, and the gold zari is very elegant..."
                  rows={4}
                  className="w-full bg-[#f8f9fa] border border-outline-variant/60 rounded-xl px-4 py-3 font-sans text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-primary resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-container text-white font-sans text-xs font-bold py-3.5 rounded-xl uppercase tracking-widest hover:shadow-md transition-all cursor-pointer border border-primary/20 text-center"
              >
                Submit Review
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-3 pb-safe bg-white/95 backdrop-blur-md border-t border-stone-100/80 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-4">
        <button 
          onClick={() => setCurrentTab('home')}
          className={`group flex flex-col items-center justify-center cursor-pointer transition-all relative py-1 px-3 rounded-2xl ${
            currentTab === 'home' ? 'text-primary scale-105' : 'text-on-surface-variant/70 hover:text-primary'
          }`}
        >
          <Home className={`w-5 h-5 transition-all duration-300 ${currentTab === 'home' ? 'stroke-[2.5px] text-primary' : 'stroke-[1.8px]'}`} />
          <span className={`font-sans text-[9px] mt-1 font-bold uppercase tracking-widest transition-all duration-300 ${
            currentTab === 'home' ? 'text-primary opacity-100' : 'text-on-surface-variant/70'
          }`}>Home</span>
          {currentTab === 'home' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-tertiary rounded-full shadow-[0_0_8px_#d97706]" />
          )}
        </button>
        <button 
          onClick={() => setCurrentTab('shop')}
          className={`group flex flex-col items-center justify-center cursor-pointer transition-all relative py-1 px-3 rounded-2xl ${
            currentTab === 'shop' ? 'text-primary scale-105' : 'text-on-surface-variant/70 hover:text-primary'
          }`}
        >
          <Grid className={`w-5 h-5 transition-all duration-300 ${currentTab === 'shop' ? 'stroke-[2.5px] text-primary' : 'stroke-[1.8px]'}`} />
          <span className={`font-sans text-[9px] mt-1 font-bold uppercase tracking-widest transition-all duration-300 ${
            currentTab === 'shop' ? 'text-primary opacity-100' : 'text-on-surface-variant/70'
          }`}>Shop</span>
          {currentTab === 'shop' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-tertiary rounded-full shadow-[0_0_8px_#d97706]" />
          )}
        </button>
        <button 
          onClick={() => setCurrentTab('cart')}
          className={`group flex flex-col items-center justify-center cursor-pointer transition-all relative py-1 px-3 rounded-2xl ${
            currentTab === 'cart' ? 'text-primary scale-105' : 'text-on-surface-variant/70 hover:text-primary'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 transition-all duration-300 ${currentTab === 'cart' ? 'stroke-[2.5px] text-primary' : 'stroke-[1.8px]'}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`font-sans text-[9px] mt-1 font-bold uppercase tracking-widest transition-all duration-300 ${
            currentTab === 'cart' ? 'text-primary opacity-100' : 'text-on-surface-variant/70'
          }`}>Bag</span>
          {currentTab === 'cart' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-tertiary rounded-full shadow-[0_0_8px_#d97706]" />
          )}
        </button>
        <button 
          onClick={() => setCurrentTab('orders')}
          className={`group flex flex-col items-center justify-center cursor-pointer transition-all relative py-1 px-3 rounded-2xl ${
            currentTab === 'orders' ? 'text-primary scale-105' : 'text-on-surface-variant/70 hover:text-primary'
          }`}
        >
          <Truck className={`w-5 h-5 transition-all duration-300 ${currentTab === 'orders' ? 'stroke-[2.5px] text-primary' : 'stroke-[1.8px]'}`} />
          <span className={`font-sans text-[9px] mt-1 font-bold uppercase tracking-widest transition-all duration-300 ${
            currentTab === 'orders' ? 'text-primary opacity-100' : 'text-on-surface-variant/70'
          }`}>Orders</span>
          {currentTab === 'orders' && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-tertiary rounded-full shadow-[0_0_8px_#d97706]" />
          )}
        </button>
        {isAdminLoggedIn && (
          <button 
            onClick={onEnterAdminMode}
            className="group flex flex-col items-center justify-center cursor-pointer transition-all relative py-1 px-3 rounded-2xl text-on-surface-variant/70 hover:text-tertiary"
          >
            <Settings className="w-5 h-5 transition-all duration-300 stroke-[1.8px] hover:scale-110" />
            <span className="font-sans text-[9px] mt-1 font-bold uppercase tracking-widest text-on-surface-variant/70">Admin</span>
          </button>
        )}
      </nav>

      {/* Floating WhatsApp Button */}
      <a 
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-50 group flex items-center" 
        href={`https://wa.me/918074400697?text=${encodeURIComponent("Namaste! I am visiting your Sri Padma Handloom Saree Store online boutique and would like to inquire about your heritage collections.")}`} 
        target="_blank" 
        rel="noopener noreferrer"
        id="whatsapp_floating_button"
      >
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-25"></div>
        <div className="relative bg-[#25D366] text-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
          <svg className="w-7 h-7 md:w-8 md:h-8 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.747-2.874-2.512-2.96-2.626-.088-.113-.716-.953-.716-1.815 0-.862.454-1.286.614-1.454.16-.168.354-.21.472-.21h.338c.106 0 .248.01.354.248.114.29.39.943.424 1.008.034.066.056.141.012.23-.044.09-.066.147-.132.221-.066.075-.138.168-.198.226-.067.066-.136.138-.058.273.077.135.343.565.735.915.507.452.933.591 1.069.66.136.069.215.057.295-.035.08-.092.34-.396.43-.531.09-.135.18-.113.303-.069.123.045.78.368.915.435.135.067.225.1.259.155.034.055.034.32-.11.725z"></path>
            <path d="M12.036 3c-4.956 0-8.993 4.038-8.993 8.996 0 1.587.413 3.134 1.198 4.492L3 21l4.65-.1.02-.01c1.317.714 2.802 1.091 4.364 1.091 4.957 0 8.994-4.038 8.994-8.996 0-4.958-4.037-8.995-8.994-8.995zm0 16.505c-1.42 0-2.813-.383-4.03-1.108l-.288-.171-2.992.65.661-2.41-.188-.299a7.481 7.481 0 0 1-1.144-3.955c0-4.133 3.363-7.496 7.496-7.496 4.133 0 7.497 3.363 7.497 7.496 0 4.133-3.363 7.497-7.496 7.497z"></path>
          </svg>
          <span className="absolute right-full mr-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
            Chat With Us
          </span>
        </div>
      </a>

    </div>
  );
}
