'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Store, Lock, User, AlertCircle } from 'lucide-react';

export default function POSLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {