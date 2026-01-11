// services/auth-service/utils/email.js
// Email utility sử dụng Nodemailer

const nodemailer = require('nodemailer');

// Cấu hình email từ environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = (process.env.EMAIL_USER || '').trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, ''); // Loại bỏ tất cả khoảng trắng
const EMAIL_FROM_ENV = (process.env.EMAIL_FROM || '').trim();
// Nếu EMAIL_FROM không có @ hoặc rỗng thì dùng EMAIL_USER
const EMAIL_FROM = EMAIL_FROM_ENV && EMAIL_FROM_ENV.includes('@') ? EMAIL_FROM_ENV : EMAIL_USER;

// Log cấu hình (ẩn password)
console.log('📧 Email Config:', {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    user: EMAIL_USER,
    pass: EMAIL_PASS ? `${EMAIL_PASS.substring(0, 4)}****` : '(empty)',
    from: EMAIL_FROM || EMAIL_USER
});

// Tạo transporter
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // true cho port 465, false cho các port khác
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Kiểm tra kết nối email
transporter.verify(function (error, success) {
    if (error) {
        console.log('⚠️ Email service không khả dụng:', error.message);
        console.log('📧 Email sẽ được log ra console thay vì gửi thực tế');
    } else {
        console.log('✅ Email service đã sẵn sàng');
    }
});

/**
 * Gửi email mã OTP để đặt lại mật khẩu
 * @param {string} to - Email người nhận
 * @param {string} otpCode - Mã OTP 6 chữ số
 * @param {string} username - Tên người dùng
 * @returns {Promise<boolean>} - true nếu gửi thành công
 */
async function sendOTPEmail(to, otpCode, username = '') {
    const mailOptions = {
        from: `"TechStore" <${EMAIL_FROM || EMAIL_USER}>`,
        to: to,
        subject: 'Mã OTP đặt lại mật khẩu - TechStore',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
                    .otp-box { background: white; border: 2px dashed #dc2626; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🛍️ TechStore</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào${username ? `, ${username}` : ''}!</h2>
                        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TechStore của mình.</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0 0 10px 0; color: #666;">Mã OTP của bạn:</p>
                            <div class="otp-code">${otpCode}</div>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Lưu ý:</strong> Mã OTP này có hiệu lực trong <strong>10 phút</strong>. 
                            Vui lòng không chia sẻ mã này với bất kỳ ai.
                        </div>
                        
                        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                        
                        <div class="footer">
                            <p>Trân trọng,<br>Đội ngũ TechStore</p>
                            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
            Xin chào${username ? `, ${username}` : ''}!
            
            Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TechStore.
            
            Mã OTP của bạn: ${otpCode}
            
            Mã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.
            
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
            
            Trân trọng,
            Đội ngũ TechStore
        `
    };

    try {
        // Nếu không có cấu hình email, chỉ log ra console
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.log('\n📧 ===== EMAIL OTP (NOT SENT - No email config) =====');
            console.log(`To: ${to}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log(`Username: ${username || 'N/A'}`);
            console.log('==================================================\n');
            return true; // Trả về true để không block flow
        }

        console.log(`📤 Đang gửi email OTP đến ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email OTP đã được gửi thành công!`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        return true;
    } catch (error) {
        console.error('❌ Lỗi khi gửi email:', error.message);
        console.error('   Chi tiết:', error);
        // Log OTP ra console để có thể test
        console.log('\n📧 ===== EMAIL OTP (FALLBACK - Email failed) =====');
        console.log(`To: ${to}`);
        console.log(`OTP Code: ${otpCode}`);
        console.log(`Username: ${username || 'N/A'}`);
        console.log(`Error: ${error.message}`);
        console.log('==================================================\n');
        return false; // Trả về false nhưng không throw error để không block flow
    }
}

/**
 * Gửi email mã OTP để xác thực email khi đăng ký
 * @param {string} to - Email người nhận
 * @param {string} otpCode - Mã OTP 6 chữ số
 * @param {string} username - Tên người dùng
 * @returns {Promise<boolean>} - true nếu gửi thành công
 */
async function sendVerificationEmail(to, otpCode, username = '') {
    const mailOptions = {
        from: `"TechStore" <${EMAIL_FROM || EMAIL_USER}>`,
        to: to,
        subject: 'Xác thực email đăng ký - TechStore',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
                    .otp-box { background: white; border: 2px dashed #10b981; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🛍️ TechStore</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào${username ? `, ${username}` : ''}!</h2>
                        <p>Cảm ơn bạn đã đăng ký tài khoản TechStore. Vui lòng xác thực email của bạn bằng mã OTP bên dưới.</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0 0 10px 0; color: #666;">Mã OTP xác thực của bạn:</p>
                            <div class="otp-code">${otpCode}</div>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Lưu ý:</strong> Mã OTP này có hiệu lực trong <strong>10 phút</strong>. 
                            Vui lòng không chia sẻ mã này với bất kỳ ai.
                        </div>
                        
                        <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
                        
                        <div class="footer">
                            <p>Trân trọng,<br>Đội ngũ TechStore</p>
                            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
            Xin chào${username ? `, ${username}` : ''}!
            
            Cảm ơn bạn đã đăng ký tài khoản TechStore. Vui lòng xác thực email của bạn bằng mã OTP bên dưới.
            
            Mã OTP xác thực của bạn: ${otpCode}
            
            Mã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.
            
            Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
            
            Trân trọng,
            Đội ngũ TechStore
        `
    };

    try {
        // Nếu không có cấu hình email, chỉ log ra console
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.log('\n📧 ===== EMAIL VERIFICATION (NOT SENT - No email config) =====');
            console.log(`To: ${to}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log(`Username: ${username || 'N/A'}`);
            console.log('==================================================\n');
            return true; // Trả về true để không block flow
        }

        console.log(`📤 Đang gửi email verification đến ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email verification đã được gửi thành công!`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        return true;
    } catch (error) {
        console.error('❌ Lỗi khi gửi email verification:', error.message);
        console.error('   Chi tiết:', error);
        // Log OTP ra console để có thể test
        console.log('\n📧 ===== EMAIL VERIFICATION (FALLBACK - Email failed) =====');
        console.log(`To: ${to}`);
        console.log(`OTP Code: ${otpCode}`);
        console.log(`Username: ${username || 'N/A'}`);
        console.log(`Error: ${error.message}`);
        console.log('==================================================\n');
        return false; // Trả về false nhưng không throw error để không block flow
    }
}

module.exports = {
    sendOTPEmail,
    sendVerificationEmail
};

