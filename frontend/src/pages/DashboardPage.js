import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, createUser, deleteUser, getHealthStatus } from '../services/api';
import './DashboardPage.css';

// ── Small stat card ────────────────────────────────────
function StatCard({ label, value, delta, accent }) {
    return (
        <div className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color: accent || 'var(--text)' }}>{value}</div>
            {delta && <div className="stat-delta">{delta}</div>}
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────
function DashboardPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [users, setUsers] = useState([]);
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'viewer' });
    const [saving, setSaving] = useState(false);

    // ── Load users + health on mount ──────────────────────
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [usersData, healthData] = await Promise.all([
                getUsers(),
                getHealthStatus(),
            ]);
            setUsers(usersData.users || usersData);
            setHealth(healthData);
        } catch (err) {
            // Demo fallback — works even without backend running
            setUsers([
                { id: 1, name: 'Alice Kumar', email: 'alice@cloudapp.io', role: 'admin', status: 'active', joined: '2024-01-15' },
                { id: 2, name: 'Bob Nair', email: 'bob@cloudapp.io', role: 'developer', status: 'active', joined: '2024-02-20' },
                { id: 3, name: 'Carol Thomas', email: 'carol@cloudapp.io', role: 'viewer', status: 'inactive', joined: '2024-03-10' },
                { id: 4, name: 'David Singh', email: 'david@cloudapp.io', role: 'developer', status: 'active', joined: '2024-04-05' },
            ]);
            setHealth({ status: 'demo', db: 'disconnected', uptime: 0 });
            setError('Backend not connected — showing demo data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email) return;
        setSaving(true);
        try {
            await createUser(newUser);
            setShowModal(false);
            setNewUser({ name: '', email: '', role: 'viewer' });
            fetchData();
        } catch {
            // Demo mode — add locally
            setUsers(prev => [...prev, { ...newUser, id: Date.now(), status: 'active', joined: new Date().toISOString().slice(0, 10) }]);
            setShowModal(false);
            setNewUser({ name: '', email: '', role: 'viewer' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await deleteUser(id);
            fetchData();
        } catch {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
    };

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        admins: users.filter(u => u.role === 'admin').length,
        devs: users.filter(u => u.role === 'developer').length,
    };

    return (
        <div className="dash-root">

            {/* ── SIDEBAR ── */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span className="logo-icon">⬡</span>
                    <span className="logo-text">CloudApp</span>
                </div>
                <nav className="sidebar-nav">
                    <a className="nav-item active" href="#dashboard">
                        <span className="nav-icon">▦</span> Dashboard
                    </a>
                    <a className="nav-item" href="#users">
                        <span className="nav-icon">◈</span> Users
                    </a>
                    <a className="nav-item" href="#monitoring">
                        <span className="nav-icon">◎</span> Monitoring
                    </a>
                    <a className="nav-item" href="#settings">
                        <span className="nav-icon">⊙</span> Settings
                    </a>
                </nav>
                <div className="sidebar-footer">
                    <div className="user-pill">
                        <div className="user-avatar">{(user.name || 'U')[0].toUpperCase()}</div>
                        <div>
                            <div className="user-name">{user.name || 'User'}</div>
                            <div className="user-role">{user.role || 'admin'}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>↩</button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="dash-main">

                {/* Header */}
                <div className="dash-header">
                    <div>
                        <h1 className="dash-title">Dashboard</h1>
                        <p className="dash-sub">
                            {health?.status === 'ok'
                                ? <span className="status-dot green" />
                                : <span className="status-dot amber" />}
                            {health?.status === 'ok' ? 'Backend connected' : 'Demo mode — backend not running'}
                        </p>
                    </div>
                    <button className="btn-add" onClick={() => setShowModal(true)}>
                        + Add User
                    </button>
                </div>

                {error && (
                    <div className="dash-banner">
                        ℹ {error} — Start the backend (Phase 03) to use live data.
                    </div>
                )}

                {/* Stat cards */}
                <div className="stats-grid">
                    <StatCard label="Total Users" value={stats.total} delta="+2 this week" accent="var(--accent)" />
                    <StatCard label="Active" value={stats.active} delta={`${Math.round(stats.active / stats.total * 100) || 0}% of total`} accent="var(--green)" />
                    <StatCard label="Admins" value={stats.admins} accent="var(--accent2)" />
                    <StatCard label="Developers" value={stats.devs} accent="#f59e0b" />
                </div>

                {/* Health strip */}
                {health && (
                    <div className="health-strip">
                        <div className="health-item">
                            <span className="health-label">API</span>
                            <span className={`health-val ${health.status === 'ok' ? 'ok' : 'warn'}`}>
                                {health.status === 'ok' ? 'healthy' : 'demo'}
                            </span>
                        </div>
                        <div className="health-item">
                            <span className="health-label">Database</span>
                            <span className={`health-val ${health.db === 'connected' ? 'ok' : 'warn'}`}>
                                {health.db || 'disconnected'}
                            </span>
                        </div>
                        <div className="health-item">
                            <span className="health-label">Uptime</span>
                            <span className="health-val ok">{health.uptime ? `${Math.floor(health.uptime)}s` : 'N/A'}</span>
                        </div>
                        <div className="health-item">
                            <span className="health-label">Environment</span>
                            <span className="health-val">{process.env.NODE_ENV}</span>
                        </div>
                    </div>
                )}

                {/* Users table */}
                <div className="table-card">
                    <div className="table-header">
                        <h2 className="table-title">Users</h2>
                        <button className="btn-refresh" onClick={fetchData} disabled={loading}>
                            {loading ? '...' : '↻ Refresh'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-rows">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton-row" />)}
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="cell-avatar">{u.name[0]}</div>
                                                {u.name}
                                            </div>
                                        </td>
                                        <td className="td-muted">{u.email}</td>
                                        <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                                        <td><span className={`status-badge status-${u.status}`}>{u.status}</span></td>
                                        <td className="td-muted td-mono">{u.joined}</td>
                                        <td>
                                            <button className="btn-del" onClick={() => handleDelete(u.id)}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Stack info */}
                <div className="stack-info">
                    <div className="stack-label">Tech Stack</div>
                    {['React 18', 'React Router v6', 'Axios', 'AWS EKS', 'Node.js Backend', 'PostgreSQL RDS'].map(t => (
                        <span key={t} className="stack-tag">{t}</span>
                    ))}
                </div>
            </main>

            {/* ── CREATE USER MODAL ── */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Add New User</h2>

                        <form onSubmit={handleCreate}>
                            <div className="field-group">
                                <label className="field-label">Full Name</label>
                                <input className="field-input" placeholder="Alice Kumar"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                            </div>
                            <div className="field-group">
                                <label className="field-label">Email</label>
                                <input className="field-input" type="email" placeholder="alice@company.com"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>
                            <div className="field-group">
                                <label className="field-label">Role</label>
                                <select className="field-input"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="admin">Admin</option>
                                    <option value="developer">Developer</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;