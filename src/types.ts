export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  status: 'IN STOCK' | 'LOW STOCK' | 'PRE-ORDER' | 'OUT OF STOCK';
  available: number;
  specs: string;
  imageUrl: string;
  threshold: number;
  price: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: 'add' | 'adjustment' | 'shipment';
  message: string;
  user: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  initials: string;
  date: string;
  price: string;
  status: 'Processing' | 'Shipped' | 'Pending' | 'Delivered';
}

export type AdjustmentType = 'RESTOCK (+)' | 'DAMAGE (-)' | 'RETURN (+)' | 'SALE (-)';
