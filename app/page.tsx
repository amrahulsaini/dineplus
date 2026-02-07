'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Users, ShoppingBag, BarChart3, Settings, Zap, Shield, Store, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Store className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Loopwar</h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://pos.loopwar.dev/pos/login"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Access POS
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-semibold mb-8">
            <Sparkles className="w-5 h-5" />
            <span>Complete Restaurant Management Platform</span>
          </div>
          <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight">
            Transform Your Restaurant
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              With Modern POS
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Streamline operations, boost sales, and delight customers with our comprehensive restaurant management system.
            Loopwar is your all-in-one platform for managing restaurants efficiently. From orders to inventory, 
            analytics to menu management - everything you need in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-orange-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold rounded-2xl transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Complete Restaurant Solution</h2>
          <p className="text-xl text-gray-600">Everything you need to run your restaurant efficiently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Store className="w-8 h-8" />}
            title="Multi-Restaurant Support"
            description="Host multiple restaurants on one platform. Each restaurant gets its own POS, menu, and settings."
          />
          <FeatureCard
            icon={<ShoppingBag className="w-8 h-8" />}
            title="Order Management"
            description="Take orders, manage tables, track order status in real-time with an intuitive POS interface."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Menu Management"
            description="Create categories, add items with variations and addons. Customize pricing for each restaurant."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Analytics & Reports"
            description="Detailed insights into sales, popular items, revenue trends, and business performance."
          />
          <FeatureCard
            icon={<Settings className="w-8 h-8" />}
            title="Table Management"
            description="Organize tables, generate QR codes for contactless ordering, manage seating arrangements."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Inventory Tracking"
            description="Monitor stock levels, set low-stock alerts, track ingredient usage across all menu items."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Secure & Reliable"
            description="Each restaurant has unique credentials. Your data is secure with enterprise-grade security."
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-cream-600 to-cream-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-[#1a1a1a]">
              <h2 className="text-4xl font-bold mb-6">Why Choose Loopwar?</h2>
              <ul className="space-y-4">
                <BenefitItem text="Complete POS system with order tracking" />
                <BenefitItem text="Real-time inventory management" />
                <BenefitItem text="Detailed sales analytics and reports" />
                <BenefitItem text="Table management for dine-in orders" />
                <BenefitItem text="Multi-role access (Admin & Staff)" />
                <BenefitItem text="Easy menu customization" />
                <BenefitItem text="Customer order history" />
                <BenefitItem text="Responsive design for all devices" />
              </ul>
            </div>
            <div className="bg-[#1a1a1a]/40 backdrop-blur-lg p-8 rounded-3xl border-2 border-[#1a1a1a]/30">
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-6">Key Stats</h3>
              <div className="space-y-6">
                <StatItem number="250+" label="Features" />
                <StatItem number="8" label="Admin Modules" />
                <StatItem number="100%" label="Cloud-Based" />
                <StatItem number="24/7" label="Access Anytime" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-cream-600/20 to-cream-700/20 rounded-3xl p-12 text-center border-2 border-cream-600/30">
          <h2 className="text-4xl font-bold mb-4 text-cream-200">Ready to Transform Your Restaurant?</h2>
          <p className="text-xl text-cream-400 mb-8">Start managing your restaurant the smart way with Loopwar</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cream-500 to-cream-600 hover:from-cream-400 hover:to-cream-500 text-[#1a1a1a] font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Loopwar</span>
            </div>
            <div className="text-gray-400">
              © 2026 Loopwar. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="https://pos.loopwar.dev/pos/login" className="text-gray-400 hover:text-white transition-colors">
                Login
              </a>
              <a href="https://pos.loopwar.dev/pos/register" className="text-gray-400 hover:text-white transition-colors">
                Register
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'indigo' | 'purple';
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const bgColor = color === 'indigo' ? 'bg-indigo-100' : 'bg-purple-100';
  const textColor = color === 'indigo' ? 'text-indigo-600' : 'text-purple-600';

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-indigo-200">
      <div className={`${bgColor} ${textColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

    </div>
  );
}
