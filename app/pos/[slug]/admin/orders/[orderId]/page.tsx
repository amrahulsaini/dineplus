'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  variation_name: string | null;
  total: number;
  special_instructions: string | null;
}

interface Order {
  id: string;
  order_number: string;
  table_number: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  order_type: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ slug: string; orderId: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItems, setShowAddItems] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      
      // Check authentication
      const storedAuth = sessionStorage.getItem('admin_auth_' + resolvedParams.slug);
      if (!storedAuth) {
        router.push('/pos/' + resolvedParams.slug + '/admin');
        return;
      }
      
      const response = await fetch(`/api/restaurants/${resolvedParams.slug}`);
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data);
        await loadOrder(resolvedParams.orderId);
        await loadMenu(data.id);
      }
      setLoading(false);
    };
    init();
  }, [params, router]);

  const loadOrder = async (orderId: string) => {
    const response = await fetch(`/api/orders/${orderId}`);
    if (response.ok) {
      const data = await response.json();
      // Convert numeric fields to numbers
      if (data.items && Array.isArray(data.items)) {
        data.items = data.items.map((item: any) => ({
          ...item,
          unit_price: Number(item.unit_price) || 0,
          total: Number(item.total) || 0,
          quantity: Number(item.quantity) || 0
        }));
      }
      data.subtotal = Number(data.subtotal) || 0;
      data.tax = Number(data.tax) || 0;
      data.discount = Number(data.discount) || 0;
      data.total = Number(data.total) || 0;
      setOrder(data);
    }
  };

  const loadMenu = async (restaurantId: string) => {
    const response = await fetch(`/api/menu?restaurantId=${restaurantId}`);
    if (response.ok) {
      const data = await response.json();
      // Convert base_price to number for consistent handling
      const items = Array.isArray(data) ? data.map((item: any) => ({
        ...item,
        base_price: Number(item.base_price) || 0
      })) : [];
      setMenuItems(items);
    }
  };

  const addItemToOrder = (item: any) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const updateOrderWithNewItems = async () => {
    if (selectedItems.length === 0 || !order) return;

    try {
      const response = await fetch(`/api/orders/${order.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: selectedItems })
      });

      if (response.ok) {
        alert('Items added successfully!');
        setShowAddItems(false);
        setSelectedItems([]);
        await loadOrder(order.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add items');
      }
    } catch (error) {
      console.error('Error adding items:', error);
      alert('Error adding items to order');
    }
  };

  const updateStatus = async (status: string) => {
    if (!order) return;
    await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await loadOrder(order.id);
  };

  const updatePaymentStatus = async (paymentStatus: string) => {
    if (!order) return;
    await fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus })
    });
    await loadOrder(order.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-purple-100 text-purple-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'delivered': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/pos/${restaurant?.slug}/admin/orders`} className="p-2 hover:bg-white/20 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Order #{order.order_number || order.id.slice(0, 8)}</h1>
              <p className="text-orange-100">{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Table:</span>
                <span className="font-semibold">{order.table_number ? `Table ${order.table_number}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold capitalize">{order.order_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-semibold uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{order.customer_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold">{order.customer_phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{order.customer_email || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <button
                onClick={() => setShowAddItems(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Items
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-3">
                <div>
                  <p className="font-semibold text-gray-900">{item.menu_item_name}</p>
                  {item.variation_name && (
                    <p className="text-sm text-gray-600">Variation: {item.variation_name}</p>
                  )}
                  {item.special_instructions && (
                    <p className="text-sm text-gray-500 italic">{item.special_instructions}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {item.quantity} × {restaurant?.currency} {item.unit_price.toFixed(2)}
                  </p>
                  <p className="text-sm text-orange-600 font-bold">
                    {restaurant?.currency} {item.total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t-2 border-gray-200 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{restaurant?.currency} {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax:</span>
              <span>{restaurant?.currency} {order.tax.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount:</span>
                <span>- {restaurant?.currency} {order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-gray-900">
              <span>Total:</span>
              <span>{restaurant?.currency} {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Update Status</h3>
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Payment Status</h3>
            <select
              value={order.payment_status}
              onChange={(e) => updatePaymentStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Items Modal */}
      {showAddItems && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowAddItems(false); setSearchQuery(''); }}>
          <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Items to Order</h2>
              
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                autoFocus
              />
            </div>
            
            {/* Scrollable Menu Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {menuItems
                .filter(item => item.is_available && 
                  (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase())))
                .map(item => (
                  <div key={item.id} className="flex justify-between items-center border border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-orange-600 font-bold">{restaurant?.currency} {item.base_price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => addItemToOrder(item)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
                    >
                      Add +
                    </button>
                  </div>
                ))}
              {menuItems.filter(item => item.is_available && 
                (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
                <p className="text-center text-gray-500 py-8">No items found</p>
              )}
            </div>

            {/* Footer with Selected Items and Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              {selectedItems.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2">Selected Items ({selectedItems.length}):</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <span className="font-medium">{item.name} × {item.quantity}</span>
                        <span className="font-bold text-orange-600">{restaurant?.currency} {(item.base_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAddItems(false); setSearchQuery(''); }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={updateOrderWithNewItems}
                  disabled={selectedItems.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-xl font-bold disabled:opacity-50 transition-all"
                >
                  Add to Order ({selectedItems.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
