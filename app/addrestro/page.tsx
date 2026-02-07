'use client';

import { useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import { Building2, Mail, Phone, MapPin, Globe, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AddRestaurantPage() {
  const [formData, setFormData] = useState({