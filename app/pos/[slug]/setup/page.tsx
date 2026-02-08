'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, UtensilsCrossed, Armchair, Package, BarChart3 } from 'lucide-react';

interface SetupPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
}

export default function POSSetupPage({ params }: SetupPageProps) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [setupSteps, setSetupSteps] = useState({
    categories: false,
    menu: false,
    tables: false,
    inventory: false
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const resolvedParams = await params;
        setSlug(resolvedParams.slug);
        
        const response = await fetch(`/api/restaurants/${resolvedParams.slug}`);
        
        if (!response.ok) {
          router.push('/pos/login');
          return;
        }
        
        const restaurantData = await response.json();
        setRestaurant(restaurantData);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        router.push('/pos/login');
      }
    };
    
    fetchRestaurant();
  }, [params, router]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to {restaurant.name}!
          </h1>
          <p className="text-slate-400 text-lg">Let's set up your restaurant step by step</p>
        </div>

        {/* Setup Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Step 1: Categories */}
          <SetupCard
            title="1. Add Categories"
            description="Create menu categories like Starters, Main Course, Beverages"
            icon={<UtensilsCrossed className="w-8 h-8" />}
            isComplete={setupSteps.categories}
            href={`/pos/${slug}/categories`}
          />

          {/* Step 2: Menu Items */}
          <SetupCard
            title="2. Add Menu Items"
            description="Add dishes with prices, variations, and addons"
            icon={<UtensilsCrossed className="w-8 h-8" />}
            isComplete={setupSteps.menu}
            href={`/pos/${slug}/menu`}
          />

          {/* Step 3: Tables */}
          <SetupCard
            title="3. Set Up Tables"
            description="Configure your restaurant tables and seating"
            icon={<Armchair className="w-8 h-8" />}
            isComplete={setupSteps.tables}
            href={`/pos/${slug}/tables`}
          />

          {/* Step 4: Inventory */}
          <SetupCard
            title="4. Add Inventory"
            description="Track ingredients and stock levels (Optional)"
            icon={<Package className="w-8 h-8" />}
            isComplete={setupSteps.inventory}
            href={`/pos/${slug}/inventory`}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-white">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href={`/pos/${slug}/dashboard`}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:shadow-xl transition-all transform hover:scale-105"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="font-semibold">Go to Dashboard</span>
            </Link>
            
            <a
              href="https://loopwar.dev"
              className="flex items-center gap-3 p-4 bg-slate-700 text-slate-300 rounded-2xl hover:bg-slate-600 transition-all"
            >
              <span className="font-semibold">Back to Main Site</span>
            </a>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <h3 className="font-bold text-lg mb-3 text-white">💡 Getting Started Tips:</h3>
          <ul className="space-y-2 text-slate-300">
            <li>✅ Start by adding at least 2-3 categories</li>
            <li>✅ Add 5-10 menu items with proper pricing</li>
            <li>✅ Configure your tables for better order management</li>
            <li>✅ Inventory is optional but helps track stock</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface SetupCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
  href: string;
}

function SetupCard({ title, description, icon, isComplete, href }: SetupCardProps) {
  return (
    <Link
      href={href}
      className="block bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 hover:border-orange-500 hover:shadow-xl transition-all transform hover:scale-105"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${isComplete ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-white">{title}</h3>
            {isComplete && <CheckCircle className="w-6 h-6 text-green-400" />}
          </div>
          <p className="text-slate-400 text-sm">{description}</p>
          <div className="mt-4 flex items-center gap-2 text-orange-400 font-semibold">
            <span>{isComplete ? 'View Details' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
