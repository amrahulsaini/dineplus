'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  location: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

export default function TablesAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      const response = await fetch(`/api/restaurants/${resolvedParams.slug}`);
      
      if (!response.ok) {
        router.push('/pos/login');
        return;
      }
      
      const restaurantData = await response.json();
      setRestaurant(restaurantData);
      
      await loadTables(restaurantData.id);
      setLoading(false);
    };
    
    init();
  }, [params, router]);

  const loadTables = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/tables?restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setTables(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-500 text-green-800';
      case 'occupied': return 'bg-red-100 border-red-500 text-red-800';
      case 'reserved': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/pos/${restaurant.slug}/admin`} className="p-2 hover:bg-white/20 rounded-lg">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Table Management</h1>
                <p className="text-orange-100">{restaurant.name}</p>
              </div>
            </div>
            <Link
              href={`/pos/${restaurant.slug}/admin/create-order`}
              className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl hover:shadow-xl font-bold"
            >
              <Plus className="w-5 h-5" />
              New Order
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <p className="text-gray-600">Total Tables</p>
            <p className="text-4xl font-bold text-gray-900">{tables.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-gray-600">Available</p>
            <p className="text-4xl font-bold text-green-600">{availableTables}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <p className="text-gray-600">Occupied</p>
            <p className="text-4xl font-bold text-red-600">{occupiedTables}</p>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Tables</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map(table => (
              <Link
                key={table.id}
                href={`/pos/${restaurant.slug}/admin/create-order`}
                className={`border-4 rounded-2xl p-6 text-center hover:shadow-xl transition-all cursor-pointer ${getStatusColor(table.status)}`}
              >
                <div className="text-3xl font-bold mb-2">T{table.table_number}</div>
                <div className="text-sm font-semibold capitalize mb-1">{table.status}</div>
                <div className="text-xs text-gray-600">{table.capacity} seats</div>
                {table.location && (
                  <div className="text-xs text-gray-500 mt-1">{table.location}</div>
                )}
              </Link>
            ))}
          </div>

          {tables.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tables configured yet</p>
              <Link
                href={`/pos/${restaurant.slug}/tables`}
                className="mt-4 inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
              >
                Add Tables
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
