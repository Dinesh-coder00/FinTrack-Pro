import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.verifyOtp({
        email,
        otp
      });

      toast.success('OTP verified successfully');

      navigate('/reset-password', {
        state: { email, otp }
      });

    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Invalid OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-card animate-up">

          <div className="auth-logo">
            <div className="auth-logo-icon">📩</div>
            <span>FinTrack <strong>Pro</strong></span>
          </div>

          <h2>Verify OTP</h2>

          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: 24
            }}
          >
            Enter the OTP sent to your email
          </p>

          <form onSubmit={submit}>

            <div className="form-group">
              <label className="form-label">
                OTP Code
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading
                ? 'Verifying...'
                : 'Verify OTP →'}
            </button>

          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: 20
            }}
          >
            <Link
              to="/login"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none'
              }}
            >
              Back to Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}