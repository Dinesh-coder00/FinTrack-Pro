// src/pages/BudgetPage.jsx
import React, { useEffect, useState } from 'react';
import { budgetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmt } from '../utils/format';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();

export default function BudgetPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({
    month:      now.getMonth() + 1,
    year:       now.getFullYear(),
    totalLimit: '',
    warnPct:    80,
  });

  const load = () => {
    setLoading(true);
    budgetAPI.getAll()
      .then(r => setBudgets(r.data.data))
      .catch(() => toast.error('Failed to load budgets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await budgetAPI.upsert(form);
      toast.success('Budget saved!');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const pctColor = (pct) => {
    if (pct >= 100) return 'danger';
    if (pct >= 80)  return 'warning';
    return 'success';
  };

  return (
    <div className="animate-fade">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Budget Planner</h2>
          <p className="section-sub">Set monthly limits and track spending</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + Set Budget
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Loading…
        </div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <div className="empty-title">No budgets set</div>
            <p style={{ marginBottom: 20 }}>Set a monthly budget to track your spending</p>
            <button className="btn btn-primary" onClick={() => setModal(true)}>
              Set Budget
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {budgets.map((b, i) => {
            const pct   = Math.min(b.pctUsed || 0, 100);
            const color = pctColor(b.pctUsed || 0);

            return (
              // FIX: was <div key={b.id} className="card" style={...} className="card animate-up">
              //      Two className props – React only uses the last one,
              //      AND it generates a compile warning that breaks some setups.
              //      Merged into a single className.
              <div
                key={b.id}
                className="card animate-up"
                style={{ padding: 24, animationDelay: `${i * 0.07}s` }}
              >
                {/* Month header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
                      {MONTHS[b.month - 1]} {b.year}
                    </div>
                    <div className="text-sm text-muted">Monthly Budget</div>
                  </div>
                  <span className={`badge badge-${
                    color === 'danger' ? 'expense' : color === 'warning' ? 'warning' : 'success'
                  }`}>
                    {b.overBudget
                      ? '🚨 Overspent'
                      : (b.pctUsed || 0) >= b.warnPct
                        ? '⚠️ Near Limit'
                        : '✅ On Track'}
                  </span>
                </div>

                {/* Amounts grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                  marginBottom: 20,
                }}>
                  {[
                    { label: 'Limit',     value: b.totalLimit, cls: '' },
                    { label: 'Spent',     value: b.spent,      cls: 'text-danger' },
                    { label: 'Remaining', value: b.remaining,  cls: b.overBudget ? 'text-danger' : 'text-success' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <div className="text-xs text-muted" style={{ marginBottom: 4 }}>
                        {item.label}
                      </div>
                      <div className={`font-bold ${item.cls}`} style={{ fontSize: 15 }}>
                        {fmt(item.value, user?.currency)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted">Usage</span>
                    <span className={`font-bold text-${color}`}>
                      {(b.pctUsed || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted" style={{ marginTop: 6 }}>
                    Warning threshold: {b.warnPct}%
                  </div>
                </div>

                {/* Alert banners */}
                {b.overBudget && (
                  <div style={{
                    marginTop: 16, padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    fontSize: 13, color: 'var(--danger)', fontWeight: 500,
                  }}>
                    🚨 You've exceeded your budget by {fmt(Math.abs(b.remaining), user?.currency)}
                  </div>
                )}
                {!b.overBudget && (b.pctUsed || 0) >= b.warnPct && (
                  <div style={{
                    marginTop: 16, padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    fontSize: 13, color: 'var(--warning)', fontWeight: 500,
                  }}>
                    ⚠️ You've used {(b.pctUsed || 0).toFixed(0)}% of your budget — slow down spending!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Set Budget Modal ──────────────────────────────────────────── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Set Monthly Budget</h3>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <select
                      className="form-control"
                      value={form.month}
                      onChange={e => setForm(f => ({ ...f, month: +e.target.value }))}
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select
                      className="form-control"
                      value={form.year}
                      onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}
                    >
                      {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(y => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Monthly Limit ({user?.currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className="form-control"
                    placeholder="e.g. 3000"
                    value={form.totalLimit}
                    onChange={e => setForm(f => ({ ...f, totalLimit: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Warning Threshold (%): {form.warnPct}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={form.warnPct}
                    onChange={e => setForm(f => ({ ...f, warnPct: +e.target.value }))}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                  <div className="text-xs text-muted" style={{ marginTop: 4 }}>
                    Alert when {form.warnPct}% of budget is used
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
