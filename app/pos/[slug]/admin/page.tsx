'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Package, Plus, Eye } from 'lucide-react';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  currency: string;
  tax_rate: number;
}

interface Order {
  id: string;
  table_id: string | null;
  customer_name: string | null;
  order_type: string;
  status: string;
  total: number;
  created_at: string;
  payment_status: string;
}

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function AdminDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const resolvedParams = await params;
      const storedAuth = sessionStorage.getItem(`admin_auth_${resolvedParams.slug}`);
      
      if (storedAuth) {
        await loadRestaurantData(resolvedParams.slug);
        setAuthenticated(true);
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [params]);

  const handleLogin = async () => {
    try {
      const resolvedParams = await params;
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          slug: resolvedParams.slug
        })
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem(`admin_auth_${resolvedParams.slug}`, 'true');
        setAuthenticated(true);
        await loadRestaurantData(resolvedParams.slug);
      } else {
        setAuthError('Invalid credentials');
      }
    } catch (error) {
      setAuthError('Login failed');
    }
  };

  const loadRestaurantData = async (slug: string) => {
    try {
      const response = await fetch(`/api/restaurants/${slug}`);
      if (!response.ok) {
        router.push('/pos/login');
        return;
      }

      const restaurantData = await response.json();
      setRestaurant(restaurantData);
      
      await Promise.all([
        loadOrders(restaurantData.id),
        loadStats(restaurantData.id)
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/orders?restaurantId=${restaurantId}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadStats = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/orders/stats?restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-orange-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Access your restaurant admin panel</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {authError}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg"
            >
              Login to Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today's Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today's Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{restaurant.currency} {stats.todayRevenue}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href={`/pos/${restaurant.slug}/admin/tables`}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-orange-200 hover:border-orange-400"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Package className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Table View</h3>
                <p className="text-gray-600 text-sm">Manage table orders</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/pos/${restaurant.slug}/menu`}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-orange-200 hover:border-orange-400"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Menu Management</h3>
                <p className="text-gray-600 text-sm">Edit menu items</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/pos/${restaurant.slug}/admin/reports`}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-orange-200 hover:border-orange-400"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Reports</h3>
                <p className="text-gray-600 text-sm">View analytics</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                    <td className="py-4 px-4">{order.customer_name || 'Walk-in'}</td>
                    <td className="py-4 px-4 capitalize">{order.order_type}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold">{restaurant.currency} {order.total}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        href={`/pos/${restaurant.slug}/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No orders yet. Create your first order!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}