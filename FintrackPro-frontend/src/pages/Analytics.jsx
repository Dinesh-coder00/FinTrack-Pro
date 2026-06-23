// src/pages/Analytics.jsx
import React, { useEffect, useState } from 'react';
import { analyticsAPI, incomeAPI, expenseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmt, CATEGORY_COLOURS } from '../utils/format';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, PointElement, LineElement,
  Title, Filler,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, PointElement, LineElement,
  Title, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { family: 'DM Sans' }, padding: 16 } } },
};

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.get()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="loader-ring"><div/><div/><div/><div/></div>
    </div>
  );

  const d = data || {};

  // ── Pie chart: expense by category ───────────────────────────────────────
  const catLabels  = (d.expenseByCategory || []).map(c => c.category);
  const catValues  = (d.expenseByCategory || []).map(c => parseFloat(c.total));
  const catColors  = catLabels.map(l => CATEGORY_COLOURS[l] || '#94a3b8');

  const pieData = {
    labels: catLabels,
    datasets: [{
      data: catValues,
      backgroundColor: catColors.map(c => c + 'cc'),
      borderColor:     catColors,
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  // ── Bar chart: monthly expenses ──────────────────────────────────────────
  const trendLabels  = (d.monthlyTrend || []).map(t => t.month);
  const trendExpense = (d.monthlyTrend || []).map(t => parseFloat(t.expense || 0));
  const trendIncome  = (d.monthlyTrend || []).map(t => parseFloat(t.income  || 0));

 const barData = {
  labels: trendLabels,
  datasets: [
    {
      label: 'Expenses',
      data: trendExpense,
      backgroundColor: 'rgba(239,68,68,0.7)',
      borderColor: '#ef4444',
      borderWidth: 2,
      borderRadius: 0,
      barThickness: 12,
      maxBarThickness: 16,
    },
    {
      label: 'Income',
      data: trendIncome,
      backgroundColor: 'rgba(16,185,129,0.7)',
      borderColor: '#10b981',
      borderWidth: 2,
      borderRadius: 0,
      barThickness: 12,
      maxBarThickness: 16,
    },
  ],
};

  // ── Line chart: savings growth (cumulative balance) ───────────────────────
  const cumulativeSavings = trendIncome.map((inc, i) =>
    trendIncome.slice(0, i+1).reduce((a, v) => a + v, 0) -
    trendExpense.slice(0, i+1).reduce((a, v) => a + v, 0)
  );

  const lineData = {
    labels: trendLabels,
    datasets: [{
      label: 'Net Savings',
      data: cumulativeSavings,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius: 4,
      pointHoverRadius: 7,
    }],
  };

  // ── Totals for summary cards ─────────────────────────────────────────────
  const totalExp = catValues.reduce((a, v) => a + v, 0);

  return (
    <div className="animate-fade">
      <h2 className="section-title">Financial Analytics</h2>
      <p className="section-sub">Visual insights into your financial patterns</p>

      {/* Summary row */}
      {d.expenseByCategory?.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16, marginBottom:28 }}>
          {d.expenseByCategory.map((c, i) => (
            <div key={c.category} className="card animate-up" style={{ padding: 16, animationDelay:`${i*0.05}s` }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ width:10, height:10, borderRadius:'50%', background: CATEGORY_COLOURS[c.category] || '#94a3b8', display:'inline-block' }}/>
                <span className="text-xs text-muted" style={{ fontWeight:600 }}>{c.category}</span>
              </div>
              <div className="font-bold" style={{ fontSize:16 }}>{fmt(c.total, user?.currency)}</div>
              <div className="text-xs text-muted">{((parseFloat(c.total)/totalExp)*100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts grid */}
      <div className="charts-grid">
        {/* Pie */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom:0 }}>
            <span className="card-title">🥧 Expenses by Category</span>
          </div>
          <div className="card-body" style={{ height: 320 }}>
            {catValues.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🥧</div><div className="empty-title">No expense data</div></div>
            ) : (
              <Pie data={pieData} options={chartDefaults} />
            )}
          </div>
        </div>

        {/* Bar */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Income vs Expenses (Monthly)</span>
          </div>
          <div className="card-body" style={{ height: 320 }}>
            {trendLabels.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No trend data</div></div>
            ) : (
              <Bar data={barData} options={{
                ...chartDefaults,
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { callback: v => fmt(v, user?.currency) } },
                },
              }} />
            )}
          </div>
        </div>

        {/* Line */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">📈 Savings Growth Trend</span>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            {trendLabels.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📈</div><div className="empty-title">No trend data yet</div></div>
            ) : (
              <Line data={lineData} options={{
                ...chartDefaults,
                scales: {
                  x: { grid: { display: false } },
                  y: {
                    grid: { color: 'rgba(148,163,184,0.1)' },
                    ticks: { callback: v => fmt(v, user?.currency) },
                  },
                },
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Expense breakdown table */}
      {d.expenseByCategory?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header"><span className="card-title">Expense Breakdown</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign:'right' }}>Amount</th>
                    <th style={{ textAlign:'right' }}>Share</th>
                    <th style={{ width:'40%' }}>Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {d.expenseByCategory.map(c => {
                    const share = (parseFloat(c.total)/totalExp)*100;
                    return (
                      <tr key={c.category}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span style={{ width:10, height:10, borderRadius:'50%', background: CATEGORY_COLOURS[c.category]||'#94a3b8', display:'inline-block', flexShrink:0 }}/>
                            <span className="font-bold">{c.category}</span>
                          </div>
                        </td>
                        <td style={{ textAlign:'right' }} className="font-bold text-danger">
                          {fmt(c.total, user?.currency)}
                        </td>
                        <td style={{ textAlign:'right' }} className="text-muted text-sm">
                          {share.toFixed(1)}%
                        </td>
                        <td>
                          <div className="progress-bar" style={{ marginTop:2 }}>
                            <div className="progress-fill accent" style={{
                              width:`${share}%`,
                              background: CATEGORY_COLOURS[c.category] || 'var(--accent)',
                            }}/>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
