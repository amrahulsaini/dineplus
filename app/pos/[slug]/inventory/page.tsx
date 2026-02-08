'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  item_name: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  unit_price: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

export default function InventoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    unit: '',
    currentStock: 0,
    minStockLevel: 0,
    unitPrice: 0
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
      
      await loadInventory(restaurantData.id);
    };
    
    init();
  }, [params, router]);

  const loadInventory = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/inventory?restaurantId=${restaurantId}`);
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!restaurant || !formData.itemName.trim() || !formData.unit.trim()) return;
    
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          itemName: formData.itemName,
          unit: formData.unit,
          currentStock: formData.currentStock,
          minStockLevel: formData.minStockLevel,
          unitPrice: formData.unitPrice
        })
      });
      
      if (response.ok) {
        await loadInventory(restaurant.id);
        setFormData({ itemName: '', unit: '', currentStock: 0, minStockLevel: 0, unitPrice: 0 });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding inventory item:', error);
    }
  };

  const handleUpdate = async (item: InventoryItem) => {
    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: item.item_name,
          unit: item.unit,
          currentStock: item.current_stock,
          minStockLevel: item.min_stock_level,
          unitPrice: item.unit_price
        })
      });
      
      if (response.ok) {
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok && restaurant) {
        await loadInventory(restaurant.id);
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  };

  const isLowStock = (item: InventoryItem) => item.current_stock <= item.min_stock_level;

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const lowStockCount = inventory.filter(isLowStock).length;

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
              <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
              <p className="text-gray-600">{restaurant.name}</p>
              {lowStockCount > 0 && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">{lowStockCount} items low on stock</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-200">
            <h2 className="text-xl font-bold mb-4">New Inventory Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <input
                type="text"
                placeholder="Item Name *"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Unit (kg, L, pcs) *"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Current Stock"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Min Stock Level"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Unit Price"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
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
                  setFormData({ itemName: '', unit: '', currentStock: 0, minStockLevel: 0, unitPrice: 0 });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inventory List */}
        <div className="space-y-4">
          {inventory.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg">No inventory items yet. Add your first item!</p>
            </div>
          ) : (
            inventory.map((item) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${isLowStock(item) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              >
                {editingId === item.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) => {
                        const updated = inventory.map(i =>
                          i.id === item.id ? { ...i, item_name: e.target.value } : i
                        );
                        setInventory(updated);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => {
                        const updated = inventory.map(i =>
                          i.id === item.id ? { ...i, unit: e.target.value } : i
                        );
                        setInventory(updated);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={item.current_stock}
                      onChange={(e) => {
                        const updated = inventory.map(i =>
                          i.id === item.id ? { ...i, current_stock: parseFloat(e.target.value) } : i
                        );
                        setInventory(updated);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={item.min_stock_level}
                      onChange={(e) => {
                        const updated = inventory.map(i =>
                          i.id === item.id ? { ...i, min_stock_level: parseFloat(e.target.value) } : i
                        );
                        setInventory(updated);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => {
                        const updated = inventory.map(i =>
                          i.id === item.id ? { ...i, unit_price: parseFloat(e.target.value) } : i
                        );
                        setInventory(updated);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(item)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{item.item_name}</h3>
                        {isLowStock(item) && (
                          <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Unit</p>
                        <p className="font-semibold text-gray-900">{item.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Stock</p>
                        <p className="font-semibold text-gray-900">{item.current_stock}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Min Level</p>
                        <p className="font-semibold text-gray-900">{item.min_stock_level}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Unit Price</p>
                        <p className="font-semibold text-gray-900">₹{item.unit_price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
