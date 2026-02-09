'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(Date.now());

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
      }
      setLoading(false);
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

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders</h1>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Link
                  href={`/pos/${restaurant?.slug}/admin/orders/${order.id}`}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold hover:bg-orange-200"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={() => deleteOrder(order.id, order.order_number || order.id.slice(0, 8))}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200"
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
    </div>
  );
}
