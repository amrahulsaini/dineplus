'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Check, X, Leaf, Search, ChevronDown } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image: string;
  category_name: string;
  is_veg: boolean;
  is_active: boolean;
}

interface CartItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export default function CustomerMenuPage({ params }: { params: Promise<{ restaurant: string; table: string }> }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [table, setTable] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      
      // Get table number from URL
      const tableNumber = resolvedParams.table.toUpperCase();
      const restaurantSlug = resolvedParams.restaurant;
      
      // Load restaurant by slug
      const restResponse = await fetch(`/api/restaurants/${restaurantSlug}`);
      if (restResponse.ok) {
        const restData = await restResponse.json();
        setRestaurant(restData);
        
        // Load menu
        const menuResponse = await fetch(`/api/menu?restaurantId=${restData.id}`);
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          console.log('Menu data loaded:', menuData); // Debug log
          const items = Array.isArray(menuData) ? menuData.filter((item: MenuItem) => item.is_active) : [];
          console.log('Filtered items:', items); // Debug log
          setMenuItems(items);
          
          // Extract unique categories
          const cats = [...new Set(items.map((item: MenuItem) => item.category_name))];
          console.log('Categories:', cats); // Debug log
          setCategories(cats);
        }
        
        // Find table by table number
        const tablesResponse = await fetch(`/api/tables?restaurantId=${restData.id}`);
        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          const foundTable = tablesData.find((t: any) => t.table_number.toLowerCase() === tableNumber.toLowerCase());
          if (foundTable) {
            setTable(foundTable);
          }
        }
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
    if (cart.length === 0 || !restaurant || !table) return;

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * ((restaurant?.tax_rate || 0) / 100);
    const total = subtotal + tax;

    const orderData = {
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug,
      tableId: table.id,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      orderType: 'dine-in',
      items: cart,
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod: 'cash',
      notes: null
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setOrderPlaced(true);
        setCart([]);
        setShowCheckout(false);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setTimeout(() => setOrderPlaced(false), 5000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_name === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedMenu = filteredItems.reduce((acc, item) => {
    if (!acc[item.category_name]) acc[item.category_name] = [];
    acc[item.category_name].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading Menu...</p>
        </div>
      </div>
    );
  }

  if (!restaurant || !table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Table Not Found</h1>
          <p className="text-gray-600">Please scan a valid QR code</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-2xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{restaurant?.name}</h1>
              <p className="text-orange-100 flex items-center gap-2 mt-1">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  Table {table?.table_number}
                </span>
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setShowCheckout(true)}
                className="relative bg-white text-orange-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Success Message */}
      {orderPlaced && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-bounce">
          <Check className="w-6 h-6" />
          <div>
            <p className="font-bold text-lg">Order Placed!</p>
            <p className="text-sm text-green-100">Your order is being prepared</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto px-4 py-4 sticky top-24 bg-gradient-to-br from-orange-50 to-red-50 z-30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none bg-white shadow-lg"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto px-4 pb-4">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full flex items-center justify-between bg-white rounded-2xl px-6 py-3 shadow-lg border-2 border-orange-200"
        >
          <span className="font-bold text-gray-900">
            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
        </button>
        
        {showCategories && (
          <div className="mt-2 bg-white rounded-2xl shadow-lg border-2 border-orange-200 overflow-hidden">
            <button
              onClick={() => { setSelectedCategory('all'); setShowCategories(false); }}
              className={`w-full px-6 py-3 text-left font-semibold ${selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50'}`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setShowCategories(false); }}
                className={`w-full px-6 py-3 text-left font-semibold border-t border-gray-100 ${selectedCategory === cat ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="max-w-6xl mx-auto px-4 pb-6">
        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl">
                {category}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => {
                const inCart = cart.find(c => c.menuItemId === item.id);
                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border-2 border-orange-100">
                    {item.image && (
                      <div className="relative h-48 bg-gray-200">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                        {item.is_veg && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                            <Leaf className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                          {item.is_veg && !item.image && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                              <Leaf className="w-3 h-3" /> Veg
                            </span>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-orange-600">
                          {restaurant?.currency} {item.base_price.toFixed(2)}
                        </span>
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-orange-100 rounded-lg px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-100 font-bold text-orange-600"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-orange-600 w-8 text-center">{inCart.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg font-semibold text-sm flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
            <p className="text-gray-500 text-lg">No items found</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-orange-500 p-4 shadow-2xl z-50">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:shadow-xl font-bold text-lg"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              </div>
              <span>View Cart • {restaurant?.currency} {cartTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setShowCheckout(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Order</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-white/20 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.name}</p>
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
                      <span className="font-bold text-lg ml-3 w-24 text-right text-orange-600">
                        {restaurant?.currency} {item.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Details */}
              <div className="mb-6 bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm">Optional</span>
                  Your Details
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{restaurant?.currency} {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({restaurant?.tax_rate || 0}%)</span>
                  <span className="font-semibold">{restaurant?.currency} {(cartTotal * ((restaurant?.tax_rate || 0) / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-900 border-t-2 border-gray-200 pt-2">
                  <span>Total</span>
                  <span className="text-orange-600">{restaurant?.currency} {(cartTotal * (1 + (restaurant?.tax_rate || 0) / 100)).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={placeOrder}
                  disabled={cart.length === 0}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
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
