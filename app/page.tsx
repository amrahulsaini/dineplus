'use client';

import { useEffect } from 'react';
import { initializeDemoData } from '@/lib/demoData';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Users, ShoppingBag, BarChart3, Settings, Zap, Shield } from 'lucide-react';

export default function Home() {
  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-orange-200 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image src="/favicon.svg" alt="Loopwar Logo" width={40} height={40} className="rounded-xl" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Loopwar</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-orange-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl mb-6 shadow-2xl">
            <Image src="/favicon.svg" alt="Loopwar" width={48} height={48} />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent tracking-tight">
            Complete Restaurant Management
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
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
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Everything You Need</h2>
          <p className="text-xl text-gray-600">Powerful features to run your restaurant smoothly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ShoppingBag className="w-8 h-8" />}
            title="Order Management"
            description="Track and manage orders in real-time. Handle dine-in, takeaway, and delivery orders efficiently."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Customer Portal"
            description="Beautiful customer interface for browsing menu, placing orders, and tracking deliveries."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Analytics & Reports"
            description="Detailed insights into sales, popular items, revenue trends, and business performance."
          />
          <FeatureCard
            icon={<Settings className="w-8 h-8" />}
            title="Menu Management"
            description="Easy-to-use interface to add, edit, and organize your menu items and categories."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Inventory Control"
            description="Keep track of stock levels, get low stock alerts, and manage ingredients efficiently."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Secure & Fast"
            description="Built with modern technology for speed and security. Your data is always protected."
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
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image src="/favicon.svg" alt="Loopwar Logo" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold">Loopwar</span>
          </div>
          <p className="text-gray-400">Complete Restaurant Management System</p>
          <p className="text-gray-500 mt-4">© 2026 Loopwar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-500 transform hover:-translate-y-2">
      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle className="w-6 h-6 flex-shrink-0" />
      <span className="text-lg">{text}</span>
    </li>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-orange-600 mb-1">{number}</div>
      <div className="text-gray-700">{label}</div>
    </div>
  );
}
