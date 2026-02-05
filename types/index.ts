// Core Types for Restaurant Management System

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  isAvailable: boolean;
  isVeg: boolean;
  preparationTime: number; // in minutes
  discount?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress?: string;
  orderType: OrderType;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out-for-delivery' 
  | 'delivered' 
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
}

export interface Inventory {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  lastRestocked: string;
}

export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: { menuItem: MenuItem; count: number }[];
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  taxRate: number; // percentage
  currency: string;
}

export interface CookieConsent {
  accepted: boolean;
  timestamp: string;
  expiresAt: string;
}
