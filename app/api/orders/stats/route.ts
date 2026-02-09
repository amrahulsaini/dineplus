import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get('restaurantId');
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }
    
    // Get today's stats
    const [todayStats]: any = await pool.query(
      `SELECT 
        COUNT(*) as todayOrders,
        COALESCE(SUM(total), 0) as todayRevenue
       FROM orders 
       WHERE restaurant_id = ? AND DATE(created_at) = CURDATE()`,
      [restaurantId]
    );
    
    // Get pending and completed orders count
    const [statusStats]: any = await pool.query(
      `SELECT 
        SUM(CASE WHEN status IN ('pending', 'confirmed', 'preparing') THEN 1 ELSE 0 END) as pendingOrders,
        SUM(CASE WHEN status IN ('delivered', 'completed') THEN 1 ELSE 0 END) as completedOrders
       FROM orders 
       WHERE restaurant_id = ? AND DATE(created_at) = CURDATE()`,
      [restaurantId]
    );
    
    // Get total revenue and orders (for reports page)
    const [totalStats]: any = await pool.query(
      `SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalRevenue,
        COALESCE(AVG(total), 0) as avgOrderValue
       FROM orders 
       WHERE restaurant_id = ?`,
      [restaurantId]
    );
    
    // Get top selling items
    const [topItems]: any = await pool.query(
      `SELECT 
        oi.menu_item_name as name,
        SUM(oi.quantity) as quantity,
        SUM(oi.total) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.restaurant_id = ?
       GROUP BY oi.menu_item_name
       ORDER BY quantity DESC
       LIMIT 10`,
      [restaurantId]
    );
    
    // Get daily stats for last 7 days
    const [dailyStats]: any = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
       FROM orders 
       WHERE restaurant_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [restaurantId]
    );
    
    return NextResponse.json({
      // Dashboard stats
      todayOrders: Number(todayStats[0]?.todayOrders) || 0,
      todayRevenue: Number(todayStats[0]?.todayRevenue) || 0,
      pendingOrders: Number(statusStats[0]?.pendingOrders) || 0,
      completedOrders: Number(statusStats[0]?.completedOrders) || 0,
      // Reports page stats
      totalRevenue: Number(totalStats[0]?.totalRevenue) || 0,
      totalOrders: Number(totalStats[0]?.totalOrders) || 0,
      avgOrderValue: Number(totalStats[0]?.avgOrderValue) || 0,
      topItems: topItems || [],
      dailyStats: dailyStats || []
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
