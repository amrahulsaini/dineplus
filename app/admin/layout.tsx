'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424]">
      {/* Header */}
      <header className="bg-gradient-to-r from-cream-600 to-cream-700 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a1a1a]/20 rounded-2xl flex items-center justify-center backdrop-blur-sm p-2">
                <Image src="/favicon.svg" alt="Loopwar" width={24} height={24} />
              </div>
              <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Loopwar Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#1a1a1a]/90 font-medium">
                Welcome, <strong className="text-[#1a1a1a]">{user.name}</strong>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a]/10 hover:bg-[#1a1a1a]/20 text-[#1a1a1a] rounded-2xl transition-all duration-300 backdrop-blur-sm border border-[#1a1a1a]/20 hover:border-[#1a1a1a]/30 hover:shadow-lg transform hover:scale-105"
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
        <aside className="w-64 bg-[#242424] shadow-xl min-h-[calc(100vh-4rem)] border-r-2 border-cream-700/20">
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
        <main className="flex-1 p-8 bg-gradient-to-br from-[#1a1a1a] to-[#242424]">
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
      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-cream-600/20 hover:to-cream-700/20 hover:text-cream-300 text-cream-400 transition-all duration-300 group border-2 border-transparent hover:border-cream-600/30 hover:shadow-lg transform hover:translate-x-1"
    >
      <span className="text-cream-500 group-hover:text-cream-300 transition-colors duration-300">{icon}</span>
      <span className="font-semibold group-hover:text-cream-200 transition-colors duration-300">{children}</span>
    </Link>
  );
}
