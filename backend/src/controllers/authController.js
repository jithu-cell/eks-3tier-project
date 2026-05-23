const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// POST /api/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required.' });
        }

        // Find user — only active users can log in
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND status = $2',
            [email.toLowerCase(), 'active']
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Sign JWT — payload: id, email, role
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'dev_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true, token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) { next(err); }
};

// POST /api/register
const register = async (req, res, next) => {
    try {
        const { name, email, password, role = 'viewer' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, password required.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, status`,
            [name, email.toLowerCase(), hash, role]
        );

        res.status(201).json({ success: true, message: 'Registered successfully.', user: rows[0] });
    } catch (err) { next(err); } // errorHandler catches duplicate email (code 23505)
};

module.exports = { login, register };