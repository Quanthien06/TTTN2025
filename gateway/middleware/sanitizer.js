/**
 * XSS Prevention Middleware
 * Sanitize user input để ngăn chặn XSS attacks
 */

const sanitizeHtml = require('sanitize-html');

// Sanitize HTML content (for comments, reviews, descriptions)
const sanitizeHtmlContent = (dirty) => {
    if (!dirty || typeof dirty !== 'string') return dirty;
    
    return sanitizeHtml(dirty, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        allowedAttributes: {
            'a': ['href', 'title']
        },
        allowedSchemes: ['http', 'https'],
        // Remove all other tags and attributes
    });
};

// Sanitize plain text (remove all HTML)
const sanitizeText = (dirty) => {
    if (!dirty || typeof dirty !== 'string') return dirty;
    
    return sanitizeHtml(dirty, {
        allowedTags: [],
        allowedAttributes: {}
    });
};

// Middleware để sanitize request body
const sanitizeRequestBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        // Sanitize text fields
        const textFields = ['username', 'email', 'phone', 'shipping_address', 'name', 'category', 'slug'];
        textFields.forEach(field => {
            if (req.body[field]) {
                req.body[field] = sanitizeText(req.body[field]);
            }
        });
        
        // Sanitize HTML fields (allow some HTML)
        const htmlFields = ['comment', 'description', 'content'];
        htmlFields.forEach(field => {
            if (req.body[field]) {
                req.body[field] = sanitizeHtmlContent(req.body[field]);
            }
        });
    }
    next();
};

module.exports = {
    sanitizeHtmlContent,
    sanitizeText,
    sanitizeRequestBody
};

