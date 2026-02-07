import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET all restaurants
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM restaurants WHERE is_active = true');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}

// POST create new restaurant
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const id = uuidv4();
    const query = `
      INSERT INTO restaurants (
        id, name, slug, email, phone, address, username, password,
        currency, tax_rate, timezone, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW())
    `;
    
    await pool.query(query, [
      id,
      data.name,
      data.slug,
      data.email,
      data.phone || null,
      data.address || null,
      data.username,
      data.password, // In production, hash this password!
      data.settings.currency,
      data.settings.taxRate,
      data.settings.timezone
    ]);
    
    // Fetch the created restaurant
    const [rows]: any = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Database error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username or slug already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 });
  }
}
