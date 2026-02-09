import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Get order details
    const [orders]: any = await pool.query(
      `SELECT o.*, rt.table_number 
       FROM orders o 
       LEFT JOIN restaurant_tables rt ON o.table_id = rt.id 
       WHERE o.id = ?`,
      [id]
    );
    
    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const order = orders[0];
    
    // Get order items
    const [items]: any = await pool.query(
      `SELECT oi.*, 
       (SELECT JSON_ARRAYAGG(JSON_OBJECT('addon_name', addon_name, 'addon_price', addon_price))
        FROM order_item_addons WHERE order_item_id = oi.id) as addons
       FROM order_items oi 
       WHERE oi.order_id = ?`,
      [id]
    );
    
    order.items = items;
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, paymentStatus, paymentMethod } = body;
    
    let query = 'UPDATE orders SET ';
    const updates: string[] = [];
    const values: any[] = [];
    
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    
    if (paymentStatus) {
      updates.push('payment_status = ?');
      values.push(paymentStatus);
    }
    
    if (paymentMethod) {
      updates.push('payment_method = ?');
      values.push(paymentMethod);
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }
    
    query += updates.join(', ') + ' WHERE id = ?';
    values.push(id);
    
    await pool.query(query, values);
    
    // Update table status back to available ONLY when admin sets order to 'completed'
    if (status && status === 'completed') {
      // Get the table_id from the order
      const [orders]: any = await pool.query('SELECT table_id FROM orders WHERE id = ?', [id]);
      if (orders.length > 0 && orders[0].table_id) {
        await pool.query(
          'UPDATE restaurant_tables SET status = "available" WHERE id = ?',
          [orders[0].table_id]
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Get table_id before deleting to free up the table
    const [orders]: any = await pool.query('SELECT table_id FROM orders WHERE id = ?', [id]);
    const tableId = orders.length > 0 ? orders[0].table_id : null;
    
    // Delete order (cascade will delete order items and addons)
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    
    // If order had a table, set it back to available
    if (tableId) {
      await pool.query(
        'UPDATE restaurant_tables SET status = "available" WHERE id = ?',
        [tableId]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
