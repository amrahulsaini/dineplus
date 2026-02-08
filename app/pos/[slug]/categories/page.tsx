'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0
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
      
      await loadCategories(restaurantData.id);
    };
    
    init();
  }, [params, router]);

  const loadCategories = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/categories?restaurantId=${restaurantId}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!restaurant || !formData.name.trim()) return;
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          name: formData.name,
          description: formData.description,
          displayOrder: formData.displayOrder
        })
      });
      
      if (response.ok) {
        await loadCategories(restaurant.id);
        setFormData({ name: '', description: '', displayOrder: 0 });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdate = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: category.name,
          description: category.description,
          displayOrder: category.display_order,
          isActive: category.is_active
        })
      });
      
      if (response.ok) {
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
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
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600">{restaurant.name}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-200">
            <h2 className="text-xl font-bold mb-4">New Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Display Order"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
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
                  setFormData({ name: '', description: '', displayOrder: 0 });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No categories yet. Add your first category!</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                {editingId === category.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => {
                        const updated = categories.map(c =>
                          c.id === category.id ? { ...c, name: e.target.value } : c
                        );
                        setCategories(updated);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      value={category.description || ''}
                      onChange={(e) => {
                        const updated = categories.map(c =>
                          c.id === category.id ? { ...c, description: e.target.value } : c
                        );
                        setCategories(updated);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      value={category.display_order}
                      onChange={(e) => {
                        const updated = categories.map(c =>
                          c.id === category.id ? { ...c, display_order: parseInt(e.target.value) } : c
                        );
                        setCategories(updated);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(category)}
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
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 mt-1">{category.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">Display Order: {category.display_order}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(category.id)}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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
