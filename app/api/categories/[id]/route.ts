import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, displayOrder, isActive } = body;
    
    const query = 'UPDATE categories SET name = ?, description = ?, display_order = ?, is_active = ? WHERE id = ?';
    await pool.query(query, [name, description || null, displayOrder || 0, isActive !== false, id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = 'DELETE FROM categories WHERE id = ?';
    await pool.query(query, [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
