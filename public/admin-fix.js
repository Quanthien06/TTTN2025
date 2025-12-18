// admin-fix.js - Fix script to enhance admin.html functionality
// This script patches admin.html issues

(function() {
    'use strict';
    
    // Override initAdmin to add admin role check
    window.initAdmin_Original = window.initAdmin;
    window.initAdmin = async function() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
        
        try {
            // Get current user info
            const response = await fetch(`${window.API_BASE_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const user = data.user || data;
                
                // Check if user is admin
                if (user.role !== 'admin') {
                    alert('Bạn không có quyền truy cập trang Admin!');
                    window.location.href = '/';
                    return;
                }
                
                const adminUsernameEl = document.getElementById('adminUsername');
                if (adminUsernameEl) {
                    adminUsernameEl.textContent = user.username || 'Admin';
                }
            } else {
                window.location.href = '/login.html';
                return;
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            window.location.href = '/login.html';
            return;
        }
        
        // Call original loadDashboard if it exists
        if (window.loadDashboard) {
            window.loadDashboard();
        }
    };
    
    // Override loadDashboard with error handling
    window.loadDashboard_Original = window.loadDashboard;
    window.loadDashboard = async function() {
        try {
            const token = localStorage.getItem('token');
            
            // Load stats (with error handling)
            try {
                const statsResponse = await fetch(`${window.API_BASE_URL}/stats/overview`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (statsResponse.ok) {
                    const stats = await statsResponse.json();
                    if (window.updateDashboardStats) {
                        window.updateDashboardStats(stats);
                    }
                } else {
                    console.warn('Stats endpoint returned:', statsResponse.status);
                    if (window.updateDashboardStats) {
                        window.updateDashboardStats({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
                    }
                }
            } catch (e) {
                console.warn('Error loading stats:', e);
                if (window.updateDashboardStats) {
                    window.updateDashboardStats({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
                }
            }
            
            // Load recent orders
            try {
                const ordersResponse = await fetch(`${window.API_BASE_URL}/orders/admin?limit=5`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (ordersResponse.ok) {
                    const ordersData = await ordersResponse.json();
                    if (window.renderRecentOrders) {
                        window.renderRecentOrders(ordersData.orders || []);
                    }
                } else {
                    if (window.renderRecentOrders) {
                        window.renderRecentOrders([]);
                    }
                }
            } catch (e) {
                console.warn('Error loading orders:', e);
                if (window.renderRecentOrders) {
                    window.renderRecentOrders([]);
                }
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    };
    
    // Override openRefundAdminModal with better error handling
    window.openRefundAdminModal_Original = window.openRefundAdminModal;
    window.openRefundAdminModal = async function(refundId) {
        try {
            const token = getToken?.();
            
            // Load all refunds and find the one with matching ID
            const response = await fetch(`${window.API_BASE_URL}/refunds?page=1&limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                alert('Không thể tải chi tiết hoàn tiền');
                return;
            }
            
            const data = await response.json();
            const refund = (data.refunds || []).find(r => r.id === parseInt(refundId)) || null;
            if (!refund) {
                alert('Không tìm thấy yêu cầu hoàn tiền');
                return;
            }
            
            if (window.showRefundAdminModal) {
                window.showRefundAdminModal(refund);
            }
        } catch (error) {
            console.error('Error loading refund detail:', error);
            alert('Không thể tải chi tiết hoàn tiền: ' + error.message);
        }
    };
    
    console.log('Admin fix script loaded successfully');
})();
