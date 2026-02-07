import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const query = 'SELECT id, name, slug, email, phone, address, username, currency, tax_rate, timezone, is_active, created_at FROM restaurants WHERE slug = ? AND is_active = true';
    
    const [rows]: any = await pool.query(query, [params.slug]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }
    
    const restaurant = rows[0];
    
    return NextResponse.json({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      email: restaurant.email,
      phone: restaurant.phone,
      address: restaurant.address,
      username: restaurant.username,
      isActive: restaurant.is_active,
      createdAt: restaurant.created_at,
      settings: {
        currency: restaurant.currency,
        taxRate: restaurant.tax_rate,
        timezone: restaurant.timezone
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurant' }, { status: 500 });
  }
}
