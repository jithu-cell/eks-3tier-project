// Global error handler — must be LAST middleware in server.js
// Called when any route does: next(err) or throws
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);

    // PostgreSQL: duplicate email (UNIQUE constraint)
    if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    // PostgreSQL: invalid UUID format
    if (err.code === '22P02') {
        return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Default 500 — show stack trace only in development
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;