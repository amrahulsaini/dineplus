import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get('restaurantId');
    const categoryId = searchParams.get('categoryId');
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }
    
    let query = `SELECT m.id, m.restaurant_id, m.category_id, m.name, m.description, m.base_price, 
                 m.image_url, m.is_active, m.is_veg, m.preparation_time, m.created_at,
                 c.name as category_name
                 FROM menu_items m 
                 LEFT JOIN categories c ON m.category_id = c.id 
                 WHERE m.restaurant_id = ?`;
    const params: any[] = [restaurantId];
    
    if (categoryId) {
      query += ' AND m.category_id = ?';
      params.push(categoryId);
    }
    
    query += ' ORDER BY c.display_order ASC, m.name ASC';
    
    const [rows]: any = await pool.query(query, params);
    
    // Get variations for each menu item
    for (const item of rows) {
      const [variations]: any = await pool.query(
        'SELECT id, name, price, is_default FROM menu_variations WHERE menu_item_id = ? ORDER BY price ASC',
        [item.id]
      );
      item.variations = variations;
      
      // Get addons
      const [addons]: any = await pool.query(
        'SELECT id, name, price FROM menu_addons WHERE menu_item_id = ? ORDER BY name ASC',
        [item.id]
      );
      item.addons = addons;
    }
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, categoryId, name, description, basePrice, isVeg, preparationTime, variations, addons } = body;
    
    if (!restaurantId || !categoryId || !name || basePrice === undefined) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }
    
    const menuItemId = uuidv4();
    const query = `INSERT INTO menu_items (id, restaurant_id, category_id, name, description, base_price, is_veg, preparation_time, is_active) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)`;
    
    await pool.query(query, [menuItemId, restaurantId, categoryId, name, description || null, basePrice, isVeg || false, preparationTime || 15]);
    
    // Add variations
    if (variations && Array.isArray(variations)) {
      for (const variation of variations) {
        const variationId = uuidv4();
        await pool.query(
          'INSERT INTO menu_variations (id, menu_item_id, name, price, is_default) VALUES (?, ?, ?, ?, ?)',
          [variationId, menuItemId, variation.name, variation.price, variation.isDefault || false]
        );
      }
    }
    
    // Add addons
    if (addons && Array.isArray(addons)) {
      for (const addon of addons) {
        const addonId = uuidv4();
        await pool.query(
          'INSERT INTO menu_addons (id, menu_item_id, name, price) VALUES (?, ?, ?, ?)',
          [addonId, menuItemId, addon.name, addon.price]
        );
      }
    }
    
    return NextResponse.json({
      id: menuItemId,
      restaurantId,
      categoryId,
      name,
      description,
      basePrice,
      isVeg,
      preparationTime,
      isActive: true
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
