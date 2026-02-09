'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, ShoppingBag, TrendingUp, Users, Calendar, Download } from 'lucide-react';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export default function ReportsPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      
      const storedAuth = sessionStorage.getItem('admin_auth_' + resolvedParams.slug);
      if (!storedAuth) {
        router.push('/pos/' + resolvedParams.slug + '/admin');
        return;
      }
      
      const response = await fetch(`/api/restaurants/${resolvedParams.slug}`);
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data);
        await loadStats(data.id);
      }
    };
    init();
  }, [params, router]);

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

  const downloadReport = () => {
    if (!stats || !restaurant) return;
    
    const csvContent = [
      ['DinePlus Report', restaurant.name],
      ['Date Range', dateRange],
      [],
      ['Summary'],
      ['Total Revenue', `${restaurant.currency} ${stats.totalRevenue.toFixed(2)}`],
      ['Total Orders', stats.totalOrders],
      ['Average Order Value', `${restaurant.currency} ${stats.avgOrderValue.toFixed(2)}`],
      [],
      ['Top Items'],
      ['Item Name', 'Quantity Sold', 'Revenue'],
      ...stats.topItems.map(item => [
        item.name,
        item.quantity,
        `${restaurant.currency} ${item.revenue.toFixed(2)}`
      ]),
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${dateRange}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!restaurant || !stats) {
    return <div className="min-h-screen bg-gray-50 p-8"><p className="text-center text-gray-600">Loading reports...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
              <p className="text-orange-100">Track your restaurant performance</p>
            </div>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl hover:shadow-xl transition-all font-bold"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Calendar className="w-6 h-6 text-orange-600" />
            <div className="flex gap-2 flex-wrap">
              {['today', 'week', 'month', 'year', 'custom'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    dateRange === range
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            {dateRange === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total Revenue</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{restaurant.currency} {stats.totalRevenue.toFixed(2)}</h3>
            <p className="text-sm text-green-600 mt-2">+12% from last period</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total Orders</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalOrders}</h3>
            <p className="text-sm text-blue-600 mt-2">+8% from last period</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Avg Order Value</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{restaurant.currency} {stats.avgOrderValue.toFixed(2)}</h3>
            <p className="text-sm text-orange-600 mt-2">+5% from last period</p>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Selling Items</h2>
          <div className="space-y-4">
            {stats.topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.quantity} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{restaurant.currency} {item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
            {stats.topItems.length === 0 && (
              <p className="text-center text-gray-500 py-8">No sales data available</p>
            )}
          </div>
        </div>

        {/* Daily Stats */}
        {stats.dailyStats && stats.dailyStats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Performance</h2>
            <div className="space-y-3">
              {stats.dailyStats.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{new Date(day.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{day.orders} orders</p>
                  </div>
                  <p className="font-bold text-orange-600">{restaurant.currency} {day.revenue.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
