import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items data' }, { status: 400 });
    }

    // Get current order details
    const [orders]: any = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];
    let newSubtotal = Number(order.subtotal) || 0;

    // Insert new order items
    for (const item of items) {
      const orderItemId = uuidv4();
      const itemTotal = (Number(item.base_price) || 0) * (item.quantity || 1);
      
      const itemQuery = `INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, quantity, unit_price, 
                         variation_id, variation_name, variation_price, total, special_instructions)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      await pool.query(itemQuery, [
        orderItemId,
        id,
        item.id,
        item.name,
        item.quantity || 1,
        Number(item.base_price) || 0,
        null,
        null,
        0,
        itemTotal,
        null
      ]);

      newSubtotal += itemTotal;
    }

    // Recalculate totals
    const taxRate = Number(order.tax) / Number(order.subtotal);
    const newTax = newSubtotal * taxRate;
    const newTotal = newSubtotal + newTax - Number(order.discount);

    // Update order totals
    await pool.query(
      'UPDATE orders SET subtotal = ?, tax = ?, total = ? WHERE id = ?',
      [newSubtotal, newTax, newTotal, id]
    );

    return NextResponse.json({ success: true, newTotal });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to add items to order' }, { status: 500 });
  }
}
