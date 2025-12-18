// middleware/authorize.js
// Simple permission middleware: accepts array of roles or a permission string
module.exports = function authorize(required) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // If required is array -> check role membership (admin bypass built-in)
    if (Array.isArray(required)) {
      if (req.user.role === 'admin' || required.includes(req.user.role)) return next();
      return res.status(403).json({ message: 'Forbidden' });
    }

    // If required is string -> treat as permission name and check req.user.permissions (array)
    if (typeof required === 'string') {
      const perms = req.user.permissions || [];
      if (req.user.role === 'admin' || perms.includes(required)) return next();
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Default deny
    return res.status(403).json({ message: 'Forbidden' });
  };
};
