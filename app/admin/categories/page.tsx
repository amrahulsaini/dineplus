'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const cats = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
    setCategories(cats.sort((a, b) => a.order - b.order));
  };

  const deleteCategory = (id: string) => {
    if (confirm('Are you sure? This will not delete menu items in this category.')) {
      const updated = categories.filter((cat) => cat.id !== id);
      storage.set(STORAGE_KEYS.CATEGORIES, updated);
      setCategories(updated);
    }
  };

  const toggleActive = (id: string) => {
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
    );
    storage.set(STORAGE_KEYS.CATEGORIES, updated);
    setCategories(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories Management</h1>
          <p className="text-gray-600">Organize your menu into categories</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsAddModalOpen(true);
          }}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
        >
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{category.name}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  category.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{category.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(category.id)}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold"
              >
                {category.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => {
                  setEditingCategory(category);
                  setIsAddModalOpen(true);
                }}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCategory(category.id)}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={(cat) => {
            let updated: Category[];
            if (editingCategory) {
              updated = categories.map((c) => (c.id === cat.id ? cat : c));
            } else {
              updated = [...categories, cat];
            }
            storage.set(STORAGE_KEYS.CATEGORIES, updated);
            setCategories(updated);
            setIsAddModalOpen(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (category: Category) => void;
}) {
  const [formData, setFormData] = useState<Partial<Category>>(
    category || {
      name: '',
      description: '',
      isActive: true,
      order: 1,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCategory: Category = {
      id: category?.id || `cat-${Date.now()}`,
      name: formData.name!,
      description: formData.description!,
      isActive: formData.isActive!,
      order: Number(formData.order),
    };
    onSave(newCategory);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Display Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              min="1"
              required
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">Active</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold"
            >
              {category ? 'Update' : 'Add'} Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
