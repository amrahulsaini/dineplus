'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Users, ShoppingBag, BarChart3, Settings, Zap, Shield, Store, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Store className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Loopwar</h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://pos.loopwar.dev/pos/login"
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-orange-600 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full font-semibold mb-8">
            <Sparkles className="w-5 h-5" />
            <span>Complete Restaurant Management Platform</span>
          </div>
          <h1 className="text-6xl font-black text-gray-900 mb-6 leading-tight">
            Transform Your Restaurant
            <span className="block bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              With Modern POS
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Streamline operations, boost sales, and delight customers with our comprehensive restaurant management system.
            Loopwar is your all-in-one platform for managing restaurants efficiently. From orders to inventory, 
            analytics to menu management - everything you need in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://pos.loopwar.dev/pos/register"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-orange-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#features"
              className="px-8 py-4 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold rounded-2xl transition-all duration-300"
            >
              Learn More
            </a>
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
            icon={<ShoppingBag className="w-8 h-8" />}
            title="Smart Menu Management"
            description="Create and organize your menu with categories, variations, and pricing options"
            color="orange"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Table Management"
            description="Manage dining areas, table assignments, and seating capacity with QR codes"
            color="red"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Real-time Analytics"
            description="Track sales, inventory, and performance with comprehensive dashboards"
            color="orange"
          />
          <FeatureCard
            icon={<Settings className="w-8 h-8" />}
            title="Inventory Tracking"
            description="Monitor stock levels, get low-stock alerts, and manage suppliers"
            color="red"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Fast & Reliable"
            description="Lightning-fast order processing with offline support and cloud sync"
            color="orange"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Secure & Private"
            description="Enterprise-grade security with encrypted data and regular backups"
            color="red"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Why Choose Loopwar?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Complete POS system with order tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Real-time inventory management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Detailed sales analytics and reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Table management for dine-in orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Multi-role access (Admin & Staff)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Easy menu customization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Customer order history</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Responsive design for all devices</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/60 backdrop-blur-lg p-8 rounded-3xl border-2 border-orange-200 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Stats</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-orange-600">250+</div>
                  <div className="text-gray-600">Features</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-red-600">8</div>
                  <div className="text-gray-600">Admin Modules</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-orange-600">100%</div>
                  <div className="text-gray-600">Cloud-Based</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-red-600">24/7</div>
                  <div className="text-gray-600">Access Anytime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-12 text-center border-2 border-orange-200">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Transform Your Restaurant?</h2>
          <p className="text-xl text-gray-600 mb-8">Start managing your restaurant the smart way with Loopwar</p>
          <a
            href="https://pos.loopwar.dev/pos/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-orange-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
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
  color: 'orange' | 'red';
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const bgColor = color === 'orange' ? 'bg-orange-100' : 'bg-red-100';
  const textColor = color === 'orange' ? 'text-orange-600' : 'text-red-600';

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-200">
      <div className={`${bgColor} ${textColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
