import { InventoryItem, ActivityLogEntry, Order } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Midnight Royal Zari Saree',
    category: 'Silk Gadwal',
    sku: 'GAD-2024-001',
    status: 'IN STOCK',
    available: 42,
    specs: 'Pure Silk • 100 Count',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    threshold: 10,
    price: 14500
  },
  {
    id: '2',
    name: 'Classic Heritage Ivory',
    category: 'Heritage Collection',
    sku: 'GAD-2024-002',
    status: 'LOW STOCK',
    available: 3,
    specs: 'Silk-Cotton Blend',
    imageUrl: 'https://images.unsplash.com/photo-1544207240-8b1025eb7a6c?auto=format&fit=crop&w=800&q=80',
    threshold: 5,
    price: 22800
  },
  {
    id: '3',
    name: 'Emerald Peacock Bloom',
    category: 'Silk Gadwal',
    sku: 'GAD-2024-003',
    status: 'OUT OF STOCK',
    available: 0,
    specs: 'Pure Handloom Silk',
    imageUrl: 'https://images.unsplash.com/photo-1590156221122-c748c78f2a41?auto=format&fit=crop&w=800&q=80',
    threshold: 8,
    price: 18200
  },
  {
    id: '4',
    name: 'Modern Silver Monochrome',
    category: 'Sico Gadwal',
    sku: 'GAD-2024-004',
    status: 'IN STOCK',
    available: 28,
    specs: 'Minimalist Silver Border',
    imageUrl: 'https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?auto=format&fit=crop&w=800&q=80',
    threshold: 5,
    price: 9900
  }
];

export const INITIAL_LOGS: ActivityLogEntry[] = [
  {
    id: 'l1',
    timestamp: 'Today, 14:20 PM',
    type: 'add',
    message: 'Stock Added: +12 units of "Royal Peacock Saree" by Admin_Sita',
    user: 'Admin_Sita'
  },
  {
    id: 'l2',
    timestamp: 'Yesterday, 18:05 PM',
    type: 'adjustment',
    message: 'Adjustment: Stock correction for "Vintage Borders" (-2 units damaged)',
    user: 'System'
  },
  {
    id: 'l3',
    timestamp: '22 Oct, 11:30 AM',
    type: 'shipment',
    message: 'Shipment: Batch #204 dispatched for International Fulfillment',
    user: 'Logistics'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o1',
    orderId: '#RG-2024-9102',
    customerName: 'Amrita Singh',
    initials: 'AS',
    date: 'Oct 24, 2024',
    price: '₹45,000',
    status: 'Processing'
  },
  {
    id: 'o2',
    orderId: '#RG-2024-9103',
    customerName: 'Rahul Verma',
    initials: 'RV',
    date: 'Oct 23, 2024',
    price: '₹12,500',
    status: 'Shipped'
  },
  {
    id: 'o3',
    orderId: '#RG-2024-9104',
    customerName: 'Priya Kapoor',
    initials: 'PK',
    date: 'Oct 22, 2024',
    price: '₹84,000',
    status: 'Pending'
  },
  {
    id: 'o4',
    orderId: '#RG-2024-9105',
    customerName: 'Mohan Kumar',
    initials: 'MK',
    date: 'Oct 22, 2024',
    price: '₹28,900',
    status: 'Delivered'
  }
];

