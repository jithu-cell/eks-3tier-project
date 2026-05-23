const jwt = require('jsonwebtoken');

// authMiddleware — verifies the JWT token on every protected route
// The frontend sends: Authorization: Bearer <token>
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.split(' ')[1]; // extract token after "Bearer "

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        req.user = decoded; // attach decoded user {id, email, role} to request
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// adminOnly — use AFTER authMiddleware to restrict to admin role
const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden. Admin access required.'
        });
    }
    next();
};

module.exports = { authMiddleware, adminOnly };