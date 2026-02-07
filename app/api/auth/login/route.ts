import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const query = `
      SELECT id, name, slug, email, phone, address, username, 
             currency, tax_rate, timezone, is_active, created_at
      FROM restaurants 
      WHERE username = ? AND password = ? AND is_active = true
    `;
    
    const [rows]: any = await pool.query(query, [username, password]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
