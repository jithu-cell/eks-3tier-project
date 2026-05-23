const pool = require('./database');

const initDatabase = async () => {
    const client = await pool.connect();
    try {
        console.log('📦 Initializing database tables...');

        // Enable UUID generation
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create users table (safe — won't overwrite if it exists)
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name       VARCHAR(100)        NOT NULL,
        email      VARCHAR(255) UNIQUE NOT NULL,
        password   VARCHAR(255)        NOT NULL,
        role       VARCHAR(20)  DEFAULT 'viewer'
                   CHECK (role IN ('admin','developer','viewer')),
        status     VARCHAR(20)  DEFAULT 'active'
                   CHECK (status IN ('active','inactive')),
        created_at TIMESTAMP    DEFAULT NOW(),
        updated_at TIMESTAMP    DEFAULT NOW()
      )
    `);

        // Seed 4 demo users only if the table is empty
        const { rows } = await client.query(`SELECT COUNT(*) FROM users`);
        if (parseInt(rows[0].count) === 0) {
            console.log('🌱 Seeding initial users...');
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('password123', 10);

            await client.query(`
        INSERT INTO users (name, email, password, role, status) VALUES
          ('Alice Kumar',  'alice@cloudapp.io',  $1, 'admin',     'active'),
          ('Bob Nair',     'bob@cloudapp.io',    $1, 'developer', 'active'),
          ('Carol Thomas', 'carol@cloudapp.io',  $1, 'viewer',    'inactive'),
          ('David Singh',  'david@cloudapp.io',  $1, 'developer', 'active')
      `, [hash]);
            console.log('✅ Seed users created (password: password123)');
        }
        console.log('✅ Database ready');
    } catch (err) {
        console.error('❌ DB init error:', err.message);
        throw err;
    } finally {
        client.release(); // ALWAYS release — prevents connection leak
    }
};

module.exports = initDatabase;