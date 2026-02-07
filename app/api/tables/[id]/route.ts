import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tableNumber, tableName, capacity, isActive } = body;
    
    const query = 'UPDATE tables SET table_number = ?, table_name = ?, capacity = ?, is_active = ? WHERE id = ?';
    await pool.query(query, [tableNumber, tableName, capacity || 4, isActive !== false, id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = 'DELETE FROM tables WHERE id = ?';
    await pool.query(query, [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
