'use client';

import { useEffect, useState } from 'react';
import { Order, MenuItem } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';
import { DollarSign, FileText, BarChart3, LucideIcon } from 'lucide-react';

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allOrders = storage.get<Order[]>(STORAGE_KEYS.ORDERS) || [];
    const allMenuItems = storage.get<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS) || [];
    setOrders(allOrders);
    setMenuItems(allMenuItems);
  };

  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      switch (dateRange) {
        case 'today':
          return orderDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate top selling items
  const itemSales = new Map<string, { item: MenuItem; count: number; revenue: number }>();
  filteredOrders.forEach((order) => {
    order.items.forEach((cartItem) => {
      const existing = itemSales.get(cartItem.menuItem.id);
      if (existing) {
        existing.count += cartItem.quantity;
        existing.revenue += cartItem.quantity * cartItem.menuItem.price;
      } else {
        itemSales.set(cartItem.menuItem.id, {
          item: cartItem.menuItem,
          count: cartItem.quantity,
          revenue: cartItem.quantity * cartItem.menuItem.price,
        });
      }
    });
  });

  const topSellingItems = Array.from(itemSales.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Order status breakdown
  const statusCounts = {
    pending: filteredOrders.filter((o) => o.status === 'pending').length,
    confirmed: filteredOrders.filter((o) => o.status === 'confirmed').length,
    preparing: filteredOrders.filter((o) => o.status === 'preparing').length,
    ready: filteredOrders.filter((o) => o.status === 'ready').length,
    delivered: filteredOrders.filter((o) => o.status === 'delivered').length,
    cancelled: filteredOrders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Insights into your restaurant performance</p>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg capitalize font-semibold transition-colors ${
                dateRange === range
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {range === 'all' ? 'All Time' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${totalRevenue.toFixed(2)}`}
          Icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Total Orders"
          value={totalOrders}
          Icon={FileText}
          color="blue"
        />
        <MetricCard
          title="Avg Order Value"
          value={`₹${avgOrderValue.toFixed(2)}`}
          Icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize font-medium">{status}</span>
                    <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStatusBarColor(status)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
          <div className="space-y-3">
            {(['cash', 'card', 'upi', 'online'] as const).map((method) => {
              const count = filteredOrders.filter((o) => o.paymentMethod === method).length;
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <div key={method}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize font-medium">{method}</span>
                    <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Top Selling Items</h2>
        {topSellingItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sales data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Item Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-right py-3 px-4">Quantity Sold</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellingItems.map((item, index) => {
                  const category = menuItems.find((mi) => mi.id === item.item.id)?.categoryId;
                  return (
                    <tr key={item.item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-orange-600">#{index + 1}</td>
                      <td className="py-3 px-4 font-semibold">{item.item.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{category || 'N/A'}</td>
                      <td className="py-3 px-4 text-right font-semibold">{item.count}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        ₹{item.revenue.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Type Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Order Type Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          {(['dine-in', 'takeaway', 'delivery'] as const).map((type) => {
            const count = filteredOrders.filter((o) => o.orderType === type).length;
            const revenue = filteredOrders
              .filter((o) => o.orderType === type)
              .reduce((sum, o) => sum + o.total, 0);
            const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
            
            return (
              <div key={type} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold capitalize mb-2">{type}</h3>
                <p className="text-2xl font-bold text-orange-600 mb-1">{count}</p>
                <p className="text-sm text-gray-600 mb-2">{percentage.toFixed(1)}% of orders</p>
                <p className="text-sm font-semibold text-green-600">₹{revenue.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  Icon,
  color,
}: {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  color: string;
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses} p-4 rounded-xl`}>
          <Icon className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
}

function getStatusBarColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    preparing: 'bg-purple-500',
    ready: 'bg-green-500',
    delivered: 'bg-green-600',
    cancelled: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
}
