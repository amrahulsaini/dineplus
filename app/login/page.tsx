'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get all restaurants from localStorage
      const restaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
      
      // Find restaurant with matching credentials
      const restaurant = restaurants.find((r: any) => 
        r.username === username && r.password === password
      );

      if (restaurant) {
        // Store logged-in restaurant
        localStorage.setItem('currentRestaurant', JSON.stringify(restaurant));
        // Redirect to restaurant dashboard
        router.push(`/restro/${restaurant.slug}/setup`);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-red-50 p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border-2 border-orange-200 animate-scaleIn">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant POS Login</h1>
            <p className="text-gray-600">Sign in with your restaurant credentials</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-2xl hover:shadow-xl transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In to POS'}
          </button>

          <div className="text-center space-y-3">
            <p className="text-gray-600">
              Don't have a restaurant account?{' '}
              <Link href="https://loopwar.dev/addrestro" className="text-orange-600 hover:text-orange-700 font-semibold">
                Register Restaurant
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              <Link href="https://loopwar.dev" className="hover:text-orange-600">
                ← Back to Home
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-red-50 p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border-2 border-orange-200 animate-scaleIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl mb-4 shadow-2xl transform hover:scale-110 transition-all duration-300 hover:rotate-6 p-4">
            <Image src="/favicon.svg" alt="Loopwar" width={48} height={48} />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2 tracking-tight">Loopwar</h1>
          <p className="text-gray-600 font-medium">Restaurant Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500 group-focus-within:text-orange-600 transition-colors duration-300" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 text-gray-900 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 hover:border-orange-400"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500 group-focus-within:text-orange-600 transition-colors duration-300" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-300 text-gray-900 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 hover:border-orange-400"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl animate-fadeIn font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <div className="mt-8 p-5 bg-orange-50 rounded-2xl border-2 border-orange-200 shadow-lg">
          <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-orange-500" />
            Demo Credentials:
          </p>
          <div className="text-xs text-gray-700 space-y-2 font-medium">
            <p className="bg-white px-3 py-2 rounded-xl border border-orange-200"><strong>Admin:</strong> admin@loopwar.com / admin123</p>
            <p className="bg-white px-3 py-2 rounded-xl border border-orange-200"><strong>User:</strong> user@example.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
