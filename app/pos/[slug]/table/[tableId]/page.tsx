'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';

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

export default function CustomerMenuPage({ params }: { params: Promise<{ slug: string; tableId: string }> }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [table, setTable] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

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
      
      setLoading(false);
    };
    init();
  }, [params]);

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
      setTimeout(() => setOrderPlaced(false), 5000);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category_name]) acc[item.category_name] = [];
    acc[item.category_name].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">{restaurant?.name}</h1>
          <p className="text-orange-100">Table {table?.table_number}</p>
        </div>
      </div>

      {/* Order Success Message */}
      {orderPlaced && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3">
          <Check className="w-6 h-6" />
          <span className="font-bold text-lg">Order Placed Successfully!</span>
        </div>
      )}

      {/* Menu */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sticky top-20 bg-gray-50 py-2 z-30">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.filter(item => item.is_available).map(item => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow">
                  <div className="flex gap-4">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                          {item.is_vegetarian && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Veg</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-orange-600">
                          {restaurant?.currency} {item.base_price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-sm"
                        >
                          Add +
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-50">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:shadow-xl font-bold text-lg"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <span>{cartCount} items</span>
              </div>
              <span>View Cart • {restaurant?.currency} {cartTotal.toFixed(2)}</span>
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
