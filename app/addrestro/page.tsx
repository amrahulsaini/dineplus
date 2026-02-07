'use client';

import { useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import { Building2, Mail, Phone, MapPin, Globe, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AddRestaurantPage() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    username: '',
    password: '',
    currency: 'USD',
    taxRate: '10',
    timezone: 'UTC'
  });

  const [success, setSuccess] = useState(false);

  const generateSlug = (name: string) => {
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const randomId = Math.floor(Math.random() * 1000);
    return `${baseSlug}-${randomId}`;
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const restaurant: Restaurant = {
      id: `rest-${Date.now()}`,
      name: formData.name,
      slug: formData.slug,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      username: formData.username,
      password: formData.password,
      isActive: true,
      createdAt: new Date().toISOString(),
      settings: {
        currency: formData.currency,
        taxRate: parseFloat(formData.taxRate),
        timezone: formData.timezone
      }
    };

    // Save to localStorage (you'll replace this with API call)
    const restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
    restaurants.push(restaurant);
    localStorage.setItem('restaurants', JSON.stringify(restaurants));

    setSuccess(true);
    setTimeout(() => {
      window.location.href = `/restro/${restaurant.slug}/setup`;
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
            Add New Restaurant
          </h1>
          <p className="text-gray-600">Set up a new restaurant on Loopwar platform</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-200">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-2xl text-green-800 font-semibold">
              ✅ Restaurant created successfully! Redirecting to setup...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
                placeholder="e.g., MTS Restaurant"
              />
            </div>

            {/* Slug (Auto-generated) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                URL Slug (Auto-generated)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-2xl font-mono text-sm"
                placeholder="mts-restaurant-123"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your POS URL: <span className="font-semibold text-orange-600">pos.loopwar.dev/{formData.slug}</span>
              </p>
            </div>

            {/* Email & Phone */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
                  placeholder="contact@restaurant.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
                rows={3}
                placeholder="Full restaurant address"
              />
            </div>

            {/* Login Credentials */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900">🔐 POS Login Credentials</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
                    placeholder="admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                These credentials will be used to login to your restaurant's POS system
              </p>
            </div>aceholder="Full restaurant address"
              />
            </div>

            {/* Settings */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({...formData, taxRate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">EST</option>
                  <option value="America/Los_Angeles">PST</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Asia/Kolkata">IST</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Link
                href="/"
                className="px-8 py-4 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold rounded-2xl transition-all duration-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-orange-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Create Restaurant & Continue to Setup
              </button>
            </div>
          </form>
        </div>

        {/* Next Steps Info */}
        <div className="mt-8 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6 border-2 border-orange-300">
          <h3 className="font-bold text-lg mb-3 text-gray-900">📋 Next Steps After Creation:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Add menu categories and items</li>
            <li>✅ Configure tables and seating</li>
            <li>✅ Set up variations and addons</li>
            <li>✅ Add inventory items</li>
            <li>✅ Launch your POS!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
