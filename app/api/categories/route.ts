import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get('restaurantId');
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }
    
    const query = 'SELECT id, name, description, display_order, is_active, created_at FROM categories WHERE restaurant_id = ? ORDER BY display_order ASC';
    const [rows]: any = await pool.query(query, [restaurantId]);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, name, description, displayOrder } = body;
    
    if (!restaurantId || !name) {
      return NextResponse.json({ error: 'Restaurant ID and name required' }, { status: 400 });
    }
    
    const categoryId = uuidv4();
    const query = 'INSERT INTO categories (id, restaurant_id, name, description, display_order, is_active) VALUES (?, ?, ?, ?, ?, true)';
    
    await pool.query(query, [categoryId, restaurantId, name, description || null, displayOrder || 0]);
    
    return NextResponse.json({
      id: categoryId,
      restaurantId,
      name,
      description,
      displayOrder: displayOrder || 0,
      isActive: true
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
