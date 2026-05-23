import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import './LoginPage.css';

function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.password) {
            setError('Please fill in both fields.');
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(form.email, form.password);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Demo: bypass API when backend isn't running yet
    const handleDemo = () => {
        localStorage.setItem('authToken', 'demo-token-123');
        localStorage.setItem('user', JSON.stringify({ name: 'Demo User', email: 'demo@cloudapp.io', role: 'admin' }));
        navigate('/dashboard');
    };

    return (
        <div className="login-root">
            {/* Grid bg */}
            <div className="login-grid-bg" aria-hidden="true" />

            <div className="login-card">
                <div className="login-logo">
                    <span className="logo-icon">⬡</span>
                    <span className="logo-text">CloudApp</span>
                </div>

                <h1 className="login-title">Sign in</h1>
                <p className="login-sub">Access your cloud dashboard</p>

                {error && <div className="login-error" role="alert">⚠ {error}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label className="field-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            className="field-input"
                            type="email"
                            name="email"
                            placeholder="you@company.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="field-input"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Sign in →'}
                    </button>
                </form>

                <div className="login-divider"><span>or</span></div>

                <button className="btn-demo" type="button" onClick={handleDemo}>
                    Continue with Demo Account
                </button>

                <p className="login-footer-note">
                    Phase 02 — React Frontend running on <code>localhost:3000</code>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
