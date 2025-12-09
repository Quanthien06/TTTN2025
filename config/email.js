// config/email.js
// Cấu hình email service sử dụng nodemailer

const nodemailer = require('nodemailer');

// Helper: kiểm tra đã cấu hình email chưa
function isEmailConfigured() {
    return Boolean(process.env.EMAIL_USER && (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD));
}

// Tạo transporter để gửi email
// Sử dụng Gmail SMTP (có thể thay đổi cho email provider khác)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'giakiethcb1@gmail.com', // Thay bằng email của bạn
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || '' // App Password từ .env
    }
});

// Verify SMTP một lần, cache kết quả
let verifyPromise = null;
function verifySMTP() {
    if (!verifyPromise) {
        verifyPromise = transporter.verify()
            .then(() => ({ ok: true }))
            .catch((err) => {
                console.error('SMTP verify fail:', err.message);
                return { ok: false, error: err.message };
            });
    }
    return verifyPromise;
}

// Hàm gửi email xác nhận đăng ký
async function sendVerificationEmail(email, otpCode) {
    if (!isEmailConfigured()) {
        const msg = 'SMTP chưa cấu hình (EMAIL_USER/EMAIL_PASS). Không thể gửi OTP.';
        console.error(msg);
        return { success: false, error: msg };
    }

    const verifyResult = await verifySMTP();
    if (!verifyResult.ok) {
        const msg = `SMTP lỗi: ${verifyResult.error || 'Không xác định'}`;
        console.error(msg);
        return { success: false, error: msg };
    }

    const mailOptions = {
        from: `"TechStore" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
        to: email,
        subject: 'Xác nhận đăng ký tài khoản TechStore',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Xác nhận đăng ký tài khoản</h2>
                <p>Xin chào,</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại TechStore!</p>
                <p>Mã OTP xác nhận của bạn là:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
                </div>
                <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
                <p>Nếu bạn không yêu cầu đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        return { success: false, error: error.message };
    }
}

// Hàm gửi email OTP để reset mật khẩu
async function sendPasswordResetOTP(email, otpCode) {
    if (!isEmailConfigured()) {
        const msg = 'SMTP chưa cấu hình (EMAIL_USER/EMAIL_PASS). Không thể gửi OTP reset.';
        console.error(msg);
        return { success: false, error: msg };
    }

    const verifyResult = await verifySMTP();
    if (!verifyResult.ok) {
        const msg = `SMTP lỗi: ${verifyResult.error || 'Không xác định'}`;
        console.error(msg);
        return { success: false, error: msg };
    }

    const mailOptions = {
        from: `"TechStore" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
        to: email,
        subject: 'Mã OTP đặt lại mật khẩu TechStore',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc2626;">Đặt lại mật khẩu</h2>
                <p>Xin chào,</p>
                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TechStore của bạn.</p>
                <p>Mã OTP của bạn là:</p>
                <div style="background-color: #fef2f2; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #dc2626;">
                    <h1 style="color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
                </div>
                <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
                <p><strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và kiểm tra bảo mật tài khoản của bạn.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email reset password đã được gửi:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Lỗi khi gửi email reset password:', error);
        return { success: false, error: error.message };
    }
}

// Hàm tạo mã OTP ngẫu nhiên 6 chữ số
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
    transporter,
    verifySMTP,
    isEmailConfigured,
    sendVerificationEmail,
    sendPasswordResetOTP,
    generateOTP
};

