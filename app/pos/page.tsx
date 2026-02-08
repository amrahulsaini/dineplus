'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function POSRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/pos/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-slate-400">Redirecting to login...</p>
      </div>
    </div>
  );
}

