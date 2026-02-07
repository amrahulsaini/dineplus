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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError('Invalid username or password');
        setLoading(false);
        return;
      }

      const restaurant = await response.json();
      
      // Redirect to POS website dashboard
      window.location.href = `https://pos.loopwar.dev/pos/${restaurant.slug}/setup`;
    } catch (err) {
      setError('Login failed. Please try again.');
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
