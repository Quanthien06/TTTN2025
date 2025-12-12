// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Sử dụng bcrypt tiêu chuẩn
const jwt = require('jsonwebtoken');
// Import middleware authenticateToken để bảo vệ các route cần xác thực
const authenticateToken = require('../middleware/auth');
// Import email service
const { sendVerificationEmail, sendPasswordResetOTP, generateOTP } = require('../config/email');

router.get('/register', (req, res) => {
    res.status(405).json({ 
        message: 'Phương thức GET không được hỗ trợ. Vui lòng sử dụng POST.',
        method: 'POST',
        endpoint: '/api/register',
        body: {
            username: 'string (bắt buộc)',
            password: 'string (bắt buộc)',
            role: 'string (tùy chọn, mặc định: "admin")'
        },
        example: {
            url: 'POST http://localhost:5000/api/register',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                username: 'new_user',
                password: 'password123',
                role: 'admin'
            }
        }
    });
});

// API ĐĂNG KÝ (REGISTER) - POST
router.post('/register', async (req, res) => {
    // Lấy pool từ ứng dụng chính
    const pool = req.app.locals.pool; 
    
    try {
        const { username, email, password, role = 'user' } = req.body; 

        // Validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username và password là bắt buộc' });
        }

        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: 'Email hợp lệ là bắt buộc' });
        }

        // Kiểm tra email đã tồn tại chưa
        const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (emailCheck.length > 0) {
            return res.status(409).json({ message: 'Email đã được sử dụng' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Tạo mã OTP
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

        // Lưu user với email_verified = false và OTP
        const sql = 'INSERT INTO users (username, email, password, role, otp_code, otp_expires) VALUES (?, ?, ?, ?, ?, ?)';
        await pool.query(sql, [username, email, hashedPassword, role, otpCode, otpExpires]);

        // Gửi email xác nhận
        const emailResult = await sendVerificationEmail(email, otpCode);
        
        if (!emailResult.success) {
            console.error('Lỗi gửi email:', emailResult.error);
            // Vẫn trả về success nhưng cảnh báo email chưa gửi được
            return res.status(201).json({ 
                message: 'Đăng ký thành công nhưng không thể gửi email xác nhận. Vui lòng liên hệ admin.',
                emailSent: false
            });
        }

        res.status(201).json({ 
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
            emailSent: true,
            note: 'Mã OTP đã được gửi đến email của bạn'
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('username')) {
                return res.status(409).json({ message: 'Username đã tồn tại' });
            }
            if (error.message.includes('email')) {
                return res.status(409).json({ message: 'Email đã được sử dụng' });
            }
            return res.status(409).json({ message: 'Thông tin đã tồn tại' });
        }
        console.error('Lỗi khi đăng ký người dùng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// API ĐĂNG NHẬP (LOGIN) - GET để hiển thị hướng dẫn
router.get('/login', (req, res) => {
    res.status(405).json({ 
        message: 'Phương thức GET không được hỗ trợ. Vui lòng sử dụng POST.',
        method: 'POST',
        endpoint: '/api/login',
        body: {
            username: 'string (bắt buộc)',
            password: 'string (bắt buộc)'
        },
        example: {
            url: 'POST http://localhost:5000/api/login',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                username: 'your_username',
                password: 'your_password'
            }
        }
    });
});

// API ĐĂNG NHẬP (LOGIN) - POST
// Hỗ trợ đăng nhập bằng username hoặc email
router.post('/login', async (req, res) => {
    const pool = req.app.locals.pool; 
    const JWT_SECRET = req.app.locals.JWT_SECRET;

    try {
        const { username, email, password } = req.body;
        const loginIdentifier = username || email; // Hỗ trợ cả username và email

        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: 'Username/Email và password là bắt buộc' });
        }

        // 1. Tìm user trong database (tìm theo username hoặc email)
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?', 
            [loginIdentifier, loginIdentifier]
        );
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Username/Email hoặc password không đúng' });
        }

        // 2. Kiểm tra password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Username/Email hoặc password không đúng' });
        }

        // 3. Tạo JWT
        if (!JWT_SECRET) {
            console.error('JWT_SECRET không được cấu hình!');
            return res.status(500).json({ message: 'Lỗi cấu hình server' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '100d' }
        );

        // 4. Trả về token + lời chào
        res.json({ 
            message: `Đăng nhập thành công. Xin chào, ${user.username}!`,
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                role: user.role 
            }
        });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// ============================================
// API BỔ SUNG CHO AUTH
// ============================================

