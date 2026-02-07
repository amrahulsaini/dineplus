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
    
    const query = 'SELECT id, restaurant_id, table_number, table_name, capacity, qr_code, is_active, created_at FROM tables WHERE restaurant_id = ? ORDER BY table_number ASC';
    const [rows]: any = await pool.query(query, [restaurantId]);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, tableNumber, tableName, capacity } = body;
    
    if (!restaurantId || !tableNumber) {
      return NextResponse.json({ error: 'Restaurant ID and table number required' }, { status: 400 });
    }
    
    const tableId = uuidv4();
    const qrCode = `${restaurantId}-T${tableNumber}`;
    const query = 'INSERT INTO tables (id, restaurant_id, table_number, table_name, capacity, qr_code, is_active) VALUES (?, ?, ?, ?, ?, ?, true)';
    
    await pool.query(query, [tableId, restaurantId, tableNumber, tableName || `Table ${tableNumber}`, capacity || 4, qrCode]);
    
    return NextResponse.json({
      id: tableId,
      restaurantId,
      tableNumber,
      tableName: tableName || `Table ${tableNumber}`,
      capacity: capacity || 4,
      qrCode,
      isActive: true
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
