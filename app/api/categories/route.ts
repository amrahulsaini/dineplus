import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  console.log('📥 Categories GET API called');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get('restaurantId');
    
    console.log('🔍 Restaurant ID:', restaurantId);
    
    if (!restaurantId) {
      console.error('❌ Missing restaurant ID');
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }
    
    const query = 'SELECT id, name, description, display_order, is_active, created_at FROM menu_categories WHERE restaurant_id = ? ORDER BY display_order ASC';
    console.log('📊 Executing query for restaurant:', restaurantId);
    
    const [rows]: any = await pool.query(query, [restaurantId]);
    
    console.log('✅ Found', rows.length, 'categories');
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('❌ Database error in categories GET:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('📥 Categories POST API called');
  
  try {
    const body = await request.json();
    console.log('📦 Request body:', body);
    
    const { restaurantId, name, description, displayOrder } = body;
    
    if (!restaurantId || !name) {
      console.error('❌ Missing required fields');
      return NextResponse.json({ error: 'Restaurant ID and name required' }, { status: 400 });
    }
    
    const categoryId = uuidv4();
    console.log('🆔 Generated category ID:', categoryId);
    
    const query = 'INSERT INTO menu_categories (id, restaurant_id, name, description, display_order, is_active) VALUES (?, ?, ?, ?, ?, true)';
    console.log('📊 Executing query:', query);
    console.log('📊 Query params:', [categoryId, restaurantId, name, description || null, displayOrder || 0]);
    
    await pool.query(query, [categoryId, restaurantId, name, description || null, displayOrder || 0]);
    
    console.log('✅ Category created successfully!');
    
    return NextResponse.json({
      id: categoryId,
      restaurantId,
      name,
      description,
      displayOrder: displayOrder || 0,
      isActive: true
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Database error in categories POST:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      error: 'Failed to create category', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