// GET /api/me - Lấy thông tin user hiện tại
// Endpoint này cho phép user xem thông tin của chính mình
// Cần có token hợp lệ trong header Authorization
router.get('/me', authenticateToken, async (req, res) => {
    // Lấy connection pool từ app để thực hiện query database
    const pool = req.app.locals.pool;
    
    // Kiểm tra pool có tồn tại không
    if (!pool) {
        console.error('Database pool không tồn tại!');
        return res.status(500).json({ 
            message: 'Lỗi cấu hình database',
            error: 'Database pool chưa được khởi tạo'
        });
    }
    
    // req.user được set bởi middleware authenticateToken sau khi verify token thành công
    // req.user chứa thông tin: { id, username, role }
    const userId = req.user.id;

    try {
        console.log('GET /api/me - User ID:', userId);
        console.log('Pool exists:', !!pool);
        
        // Query database để lấy thông tin user - sử dụng SELECT * để lấy tất cả các trường
        let [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        
        console.log('Query executed, rows count:', rows.length);

        // Kiểm tra user có tồn tại không
        if (rows.length === 0) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const user = rows[0];
        console.log('User found:', user.username);
        console.log('User data keys:', Object.keys(user));
        
        // Xử lý an toàn với các trường có thể không tồn tại
        // Lưu ý: Database có thể dùng camelCase (createdAt) hoặc snake_case (created_at)
        const result = {
            id: user.id,
            username: user.username || '',
            role: user.role || 'user',
            created_at: user.created_at || user.createdAt || null,
            email: user.email || null,
            email_verified: (user.email_verified !== undefined && user.email_verified !== null) ? Boolean(user.email_verified) : null,
            google_id: user.google_id || null,
            full_name: user.full_name || null,
            phone: user.phone || null,
            address: user.address || null,
            date_of_birth: user.date_of_birth || null,
            avatar_url: user.avatar_url || null
        };
        
        console.log('Processed user result:', {
            id: result.id,
            username: result.username,
            hasEmail: !!result.email,
            hasFullName: !!result.full_name,
            hasPhone: !!result.phone
        });
        
        // Trả về thông tin user
        console.log('Returning user data for:', result.username);
        res.json({
            user: result
        });

    } catch (error) {
        // Log lỗi chi tiết để debug
        console.error('❌ Lỗi khi lấy thông tin user:', error);
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        console.error('Error stack:', error.stack);
        
        // Log chi tiết hơn cho database errors
        if (error.code) {
            console.error('Error code:', error.code);
        }
        if (error.sqlMessage) {
            console.error('SQL Error message:', error.sqlMessage);
        }
        if (error.sqlState) {
            console.error('SQL State:', error.sqlState);
        }
        if (error.errno) {
            console.error('Error number:', error.errno);
        }
        
        // Trả về lỗi chi tiết hơn trong development
        const errorResponse = {
            message: 'Lỗi máy chủ nội bộ',
            error: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        };
        
        // Thêm thông tin SQL nếu có
        if (error.sqlMessage) {
            errorResponse.sqlError = error.sqlMessage;
        }
        
        res.status(500).json(errorResponse);
    }
});

// PUT /api/profile - Cập nhật thông tin cá nhân
// Cho phép user cập nhật thông tin profile: username, full_name, phone, address, date_of_birth
// Cần có token hợp lệ
router.put('/profile', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    // Lấy các trường từ request body
    const { username, full_name, phone, address, date_of_birth, avatar_url } = req.body;

    console.log('PUT /api/profile - User ID:', userId);
    console.log('Request body:', { username, full_name, phone, address, date_of_birth, avatar_url: avatar_url ? 'provided' : 'not provided' });

    try {
        // Validation: Kiểm tra username nếu có
        if (username !== undefined) {
            if (!username || username.trim() === '') {
                return res.status(400).json({ message: 'Username không được để trống' });
            }

            // Kiểm tra username mới đã tồn tại chưa (trừ user hiện tại)
            const [existingUsers] = await pool.query(
                'SELECT id FROM users WHERE username = ? AND id != ?',
                [username, userId]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({ message: 'Username đã tồn tại' });
            }
        }

        // Validation: Kiểm tra phone format nếu có
        if (phone !== undefined && phone !== null && phone.trim() !== '') {
            // Loại bỏ khoảng trắng và ký tự đặc biệt để kiểm tra
            const phoneDigits = phone.replace(/\D/g, '');
            if (phoneDigits.length < 10 || phoneDigits.length > 11) {
                return res.status(400).json({ message: 'Số điện thoại không hợp lệ (phải có 10-11 chữ số)' });
            }
        }

        // Validation: Kiểm tra date_of_birth nếu có
        if (date_of_birth !== undefined && date_of_birth !== null && date_of_birth !== '') {
            const birthDate = new Date(date_of_birth);
            const today = new Date();
            if (birthDate > today) {
                return res.status(400).json({ message: 'Ngày sinh không thể lớn hơn ngày hiện tại' });
            }
            // Kiểm tra tuổi hợp lý (ít nhất 13 tuổi)
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 13 || age > 120) {
                return res.status(400).json({ message: 'Ngày sinh không hợp lệ' });
            }
        }

        // Xây dựng câu lệnh UPDATE động
        const updateFields = [];
        const updateValues = [];

        if (username !== undefined) {
            updateFields.push('username = ?');
            updateValues.push(username.trim());
        }
        if (full_name !== undefined) {
            updateFields.push('full_name = ?');
            updateValues.push(full_name ? full_name.trim() : null);
        }
        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone ? phone.trim() : null);
        }
        if (address !== undefined) {
            updateFields.push('address = ?');
            updateValues.push(address ? address.trim() : null);
        }
        if (date_of_birth !== undefined) {
            updateFields.push('date_of_birth = ?');
            updateValues.push(date_of_birth || null);
        }
        if (avatar_url !== undefined) {
            updateFields.push('avatar_url = ?');
            updateValues.push(avatar_url || null);
        }

        // Nếu không có trường nào để cập nhật
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
        }

        // Thêm userId vào cuối mảng values
        updateValues.push(userId);

        // Thực hiện cập nhật
        const updateSQL = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        console.log('Update SQL:', updateSQL);
        console.log('Update values:', updateValues);
        
        await pool.query(updateSQL, updateValues);
        console.log('✅ Update successful');

        // Lấy thông tin user đã cập nhật để trả về
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        const updatedUser = rows[0];

        // Trả về thông tin user đã cập nhật (chỉ các trường cần thiết)
        res.json({
            message: 'Cập nhật thông tin thành công',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                email: updatedUser.email || null,
                email_verified: updatedUser.email_verified ? Boolean(updatedUser.email_verified) : null,
                full_name: updatedUser.full_name || null,
                phone: updatedUser.phone || null,
                address: updatedUser.address || null,
                date_of_birth: updatedUser.date_of_birth || null,
                avatar_url: updatedUser.avatar_url || null,
                created_at: updatedUser.created_at
            }
        });

    } catch (error) {
        console.error('❌ Lỗi khi cập nhật profile:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        });
        
        res.status(500).json({ 
            message: 'Lỗi máy chủ nội bộ',
            error: error.message,
            code: error.code || 'UNKNOWN_ERROR'
        });
    }
});

