'use client';

import { useEffect, useState } from 'react';
import { MenuItem, Category } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const items = storage.get<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS) || [];
    const cats = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
    setMenuItems(items);
    setCategories(cats);
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updated = menuItems.filter((item) => item.id !== id);
      storage.set(STORAGE_KEYS.MENU_ITEMS, updated);
      setMenuItems(updated);
    }
  };

  const toggleAvailability = (id: string) => {
    const updated = menuItems.map((item) =>
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    );
    storage.set(STORAGE_KEYS.MENU_ITEMS, updated);
    setMenuItems(updated);
  };

  const filteredItems = filterCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.categoryId === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant menu items</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
        >
          + Add Menu Item
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat.name} ({menuItems.filter((item) => item.categoryId === cat.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const category = categories.find((c) => c.id === item.categoryId);
          return (
            <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-400 to-red-400 h-40 flex items-center justify-center text-6xl">
                  {item.isVeg ? '🥗' : '🍗'}
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.isVeg ? 'bg-green-500' : 'bg-red-500'
                  } text-white`}>
                    {item.isVeg ? 'VEG' : 'NON-VEG'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.isAvailable ? 'bg-green-500' : 'bg-gray-500'
                  } text-white`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <span className="text-orange-600 font-bold text-lg">₹{item.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <p className="text-xs text-gray-500 mb-3">
                  Category: {category?.name} • {item.preparationTime} mins
                </p>
                {item.tags.length > 0 && (
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      item.isAvailable
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsAddModalOpen(true);
                    }}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No menu items found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <MenuItemModal
          item={editingItem}
          categories={categories}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
          onSave={(item) => {
            let updated: MenuItem[];
            if (editingItem) {
              updated = menuItems.map((i) => (i.id === item.id ? item : i));
            } else {
              updated = [...menuItems, item];
            }
            storage.set(STORAGE_KEYS.MENU_ITEMS, updated);
            setMenuItems(updated);
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function MenuItemModal({
  item,
  categories,
  onClose,
  onSave,
}: {
  item: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSave: (item: MenuItem) => void;
}) {
  const [formData, setFormData] = useState<Partial<MenuItem>>(
    item || {
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id || '',
      isAvailable: true,
      isVeg: true,
      preparationTime: 15,
      tags: [],
    }
  );
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: MenuItem = {
      id: item?.id || `item-${Date.now()}`,
      name: formData.name!,
      description: formData.description!,
      price: Number(formData.price),
      categoryId: formData.categoryId!,
      isAvailable: formData.isAvailable!,
      isVeg: formData.isVeg!,
      preparationTime: Number(formData.preparationTime),
      tags: formData.tags || [],
      createdAt: item?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newItem);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Item Name</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preparation Time (mins)</label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) =>
                  setFormData({ ...formData, preparationTime: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border rounded-lg"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isVeg}
                onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Vegetarian</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Available</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="Add tag (e.g., popular, spicy)"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

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
              {item ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
