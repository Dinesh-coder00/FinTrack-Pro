// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name = 'Name is required';
    if (!form.email.includes('@'))  e.email = 'Valid email required';
    if (form.password.length < 8)   e.password = 'Min 8 characters';
    if (!/[A-Z]/.test(form.password)) e.password = 'Need uppercase letter';
    if (!/\d/.test(form.password))  e.password = 'Need a digit';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await register(form.name, form.email, form.password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-blobs" />
        <div className="auth-hero-content animate-up">
          <div style={{ fontSize: 56, marginBottom: 24 }}>🎯</div>
          <h1>Start your financial journey today</h1>
          <p>Join thousands of users who manage their money smarter with FinTrack Pro's comprehensive finance tools.</p>
          <div style={{ marginTop: 40, display: 'grid', gap: 16 }}>
            {[
              ['✓','Free to use – no credit card required'],
              ['✓','Bank-level security with JWT auth'],
              ['✓','Smart analytics & spending insights'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: 12, fontSize: 14, opacity: 0.85 }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{icon}</span>
                <span>{text}</span>
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

          <h2 style={{ marginBottom: 6 }}>Create your account</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>
            Get started in under a minute
          </p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" className="form-control" placeholder="Alex Morgan"
                value={form.name} onChange={handle} required />
              {errors.name && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input name="email" type="email" className="form-control" placeholder="you@example.com"
                value={form.email} onChange={handle} required />
              {errors.email && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" type="password" className="form-control" placeholder="Min 8 chars"
                  value={form.password} onChange={handle} required />
                {errors.password && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.password}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input name="confirm" type="password" className="form-control" placeholder="Repeat password"
                  value={form.confirm} onChange={handle} required />
                {errors.confirm && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.confirm}</p>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
