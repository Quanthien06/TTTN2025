/**
 * Security Headers Middleware
 * Sử dụng Helmet.js và custom headers để bảo vệ ứng dụng
 */

const helmet = require('helmet');

// Configure Helmet with CSP
// In development, use more relaxed CSP to allow local CSS/JS files
const isDevelopment = process.env.NODE_ENV !== 'production';

const helmetConfig = helmet({
    contentSecurityPolicy: isDevelopment ? false : {
        // Disable CSP in development to avoid blocking local CSS/JS
        // In production, enable strict CSP
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "http://localhost:*"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "http://localhost:*"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "http://localhost:*"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "http://localhost:*"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Disable if causing issues
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: isDevelopment ? false : {
        // Disable HSTS in development
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    }
});

// Additional custom security headers
const customSecurityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
};

module.exports = {
    helmetConfig,
    customSecurityHeaders
};