// GET /api/user-by-email - Lấy username từ email (dùng cho forgot password)
router.get('/user-by-email', async (req, res) => {
    const pool = req.app.locals.pool;
    const { email } = req.query;

    try {
        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: 'Email hợp lệ là bắt buộc' });
        }

        // Tìm user với email
        const [rows] = await pool.query(
            'SELECT username FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            // Không tiết lộ email có tồn tại hay không (bảo mật)
            return res.json({ 
                username: null,
                exists: false
            });
        }

        res.json({ 
            username: rows[0].username,
            exists: true
        });

    } catch (error) {
        console.error('Lỗi khi lấy username từ email:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// PUT /api/change-password - Đổi mật khẩu
// Cho phép user đổi mật khẩu của mình
// Yêu cầu: currentPassword (để xác nhận) và newPassword (mật khẩu mới)
router.put('/change-password', authenticateToken, async (req, res) => {
    const pool = req.app.locals.pool;
    const userId = req.user.id;
    // Lấy mật khẩu hiện tại và mật khẩu mới từ request body
    const { currentPassword, newPassword } = req.body;

    try {
        // Validation: Kiểm tra cả 2 password đều phải có
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Current password và new password là bắt buộc' 
            });
        }

        // Validation: Mật khẩu mới phải có ít nhất 6 ký tự (bảo mật)
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
            });
        }

        // Lấy thông tin user từ database (bao gồm password đã hash)
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        // Kiểm tra user có tồn tại không
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const user = rows[0];

        // Kiểm tra mật khẩu hiện tại có đúng không
        // bcrypt.compare so sánh password plain text với hash trong database
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            // Trả về lỗi 401 Unauthorized nếu mật khẩu không đúng
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Hash mật khẩu mới trước khi lưu vào database
        // Sử dụng bcrypt với 10 rounds (độ phức tạp)
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới vào database
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedNewPassword, userId]
        );

        // Trả về thông báo thành công
        res.json({ message: 'Đổi mật khẩu thành công' });

    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /api/logout - Đăng xuất
