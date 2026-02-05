'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { initializeDemoData } from '@/lib/demoData';
import CustomerMenu from '@/components/CustomerMenu';

export default function Home() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData();

    // Redirect admins to dashboard
    if (user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isAdmin, router]);

  if (!user) {
    router.push('/login');
    return null;
  }

  if (isAdmin) {
    return null; // Will redirect to admin
  }

  return <CustomerMenu />;
}
