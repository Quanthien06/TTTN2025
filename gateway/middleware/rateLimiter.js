/**
 * Rate Limiting Middleware
 * Chống brute force attacks và giới hạn số requests
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'TOO_MANY_REQUESTS',
        message: 'Quá nhiều requests từ IP này. Vui lòng thử lại sau 15 phút.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting for health checks and static files
        return req.path === '/health' || 
               req.path.startsWith('/img/') || 
               req.path.startsWith('/css/') || 
               req.path.startsWith('/js/');
    }
});

// Strict rate limiter cho login/register
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: 'TOO_MANY_AUTH_ATTEMPTS',
        message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Store in memory (có thể dùng Redis cho production)
    skipSuccessfulRequests: false, // Count successful requests too
});

// Rate limiter cho OTP requests
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit to 3 OTP requests per 15 minutes
    message: {
        error: 'TOO_MANY_OTP_REQUESTS',
        message: 'Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau 15 phút.'
    },
    keyGenerator: (req) => {
        // Rate limit by email instead of IP
        return req.body?.email || req.ip;
    }
});

// Rate limiter cho password reset
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit to 3 password reset attempts per hour
    message: {
        error: 'TOO_MANY_RESET_ATTEMPTS',
        message: 'Quá nhiều lần thử đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.'
    },
    keyGenerator: (req) => req.body?.email || req.ip
});

// Rate limiter cho order creation
const orderLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit to 5 orders per minute
    message: {
        error: 'TOO_MANY_ORDERS',
        message: 'Bạn đang tạo đơn hàng quá nhanh. Vui lòng thử lại sau 1 phút.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    otpLimiter,
    passwordResetLimiter,
    orderLimiter
};

