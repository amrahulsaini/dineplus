'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Utensils, 
  Table2, 
  Package, 
  FileText,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X
} from 'lucide-react';

export default function AdminLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [slug, setSlug] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      
      // Check authentication
      const storedAuth = sessionStorage.getItem(`admin_auth_${resolvedParams.slug}`);
      if (!storedAuth && !pathname?.includes('/admin/login')) {
        setLoading(false);
        return;
      }

      // Load restaurant name
      try {
        const response = await fetch(`/api/restaurants/${resolvedParams.slug}`);
        if (response.ok) {
          const data = await response.json();
          setRestaurantName(data.name);
        }
      } catch (error) {
        console.error('Error loading restaurant:', error);
      }
      
      setLoading(false);
    };
    
    init();
  }, [params, pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem(`admin_auth_${slug}`);
    router.push(`/pos/${slug}/login`);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: `/pos/${slug}/admin` },
    { icon: ShoppingCart, label: 'Create Order', href: `/pos/${slug}/admin/create-order` },
    { icon: FileText, label: 'Orders', href: `/pos/${slug}/admin/orders` },
    { icon: Utensils, label: 'Menu Items', href: `/pos/${slug}/admin/menu` },
    { icon: Table2, label: 'Tables', href: `/pos/${slug}/admin/tables` },
    { icon: Package, label: 'Inventory', href: `/pos/${slug}/admin/inventory` },
    { icon: Settings, label: 'Settings', href: `/pos/${slug}/admin/settings` },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 z-50 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">{restaurantName}</h1>
          <p className="text-xs text-orange-100">Admin Panel</p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-white/20 rounded-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <h1 className="text-2xl font-bold">{restaurantName}</h1>
          <p className="text-sm text-orange-100">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
