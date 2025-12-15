// routes/oauth.js
// OAuth2 routes cho Google authentication

const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');   

// Khởi tạo Google Strategy
function initializeOAuth(appInstance) {
    const pool = appInstance.locals.pool;
    const JWT_SECRET = appInstance.locals.JWT_SECRET;
    
    // Cấu hình Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Tìm user với Google ID hoặc email
            const [existingUsers] = await pool.query(
                'SELECT * FROM users WHERE google_id = ? OR email = ?',
                [profile.id, profile.emails[0].value]
            );

            if (existingUsers.length > 0) {
                // User đã tồn tại - cập nhật Google ID nếu chưa có
                const user = existingUsers[0];
                if (!user.google_id) {
                    await pool.query(
                        'UPDATE users SET google_id = ?, email_verified = TRUE WHERE id = ?',
                        [profile.id, user.id]
                    );
                }
                return done(null, user);
            } else {
                // Tạo user mới
                const email = profile.emails[0].value;
                // Tạo username từ email (trước @) + 6 ký tự đầu của Google ID
                const baseUsername = email.split('@')[0];
                const googleIdShort = profile.id.substring(0, 6);
                let username = `${baseUsername}_${googleIdShort}`;
                
                // Kiểm tra username đã tồn tại chưa, nếu có thì thêm số
                let counter = 1;
                let finalUsername = username;
                while (true) {
                    const [checkUsers] = await pool.query(
                        'SELECT id FROM users WHERE username = ?',
                        [finalUsername]
                    );
                    if (checkUsers.length === 0) break;
                    finalUsername = `${username}${counter}`;
                    counter++;
                }
                
                // Tạo password ngẫu nhiên (user sẽ không dùng password này)
                const randomPassword = Math.random().toString(36).slice(-12) + Date.now().toString();
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                const [result] = await pool.query(
                    'INSERT INTO users (username, email, password, google_id, email_verified, role) VALUES (?, ?, ?, ?, ?, ?)',
                    [finalUsername, email, hashedPassword, profile.id, true, 'user']
                );

                const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
                return done(null, newUser[0]);
            }
        } catch (error) {
            console.error('OAuth error:', error);
            return done(error, null);
        }
    }));

    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            if (users.length === 0) {
                return done(null, false);
            }
            done(null, users[0]);
        } catch (error) {
            done(error, null);
        }
    });
}

// Khởi tạo OAuth ngay khi module được load (nếu có app instance)
// Hoặc khởi tạo trong middleware khi request đến
let oauthInitialized = false;

function ensureOAuthInitialized(req) {
    if (!oauthInitialized && req.app.locals.pool) {
        try {
            initializeOAuth(req.app);
            oauthInitialized = true;
            console.log('OAuth2 Google Strategy đã được khởi tạo');
        } catch (error) {
            console.error('Lỗi khởi tạo OAuth:', error);
        }
    }
}

// Middleware để đảm bảo OAuth được khởi tạo
router.use((req, res, next) => {
    ensureOAuthInitialized(req);
    next();
});

// Route để bắt đầu OAuth flow
router.get('/google',
    (req, res, next) => {
        // Đảm bảo OAuth đã được khởi tạo
        ensureOAuthInitialized(req);
        
        // Kiểm tra strategy đã được đăng ký chưa
        if (!passport._strategies.google) {
            console.error('Google OAuth strategy chưa được khởi tạo!');
            return res.status(500).json({ 
                error: 'OAuth2 chưa được cấu hình. Vui lòng kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET.' 
            });
        }
        
        // Lưu redirect URL vào session nếu có
        if (req.query.redirect && req.session) {
            req.session.oauthRedirect = req.query.redirect;
        }
        next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route sau khi Google xác thực
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login.html?error=oauth_failed' }),
    async (req, res) => {
        try {
            const user = req.user;
            const JWT_SECRET = req.app.locals.JWT_SECRET;

            // Tạo JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '100d' }
            );

            // Lấy redirect URL từ session hoặc query
            const redirectUrl = req.session?.oauthRedirect || req.query.redirect || '/';
            
            // Xóa session redirect
            if (req.session) {
                delete req.session.oauthRedirect;
            }

            // Redirect về frontend với token trong URL
            // Frontend sẽ lấy token và lưu vào localStorage
            res.redirect(`${redirectUrl}?token=${token}&oauth=success`);
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect('/login.html?error=oauth_error');
        }
    }
);

// Route để lấy thông tin OAuth (kiểm tra trạng thái)
router.get('/status', (req, res) => {
    ensureOAuthInitialized(req);
    
    // Debug: Log biến môi trường
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
    
    console.log('=== OAuth Status Debug ===');
    console.log('GOOGLE_CLIENT_ID:', clientId ? `${clientId.substring(0, 20)}...` : 'UNDEFINED');
    console.log('GOOGLE_CLIENT_SECRET:', clientSecret ? 'SET' : 'UNDEFINED');
    console.log('GOOGLE_CALLBACK_URL:', callbackUrl || 'UNDEFINED');
    
    const hasCredentials = !!(clientId && clientSecret);
    const strategyReady = !!passport._strategies.google;
    
    res.json({
        google: {
            enabled: hasCredentials && strategyReady,
            credentialsConfigured: hasCredentials,
            strategyInitialized: strategyReady,
            authUrl: '/api/auth/google',
            callbackUrl: callbackUrl || 'http://localhost:5000/api/auth/google/callback',
            debug: {
                hasClientId: !!clientId,
                hasClientSecret: !!clientSecret,
                hasCallbackUrl: !!callbackUrl
            }
        }
    });
});

// Test route để kiểm tra router có hoạt động không
router.get('/test', (req, res) => {
    res.json({ 
        message: 'OAuth router is working!',
        poolAvailable: !!req.app.locals.pool,
        oauthInitialized: oauthInitialized
    });
});

module.exports = router;
