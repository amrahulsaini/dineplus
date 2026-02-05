'use client';

import { useEffect, useState } from 'react';
import { Order, MenuItem } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  UtensilsCrossed,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalMenuItems: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allOrders = storage.get<Order[]>(STORAGE_KEYS.ORDERS) || [];
    const allMenuItems = storage.get<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS) || [];

    setOrders(allOrders);
    setMenuItems(allMenuItems);

    // Calculate today's revenue
    const today = new Date().toDateString();
    const todayOrders = allOrders.filter(
      (order) => new Date(order.createdAt).toDateString() === today
    );
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = allOrders.filter(
      (order) => order.status === 'pending' || order.status === 'confirmed'
    ).length;

    setStats({
      totalOrders: allOrders.length,
      todayRevenue,
      pendingOrders,
      totalMenuItems: allMenuItems.length,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your restaurant operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingBag className="w-8 h-8" />}
          color="blue"
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todayRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-8 h-8" />}
          color="green"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<Clock className="w-8 h-8" />}
          color="orange"
        />
        <StatCard
          title="Menu Items"
          value={stats.totalMenuItems}
          icon={<UtensilsCrossed className="w-8 h-8" />}
          color="purple"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="py-3 px-4">{order.userName}</td>
                    <td className="py-3 px-4">{order.items.length} items</td>
                    <td className="py-3 px-4 font-semibold">₹{order.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          href="/admin/orders"
          icon={<ShoppingBag className="w-10 h-10" />}
          title="Manage Orders"
          description="View and update order status"
        />
        <QuickAction
          href="/admin/menu"
          icon={<UtensilsCrossed className="w-10 h-10" />}
          title="Manage Menu"
          description="Add or edit menu items"
        />
        <QuickAction
          href="/admin/reports"
          icon={<TrendingUp className="w-10 h-10" />}
          title="View Reports"
          description="Analytics and insights"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${colorClasses} p-4 rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all group border border-gray-100 hover:border-orange-200"
    >
      <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl text-white inline-block mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-lg font-bold mb-2 group-hover:text-orange-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-4 flex items-center text-orange-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        <span>View more</span>
        <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </a>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    'out-for-delivery': 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
