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
  capacity?: number;
  location?: string;
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
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'wallet'>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      
      // Check authentication
      const storedAuth = sessionStorage.getItem('admin_auth_' + resolvedParams.slug);
      if (!storedAuth) {
        router.push('/pos/' + resolvedParams.slug + '/admin');
        return;
      }
      
      setAuthenticated(true);
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-500 text-green-800';
      case 'occupied': return 'bg-red-100 border-red-500 text-red-800';
      case 'reserved': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getSelectedTableName = () => {
    const table = tables.find(t => t.id === selectedTable);
    return table ? `Table ${table.table_number}` : 'Select Table';
  };

  const handleTableSelect = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    // Prevent selecting occupied tables
    if (table && table.status === 'occupied') {
      alert('This table is currently occupied with an active order. Please choose another table or wait until the order is completed.');
      return;
    }
    setSelectedTable(tableId);
    setShowTableModal(false);
  };

  const handleTableStatusChange = async (tableId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent table selection when clicking status button
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update local state
        setTables(tables.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
      }
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

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
                {restaurant?.currency} {item.base_price}
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
              <p className="text-xs text-gray-600">{restaurant?.currency} {item.unitPrice} each</p>
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
            <p className="font-bold">{restaurant?.currency} {Number(item.total).toFixed(2)}</p>
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
          customerEmail: customerEmail || null,
          orderType,
          items: cart,
          subtotal,
          tax,
          discount: 0,
          total,
          paymentMethod,
          notes
        })
      });

      if (response.ok) {
        alert('Order created successfully!');
        router.push('/pos/' + restaurant.slug + '/admin');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect in useEffect
  }

  let filteredItems: MenuItem[] = [];
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
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
                  <button
                    type="button"
                    onClick={() => setShowTableModal(true)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none hover:bg-gray-50 text-left flex justify-between items-center"
                  >
                    <span className={selectedTable ? 'text-gray-900' : 'text-gray-500'}>{getSelectedTableName()}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {tables.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">No tables found. Please add tables first.</p>
                  )}
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
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <h3 className="font-bold text-lg mb-4 sticky top-0 bg-white pb-2 border-b-2 border-gray-100">Order Summary</h3>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-gray-100">
              {renderCartItems()}

              {cart.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Cart is empty</p>
                </div>
              )}
            </div>

            {/* Customer Details - Always show */}
            <div className="mb-4">
              <h4 className="font-bold text-sm text-gray-700 mb-3">Customer Details (Optional)</h4>
              <div className="space-y-3">
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
                <input
                  type="email"
                  placeholder="Email Address"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <h4 className="font-bold text-sm text-gray-700 mb-3">Payment Method</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={paymentMethod === 'cash' ? 'py-2 px-3 rounded-lg font-semibold text-sm bg-orange-500 text-white' : 'py-2 px-3 rounded-lg font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200'}
                >
                  💵 Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={paymentMethod === 'card' ? 'py-2 px-3 rounded-lg font-semibold text-sm bg-orange-500 text-white' : 'py-2 px-3 rounded-lg font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200'}
                >
                  💳 Card
                </button>
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={paymentMethod === 'upi' ? 'py-2 px-3 rounded-lg font-semibold text-sm bg-orange-500 text-white' : 'py-2 px-3 rounded-lg font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200'}
                >
                  📱 UPI
                </button>
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={paymentMethod === 'wallet' ? 'py-2 px-3 rounded-lg font-semibold text-sm bg-orange-500 text-white' : 'py-2 px-3 rounded-lg font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200'}
                >
                  👛 Wallet
                </button>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{restaurant?.currency} {Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({restaurant?.tax_rate || 0}%)</span>
                <span className="font-semibold">{restaurant?.currency} {Number(tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t-2 border-gray-200 pt-2">
                <span>Total</span>
                <span className="text-orange-600">{restaurant?.currency} {Number(total).toFixed(2)}</span>
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

      {/* Table Selection Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Select Table</h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {tables.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No tables found</p>
                  <p className="text-gray-400">Please add tables to your restaurant first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {tables.map((table) => {
                    const isOccupied = table.status === 'occupied';
                    const isDisabled = isOccupied;
                    
                    return (
                      <div key={table.id} className="relative">
                        <button
                          onClick={() => handleTableSelect(table.id)}
                          disabled={isDisabled}
                          className={`w-full p-6 rounded-xl border-3 transition-all ${
                            isDisabled 
                              ? 'cursor-not-allowed opacity-60'
                              : 'hover:shadow-lg cursor-pointer'
                          } ${
                            selectedTable === table.id
                              ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                              : getStatusColor(table.status)
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-2">{table.table_number}</div>
                            <div className="text-sm font-semibold capitalize mb-2">
                              {table.status}
                              {isOccupied && <div className="text-xs mt-1">(Active Order)</div>}
                            </div>
                            {table.capacity && (
                              <div className="text-xs text-gray-600 mt-1">{table.capacity} seats</div>
                            )}
                          </div>
                        </button>
                        {/* Quick status change buttons - only for non-occupied tables or manual override */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                          <button
                            onClick={(e) => handleTableStatusChange(table.id, 'available', e)}
                            className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 shadow-md"
                            title="Set Available"
                          />
                          <button
                            onClick={(e) => handleTableStatusChange(table.id, 'occupied', e)}
                            className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 shadow-md"
                            title="Set Occupied"
                          />
                          <button
                            onClick={(e) => handleTableStatusChange(table.id, 'reserved', e)}
                            className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-600 shadow-md"
                            title="Set Reserved"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowTableModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
