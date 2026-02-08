import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get('restaurantId');
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's stats
    const [todayStats]: any = await pool.query(
      `SELECT 
        COUNT(*) as todayOrders,
        COALESCE(SUM(total), 0) as todayRevenue
       FROM orders 
       WHERE restaurant_id = ? AND DATE(created_at) = CURDATE()`,
      [restaurantId]
    );
    
    const [pendingOrders]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM orders 
       WHERE restaurant_id = ? AND status IN ('pending', 'confirmed', 'preparing')`,
      [restaurantId]
    );
    
    const [completedOrders]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM orders 
       WHERE restaurant_id = ? AND DATE(created_at) = CURDATE() AND status IN ('delivered', 'ready')`,
      [restaurantId]
    );
    
    return NextResponse.json({
      todayOrders: todayStats[0].todayOrders || 0,
      todayRevenue: todayStats[0].todayRevenue || 0,
      pendingOrders: pendingOrders[0].count || 0,
      completedOrders: completedOrders[0].count || 0
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
