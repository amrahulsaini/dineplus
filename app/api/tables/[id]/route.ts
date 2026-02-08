import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tableNumber, tableName, capacity, status } = body;
    
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    
    if (tableNumber !== undefined) {
      updates.push('table_number = ?');
      values.push(tableNumber);
    }
    
    if (tableName !== undefined) {
      updates.push('location = ?');
      values.push(tableName);
    }
    
    if (capacity !== undefined) {
      updates.push('capacity = ?');
      values.push(capacity);
    }
    
    if (status !== undefined) {
      // Allow manual status change: available, occupied, reserved
      if (['available', 'occupied', 'reserved'].includes(status)) {
        // Check if table has active orders before setting to available
        if (status === 'available') {
          const [activeOrders]: any = await pool.query(
            'SELECT COUNT(*) as count FROM orders WHERE table_id = ? AND status NOT IN ("delivered", "cancelled", "completed")',
            [id]
          );
          
          if (activeOrders[0].count > 0) {
            return NextResponse.json({ 
              error: 'Cannot set table to available - table has active orders' 
            }, { status: 400 });
          }
        }
        
        updates.push('status = ?');
        values.push(status);
      }
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }
    
    const query = `UPDATE restaurant_tables SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);
    
    await pool.query(query, values);
    
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
    const query = 'DELETE FROM restaurant_tables WHERE id = ?';
    await pool.query(query, [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
