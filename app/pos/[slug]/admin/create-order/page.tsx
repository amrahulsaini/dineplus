'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, ArrowLeft, ShoppingCart, Check, X } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category_id: string;
  category_name: string;
  is_veg: boolean;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Table {
  id: string;
  table_number: string;
  status: string;
}

interface CartItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
  specialInstructions?: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  currency: string;
  tax_rate: number;
}

export default function CreateOrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      const response = await fetch('/api/restaurants/' + resolvedParams.slug);
      
      if (!response.ok) {
        router.push('/pos/login');
        return;
      }
      
      const restaurantData = await response.json();
      setRestaurant(restaurantData);
      
      await Promise.all([
        loadMenuItems(restaurantData.id),
        loadCategories(restaurantData.id),
        loadTables(restaurantData.id)
      ]);
      
      setLoading(false);
    };
    
    init();
  }, [params, router]);

  const loadMenuItems = async (restaurantId: string) => {
    try {
      const response = await fetch('/api/menu?restaurantId=' + restaurantId);
      if (response.ok) {
        const data = await response.json();
        setMenuItems(Array.isArray(data) ? data.filter((item: MenuItem) => item.is_active) : []);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const loadCategories = async (restaurantId: string) => {
    try {
      const response = await fetch('/api/categories?restaurantId=' + restaurantId);
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTables = async (restaurantId: string) => {
    try {
      const response = await fetch('/api/tables?restaurantId=' + restaurantId);
      if (response.ok) {
        const data = await response.json();
        setTables(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.menuItemId === item.id);
    const basePrice = Number(item.base_price);
    if (existing) {
      setCart(cart.map(c => 
        c.menuItemId === item.id 
          ? { ...c, quantity: c.quantity + 1, total: Number(((c.quantity + 1) * c.unitPrice).toFixed(2)) }
          : c
      ));
    } else {
      setCart([...cart, {
        menuItemId: item.id,
        name: item.name,
        unitPrice: basePrice,
        quantity: 1,
        total: basePrice
      }]);
    }
  };

  const updateQuantity = (menuItemId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.menuItemId === menuItemId) {
        const newQty = item.quantity + change;
        if (newQty <= 0) return item;
        return { ...item, quantity: newQty, total: Number((newQty * item.unitPrice).toFixed(2)) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter(item => item.menuItemId !== menuItemId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + Number(item.total), 0);
    const taxRate = restaurant?.tax_rate ? Number(restaurant.tax_rate) : 0;
    const tax = subtotal * taxRate * 0.01;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  function renderTableOptions() {
    const availableTables = [];
    for (let i = 0; i < tables.length; i++) {
      if (tables[i].status === 'available') {
        availableTables.push(
          <option key={tables[i].id} value={tables[i].id}>
            Table {tables[i].table_number}
          </option>
        );
      }
    }
    return availableTables;
  }

  function renderCategoryButtons() {
    const buttons = [];
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const isSelected = selectedCategory === cat.id;
      buttons.push(
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.id)}
          className={isSelected ? 'px-6 py-2 rounded-xl font-semibold whitespace-nowrap bg-gradient-to-r from-orange-500 to-red-600 text-white' : 'px-6 py-2 rounded-xl font-semibold whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200'}
        >
          {cat.name}
        </button>
      );
    }
    return buttons;
  }

  function renderMenuItems() {
    const items = [];
    for (let i = 0; i < filteredItems.length; i++) {
      const item = filteredItems[i];
      items.push(
        <div
          key={item.id}
          onClick={() => addToCart(item)}
          className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-400 cursor-pointer transition-all hover:shadow-lg"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{item.name}</h4>
              {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
              <p className="text-lg font-bold text-orange-600 mt-2">
                {restaurant.currency} {item.base_price}
              </p>
            </div>
            <button className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }
    return items;
  }

  function renderCartItems() {
    const items = [];
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      items.push(
        <div key={item.menuItemId} className="border-2 border-gray-200 rounded-xl p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{item.name}</h4>
              <p className="text-xs text-gray-600">{restaurant.currency} {item.unitPrice} each</p>
            </div>
            <button onClick={() => removeFromCart(item.menuItemId)} className="text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.menuItemId, -1)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold w-8 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.menuItemId, 1)} className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-200">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="font-bold">{restaurant.currency} {Number(item.total).toFixed(2)}</p>
          </div>
        </div>
      );
    }
    return items;
  }

  const handleCreateOrder = async () => {
    if (!restaurant || cart.length === 0) return;
    
    if (orderType === 'dine-in' && !selectedTable) {
      alert('Please select a table');
      return;
    }

    setSaving(true);
    try {
      const { subtotal, tax, total } = calculateTotals();
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          restaurantSlug: restaurant.slug,
          tableId: orderType === 'dine-in' ? selectedTable : null,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          orderType,
          items: cart,
          subtotal,
          tax,
          discount: 0,
          total,
          paymentMethod: 'cash',
          notes
        })
      });

      if (response.ok) {
        alert('Order created successfully!');
        router.push('/pos/' + restaurant.slug + '/admin');
      } else {
        alert('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  let filteredItems = [];
  if (selectedCategory === 'all') {
    filteredItems = menuItems;
  } else {
    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].category_id === selectedCategory) {
        filteredItems.push(menuItems[i]);
      }
    }
  }

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Order Type</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setOrderType('dine-in')}
                  className={orderType === 'dine-in' ? 'py-3 px-4 rounded-xl font-semibold capitalize bg-gradient-to-r from-orange-500 to-red-600 text-white' : 'py-3 px-4 rounded-xl font-semibold capitalize bg-gray-100 text-gray-700 hover:bg-gray-200'}
                >
                  dine-in
                </button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={orderType === 'takeaway' ? 'py-3 px-4 rounded-xl font-semibold capitalize bg-gradient-to-r from-orange-500 to-red-600 text-white' : 'py-3 px-4 rounded-xl font-semibold capitalize bg-gray-100 text-gray-700 hover:bg-gray-200'}
                >
                  takeaway
                </button>
                <button
                  onClick={() => setOrderType('delivery')}
                  className={orderType === 'delivery' ? 'py-3 px-4 rounded-xl font-semibold capitalize bg-gradient-to-r from-orange-500 to-red-600 text-white' : 'py-3 px-4 rounded-xl font-semibold capitalize bg-gray-100 text-gray-700 hover:bg-gray-200'}
                >
                  delivery
                </button>
              </div>

              {orderType === 'dine-in' && (
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Table *</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Choose a table</option>
                    {renderTableOptions()}
                  </select>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={
                    selectedCategory === 'all'
                      ? 'px-6 py-2 rounded-xl font-semibold whitespace-nowrap bg-gradient-to-r from-orange-500 to-red-600 text-white'
                      : 'px-6 py-2 rounded-xl font-semibold whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                >
                  All Items
                </button>
                {renderCategoryButtons()}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Menu Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderMenuItems()}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No items in this category</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {renderCartItems()}

                {cart.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Cart is empty</p>
                  </div>
                )}
              </div>

              {orderType !== 'dine-in' && (
                <div className="mb-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                  />
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{restaurant.currency} {Number(subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({restaurant.tax_rate || 0}%)</span>
                  <span className="font-semibold">{restaurant.currency} {Number(tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t-2 border-gray-200 pt-2">
                  <span>Total</span>
                  <span className="text-orange-600">{restaurant.currency} {Number(total).toFixed(2)}</span>
                </div>
              </div>

              <textarea
                placeholder="Special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-4 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                rows={2}
              />

              <button
                onClick={handleCreateOrder}
                disabled={cart.length === 0 || saving}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
