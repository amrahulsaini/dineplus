'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, QrCode, Users } from 'lucide-react';
import Link from 'next/link';

interface Table {
  id: string;
  table_number: number;
  table_name: string;
  capacity: number;
  qr_code: string;
  is_active: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

export default function TablesPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: '',
    tableName: '',
    capacity: 4
  });

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
    };
    
    init();
  }, [params, router]);

  const loadTables = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/tables?restaurantId=${restaurantId}`);
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!restaurant || !formData.tableNumber) return;
    
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableNumber: parseInt(formData.tableNumber),
          tableName: formData.tableName,
          capacity: formData.capacity
        })
      });
      
      if (response.ok) {
        await loadTables(restaurant.id);
        setFormData({ tableNumber: '', tableName: '', capacity: 4 });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleUpdate = async (table: Table) => {
    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: table.table_number,
          tableName: table.table_name,
          capacity: table.capacity,
          isActive: table.is_active
        })
      });
      
      if (response.ok) {
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating table:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    
    try {
      const response = await fetch(`/api/tables/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok && restaurant) {
        await loadTables(restaurant.id);
      }
    } catch (error) {
      console.error('Error deleting table:', error);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/pos/${restaurant.slug}/setup`}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tables</h1>
              <p className="text-gray-600">{restaurant.name}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Table
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-200">
            <h2 className="text-xl font-bold mb-4">New Table</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="number"
                placeholder="Table Number *"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Table Name"
                value={formData.tableName}
                onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ tableNumber: '', tableName: '', capacity: 4 });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No tables yet. Add your first table!</p>
            </div>
          ) : (
            tables.map((table) => (
              <div key={table.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-orange-400 transition-colors">
                {editingId === table.id ? (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={table.table_number}
                      onChange={(e) => {
                        const updated = tables.map(t =>
                          t.id === table.id ? { ...t, table_number: parseInt(e.target.value) } : t
                        );
                        setTables(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={table.table_name}
                      onChange={(e) => {
                        const updated = tables.map(t =>
                          t.id === table.id ? { ...t, table_name: e.target.value } : t
                        );
                        setTables(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={table.capacity}
                      onChange={(e) => {
                        const updated = tables.map(t =>
                          t.id === table.id ? { ...t, capacity: parseInt(e.target.value) } : t
                        );
                        setTables(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(table)}
                        className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-orange-600">{table.table_number}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{table.table_name}</h3>
                      <div className="flex items-center justify-center gap-1 text-gray-600 mt-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{table.capacity} seats</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-gray-500 mt-1">
                        <QrCode className="w-4 h-4" />
                        <span className="text-xs font-mono">{table.qr_code}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(table.id)}
                        className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <Edit2 className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleDelete(table.id)}
                        className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
