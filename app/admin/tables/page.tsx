'use client';

import { useEffect, useState } from 'react';
import { Table, Order } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';

export default function TablesManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allTables = storage.get<Table[]>(STORAGE_KEYS.TABLES) || [];
    const allOrders = storage.get<Order[]>(STORAGE_KEYS.ORDERS) || [];
    setTables(allTables);
    setOrders(allOrders);
  };

  const updateTableStatus = (
    tableId: string,
    status: 'available' | 'occupied' | 'reserved'
  ) => {
    const updated = tables.map((table) =>
      table.id === tableId ? { ...table, status } : table
    );
    storage.set(STORAGE_KEYS.TABLES, updated);
    setTables(updated);
  };

  const getTableOrder = (tableId: string) => {
    return orders.find((order) =>
      order.orderType === 'dine-in' &&
      order.status !== 'delivered' &&
      order.status !== 'cancelled'
    );
  };

  const statusColors = {
    available: 'bg-green-100 border-green-500 text-green-800',
    occupied: 'bg-red-100 border-red-500 text-red-800',
    reserved: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Table Management</h1>
        <p className="text-gray-600">Manage restaurant tables and seating</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Available"
          count={tables.filter((t) => t.status === 'available').length}
          color="green"
        />
        <StatCard
          title="Occupied"
          count={tables.filter((t) => t.status === 'occupied').length}
          color="red"
        />
        <StatCard
          title="Reserved"
          count={tables.filter((t) => t.status === 'reserved').length}
          color="yellow"
        />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`rounded-xl border-2 p-6 text-center transition-all hover:shadow-lg ${
              statusColors[table.status]
            }`}
          >
            <div className="text-4xl mb-2">🪑</div>
            <h3 className="text-2xl font-bold mb-1">Table {table.number}</h3>
            <p className="text-sm mb-3">Capacity: {table.capacity}</p>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase">{table.status}</p>
              <select
                value={table.status}
                onChange={(e) =>
                  updateTableStatus(
                    table.id,
                    e.target.value as 'available' | 'occupied' | 'reserved'
                  )
                }
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  title,
  count,
  color,
}: {
  title: string;
  count: number;
  color: 'green' | 'red' | 'yellow';
}) {
  const colors = {
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${colors[color]}`}>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-4xl font-bold">{count}</p>
    </div>
  );
}
