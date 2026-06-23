// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmtDate } from '../utils/format';
import toast from 'react-hot-toast';

const CURRENCIES = ['INR','USD','EUR','GBP','CAD','AUD','JPY','SGD','AED'];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ name:'', currency:'INR', darkMode: false, avatarUrl:'' });

  useEffect(() => {
    profileAPI.get()
      .then(r => {
        const p = r.data.data;
        setProfile(p);
        setForm({ name: p.name, currency: p.currency, darkMode: p.darkMode, avatarUrl: p.avatarUrl || '' });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileAPI.update(form);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding: 80 }}>
      <div className="loader-ring"><div/><div/><div/><div/></div>
    </div>
  );

  return (
    <div className="animate-fade" style={{ maxWidth: 720 }}>
      <h2 className="section-title">My Profile</h2>
      <p className="section-sub">Manage your account settings and preferences</p>

      {/* Avatar card */}
      <div className="card mb-6" style={{ padding: 28 }}>
        <div className="flex items-center gap-4">
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 28, fontWeight: 800, color: '#fff',
            fontFamily: 'var(--font-display)', flexShrink: 0,
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700 }}>
              {profile?.name}
            </div>
            <div className="text-secondary">{profile?.email}</div>
            <div className="text-muted text-sm" style={{ marginTop:4 }}>
              Member since {fmtDate(profile?.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card mb-6" style={{ padding: 28 }}>
        <h3 style={{ marginBottom: 20, fontFamily:'var(--font-display)' }}>Account Settings</h3>
        <form onSubmit={save}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" value={profile?.email} disabled
              style={{ opacity: 0.6, cursor:'not-allowed' }} />
            <div className="text-xs text-muted" style={{ marginTop:4 }}>Email cannot be changed</div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-control" value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Theme</label>
              <select className="form-control" value={form.darkMode ? 'dark' : 'light'}
                onChange={e => setForm(f => ({ ...f, darkMode: e.target.value === 'dark' }))}>
                <option value="light">☀️ Light</option>
                <option value="dark">🌙 Dark</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Avatar URL (optional)</label>
            <input className="form-control" type="url" placeholder="https://..."
              value={form.avatarUrl}
              onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} />
          </div>

          <div style={{ display:'flex', gap:12, marginTop:8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : '✓ Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Stats card */}
      <div className="card mb-6" style={{ padding: 28 }}>
        <h3 style={{ marginBottom: 20, fontFamily:'var(--font-display)' }}>Account Information</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            { label:'Account ID',     value:`#${profile?.id}` },
            { label:'Currency',       value: profile?.currency },
            { label:'Theme',          value: profile?.darkMode ? '🌙 Dark' : '☀️ Light' },
            { label:'Member Since',   value: fmtDate(profile?.createdAt) },
          ].map(item => (
            <div key={item.label} style={{
              padding: 16, background:'var(--surface-alt)',
              borderRadius: 10, border:'1px solid var(--border)',
            }}>
              <div className="text-xs text-muted" style={{ marginBottom:4 }}>{item.label}</div>
              <div style={{ fontWeight:600, fontSize:15 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: 28, borderColor:'rgba(239,68,68,0.3)' }}>
        <h3 style={{ marginBottom:8, fontFamily:'var(--font-display)', color:'var(--danger)' }}>
          Danger Zone
        </h3>
        <p className="text-secondary" style={{ marginBottom:16, fontSize:14 }}>
          Logging out will end your current session.
        </p>
        <button className="btn btn-danger" onClick={logout}>⏻ Logout</button>
      </div>
    </div>
  );
}
