// Enhanced error handling utilities for admin.html
const AdminEnhancements = {
    handleApiError(response, context) {
        if (!response.ok) {
            console.error(`API Error [${context}]:`, {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });
            
            switch(response.status) {
                case 401:
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                    return null;
                case 403:
                    console.warn(`Permission denied for: ${context}`);
                    return { error: 'Bạn không có quyền truy cập' };
                case 404:
                    console.warn(`Not found: ${context}`);
                    return { error: 'Endpoint không được tìm thấy' };
                case 500:
                    return { error: 'Lỗi server - vui lòng thử lại sau' };
                default:
                    return { error: `Lỗi ${response.status}` };
            }
        }
        return null;
    },
    
    async fetchWithErrorHandling(url, options, context) {
        try {
            const response = await fetch(url, options);
            const errorResult = this.handleApiError(response, context);
            if (errorResult) {
                throw new Error(JSON.stringify(errorResult));
            }
            return await response.json();
        } catch (error) {
            console.error(`Fetch error [${context}]:`, error);
            throw error;
        }
    }
};

// Override original loadUsers function
const originalLoadUsers = window.loadUsers;
window.loadUsers = async function(page = 1) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
        
        const response = await fetch(
            `${window.API_BASE_URL}/users?page=${page}&limit=20`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Render users table
        const usersTableBody = document.querySelector('#usersTable tbody');
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = '';
        const users = data.users || [];
        
        if (users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có người dùng</td></tr>';
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id || '-'}</td>
                <td>${user.username || '-'}</td>
                <td>${user.email || '-'}</td>
                <td><span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-info'}">${user.role || 'user'}</span></td>
                <td>${user.phone || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editUser(${user.id})">Sửa</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Xóa</button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
        
        // Update pagination
        const totalPages = Math.ceil((data.total || 0) / 20);
        renderPagination('usersPagination', page, totalPages, loadUsers);
        
    } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error);
        const usersTableBody = document.querySelector('#usersTable tbody');
        if (usersTableBody) {
            usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
        }
    }
};

// Override original loadRefunds function
const originalLoadRefunds = window.loadRefunds;
window.loadRefunds = async function(page = 1) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
        
        const response = await fetch(
            `${window.API_BASE_URL}/refunds?page=${page}&limit=20`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Render refunds table
        const refundsTableBody = document.querySelector('#refundsTable tbody');
        if (!refundsTableBody) return;
        
        refundsTableBody.innerHTML = '';
        const refunds = data.refunds || [];
        
        if (refunds.length === 0) {
            refundsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Không có yêu cầu hoàn tiền</td></tr>';
            return;
        }
        
        refunds.forEach(refund => {
            const row = document.createElement('tr');
            const statusBadge = getStatusBadge(refund.status);
            row.innerHTML = `
                <td>${refund.id || '-'}</td>
                <td>${refund.order_id || '-'}</td>
                <td>${refund.user_id || '-'}</td>
                <td>${refund.amount || 0} VNĐ</td>
                <td>${refund.reason || '-'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="openRefundAdminModal(${refund.id})">Chi tiết</button>
                </td>
            `;
            refundsTableBody.appendChild(row);
        });
        
        // Update pagination
        const totalPages = Math.ceil((data.total || 0) / 20);
        renderPagination('refundsPagination', page, totalPages, loadRefunds);
        
    } catch (error) {
        console.error('Lỗi khi tải danh sách hoàn tiền:', error);
        const refundsTableBody = document.querySelector('#refundsTable tbody');
        if (refundsTableBody) {
            refundsTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
        }
    }
};

// Helper function to get status badge
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge bg-warning">Chờ xử lý</span>',
        'approved': '<span class="badge bg-success">Phê duyệt</span>',
        'rejected': '<span class="badge bg-danger">Từ chối</span>',
        'refunded': '<span class="badge bg-info">Đã hoàn tiền</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

// Helper function to render pagination
function renderPagination(elementId, currentPage, totalPages, callback) {
    const paginationEl = document.getElementById(elementId);
    if (!paginationEl) return;
    
    paginationEl.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    if (currentPage > 1) {
        const prev = document.createElement('li');
        prev.className = 'page-item';
        prev.innerHTML = `<a class="page-link" href="#" onclick="event.preventDefault(); ${callback.name}(${currentPage - 1})">Trước</a>`;
        paginationEl.appendChild(prev);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="event.preventDefault(); ${callback.name}(${i})">${i}</a>`;
        paginationEl.appendChild(li);
    }
    
    // Next button
    if (currentPage < totalPages) {
        const next = document.createElement('li');
        next.className = 'page-item';
        next.innerHTML = `<a class="page-link" href="#" onclick="event.preventDefault(); ${callback.name}(${currentPage + 1})">Tiếp</a>`;
        paginationEl.appendChild(next);
    }
}

console.log('Admin enhancements loaded successfully');
