import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const handle = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        email,
        otp,
        newPassword: form.newPassword
      });

      toast.success('Password reset successfully');
      navigate('/login');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-card animate-up">

          <div className="auth-logo">
            <div className="auth-logo-icon">🔑</div>
            <span>FinTrack <strong>Pro</strong></span>
          </div>

          <h2>Reset Password</h2>

          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Create a new password for your account
          </p>

          <form onSubmit={submit}>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                name="newPassword"
                type="password"
                className="form-control"
                placeholder="New password"
                value={form.newPassword}
                onChange={handle}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handle}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password →'}
            </button>

          </form>

          <p style={{ textAlign: 'center', marginTop: 20 }}>
            <Link
              to="/login"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
            >
              Back to Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}