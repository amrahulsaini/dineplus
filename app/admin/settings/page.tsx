'use client';

import { useEffect, useState } from 'react';
import { Restaurant } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState<Partial<Restaurant>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = storage.get<Restaurant>(STORAGE_KEYS.RESTAURANT);
    if (data) {
      setRestaurant(data);
      setFormData(data);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Restaurant = {
      ...restaurant!,
      ...formData,
      taxRate: Number(formData.taxRate),
    };
    storage.set(STORAGE_KEYS.RESTAURANT, updated);
    setRestaurant(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
      if (confirm('This will delete all orders, cart, and reset everything. Proceed?')) {
        storage.clear();
        alert('All data cleared! Reloading page...');
        window.location.reload();
      }
    }
  };

  if (!restaurant) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Settings</h1>
        <p className="text-gray-600">Configure your restaurant information</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Restaurant Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Opening Time</label>
            <input
              type="time"
              value={formData.openingTime}
              onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Closing Time</label>
            <input
              type="time"
              value={formData.closingTime}
              onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              max="100"
              step="0.1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <input
              type="text"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isOpen}
                onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Restaurant is currently open</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
          >
            Save Settings
          </button>
          {saved && (
            <div className="flex items-center text-green-600 font-semibold">
              ✅ Settings saved successfully!
            </div>
          )}
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Danger Zone</h2>
        <p className="text-gray-600 mb-4">
          Clear all data including orders, cart, and reset to demo data. This action cannot be undone!
        </p>
        <button
          onClick={handleClearData}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
        >
          Clear All Data
        </button>
      </div>

      {/* Data Storage Info */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">💾 Data Storage Information</h3>
        <p className="text-sm text-blue-800">
          All data is stored locally in your browser's localStorage. Data persists for 30 days via cookies.
          No data is sent to any server. Clear your browser data to remove all information.
        </p>
      </div>
    </div>
  );
}
