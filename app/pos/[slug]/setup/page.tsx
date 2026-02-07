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
        
        const response = await fetch(`https://loopwar.dev/api/restaurants/${resolvedParams.slug}`);
        
        if (!response.ok) {
          router.push('https://loopwar.dev/login');
          return;
        }
        
        const restaurantData = await response.json();
        setRestaurant(restaurantData);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        router.push('https://loopwar.dev/login');
      }
    };
    
    fetchRestaurant();
  }, [params, router]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
            Welcome to {restaurant.name}!
          </h1>
          <p className="text-gray-600 text-lg">Let's set up your restaurant step by step</p>
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
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Actions</h2>
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
              className="flex items-center gap-3 p-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all"
            >
              <span className="font-semibold">Back to Main Site</span>
            </a>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-300">
          <h3 className="font-bold text-lg mb-3 text-gray-900">💡 Getting Started Tips:</h3>
          <ul className="space-y-2 text-gray-700">
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
      className="block bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-orange-400 hover:shadow-2xl transition-all transform hover:scale-105"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${isComplete ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900">{title}</h3>
            {isComplete && <CheckCircle className="w-6 h-6 text-green-500" />}
          </div>
          <p className="text-gray-600 text-sm">{description}</p>
          <div className="mt-4 flex items-center gap-2 text-orange-600 font-semibold">
            <span>{isComplete ? 'View Details' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
