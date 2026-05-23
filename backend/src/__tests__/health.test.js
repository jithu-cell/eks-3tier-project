const request = require('supertest');

// Mock the database so tests run WITHOUT PostgreSQL
jest.mock('../config/database', () => ({
    query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
    connect: jest.fn().mockImplementation((cb) => cb(null, { release: jest.fn() }, jest.fn())),
}));

jest.mock('../config/db-init', () => jest.fn().mockResolvedValue(true));

const app = require('../server');

describe('Health Check', () => {
    it('GET /health returns status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('uptime');
    });
});

describe('Auth Routes', () => {
    it('POST /api/login returns 400 when body is empty', async () => {
        const res = await request(app).post('/api/login').send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('Protected Routes', () => {
    it('GET /api/users returns 401 without token', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(401);
    });
});