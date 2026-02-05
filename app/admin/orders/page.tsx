'use client';

import { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/localStorage';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = storage.get<Order[]>(STORAGE_KEYS.ORDERS) || [];
    setOrders(allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map((order) =>
      order.id === orderId
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    );
    storage.set(STORAGE_KEYS.ORDERS, updated);
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">View and manage all orders</p>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex gap-2 flex-wrap">
          <FilterButton
            label="All Orders"
            count={statusCounts.all}
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
          />
          <FilterButton
            label="Pending"
            count={statusCounts.pending}
            active={filterStatus === 'pending'}
            onClick={() => setFilterStatus('pending')}
            color="yellow"
          />
          <FilterButton
            label="Confirmed"
            count={statusCounts.confirmed}
            active={filterStatus === 'confirmed'}
            onClick={() => setFilterStatus('confirmed')}
            color="blue"
          />
          <FilterButton
            label="Preparing"
            count={statusCounts.preparing}
            active={filterStatus === 'preparing'}
            onClick={() => setFilterStatus('preparing')}
            color="purple"
          />
          <FilterButton
            label="Ready"
            count={statusCounts.ready}
            active={filterStatus === 'ready'}
            onClick={() => setFilterStatus('ready')}
            color="green"
          />
          <FilterButton
            label="Delivered"
            count={statusCounts.delivered}
            active={filterStatus === 'delivered'}
            onClick={() => setFilterStatus('delivered')}
            color="green"
          />
          <FilterButton
            label="Cancelled"
            count={statusCounts.cancelled}
            active={filterStatus === 'cancelled'}
            onClick={() => setFilterStatus('cancelled')}
            color="red"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedOrder(order)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">#{order.id.slice(-8)}</h3>
                <p className="text-sm text-gray-600">{order.userName}</p>
                <p className="text-xs text-gray-500">{order.userPhone}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="border-t border-b py-3 my-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items:</span>
                <span className="font-semibold">{order.items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold capitalize">{order.orderType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment:</span>
                <span className="font-semibold capitalize">{order.paymentMethod}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Total:</span>
              <span className="text-xl font-bold text-orange-600">₹{order.total.toFixed(2)}</span>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              {new Date(order.createdAt).toLocaleString()}
            </p>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrder(order);
                }}
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(status) => updateOrderStatus(selectedOrder.id, status)}
        />
      )}
    </div>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
  color = 'orange',
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  const activeColors: Record<string, string> = {
    orange: 'bg-orange-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors ${
        active ? activeColors[color] : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      {label} ({count})
    </button>
  );
}

function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
}) {
  const statuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'out-for-delivery',
    'delivered',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h2>
            <p className="text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold mb-2">Customer Information</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {order.userName}</p>
              <p><strong>Phone:</strong> {order.userPhone}</p>
              {order.deliveryAddress && (
                <p><strong>Address:</strong> {order.deliveryAddress}</p>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div>
            <h3 className="font-bold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{item.menuItem.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} × ₹{item.menuItem.price}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-lg">
                    ₹{(item.quantity * item.menuItem.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-orange-600">₹{order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Payment Method:</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Order Type:</span>
              <span className="capitalize">{order.orderType}</span>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <h3 className="font-bold mb-3">Update Order Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => onUpdateStatus(status)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                    order.status === status
                      ? getStatusColor(status)
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-bold mb-2">Order Notes</h3>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    'out-for-delivery': 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
