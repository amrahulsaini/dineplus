import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get('restaurantId');
    const limit = searchParams.get('limit') || '50';
    const status = searchParams.get('status');
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }
    
    let query = `SELECT o.*, rt.table_number 
                 FROM orders o 
                 LEFT JOIN restaurant_tables rt ON o.table_id = rt.id 
                 WHERE o.restaurant_id = ?`;
    const params: any[] = [restaurantId];
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [rows]: any = await pool.query(query, params);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, restaurantSlug, tableId, customerName, customerPhone, orderType, items, subtotal, tax, discount, total, paymentMethod, notes } = body;
    
    if (!restaurantId || !restaurantSlug || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }
    
    const orderId = uuidv4();
    
    // Insert order
    const orderQuery = `INSERT INTO orders (id, restaurant_id, restaurant_slug, table_id, customer_name, customer_phone, 
                        order_type, status, subtotal, tax, discount, total, payment_method, payment_status, notes) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, 'pending', ?)`;
    
    await pool.query(orderQuery, [
      orderId, restaurantId, restaurantSlug, tableId || null, customerName || null, customerPhone || null,
      orderType, subtotal, tax || 0, discount || 0, total, paymentMethod || 'cash', notes || null
    ]);
    
    // Insert order items
    for (const item of items) {
      const orderItemId = uuidv4();
      const itemQuery = `INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, quantity, unit_price, 
                         variation_id, variation_name, variation_price, total, special_instructions)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      await pool.query(itemQuery, [
        orderItemId, orderId, item.menuItemId, item.name, item.quantity, item.unitPrice,
        item.variationId || null, item.variationName || null, item.variationPrice || 0,
        item.total, item.specialInstructions || null
      ]);
      
      // Insert addons if any
      if (item.addons && Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          const addonId = uuidv4();
          await pool.query(
            'INSERT INTO order_item_addons (id, order_item_id, addon_id, addon_name, addon_price) VALUES (?, ?, ?, ?, ?)',
            [addonId, orderItemId, addon.id, addon.name, addon.price]
          );
        }
      }
    }
    
    return NextResponse.json({ id: orderId, status: 'pending' }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
