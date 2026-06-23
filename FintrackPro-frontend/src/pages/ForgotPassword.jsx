import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });
      toast.success('OTP sent to your email');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-card animate-up">
          <div className="auth-logo">
            <div className="auth-logo-icon">🔐</div>
            <span>FinTrack <strong>Pro</strong></span>
          </div>

          <h2 style={{ marginBottom: 6 }}>Forgot Password</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 14 }}>
            Enter your registered email to receive an OTP
          </p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}