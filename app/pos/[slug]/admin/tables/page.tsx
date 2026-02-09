'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, QrCode, Download } from 'lucide-react';
import Link from 'next/link';
import QRCodeCanvas from 'qrcode';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  location: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

export default function TablesAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      
      // Check authentication
      const storedAuth = sessionStorage.getItem('admin_auth_' + resolvedParams.slug);
      if (!storedAuth) {
        router.push('/pos/' + resolvedParams.slug + '/admin');
        return;
      }
      
      const response = await fetch(`/api/restaurants/${resolvedParams.slug}`);
      
      if (!response.ok) {
        router.push('/pos/login');
        return;
      }
      
      const restaurantData = await response.json();
      setRestaurant(restaurantData);
      
      await loadTables(restaurantData.id);
      setLoading(false);
    };
    
    init();
  }, [params, router]);

  const loadTables = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/tables?restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setTables(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-500 text-green-800';
      case 'occupied': return 'bg-red-100 border-red-500 text-red-800';
      case 'reserved': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const showQRCode = async (table: Table) => {
    setSelectedTable(table);
    const url = `${window.location.origin}/${restaurant?.slug}/${table.table_number}`;
    setQrCodeUrl(url);
    
    // Generate QR code on canvas
    setTimeout(() => {
      if (canvasRef.current) {
        QRCodeCanvas.toCanvas(canvasRef.current, url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }
    }, 100);
  };

  const downloadQRCode = () => {
    if (canvasRef.current && selectedTable) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `table-${selectedTable.table_number}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/pos/${restaurant.slug}/admin`} className="p-2 hover:bg-white/20 rounded-lg">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Table Management</h1>
                <p className="text-orange-100">{restaurant.name}</p>
              </div>
            </div>
            <Link
              href={`/pos/${restaurant.slug}/admin/create-order`}
              className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl hover:shadow-xl font-bold"
            >
              <Plus className="w-5 h-5" />
              New Order
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <p className="text-gray-600">Total Tables</p>
            <p className="text-4xl font-bold text-gray-900">{tables.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-gray-600">Available</p>
            <p className="text-4xl font-bold text-green-600">{availableTables}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
            <p className="text-gray-600">Occupied</p>
            <p className="text-4xl font-bold text-red-600">{occupiedTables}</p>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Tables</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map(table => (
              <div
                key={table.id}
                className={`border-4 rounded-2xl p-6 text-center hover:shadow-xl transition-all ${getStatusColor(table.status)}`}
              >
                <div className="text-3xl font-bold mb-2">T{table.table_number}</div>
                <div className="text-sm font-semibold capitalize mb-1">{table.status}</div>
                <div className="text-xs text-gray-600">{table.capacity} seats</div>
                {table.location && (
                  <div className="text-xs text-gray-500 mt-1">{table.location}</div>
                )}
                <button
                  onClick={() => showQRCode(table)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm"
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
              </div>
            ))}
          </div>

          {tables.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tables configured yet</p>
              <Link
                href={`/pos/${restaurant.slug}/tables`}
                className="mt-4 inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
              >
                Add Tables
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedTable(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Table {selectedTable.table_number} QR Code</h2>
            <p className="text-gray-600 mb-6">Scan to view menu and order</p>
            
            <div className="bg-white p-6 rounded-2xl border-4 border-gray-200 mb-6 flex justify-center">
              <canvas ref={canvasRef}></canvas>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-xs text-gray-600 break-all">{qrCodeUrl}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={downloadQRCode}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-xl font-bold"
              >
                <Download className="w-5 h-5" />
                Download QR
              </button>
              <button
                onClick={() => setSelectedTable(null)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
