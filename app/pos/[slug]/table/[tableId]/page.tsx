'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Check, Clock, ChefHat, CheckCircle, Package, TrendingUp, Star, Award, Gift } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image: string;
  category_name: string;
  is_vegetarian: boolean;
  is_available: boolean;
}

interface CartItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  items: any[];
}

export default function CustomerMenuPage({ params }: { params: Promise<{ slug: string; tableId: string }> }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [table, setTable] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [showOrders, setShowOrders] = useState(false);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      
      // Load restaurant
      const restResponse = await fetch(`/api/restaurants/${resolvedParams.slug}`);
      if (restResponse.ok) {
        const restData = await restResponse.json();
        setRestaurant(restData);
        
        // Load menu
        const menuResponse = await fetch(`/api/menu?restaurantId=${restData.id}`);
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          setMenuItems(Array.isArray(menuData) ? menuData : []);
        }
      }
      
      // Load table info
      const tableResponse = await fetch(`/api/tables/${resolvedParams.tableId}`);
      if (tableResponse.ok) {
        const tableData = await tableResponse.json();
        setTable(tableData);
      }
      
      // Load active orders for this table
      loadActiveOrders(resolvedParams.tableId);
    };
    init();
    
    // Poll for order updates every 10 seconds
    const interval = setInterval(() => {
      params.then(p => loadActiveOrders(p.tableId));
    }, 10000);
    
    return () => clearInterval(interval);
  }, [params]);

  const loadActiveOrders = async (tableId: string) => {
    try {
      const response = await fetch(`/api/orders?tableId=${tableId}&activeOnly=true`);
      if (response.ok) {
        const orders = await response.json();
        setActiveOrders(Array.isArray(orders) ? orders : []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(c => c.menuItemId === item.id);
    if (existingItem) {
      setCart(cart.map(c => 
        c.menuItemId === item.id 
          ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.unitPrice }
          : c
      ));
    } else {
      setCart([...cart, {
        menuItemId: item.id,
        name: item.name,
        unitPrice: item.base_price,
        quantity: 1,
        total: item.base_price
      }]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    const item = cart.find(c => c.menuItemId === menuItemId);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      setCart(cart.filter(c => c.menuItemId !== menuItemId));
    } else {
      setCart(cart.map(c => 
        c.menuItemId === menuItemId
          ? { ...c, quantity: newQuantity, total: newQuantity * c.unitPrice }
          : c
      ));
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * ((restaurant?.tax_rate || 0) / 100);
    const total = subtotal + tax;

    const orderData = {
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug,
      tableId: table.id,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      orderType: 'dine-in',
      items: cart,
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod: 'cash',
      notes: null
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      setOrderPlaced(true);
      setCart([]);
      setShowCheckout(false);
      // Reload active orders
      params.then(p => loadActiveOrders(p.tableId));
      setTimeout(() => setOrderPlaced(false), 5000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Clock className="w-5 h-5" />;
      case 'preparing': return <ChefHat className="w-5 h-5" />;
      case 'ready': return <CheckCircle className="w-5 h-5" />;
      case 'delivered': return <Package className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Being Prepared';
      case 'ready': return 'Ready to Serve';
      case 'delivered': return 'Served';
      default: return status;
    }
  };

  const getElapsedTime = (createdAt: string, updatedAt: string, status: string) => {
    const start = new Date(createdAt);
    const end = status === 'delivered' ? new Date(updatedAt) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category_name]) acc[item.category_name] = [];
    acc[item.category_name].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white shadow-2xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{restaurant?.name}</h1>
              <div className="flex items-center gap-2 text-orange-100">
                <Package className="w-4 h-4" />
                <span>Table {table?.table_number}</span>
              </div>
            </div>
            {activeOrders.length > 0 && (
              <button
                onClick={() => setShowOrders(!showOrders)}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{activeOrders.length} Active</span>
              </button>
            )}
          </div>
          
          {/* Welcome Message */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-300" />
              <div>
                <p className="font-semibold">Welcome! 👋</p>
                <p className="text-sm text-orange-100">Scan, order, and enjoy delicious food at your table</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Success Message */}
      {orderPlaced && (
        <div className="fixed top-32 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <Check className="w-6 h-6" />
          <div>
            <p className="font-bold text-lg">Order Placed Successfully!</p>
            <p className="text-sm text-green-100">Your order is being prepared</p>
          </div>
        </div>
      )}

      {/* Active Orders Tracking */}
      {showOrders && activeOrders.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            Your Active Orders
          </h2>
          <div className="space-y-4">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Order #{order.order_number || order.id.slice(0, 8)}</p>
                    <p className="text-2xl font-bold text-gray-900">{restaurant?.currency} {Number(order.total).toFixed(2)}</p>
                  </div>
                  <div className={`${getStatusColor(order.status)} text-white px-4 py-2 rounded-full flex items-center gap-2`}>
                    {getStatusIcon(order.status)}
                    <span className="font-semibold">{getStatusText(order.status)}</span>
                  </div>
                </div>

                {/* Order Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-orange-600">
                      <Clock className="w-4 h-4 inline" /> {getElapsedTime(order.created_at, order.updated_at, order.status)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className={`flex-1 h-2 rounded-full ${order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-2 rounded-full ${order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered' ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-2 rounded-full ${order.status === 'ready' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-2 rounded-full ${order.status === 'delivered' ? 'bg-gray-500' : 'bg-gray-200'}`}></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-600">
                    <span>Confirmed</span>
                    <span>Preparing</span>
                    <span>Ready</span>
                    <span>Served</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Items:</p>
                  {order.items && order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}× {item.menu_item_name}</span>
                      <span className="text-gray-900 font-semibold">{restaurant?.currency} {Number(item.total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Offers Banner */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-3">
              <Gift className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-white">
              <p className="font-bold text-xl mb-1">Today's Special!</p>
              <p className="text-sm text-white/90">Check out our chef's recommendations and best sellers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-3 mb-4 sticky top-48 bg-gradient-to-b from-orange-50 to-white py-3 z-30">
              <Award className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-orange-300 to-transparent rounded"></div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {items.filter(item => item.is_available).map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-200">
                  <div className="flex gap-4 p-4">
                    {item.image && (
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-28 h-28 object-cover rounded-xl" />
                        {item.is_vegetarian && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                            VEG
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 flex flex-col">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {restaurant?.currency} {item.base_price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-xl font-bold text-sm flex items-center gap-2 transition-all transform hover:scale-105"
                        >
                          <Plus className="w-4 h-4" />
                          ADD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-4 px-4 z-50 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full flex items-center justify-between px-6 py-5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white rounded-2xl hover:shadow-2xl font-bold text-lg transform hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-2">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-orange-100">View Cart</p>
                  <p className="text-lg font-bold">{cartCount} items</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{restaurant?.currency} {cartTotal.toFixed(2)}</span>
                <div className="bg-white/20 rounded-full p-1">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowCheckout(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl md:mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Order</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{restaurant?.currency} {item.unitPrice.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-lg ml-3 w-20 text-right">
                        {restaurant?.currency} {item.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Details */}
              <div className="mb-6 space-y-3">
                <h3 className="font-bold text-gray-900">Your Details (Optional)</h3>
                <input
                  type="text"
                  placeholder="Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{restaurant?.currency} {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({restaurant?.tax_rate || 0}%)</span>
                  <span>{restaurant?.currency} {(cartTotal * ((restaurant?.tax_rate || 0) / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{restaurant?.currency} {(cartTotal * (1 + (restaurant?.tax_rate || 0) / 100)).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={placeOrder}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-xl font-bold"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
