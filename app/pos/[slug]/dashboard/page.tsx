'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, UtensilsCrossed, Armchair, Package, DollarSign, TrendingUp, Users, ArrowRight } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface DashboardStats {
  totalCategories: number;
  totalMenuItems: number;
  totalTables: number;
  lowStockItems: number;
}

export default function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCategories: 0,
    totalMenuItems: 0,
    totalTables: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      const response = await fetch(`https://loopwar.dev/api/restaurants/${resolvedParams.slug}`);
      
      if (!response.ok) {
        router.push('https://loopwar.dev/login');
        return;
      }
      
      const restaurantData = await response.json();
      setRestaurant(restaurantData);
      
      await loadStats(restaurantData.id);
    };
    
    init();
  }, [params, router]);

  const loadStats = async (restaurantId: string) => {
    try {
      const [categoriesRes, menuRes, tablesRes, inventoryRes] = await Promise.all([
        fetch(`https://loopwar.dev/api/categories?restaurantId=${restaurantId}`),
        fetch(`https://loopwar.dev/api/menu?restaurantId=${restaurantId}`),
        fetch(`https://loopwar.dev/api/tables?restaurantId=${restaurantId}`),
        fetch(`https://loopwar.dev/api/inventory?restaurantId=${restaurantId}`)
      ]);

      const categories = await categoriesRes.json();
      const menu = await menuRes.json();
      const tables = await tablesRes.json();
      const inventory = await inventoryRes.json();

      const lowStock = inventory.filter((item: any) => item.current_stock <= item.min_stock_level).length;

      setStats({
        totalCategories: categories.length,
        totalMenuItems: menu.length,
        totalTables: tables.length,
        lowStockItems: lowStock
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
            {restaurant.name}
          </h1>
          <p className="text-gray-600 text-lg">Restaurant Management Dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href={`/pos/${restaurant.slug}/categories`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-orange-400 transition-all hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UtensilsCrossed className="w-8 h-8 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1">Categories</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
          </Link>

          <Link href={`/pos/${restaurant.slug}/menu`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-orange-400 transition-all hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <UtensilsCrossed className="w-8 h-8 text-green-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1">Menu Items</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMenuItems}</p>
            </div>
          </Link>

          <Link href={`/pos/${restaurant.slug}/tables`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-orange-400 transition-all hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Armchair className="w-8 h-8 text-purple-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1">Tables</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTables}</p>
            </div>
          </Link>

          <Link href={`/pos/${restaurant.slug}/inventory`}>
            <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${stats.lowStockItems > 0 ? 'border-red-400' : 'border-gray-200'} hover:border-orange-400 transition-all hover:shadow-xl`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stats.lowStockItems > 0 ? 'bg-red-100' : 'bg-orange-100'}`}>
                  <Package className={`w-8 h-8 ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-orange-600'}`} />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1">Low Stock Alerts</h3>
              <p className={`text-3xl font-bold ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {stats.lowStockItems}
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Setup</h2>
            <div className="space-y-4">
              <Link
                href={`/pos/${restaurant.slug}/categories`}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-6 h-6 text-blue-600" />
                  <span className="font-semibold text-gray-900">Manage Categories</span>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </Link>
              
              <Link
                href={`/pos/${restaurant.slug}/menu`}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-900">Manage Menu</span>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600" />
              </Link>
              
              <Link
                href={`/pos/${restaurant.slug}/tables`}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <Armchair className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-900">Manage Tables</span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600" />
              </Link>
              
              <Link
                href={`/pos/${restaurant.slug}/inventory`}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-orange-600" />
                  <span className="font-semibold text-gray-900">Manage Inventory</span>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-600" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">System Info</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                <p className="text-sm text-gray-600 mb-1">Restaurant URL</p>
                <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                  pos.loopwar.dev/{restaurant.slug}
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                <p className="text-sm text-gray-600 mb-1">Restaurant ID</p>
                <p className="font-mono text-xs font-semibold text-gray-900 break-all">
                  {restaurant.id}
                </p>
              </div>
              
              <Link
                href={`/pos/${restaurant.slug}/setup`}
                className="block w-full p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:shadow-xl transition-all text-center font-semibold"
              >
                Back to Setup Page
              </Link>
              
              <a
                href="https://loopwar.dev"
                className="block w-full p-4 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all text-center font-semibold"
              >
                Go to Main Website
              </a>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        {(stats.totalCategories === 0 || stats.totalMenuItems === 0 || stats.totalTables === 0) && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-8 border-2 border-blue-300">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">👋 Welcome to Your Dashboard!</h3>
            <p className="text-gray-700 text-lg mb-4">
              Get started by setting up your restaurant:
            </p>
            <ul className="space-y-2 text-gray-700">
              {stats.totalCategories === 0 && (
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>Add your menu categories</span>
                </li>
              )}
              {stats.totalMenuItems === 0 && (
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>Create your menu items with prices</span>
                </li>
              )}
              {stats.totalTables === 0 && (
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>Set up your restaurant tables</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
