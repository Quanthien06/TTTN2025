// middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware để kiểm tra và xác thực JWT từ Header
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    // Log để debug
    console.log('Authorization Header:', authHeader);
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token truy cập. Vui lòng thêm header Authorization: Bearer [token]' });
    }

    // Xử lý nhiều định dạng có thể có
    let token;
    if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Lấy phần sau "Bearer "
    } else if (authHeader.startsWith('bearer ')) {
        token = authHeader.substring(7); // Xử lý trường hợp chữ thường
    } else {
        // Nếu không có "Bearer ", thử lấy toàn bộ header
        token = authHeader.trim();
    }

    // Loại bỏ khoảng trắng thừa
    token = token.trim();
    
    // Loại bỏ dấu ngoặc kép nếu có (trường hợp copy từ JSON)
    if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }
    if (token.startsWith("'") && token.endsWith("'")) {
        token = token.slice(1, -1);
    }
    
    // Loại bỏ khoảng trắng thừa sau khi loại bỏ dấu ngoặc kép
    token = token.trim();
    
    // Kiểm tra token có rỗng không
    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'Token không hợp lệ. Vui lòng kiểm tra lại token.' });
    }
    
    // Log token để debug (chỉ log một phần để bảo mật)
    console.log('Token sau khi xử lý (first 30 chars):', token.substring(0, 30) + '...');
    console.log('Token length:', token.length);

    // Lấy secret key từ app.locals
    const JWT_SECRET = req.app.locals.JWT_SECRET;
    
    if (!JWT_SECRET) {
        console.error('JWT_SECRET không được cấu hình!');
        return res.status(500).json({ message: 'Lỗi cấu hình server' });
    }
    
    console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);
    console.log('JWT_SECRET (first 10 chars):', JWT_SECRET ? JWT_SECRET.substring(0, 10) + '...' : 'null');
    
    // Thử decode token trước để xem có hợp lệ không
    try {
        const decoded = jwt.decode(token, { complete: true });
        if (decoded) {
            console.log('Token decoded successfully (without verification)');
            console.log('Token payload:', JSON.stringify(decoded.payload, null, 2));
        }
    } catch (decodeErr) {
        console.error('Lỗi khi decode token (không verify):', decodeErr.message);
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Xử lý lỗi chi tiết hơn
            console.error('Lỗi xác thực token:', err.message);
            console.error('Error name:', err.name);
            console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
            
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ 
                    message: 'Token đã hết hạn. Vui lòng đăng nhập lại.',
                    error: 'TokenExpiredError',
                    expiredAt: err.expiredAt
                });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ 
                    message: 'Token không hợp lệ. Vui lòng kiểm tra lại token hoặc đăng nhập lại để lấy token mới.',
                    error: 'JsonWebTokenError',
                    details: err.message
                });
            } else {
                return res.status(403).json({ 
                    message: 'Token không hợp lệ hoặc đã hết hạn',
                    error: err.name,
                    details: err.message
                });
            }
        }
        console.log('Token verified successfully for user:', user.username);
        req.user = user; 
        next(); 
    });
}

module.exports = authenticateToken;

