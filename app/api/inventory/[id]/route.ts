import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itemName, unit, currentStock, minStockLevel, unitPrice } = body;
    
    const query = 'UPDATE inventory SET item_name = ?, unit = ?, current_stock = ?, min_stock_level = ?, unit_price = ? WHERE id = ?';
    await pool.query(query, [itemName, unit, currentStock || 0, minStockLevel || 0, unitPrice || 0, id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = 'DELETE FROM inventory WHERE id = ?';
    await pool.query(query, [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
