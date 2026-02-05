'use client';

import { useEffect, useState } from 'react';
import { Inventory } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    const items = storage.get<Inventory[]>(STORAGE_KEYS.INVENTORY) || [];
    setInventory(items);
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      const updated = inventory.filter((item) => item.id !== id);
      storage.set(STORAGE_KEYS.INVENTORY, updated);
      setInventory(updated);
    }
  };

  const lowStockItems = inventory.filter((item) => item.quantity <= item.lowStockThreshold);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your restaurant inventory</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
        >
          + Add Item
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <h3 className="font-bold text-red-900 mb-2">⚠️ Low Stock Alert</h3>
          <p className="text-sm text-red-800 mb-2">
            {lowStockItems.length} item(s) are running low on stock:
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span
                key={item.id}
                className="px-3 py-1 bg-red-100 text-red-900 rounded-full text-sm font-semibold"
              >
                {item.itemName} ({item.quantity} {item.unit})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 font-semibold">Item Name</th>
                <th className="text-right py-4 px-6 font-semibold">Quantity</th>
                <th className="text-center py-4 px-6 font-semibold">Unit</th>
                <th className="text-center py-4 px-6 font-semibold">Low Stock Threshold</th>
                <th className="text-center py-4 px-6 font-semibold">Status</th>
                <th className="text-center py-4 px-6 font-semibold">Last Restocked</th>
                <th className="text-right py-4 px-6 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isLowStock = item.quantity <= item.lowStockThreshold;
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-semibold">{item.itemName}</td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`font-bold ${
                          isLowStock ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600">{item.unit}</td>
                    <td className="py-4 px-6 text-center text-gray-600">
                      {item.lowStockThreshold}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isLowStock
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-gray-600">
                      {new Date(item.lastRestocked).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsAddModalOpen(true);
                          }}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {inventory.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No inventory items yet</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <InventoryModal
          item={editingItem}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
          onSave={(item) => {
            let updated: Inventory[];
            if (editingItem) {
              updated = inventory.map((i) => (i.id === item.id ? item : i));
            } else {
              updated = [...inventory, item];
            }
            storage.set(STORAGE_KEYS.INVENTORY, updated);
            setInventory(updated);
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function InventoryModal({
  item,
  onClose,
  onSave,
}: {
  item: Inventory | null;
  onClose: () => void;
  onSave: (item: Inventory) => void;
}) {
  const [formData, setFormData] = useState<Partial<Inventory>>(
    item || {
      itemName: '',
      quantity: 0,
      unit: 'kg',
      lowStockThreshold: 10,
      lastRestocked: new Date().toISOString(),
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Inventory = {
      id: item?.id || `inv-${Date.now()}`,
      itemName: formData.itemName!,
      quantity: Number(formData.quantity),
      unit: formData.unit!,
      lowStockThreshold: Number(formData.lowStockThreshold),
      lastRestocked: formData.lastRestocked!,
    };
    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            {item ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Item Name</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
                <option value="dozen">dozen</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Low Stock Threshold</label>
            <input
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) =>
                setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Last Restocked</label>
            <input
              type="date"
              value={formData.lastRestocked?.split('T')[0]}
              onChange={(e) =>
                setFormData({ ...formData, lastRestocked: new Date(e.target.value).toISOString() })
              }
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
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