// Lưu ý: Với JWT stateless, logout thường được xử lý ở client (xóa token khỏi localStorage)
// Endpoint này chỉ là formality, client sẽ tự xóa token
// Nếu muốn implement token blacklist, cần tạo bảng blacklisted_tokens trong database
router.post('/logout', authenticateToken, async (req, res) => {
    // Với JWT stateless, không cần làm gì ở server
    // Client chỉ cần xóa token khỏi localStorage/sessionStorage
    
    // TODO: Nếu muốn implement token blacklist:
    // 1. Tạo bảng blacklisted_tokens trong database
    // 2. Lưu token vào blacklist khi logout
    // 3. Kiểm tra token trong blacklist ở middleware authenticateToken
    
    // Hiện tại chỉ trả về success, client tự xóa token
    res.json({ 
        message: 'Đăng xuất thành công',
        note: 'Vui lòng xóa token ở client (localStorage/sessionStorage)'
    });
});

// ============================================
// EMAIL VERIFICATION & PASSWORD RESET
// ============================================

// POST /api/verify-email - Xác nhận email với OTP
router.post('/verify-email', async (req, res) => {
    const pool = req.app.locals.pool;
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email và OTP là bắt buộc' });
        }

        // Tìm user với email và OTP hợp lệ
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expires > NOW()',
            [email, otp]
        );

        if (rows.length === 0) {
            return res.status(400).json({ 
                message: 'OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.' 
            });
        }

        const user = rows[0];

        // Cập nhật email_verified = true và xóa OTP
        await pool.query(
            'UPDATE users SET email_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE id = ?',
            [user.id]
        );

        res.json({ message: 'Email đã được xác nhận thành công!' });

    } catch (error) {
        console.error('Lỗi khi xác nhận email:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /api/resend-verification - Gửi lại mã OTP xác nhận
router.post('/resend-verification', async (req, res) => {
    const pool = req.app.locals.pool;
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email là bắt buộc' });
        }

        // Tìm user với email
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
        }

        const user = rows[0];

        if (user.email_verified) {
            return res.status(400).json({ message: 'Email đã được xác nhận rồi' });
        }

        // Tạo mã OTP mới
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

        // Cập nhật OTP trong database
        await pool.query(
            'UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?',
            [otpCode, otpExpires, user.id]
        );

        // Gửi email
        const emailResult = await sendVerificationEmail(email, otpCode);

        if (!emailResult.success) {
            return res.status(500).json({ 
                message: 'Không thể gửi email. Vui lòng thử lại sau.',
                emailSent: false
            });
        }

        res.json({ 
            message: 'Mã OTP mới đã được gửi đến email của bạn',
            emailSent: true
        });

    } catch (error) {
        console.error('Lỗi khi gửi lại mã xác nhận:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /api/forgot-password - Gửi OTP để reset mật khẩu
router.post('/forgot-password', async (req, res) => {
    const pool = req.app.locals.pool;
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email là bắt buộc' });
        }

        // Tìm user với email
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            // Không tiết lộ email có tồn tại hay không (bảo mật)
            return res.json({ 
                message: 'Nếu email tồn tại, mã OTP đã được gửi',
                emailSent: true
            });
        }

        const user = rows[0];

        // Tạo mã OTP mới
        const otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

        // Cập nhật OTP trong database
        await pool.query(
            'UPDATE users SET otp_code = ?, otp_expires = ? WHERE id = ?',
            [otpCode, otpExpires, user.id]
        );

        // Gửi email
        const emailResult = await sendPasswordResetOTP(email, otpCode);

        if (!emailResult.success) {
            return res.status(500).json({ 
                message: 'Không thể gửi email. Vui lòng thử lại sau.',
                emailSent: false
            });
        }

        res.json({ 
            message: 'Nếu email tồn tại, mã OTP đã được gửi đến email của bạn',
            emailSent: true
        });

    } catch (error) {
        console.error('Lỗi khi gửi mã reset password:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

// POST /api/reset-password - Đặt lại mật khẩu với OTP
router.post('/reset-password', async (req, res) => {
    const pool = req.app.locals.pool;
    const { email, otp, newPassword } = req.body;

    try {
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP và mật khẩu mới là bắt buộc' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        // Tìm user với email và OTP hợp lệ
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expires > NOW()',
            [email, otp]
        );

        if (rows.length === 0) {
            return res.status(400).json({ 
                message: 'OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.' 
            });
        }

        const user = rows[0];

        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu và xóa OTP
        await pool.query(
            'UPDATE users SET password = ?, otp_code = NULL, otp_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Mật khẩu đã được đặt lại thành công!' });

    } catch (error) {
        console.error('Lỗi khi reset password:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;