'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, ArrowLeft, Leaf, Save, X } from 'lucide-react';
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
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    isVeg: false,
    preparationTime: 15
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
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
      if (response.ok) {
        const data = await response.json();
        setMenuItems(Array.isArray(data) ? data : []);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/categories?restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
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

  const handleAddCategory = async () => {
    if (!restaurant || !categoryFormData.name.trim()) return;
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          name: categoryFormData.name,
          description: categoryFormData.description,
          displayOrder: categories.length
        })
      });
      
      if (response.ok) {
        await loadCategories(restaurant.id);
        setCategoryFormData({ name: '', description: '' });
        setShowAddCategoryForm(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async (categoryId: string, name: string, description: string | null) => {
    if (!name.trim()) return;
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || ''
        })
      });
      
      if (response.ok && restaurant) {
        await loadCategories(restaurant.id);
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryItems = menuItems.filter(item => item.category_id === categoryId);
    
    if (categoryItems.length > 0) {
      alert(`Cannot delete category with ${categoryItems.length} menu items. Please delete or move the items first.`);
      return;
    }
    
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok && restaurant) {
        await loadCategories(restaurant.id);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
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
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600">{restaurant.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddCategoryForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Add Category Form */}
        {showAddCategoryForm && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-300">
            <h2 className="text-xl font-bold mb-4 text-gray-900">New Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category Name *"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                className="px-4 py-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg"
              >
                Save Category
              </button>
              <button
                onClick={() => {
                  setShowAddCategoryForm(false);
                  setCategoryFormData({ name: '', description: '' });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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

        {/* Menu Items Grid by Category */}
        {categories.map(category => {
          const categoryItems = menuItems.filter(item => item.category_id === category.id);
          
          return (
            <div key={category.id} className="mb-8">
              {/* Category Header with Edit/Delete */}
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-4 mb-4 flex items-center justify-between border-2 border-orange-200">
                {editingCategory === category.id ? (
                  <div className="flex-1 flex gap-3 items-center">
                    <input
                      type="text"
                      defaultValue={category.name}
                      id={`edit-name-${category.id}`}
                      className="px-3 py-2 border-2 border-orange-300 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Category Name"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`edit-name-${category.id}`) as HTMLInputElement;
                        handleUpdateCategory(category.id, input.value, null);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCategory(category.id)}
                        className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Menu Items in Category */}
              {categoryItems.length > 0 ? (
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
              ) : (
                <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">No items in this category yet. Add menu items above!</p>
                </div>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No categories yet. Start by adding a category!</p>
            <button
              onClick={() => setShowAddCategoryForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg"
            >
              Add Your First Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
