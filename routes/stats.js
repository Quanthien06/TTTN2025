// routes/stats.js
// Routes cho Statistics/Dashboard API (Admin only)

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// Middleware kiểm tra admin
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có quyền thực hiện thao tác này' });
    }
    next();
}

// GET /api/stats/overview - Tổng quan thống kê (admin)
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        // Tổng doanh thu
        const [revenueRows] = await pool.query(
            'SELECT SUM(total) as totalRevenue FROM orders WHERE status != "cancelled"'
        );
        const totalRevenue = parseFloat(revenueRows[0].totalRevenue || 0);
        
        // Doanh thu tháng trước
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const [lastMonthRevenueRows] = await pool.query(
            'SELECT SUM(total) as totalRevenue FROM orders WHERE status != "cancelled" AND MONTH(created_at) = ? AND YEAR(created_at) = ?',
            [lastMonth.getMonth() + 1, lastMonth.getFullYear()]
        );
        const lastMonthRevenue = parseFloat(lastMonthRevenueRows[0].totalRevenue || 0);
        const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;
        
        // Tổng đơn hàng
        const [ordersRows] = await pool.query('SELECT COUNT(*) as total FROM orders');
        const totalOrders = parseInt(ordersRows[0].total || 0);
        
        // Đơn hàng mới hôm nay
        const [todayOrdersRows] = await pool.query(
            'SELECT COUNT(*) as total FROM orders WHERE DATE(created_at) = CURDATE()'
        );
        const newOrdersToday = parseInt(todayOrdersRows[0].total || 0);
        
        // Tổng sản phẩm
        const [productsRows] = await pool.query('SELECT COUNT(*) as total FROM products');
        const totalProducts = parseInt(productsRows[0].total || 0);
        
        // Sản phẩm còn hàng
        const [inStockRows] = await pool.query(
            'SELECT COUNT(*) as total FROM products WHERE stock_quantity > 0'
        );
        const productsInStock = parseInt(inStockRows[0].total || 0);
        
        // Tổng người dùng
        const [usersRows] = await pool.query('SELECT COUNT(*) as total FROM users');
        const totalUsers = parseInt(usersRows[0].total || 0);
        
        // Người dùng hoạt động (có đơn hàng trong 30 ngày)
        const [activeUsersRows] = await pool.query(
            'SELECT COUNT(DISTINCT user_id) as total FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );
        const activeUsers = parseInt(activeUsersRows[0].total || 0);
        
        res.json({
            totalRevenue,
            revenueGrowth: parseFloat(revenueGrowth),
            totalOrders,
            newOrdersToday,
            totalProducts,
            productsInStock,
            totalUsers,
            activeUsers
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê tổng quan:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// GET /api/stats/revenue - Doanh thu theo tháng và trạng thái đơn hàng (admin)
router.get('/revenue', authenticateToken, requireAdmin, async (req, res) => {
    const pool = req.app.locals.pool;
    
    try {
        // Doanh thu theo tháng (12 tháng gần nhất)
        const revenueByMonth = [];
        const months = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            
            const [rows] = await pool.query(
                'SELECT SUM(total) as revenue FROM orders WHERE MONTH(created_at) = ? AND YEAR(created_at) = ? AND status != "cancelled"',
                [month, year]
            );
            
            revenueByMonth.push(parseFloat(rows[0].revenue || 0));
            months.push(`T${month}`);
        }
        
        // Đơn hàng theo trạng thái
        const [statusRows] = await pool.query(
            'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
        );
        
        const ordersByStatus = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };
        
        statusRows.forEach(row => {
            ordersByStatus[row.status] = parseInt(row.count || 0);
        });
        
        res.json({
            months,
            revenue: revenueByMonth,
            ordersByStatus
        });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê doanh thu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;

