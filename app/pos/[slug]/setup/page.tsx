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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 py-12">
      <div className="absolute inset-0 bg-grid-orange-900/[0.02] bg-[size:50px_50px]"></div>
      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to {restaurant.name}!
          </h1>
          <p className="text-gray-600 text-lg">Let's set up your restaurant step by step</p>
        </div>

        {/* Setup Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Step 1: Menu & Categories */}
          <SetupCard
            title="1. Menu & Categories"
            description="Add categories and menu items all in one place"
            icon={<UtensilsCrossed className="w-8 h-8" />}
            isComplete={setupSteps.menu}
            href={`/pos/${slug}/menu`}
          />

          {/* Step 2: Tables */}
          <SetupCard
            title="2. Set Up Tables"
            description="Configure your restaurant tables and seating"
            icon={<Armchair className="w-8 h-8" />}
            isComplete={setupSteps.tables}
            href={`/pos/${slug}/tables`}
          />

          {/* Step 3: Inventory */}
          <SetupCard
            title="3. Add Inventory"
            description="Track ingredients and stock levels (Optional)"
            icon={<Package className="w-8 h-8" />}
            isComplete={setupSteps.inventory}
            href={`/pos/${slug}/inventory`}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-orange-200">
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
              className="flex items-center gap-3 p-4 bg-orange-100 text-gray-700 rounded-2xl hover:bg-orange-200 transition-all"
            >
              <span className="font-semibold">Back to Main Site</span>
            </a>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-200">
          <h3 className="font-bold text-lg mb-3 text-gray-900">💡 Getting Started Tips:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Go to Menu & Categories to add your food items</li>
            <li>✅ Create categories and add menu items in one place</li>
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
      className="block bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-200 hover:border-orange-500 hover:shadow-xl transition-all transform hover:scale-105"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${isComplete ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900">{title}</h3>
            {isComplete && <CheckCircle className="w-6 h-6 text-green-600" />}
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
