// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [show, setShow]   = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const ok = await login(form.email, form.password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-blobs" />
        <div className="auth-hero-content animate-up">
          <div style={{ fontSize: 56, marginBottom: 24 }}>💹</div>
          <h1>Take control of your finances</h1>
          <p>Track income, manage expenses, plan budgets, and achieve savings goals — all in one powerful dashboard.</p>
          <div style={{ marginTop: 40, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['📊 Real-time Analytics','🔒 Secure & Private','📱 Works on Mobile'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, opacity: 0.8 }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card animate-up">
          <div className="auth-logo">
            <div className="auth-logo-icon">💹</div>
            <span>FinTrack <strong>Pro</strong></span>
          </div>

          <h2 style={{ marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                name="email" type="email" className="form-control"
                placeholder="you@example.com"
                value={form.email} onChange={handle} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password" type={show ? 'text' : 'password'}
                  className="form-control" placeholder="••••••••"
                  value={form.password} onChange={handle} required
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}
                >
                  {show ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
              <Link
                  to="/forgot-password"
                 style={{
                    color: 'var(--accent)',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none'
                          }}>Forgot Password?
                              </Link>
                            </div>
            

            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>

          <div style={{ marginTop: 20, padding: 12, background: 'var(--surface-alt)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            Demo: <strong>alex@fintrack.pro</strong> / <strong>Password123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
