'use client';

import { useEffect, useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, UtensilsCrossed, Armchair, Package, BarChart3 } from 'lucide-react';

interface SetupPageProps {
  params: {
    slug: string;
  };
}

export default function RestaurantSetupPage({ params }: SetupPageProps) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [setupSteps, setSetupSteps] = useState({
    categories: false,
    menu: false,
    tables: false,
    inventory: false
  });

  useEffect(() => {
    // Load restaurant from localStorage
    const restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
    const found = restaurants.find((r: Restaurant) => r.slug === params.slug);
    
    if (!found) {
      router.push('/addrestro');
      return;
    }
    
    setRestaurant(found);
  }, [params.slug, router]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <div className="mt-4 inline-block px-6 py-2 bg-orange-100 rounded-full">
            <span className="text-orange-600 font-semibold">Your POS URL: </span>
            <span className="font-mono text-orange-800">pos.loopwar.dev/{restaurant.slug}</span>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Step 1: Categories */}
          <SetupCard
            title="1. Add Categories"
            description="Create menu categories like Starters, Main Course, Beverages"
            icon={<UtensilsCrossed className="w-8 h-8" />}
            isComplete={setupSteps.categories}
            href={`/restro/${restaurant.slug}/categories`}
          />

          {/* Step 2: Menu Items */}
          <SetupCard
            title="2. Add Menu Items"
            description="Add dishes with prices, variations, and addons"
            icon={<UtensilsCrossed className="w-8 h-8" />}
            isComplete={setupSteps.menu}
            href={`/restro/${restaurant.slug}/menu`}
          />

          {/* Step 3: Tables */}
          <SetupCard
            title="3. Set Up Tables"
            description="Configure your restaurant tables and seating"
            icon={<Armchair className="w-8 h-8" />}
            isComplete={setupSteps.tables}
            href={`/restro/${restaurant.slug}/tables`}
          />

          {/* Step 4: Inventory */}
          <SetupCard
            title="4. Add Inventory"
            description="Track ingredients and stock levels (Optional)"
            icon={<Package className="w-8 h-8" />}
            isComplete={setupSteps.inventory}
            href={`/restro/${restaurant.slug}/inventory`}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href={`/restro/${restaurant.slug}/dashboard`}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:shadow-xl transition-all transform hover:scale-105"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="font-semibold">Go to Dashboard</span>
            </Link>
            
            <Link
              href={`https://pos.loopwar.dev/${restaurant.slug}`}
              target="_blank"
              className="flex items-center gap-3 p-4 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl hover:bg-orange-50 transition-all"
            >
              <ArrowRight className="w-6 h-6" />
              <span className="font-semibold">Open POS</span>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 p-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all"
            >
              <span className="font-semibold">Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-300">
          <h3 className="font-bold text-lg mb-3 text-gray-900">💡 Getting Started Tips:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Start by adding at least 2-3 categories</li>
            <li>✅ Add menu items with clear descriptions and prices</li>
            <li>✅ Set up variations (Small/Medium/Large) for flexible pricing</li>
            <li>✅ Add popular addons to increase order value</li>
            <li>✅ Configure tables for dine-in orders</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SetupCard({ 
  title, 
  description, 
  icon, 
  isComplete, 
  href 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  isComplete: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 transform hover:-translate-y-2 relative"
    >
      {isComplete && (
        <div className="absolute top-4 right-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
          <div className="mt-3 flex items-center text-orange-600 font-semibold">
            <span>Set up now</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>
      </div>
    </Link>
  );
}
