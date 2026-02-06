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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#242424] to-[#1a1a1a] p-4 animate-fadeIn">
      <div className="bg-[#242424]/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border-2 border-cream-700/30 animate-scaleIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cream-500 to-cream-600 rounded-3xl mb-4 shadow-2xl transform hover:scale-110 transition-all duration-300 hover:rotate-6 p-4">
            <Image src="/favicon.svg" alt="Loopwar" width={48} height={48} />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cream-300 to-cream-500 bg-clip-text text-transparent mb-2 tracking-tight">Loopwar</h1>
          <p className="text-cream-400 font-medium">Restaurant Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-cream-200 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cream-500 group-focus-within:text-cream-400 transition-colors duration-300" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border-2 border-cream-700/30 text-cream-200 rounded-2xl focus:ring-4 focus:ring-cream-600/30 focus:border-cream-500 outline-none transition-all duration-300 hover:border-cream-600/50"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-cream-200 mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cream-500 group-focus-within:text-cream-400 transition-colors duration-300" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border-2 border-cream-700/30 text-cream-200 rounded-2xl focus:ring-4 focus:ring-cream-600/30 focus:border-cream-500 outline-none transition-all duration-300 hover:border-cream-600/50"
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
            className="w-full bg-gradient-to-r from-cream-500 to-cream-600 hover:from-cream-400 hover:to-cream-500 text-[#1a1a1a] font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <div className="mt-8 p-5 bg-cream-600/20 rounded-2xl border-2 border-cream-600/30 shadow-lg">
          <p className="text-sm font-bold text-cream-200 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Demo Credentials:
          </p>
          <div className="text-xs text-cream-300 space-y-2 font-medium">
            <p className="bg-[#1a1a1a]/60 px-3 py-2 rounded-xl"><strong>Admin:</strong> admin@loopwar.com / admin123</p>
            <p className="bg-[#1a1a1a]/60 px-3 py-2 rounded-xl"><strong>User:</strong> user@example.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
