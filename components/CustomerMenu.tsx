'use client';

import { useEffect, useState } from 'react';
import { MenuItem, Category, CartItem, Order, OrderType, PaymentMethod } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  LogOut, 
  UtensilsCrossed,
  Leaf,
  Star,
  X,
  CheckCircle
} from 'lucide-react';

export default function CustomerMenu() {
  const { user, logout } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const items = storage.get<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS) || [];
    const cats = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
    const savedCart = storage.get<CartItem[]>(STORAGE_KEYS.CART) || [];
    setMenuItems(items.filter((i) => i.isAvailable));
    setCategories(cats.filter((c) => c.isActive));
    setCart(savedCart);
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((ci) => ci.menuItem.id === item.id);
    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map((ci) =>
        ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
      );
    } else {
      newCart = [...cart, { menuItem: item, quantity: 1 }];
    }

    setCart(newCart);
    storage.set(STORAGE_KEYS.CART, newCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const newCart = cart.map((ci) =>
      ci.menuItem.id === itemId ? { ...ci, quantity } : ci
    );
    setCart(newCart);
    storage.set(STORAGE_KEYS.CART, newCart);
  };

  const removeFromCart = (itemId: string) => {
    const newCart = cart.filter((ci) => ci.menuItem.id !== itemId);
    setCart(newCart);
    storage.set(STORAGE_KEYS.CART, newCart);
  };

  const clearCart = () => {
    setCart([]);
    storage.set(STORAGE_KEYS.CART, []);
  };

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.categoryId === selectedCategory);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gray-100 sticky top-0 z-40 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg p-2">
                <Image src="/favicon.svg" alt="Loopwar" width={24} height={24} />
              </div>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Loopwar</span>
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block font-medium">
                Welcome, <strong className="text-gray-900">{user?.name}</strong>
              </span>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl transition-all duration-300 font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" /> Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce-slow">
                    {cartItemCount}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-2xl transition-all duration-300 flex items-center gap-2 font-semibold hover:shadow-lg transform hover:scale-105"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all font-medium ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-400 to-purple-500 h-48 flex items-center justify-center text-7xl">
                  {item.isVeg ? <Leaf className="w-20 h-20 text-white" /> : <UtensilsCrossed className="w-20 h-20 text-white" />}
                </div>
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      item.isVeg ? 'bg-green-500' : 'bg-red-500'
                    } text-white shadow-lg`}
                  >
                    <Leaf className="w-3 h-3" />
                    {item.isVeg ? 'VEG' : 'NON-VEG'}
                  </span>
                </div>
                {item.tags.includes('popular') && (
                  <div className="absolute top-2 right-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      Popular
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-bold text-xl">
                    ₹{item.price}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No items available</p>
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <CartSidebar
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          total={cartTotal}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          cart={cart}
          user={user!}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            clearCart();
            setIsCheckoutOpen(false);
            alert('Order placed successfully! ✅');
          }}
        />
      )}
    </div>
  );
}

function CartSidebar({
  cart,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  total,
}: {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
  total: number;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Cart</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{item.menuItem.name}</h3>
                    <button
                      onClick={() => onRemove(item.menuItem.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">₹{item.menuItem.price}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full font-bold"
                      >
                        -
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right mt-2">
                    <span className="font-bold text-orange-600">
                      ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-orange-600">₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-lg transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CheckoutModal({
  cart,
  user,
  onClose,
  onSuccess,
}: {
  cart: CartItem[];
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    const order: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      items: cart,
      subtotal,
      tax,
      discount: 0,
      total,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      orderType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: notes || undefined,
    };

    const orders = storage.get<Order[]>(STORAGE_KEYS.ORDERS) || [];
    orders.push(order);
    storage.set(STORAGE_KEYS.ORDERS, orders);

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Checkout</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl">
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Type */}
          <div>
            <label className="block font-semibold mb-2">Order Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(['dine-in', 'takeaway', 'delivery'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-4 py-3 rounded-lg font-semibold capitalize transition-colors ${
                    orderType === type
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {orderType === 'delivery' && (
            <div>
              <label className="block font-semibold mb-2">Delivery Address</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                rows={3}
                placeholder="Enter delivery address"
                required
              />
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block font-semibold mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {(['cash', 'card', 'upi', 'online'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-4 py-3 rounded-lg font-semibold capitalize transition-colors ${
                    paymentMethod === method
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block font-semibold mb-2">Special Instructions (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              rows={2}
              placeholder="Any special requests?"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-orange-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-lg transition-colors"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
