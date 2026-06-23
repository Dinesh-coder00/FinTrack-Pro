// src/pages/SavingsPage.jsx
import React, { useEffect, useState } from 'react';
import { savingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmt, fmtDate, today } from '../utils/format';
import toast from 'react-hot-toast';

const EMPTY = { title: '', targetAmount: '', savedAmount: '', deadline: '' };

export default function SavingsPage() {
  const { user } = useAuth();
  const [goals, setGoals]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [contributeModal, setContributeModal] = useState(null); // holds goal object
  const [form, setForm]             = useState(EMPTY);
  const [contribution, setContribution] = useState('');

  const load = () => {
    setLoading(true);
    savingsAPI.getAll()
      .then(r => setGoals(r.data.data))
      .catch(() => toast.error('Failed to load goals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await savingsAPI.create(form);
      toast.success('Savings goal created!');
      setModal(false);
      setForm(EMPTY);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create goal'); }
  };

  const contribute = async (e) => {
    e.preventDefault();
    try {
      await savingsAPI.contribute(contributeModal.id, contribution);
      toast.success('Contribution added!');
      setContributeModal(null);
      setContribution('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try { await savingsAPI.remove(id); toast.success('Goal deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const activeGoals    = goals.filter(g => g.status === 'Active');
  const completedGoals = goals.filter(g => g.status === 'Completed');

  const GoalCard = ({ goal }) => {
    const pct   = Math.min(goal.progressPct || 0, 100);
    const color = goal.completed ? 'success' : pct >= 75 ? 'accent' : pct >= 40 ? 'warning' : 'accent';

    return (
      <div className="card animate-up" style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>
              {goal.title}
            </div>
            {goal.deadline && (
              <div className="text-sm text-muted" style={{ marginTop: 2 }}>
                🗓 Deadline: {fmtDate(goal.deadline)}
              </div>
            )}
          </div>
          <span className={`badge ${goal.completed ? 'badge-success' : 'badge-info'}`}>
            {goal.completed ? '🎉 Completed' : '🎯 Active'}
          </span>
        </div>

        {/* Amounts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <div className="text-xs text-muted">Saved</div>
            <div className="font-bold text-success" style={{ fontSize: 18 }}>
              {fmt(goal.savedAmount, user?.currency)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted">Target</div>
            <div className="font-bold" style={{ fontSize: 18 }}>
              {fmt(goal.targetAmount, user?.currency)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted">Progress</span>
            <span className="font-bold" style={{ color: `var(--${color === 'accent' ? 'accent' : color})` }}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="progress-bar">
            <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
          </div>
          {!goal.completed && (
            <div className="text-xs text-muted" style={{ marginTop: 6 }}>
              {fmt(parseFloat(goal.targetAmount) - parseFloat(goal.savedAmount), user?.currency)} remaining
            </div>
          )}
        </div>

        {goal.completed && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 12,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            fontSize: 13, color: 'var(--success)', fontWeight: 500,
          }}>
            🎉 Congratulations! Goal achieved!
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!goal.completed && (
            <button className="btn btn-success btn-sm flex-1"
              onClick={() => { setContributeModal(goal); setContribution(''); }}>
              + Add Money
            </button>
          )}
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(goal.id)}>🗑</button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Savings Goals</h2>
          <p className="section-sub">Set targets and track your progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Goal</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>
      ) : goals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏦</div>
            <div className="empty-title">No savings goals yet</div>
            <p style={{ marginBottom: 20 }}>Create your first savings goal and start working toward it</p>
            <button className="btn btn-primary" onClick={() => setModal(true)}>Create Goal</button>
          </div>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <>
              <h3 style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>🎯 Active Goals</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
                {activeGoals.map(g => <GoalCard key={g.id} goal={g} />)}
              </div>
            </>
          )}
          {completedGoals.length > 0 && (
            <>
              <h3 style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>✅ Completed Goals</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {completedGoals.map(g => <GoalCard key={g.id} goal={g} />)}
              </div>
            </>
          )}
        </>
      )}

      {/* Create Goal Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Savings Goal</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Goal Title</label>
                  <input className="form-control" placeholder="e.g. Emergency Fund, New Laptop"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Target Amount</label>
                    <input type="number" min="1" step="0.01" className="form-control" placeholder="5000"
                      value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Already Saved</label>
                    <input type="number" min="0" step="0.01" className="form-control" placeholder="0"
                      value={form.savedAmount} onChange={e => setForm(f => ({ ...f, savedAmount: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Deadline (optional)</label>
                  <input type="date" className="form-control" min={today()}
                    value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeModal && (
        <div className="modal-overlay" onClick={() => setContributeModal(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Money</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setContributeModal(null)}>✕</button>
            </div>
            <form onSubmit={contribute}>
              <div className="modal-body">
                <p className="text-secondary" style={{ marginBottom: 16 }}>
                  Adding to: <strong>{contributeModal.title}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Amount ({user?.currency})</label>
                  <input type="number" min="0.01" step="0.01" className="form-control" placeholder="100"
                    value={contribution} onChange={e => setContribution(e.target.value)} required autoFocus />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setContributeModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-success">Add Contribution</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
