import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { categoryId, name, description, basePrice, isVeg, preparationTime, isActive } = body;
    
    const query = `UPDATE menu_items SET category_id = ?, name = ?, description = ?, base_price = ?, 
                   is_veg = ?, preparation_time = ?, is_active = ? WHERE id = ?`;
    
    await pool.query(query, [categoryId, name, description || null, basePrice, isVeg || false, preparationTime || 15, isActive !== false, id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Delete variations and addons first
    await pool.query('DELETE FROM menu_variations WHERE menu_item_id = ?', [id]);
    await pool.query('DELETE FROM menu_addons WHERE menu_item_id = ?', [id]);
    
    // Delete menu item
    await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
