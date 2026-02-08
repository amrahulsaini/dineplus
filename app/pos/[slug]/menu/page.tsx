'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, ArrowLeft, Leaf } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  category_id: string;
  category_name: string;
  is_veg: boolean;
  preparation_time: number;
  is_active: boolean;
  variations?: any[];
  addons?: any[];
}

interface Category {
  id: string;
  name: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

export default function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    isVeg: false,
    preparationTime: 15
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
      
      await Promise.all([
        loadMenuItems(restaurantData.id),
        loadCategories(restaurantData.id)
      ]);
    };
    
    init();
  }, [params, router]);

  const loadMenuItems = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/menu?restaurantId=${restaurantId}`);
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/categories?restaurantId=${restaurantId}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAdd = async () => {
    if (!restaurant || !formData.name.trim() || !formData.categoryId || !formData.basePrice) return;
    
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          categoryId: formData.categoryId,
          name: formData.name,
          description: formData.description,
          basePrice: parseFloat(formData.basePrice),
          isVeg: formData.isVeg,
          preparationTime: formData.preparationTime
        })
      });
      
      if (response.ok) {
        await loadMenuItems(restaurant.id);
        setFormData({ name: '', description: '', basePrice: '', categoryId: '', isVeg: false, preparationTime: 15 });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok && restaurant) {
        await loadMenuItems(restaurant.id);
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
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
      <div className="max-w-7xl mx-auto px-4">
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
              <h1 className="text-3xl font-bold text-gray-900">Menu Items</h1>
              <p className="text-gray-600">{restaurant.name}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Menu Item
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-200">
            <h2 className="text-xl font-bold mb-4">New Menu Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Item Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Category *</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Price *"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Prep Time (minutes)"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 md:col-span-2"
                rows={2}
              />
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.isVeg}
                  onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  className="w-5 h-5"
                />
                <Leaf className="w-5 h-5 text-green-600" />
                <span>Vegetarian</span>
              </label>
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
                  setFormData({ name: '', description: '', basePrice: '', categoryId: '', isVeg: false, preparationTime: 15 });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        {categories.map(category => {
          const categoryItems = menuItems.filter(item => item.category_id === category.id);
          if (categoryItems.length === 0) return null;
          
          return (
            <div key={category.id} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.name}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-orange-400 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                          {item.is_veg && <Leaf className="w-4 h-4 text-green-600" />}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        <p className="text-xl font-bold text-orange-600">₹{item.base_price}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.preparation_time} mins</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {menuItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No menu items yet. Add your first item!</p>
          </div>
        )}
      </div>
    </div>
  );
}
