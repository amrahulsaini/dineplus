'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  FolderTree, 
  Armchair, 
  Package, 
  BarChart3, 
  Settings, 
  Home, 
  LogOut,
  Menu
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    } else if (mounted && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, router, mounted]);

  if (!mounted || !user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-600 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">DinePlus Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/90 font-medium">
                Welcome, <strong className="text-white">{user.name}</strong>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:shadow-lg transform hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-xl min-h-[calc(100vh-4rem)] border-r-2 border-gray-200">
          <nav className="p-4 space-y-2">
            <NavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />}>Dashboard</NavLink>
            <NavLink href="/admin/orders" icon={<ShoppingBag className="w-5 h-5" />}>Orders</NavLink>
            <NavLink href="/admin/menu" icon={<UtensilsCrossed className="w-5 h-5" />}>Menu Management</NavLink>
            <NavLink href="/admin/categories" icon={<FolderTree className="w-5 h-5" />}>Categories</NavLink>
            <NavLink href="/admin/tables" icon={<Armchair className="w-5 h-5" />}>Tables</NavLink>
            <NavLink href="/admin/inventory" icon={<Package className="w-5 h-5" />}>Inventory</NavLink>
            <NavLink href="/admin/reports" icon={<BarChart3 className="w-5 h-5" />}>Reports</NavLink>
            <NavLink href="/admin/settings" icon={<Settings className="w-5 h-5" />}>Settings</NavLink>
            <div className="pt-4 mt-4 border-t-2 border-gray-200">
              <NavLink href="/" icon={<Home className="w-5 h-5" />}>View Customer Site</NavLink>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600 transition-all duration-300 group border-2 border-transparent hover:border-orange-200 hover:shadow-lg transform hover:translate-x-1"
    >
      <span className="text-gray-600 group-hover:text-orange-600 transition-colors duration-300">{icon}</span>
      <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors duration-300">{children}</span>
    </Link>
  );
}
