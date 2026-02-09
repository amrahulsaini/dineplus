'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Clock, CheckCircle, XCircle, Trash2, Plus, Printer, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  table_number: string | null;
  customer_name: string | null;
  order_type: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export default function OrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showAddItems, setShowAddItems] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
        await loadOrders(data.id);
        await loadMenu(data.id);
      }
    };
    init();
    
    // Update current time every second for timer
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      if (restaurant) loadOrders(restaurant.id);
    }, 10000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [params, restaurant, router]);

  const loadOrders = async (restaurantId: string) => {
    const response = await fetch(`/api/orders?restaurantId=${restaurantId}&limit=100`);
    if (response.ok) {
      const data = await response.json();
      // Convert numeric fields to numbers
      const orders = Array.isArray(data) ? data.map((order: any) => ({
        ...order,
        total: Number(order.total) || 0
      })) : [];
      setOrders(orders);
    }
  };

  const loadMenu = async (restaurantId: string) => {
    const response = await fetch(`/api/menu?restaurantId=${restaurantId}`);
    if (response.ok) {
      const data = await response.json();
      const items = Array.isArray(data) ? data.map((item: any) => ({
        ...item,
        base_price: Number(item.base_price) || 0
      })) : [];
      setMenuItems(items);
    }
    
    const catResponse = await fetch(`/api/categories?restaurantId=${restaurantId}`);
    if (catResponse.ok) {
      const catData = await catResponse.json();
      setCategories(Array.isArray(catData) ? catData : []);
    }
  };

  const openAddItemsModal = (order: Order) => {
    setSelectedOrder(order);
    setSelectedItems([]);
    setSearchQuery('');
    setSelectedCategory('all');
    setShowAddItems(true);
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
    if (selectedItems.length === 0 || !selectedOrder) return;

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: selectedItems })
      });

      if (response.ok) {
        alert('Items added successfully!');
        setShowAddItems(false);
        setSelectedItems([]);
        setSelectedOrder(null);
        if (restaurant) await loadOrders(restaurant.id);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add items');
      }
    } catch (error) {
      console.error('Error adding items:', error);
      alert('Error adding items to order');
    }
  };

  const printBill = async (order: Order) => {
    try {
      // Fetch full order details with items
      const response = await fetch(`/api/orders/${order.id}`);
      if (!response.ok) return;
      
      const fullOrder = await response.json();
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      
      const billContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bill - ${order.order_number}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
            @page { size: A4; margin: 0; }
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; }
            .restaurant-name { font-size: 24px; font-weight: bold; }
            .bill-title { font-size: 18px; margin-top: 10px; }
            .info { margin: 5px 0; display: flex; justify-content: space-between; }
            .items { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 10px 0; margin: 15px 0; }
            .item { display: flex; justify-content: space-between; margin: 8px 0; }
            .item-details { flex: 1; }
            .item-name { font-weight: bold; }
            .item-price { text-align: right; min-width: 80px; }
            .totals { border-top: 2px solid #000; padding-top: 10px; }
            .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
            .no-print { text-align: center; margin: 20px 0; }
            .no-print button { padding: 10px 20px; margin: 0 5px; font-size: 16px; cursor: pointer; border-radius: 5px; border: none; }
            .print-btn { background: #f97316; color: white; }
            .download-btn { background: #3b82f6; color: white; }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="print-btn" onclick="window.print()">🖨️ Print</button>
            <button class="download-btn" onclick="window.print()">📥 Download PDF</button>
          </div>
          
          <div class="header">
            <div class="restaurant-name">${restaurant?.name || 'Restaurant'}</div>
            <div>${restaurant?.address || ''}</div>
            <div>${restaurant?.phone || ''}</div>
            <div class="bill-title">TAX INVOICE</div>
          </div>
          
          <div class="info">
            <span>Bill No:</span>
            <span><strong>${order.order_number || order.id.slice(0, 8)}</strong></span>
          </div>
          <div class="info">
            <span>Date:</span>
            <span>${new Date(order.created_at).toLocaleString()}</span>
          </div>
          <div class="info">
            <span>Table:</span>
            <span>${order.table_number ? `Table ${order.table_number}` : 'Takeaway'}</span>
          </div>
          ${fullOrder.customer_name ? `
          <div class="info">
            <span>Customer:</span>
            <span>${fullOrder.customer_name}</span>
          </div>
          ` : ''}
          
          <div class="items">
            ${fullOrder.items?.map((item: any) => `
              <div class="item">
                <div class="item-details">
                  <div class="item-name">${item.menu_item_name}</div>
                  <div style="font-size: 12px; color: #666;">${item.quantity} × ${restaurant?.currency || '₹'} ${Number(item.unit_price).toFixed(2)}</div>
                </div>
                <div class="item-price">${restaurant?.currency || '₹'} ${Number(item.total).toFixed(2)}</div>
              </div>
            `).join('') || ''}
          </div>
          
          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>${restaurant?.currency || '₹'} ${Number(fullOrder.subtotal || 0).toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>Tax:</span>
              <span>${restaurant?.currency || '₹'} ${Number(fullOrder.tax || 0).toFixed(2)}</span>
            </div>
            ${fullOrder.discount > 0 ? `
            <div class="total-line">
              <span>Discount:</span>
              <span>- ${restaurant?.currency || '₹'} ${Number(fullOrder.discount).toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-line grand-total">
              <span>GRAND TOTAL:</span>
              <span>${restaurant?.currency || '₹'} ${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
          
          <div style="margin-top: 15px; text-align: center;">
            <div>Payment: <strong>${fullOrder.payment_method?.toUpperCase() || 'CASH'}</strong></div>
            <div>Status: <strong>${fullOrder.payment_status?.toUpperCase() || 'PENDING'}</strong></div>
          </div>
          
          <div class="footer">
            <div>Thank you for dining with us!</div>
            <div>Visit again soon</div>
            <div style="margin-top: 5px;">Powered by LoopWar</div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(billContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing bill:', error);
      alert('Failed to print bill');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (restaurant) await loadOrders(restaurant.id);
  };

  const deleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to permanently delete order #${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Order deleted successfully');
        if (restaurant) await loadOrders(restaurant.id);
      } else {
        alert('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-purple-100 text-purple-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'delivered': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getElapsedTime = (createdAt: string, status: string, updatedAt: string) => {
    // If order is completed, show time from created to completed (updated_at)
    const endTime = status === 'completed' ? new Date(updatedAt).getTime() : currentTime;
    const elapsed = Math.floor((endTime - new Date(createdAt).getTime()) / 1000);
    
    if (elapsed < 60) {
      return `${elapsed}s`;
    } else if (elapsed < 3600) {
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filter !== 'all' && order.status !== filter) return false;
    
    // Date filters
    if (startDate) {
      const orderDate = new Date(order.created_at).setHours(0, 0, 0, 0);
      const filterStart = new Date(startDate).setHours(0, 0, 0, 0);
      if (orderDate < filterStart) return false;
    }
    
    if (endDate) {
      const orderDate = new Date(order.created_at).setHours(0, 0, 0, 0);
      const filterEnd = new Date(endDate).setHours(0, 0, 0, 0);
      if (orderDate > filterEnd) return false;
    }
    
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders</h1>

        {/* Status Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-semibold capitalize whitespace-nowrap ${
                filter === status
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Filter by Date:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            placeholder="Start Date"
          />
          <span className="text-gray-600">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            placeholder="End Date"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold text-sm"
            >
              Clear Dates
            </button>
          )}
          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredOrders.length} order(s)
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">#{order.order_number || order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-600">
                    {order.table_number ? `Table ${order.table_number}` : order.customer_name || 'Takeaway'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-4 space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-orange-600">{getElapsedTime(order.created_at, order.status, order.updated_at)}</span>
                  <span className="text-gray-400">|</span>
                  <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                </p>
                <p className="font-bold text-lg text-gray-800">
                  {restaurant?.currency} {Number(order.total).toFixed(2)}
                </p>
                <p className="capitalize">
                  Type: <span className="font-semibold">{order.order_type}</span>
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none col-span-2"
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
              <div className="grid grid-cols-4 gap-2">
                <Link
                  href={`/pos/${restaurant?.slug}/admin/orders/${order.id}`}
                  className="flex items-center justify-center gap-1 px-2 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold hover:bg-orange-200 text-xs"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={() => openAddItemsModal(order)}
                  className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                <button
                  onClick={() => printBill(order)}
                  className="flex items-center justify-center gap-1 px-2 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 text-xs"
                  title="Print Bill"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => deleteOrder(order.id, order.order_number || order.id.slice(0, 8))}
                  className="flex items-center justify-center gap-1 px-2 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 text-xs"
                  title="Delete Order"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Add Items Modal */}
      {showAddItems && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowAddItems(false); setSearchQuery(''); setSelectedCategory('all'); }}>
          <div className="bg-white rounded-3xl w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Items to Order</h2>
              <p className="text-sm text-gray-600 mb-4">Order #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                  autoFocus
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {menuItems
                  .filter(item => item.is_active && 
                    (selectedCategory === 'all' || item.category_id === selectedCategory) &&
                    (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase())))
                  .map(item => (
                    <div key={item.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-3 h-3 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} title={item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}></span>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-auto pt-2">
                        <p className="text-sm text-orange-600 font-bold">{restaurant?.currency} {item.base_price.toFixed(2)}</p>
                        <button
                          onClick={() => addItemToOrder(item)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors text-sm"
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              {menuItems.filter(item => item.is_active && 
                (selectedCategory === 'all' || item.category_id === selectedCategory) &&
                (searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
                <p className="text-center text-gray-500 py-8">No items found</p>
              )}
            </div>

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
                  onClick={() => { setShowAddItems(false); setSearchQuery(''); setSelectedCategory('all'); }}
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
