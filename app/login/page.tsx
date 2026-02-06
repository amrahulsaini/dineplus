'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = login(email, password);
    if (user) {
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/menu');
      }
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 animate-fadeIn">
      <div className="glass backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border-2 border-white/40 animate-scaleIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl mb-4 shadow-2xl transform hover:scale-110 transition-all duration-300 hover:rotate-6 p-4">
            <Image src="/favicon.svg" alt="Loopwar" width={48} height={48} />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 tracking-tight">Loopwar</h1>
          <p className="text-gray-600 font-medium">Restaurant Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300"
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
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300"
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
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <div className="mt-8 p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 shadow-lg">
          <p className="text-sm font-bold text-orange-900 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Demo Credentials:
          </p>
          <div className="text-xs text-orange-800 space-y-2 font-medium">
            <p className="bg-white/60 px-3 py-2 rounded-xl"><strong>Admin:</strong> admin@loopwar.com / admin123</p>
            <p className="bg-white/60 px-3 py-2 rounded-xl"><strong>User:</strong> user@example.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
