'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CustomerMenu from '@/components/CustomerMenu';

export default function MenuPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return <CustomerMenu />;
}
