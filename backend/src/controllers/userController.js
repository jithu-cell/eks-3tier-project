const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// GET /api/users — all users, newest first
const getUsers = async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
      SELECT id, name, email, role, status,
             TO_CHAR(created_at, 'YYYY-MM-DD') AS joined
      FROM users ORDER BY created_at DESC
    `);
        res.json({ success: true, count: rows.length, users: rows });
    } catch (err) { next(err); }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, name, email, role, status,
              TO_CHAR(created_at, 'YYYY-MM-DD') AS joined
       FROM users WHERE id = $1`, [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, user: rows[0] });
    } catch (err) { next(err); }
};

// POST /api/users — admin only
const createUser = async (req, res, next) => {
    try {
        const { name, email, password = 'password123', role = 'viewer' } = req.body;
        if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email required.' });

        const hash = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, status,
                 TO_CHAR(created_at, 'YYYY-MM-DD') AS joined`,
            [name, email.toLowerCase(), hash, role]
        );
        res.status(201).json({ success: true, message: 'User created.', user: rows[0] });
    } catch (err) { next(err); }
};

// PUT /api/users/:id — partial update with COALESCE
const updateUser = async (req, res, next) => {
    try {
        const { name, role, status } = req.body;
        const { rows } = await pool.query(
            `UPDATE users
       SET name=COALESCE($1,name), role=COALESCE($2,role),
           status=COALESCE($3,status), updated_at=NOW()
       WHERE id=$4
       RETURNING id, name, email, role, status`,
            [name, role, status, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, message: 'User updated.', user: rows[0] });
    } catch (err) { next(err); }
};

// DELETE /api/users/:id
const deleteUser = async (req, res, next) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
        if (!rowCount) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, message: 'User deleted.' });
    } catch (err) { next(err); }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };