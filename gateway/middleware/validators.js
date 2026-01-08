/**
 * Input Validation Middleware
 * Sử dụng express-validator để validate tất cả inputs
 */

const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Dữ liệu đầu vào không hợp lệ',
            errors: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value
            }))
        });
    }
    next();
};

// Register validation
const validateRegister = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username là bắt buộc')
        .isLength({ min: 3, max: 50 }).withMessage('Username phải có từ 3-50 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username chỉ được chứa chữ, số và dấu gạch dưới'),
    
    body('password')
        .notEmpty().withMessage('Password là bắt buộc')
        .isLength({ min: 6, max: 100 }).withMessage('Password phải có từ 6-100 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
    
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Email không đúng định dạng')
        .normalizeEmail(),
    
    body('role')
        .optional()
        .isIn(['user', 'admin']).withMessage('Role phải là user hoặc admin'),
    
    handleValidationErrors
];

// Login validation
const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username là bắt buộc')
        .isLength({ max: 50 }).withMessage('Username quá dài'),
    
    body('password')
        .notEmpty().withMessage('Password là bắt buộc')
        .isLength({ max: 100 }).withMessage('Password quá dài'),
    
    handleValidationErrors
];

// Forgot password validation
const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email là bắt buộc')
        .isEmail().withMessage('Email không đúng định dạng')
        .normalizeEmail(),
    
    handleValidationErrors
];

// Reset password validation
const validateResetPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email là bắt buộc')
        .isEmail().withMessage('Email không đúng định dạng')
        .normalizeEmail(),
    
    body('otp')
        .trim()
        .notEmpty().withMessage('Mã OTP là bắt buộc')
        .isLength({ min: 6, max: 6 }).withMessage('Mã OTP phải là 6 chữ số')
        .matches(/^\d{6}$/).withMessage('Mã OTP chỉ được chứa số'),
    
    body('newPassword')
        .notEmpty().withMessage('Mật khẩu mới là bắt buộc')
        .isLength({ min: 6, max: 100 }).withMessage('Mật khẩu mới phải có từ 6-100 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Mật khẩu mới phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
    
    handleValidationErrors
];

// Product validation
const validateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Tên sản phẩm là bắt buộc')
        .isLength({ min: 1, max: 255 }).withMessage('Tên sản phẩm phải có từ 1-255 ký tự'),
    
    body('price')
        .notEmpty().withMessage('Giá là bắt buộc')
        .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
    
    body('category')
        .trim()
        .notEmpty().withMessage('Danh mục là bắt buộc'),
    
    body('stock_quantity')
        .optional()
        .isInt({ min: 0 }).withMessage('Số lượng tồn kho phải là số nguyên dương'),
    
    body('original_price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Giá gốc phải là số dương'),
    
    handleValidationErrors
];

// Order validation
const validateOrder = [
    body('shipping_address')
        .trim()
        .notEmpty().withMessage('Địa chỉ giao hàng là bắt buộc')
        .isLength({ min: 10, max: 500 }).withMessage('Địa chỉ phải có từ 10-500 ký tự'),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Số điện thoại là bắt buộc')
        .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ (10-11 số)'),
    
    body('payment_method')
        .optional()
        .isIn(['bank_transfer', 'momo', 'visa']).withMessage('Phương thức thanh toán không hợp lệ'),
    
    body('coupon_code')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Mã giảm giá quá dài'),
    
    body('use_loyalty_points')
        .optional()
        .isInt({ min: 0 }).withMessage('Số điểm thưởng phải là số nguyên dương'),
    
    handleValidationErrors
];

// Cart item validation
const validateCartItem = [
    body('product_id')
        .notEmpty().withMessage('Product ID là bắt buộc')
        .isInt({ min: 1 }).withMessage('Product ID phải là số nguyên dương'),
    
    body('quantity')
        .notEmpty().withMessage('Số lượng là bắt buộc')
        .isInt({ min: 1 }).withMessage('Số lượng phải là số nguyên dương'),
    
    handleValidationErrors
];

// ID parameter validation
const validateId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID phải là số nguyên dương'),
    handleValidationErrors
];

// Comment validation
const validateComment = [
    body('product_id')
        .notEmpty().withMessage('Product ID là bắt buộc')
        .isInt({ min: 1 }).withMessage('Product ID phải là số nguyên dương'),
    
    body('comment')
        .trim()
        .notEmpty().withMessage('Bình luận là bắt buộc')
        .isLength({ min: 1, max: 1000 }).withMessage('Bình luận phải có từ 1-1000 ký tự'),
    
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Đánh giá phải từ 1-5 sao'),
    
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateProduct,
    validateOrder,
    validateCartItem,
    validateId,
    validateComment,
    handleValidationErrors
};

