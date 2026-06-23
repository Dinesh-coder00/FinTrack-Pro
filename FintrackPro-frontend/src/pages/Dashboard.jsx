// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmt, fmtDate } from '../utils/format';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader" style={{ position: 'relative', height: 300 }}>
    <div className="loader-ring"><div/><div/><div/><div/></div>
  </div>;

  const d = data || {};
  const budget = d.currentBudget;
  const budgetPct = budget ? Math.min(budget.pctUsed || 0, 100) : 0;
  const budgetColor = budgetPct >= 100 ? 'danger' : budgetPct >= 80 ? 'warning' : 'success';

  return (
    <div className="animate-fade">
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h2>Good {greeting()}, {user?.name?.split(' ')[0]} 👋</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          Here's a summary of your finances — {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid stagger">
        <StatCard type="income"  icon="💰" label="Total Income"
          value={fmt(d.totalIncome, user?.currency)}
          sub={`This month: ${fmt(d.monthlyIncome, user?.currency)}`} />
        <StatCard type="expense" icon="💸" label="Total Expenses"
          value={fmt(d.totalExpense, user?.currency)}
          sub={`This month: ${fmt(d.monthlyExpense, user?.currency)}`} />
        <StatCard type="balance" icon="📈" label="Net Balance"
          value={fmt(d.balance, user?.currency)}
          sub={`Monthly: ${fmt(d.monthlyBalance, user?.currency)}`} />
        <StatCard type="budget"  icon="🎯" label="Monthly Budget"
          value={budget ? `${budgetPct.toFixed(0)}% used` : 'Not set'}
          sub={budget ? `${fmt(budget.remaining, user?.currency)} remaining` : 'Set a budget →'}
          onClick={() => navigate('/budget')} />
      </div>

      {/* Budget progress */}
      {budget && (
        <div className="card mb-6 animate-up" style={{ animationDelay:'0.2s' }}>
          <div className="card-header">
            <span className="card-title">Budget Overview</span>
            <span className={`badge badge-${budgetColor === 'danger' ? 'expense' : budgetColor === 'warning' ? 'warning' : 'success'}`}>
              {budget.overBudget ? '🚨 Overspent!' : budgetPct >= 80 ? '⚠️ Warning' : '✅ On track'}
            </span>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-secondary">
                {fmt(budget.spent, user?.currency)} of {fmt(budget.totalLimit, user?.currency)}
              </span>
              <span className={`text-sm font-bold text-${budgetColor === 'danger' ? 'danger' : budgetColor === 'warning' ? 'warning' : 'success'}`}>
                {budgetPct.toFixed(1)}%
              </span>
            </div>
            <div className="progress-bar">
              <div className={`progress-fill ${budgetColor}`} style={{ width: `${budgetPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="card animate-up" style={{ animationDelay: '0.3s' }}>
        <div className="card-header">
          <span className="card-title">Recent Transactions</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>
            View all →
          </button>
        </div>
        <div className="card-body" style={{ padding: '12px 0' }}>
          {(d.recentTransactions || []).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No transactions yet</div>
              <p>Add income or expense to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign:'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {d.recentTransactions.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 20 }}>
                            {t.type === 'Income' ? '💰' : getCategoryIcon(t.category)}
                          </span>
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${t.category}`}>{t.category}</span>
                      </td>
                      <td className="text-muted text-sm">{fmtDate(t.date)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`font-bold text-${t.type === 'Income' ? 'success' : 'danger'}`}>
                          {t.type === 'Income' ? '+' : '−'}{fmt(t.amount, user?.currency)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginTop:24 }}>
        {[
          { icon:'💰', label:'Add Income',  path:'/income',    color:'var(--success)' },
          { icon:'💸', label:'Add Expense', path:'/expense',   color:'var(--danger)' },
          { icon:'🎯', label:'Set Budget',  path:'/budget',    color:'var(--warning)' },
          { icon:'🏦', label:'New Goal',    path:'/savings',   color:'var(--accent)' },
        ].map(a => (
          <button
            key={a.label}
            className="card btn"
            onClick={() => navigate(a.path)}
            style={{ padding: 20, flexDirection:'column', gap:10, border:'none',
              background:'var(--surface)', cursor:'pointer', transition:'all 0.2s' }}
          >
            <span style={{ fontSize: 28 }}>{a.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ type, icon, label, value, sub, onClick }) {
  return (
    <div className={`stat-card ${type}`} onClick={onClick} style={onClick ? { cursor:'pointer' } : {}}>
      <div className={`stat-icon ${type}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getCategoryIcon(cat) {
  const icons = {
    Food:'🍔', Travel:'✈️', Shopping:'🛍️', Bills:'📑',
    Entertainment:'🎬', Health:'❤️', Education:'📚', Other:'📦'
  };
  return icons[cat] || '📦';
}
