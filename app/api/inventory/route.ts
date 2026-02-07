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
    
    const query = 'SELECT id, restaurant_id, item_name, unit, current_stock, min_stock_level, unit_price, created_at FROM inventory WHERE restaurant_id = ? ORDER BY item_name ASC';
    const [rows]: any = await pool.query(query, [restaurantId]);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, itemName, unit, currentStock, minStockLevel, unitPrice } = body;
    
    if (!restaurantId || !itemName || !unit) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }
    
    const inventoryId = uuidv4();
    const query = 'INSERT INTO inventory (id, restaurant_id, item_name, unit, current_stock, min_stock_level, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    await pool.query(query, [inventoryId, restaurantId, itemName, unit, currentStock || 0, minStockLevel || 0, unitPrice || 0]);
    
    return NextResponse.json({
      id: inventoryId,
      restaurantId,
      itemName,
      unit,
      currentStock: currentStock || 0,
      minStockLevel: minStockLevel || 0,
      unitPrice: unitPrice || 0
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
