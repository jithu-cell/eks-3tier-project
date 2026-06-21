require('dotenv').config(); // load .env FIRST before anything else
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const initDatabase = require('./config/db-init');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const { register, metricsMiddleware } = require('./middleware/metrics');

const app = express();
const PORT = process.env.PORT || 3001;

// ── SECURITY MIDDLEWARE ──────────────────────────────────
app.use(helmet());   // sets security HTTP headers automatically

// ── CORS: allow frontend (React on :3000) to call this API ──
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// ── REQUEST PARSING ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── LOGGING ──────────────────────────────────────────────
// 'dev' format: GET /api/users 200 5ms
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ── METRICS MIDDLEWARE ────────────────────────────────────────────────────────
app.use(metricsMiddleware);

// ── HEALTH CHECK ─────────────────────────────────────────
// Kubernetes liveness/readiness probes hit this endpoint
app.get('/health', async (req, res) => {
    let dbStatus = 'disconnected';
    let dbLatency = null;

    try {
        const start = Date.now();
        const pool = require('./config/database');
        await pool.query('SELECT 1');
        dbLatency = Date.now() - start;
        dbStatus = 'connected';
    } catch (_) { }

    res.json({
        status: dbStatus === 'connected' ? 'ok' : 'degraded',
        db: dbStatus,
        dbLatency: dbLatency ? `${dbLatency}ms` : null,
        uptime: process.uptime(),
        env: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// ── PROMETHEUS METRICS ────────────────────────────────────────────────────────
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

// ── API ROUTES ───────────────────────────────────────────
app.use('/api', authRoutes);         // /api/login, /api/register
app.use('/api/users', userRoutes);   // /api/users CRUD

// ── 404 HANDLER ──────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found.`
    });
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────
app.use(errorHandler);

// ── START SERVER ─────────────────────────────────────────
const startServer = async () => {
    try {
        // Initialize DB tables (creates them if they don't exist)
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`   Health: http://localhost:${PORT}/health`);
            console.log(`   Env:    ${process.env.NODE_ENV || 'development'}\n`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        console.error('   Tip: Is PostgreSQL running? Check .env DB settings.');
        process.exit(1);
    }
};

startServer();

module.exports = app; // exported for tests