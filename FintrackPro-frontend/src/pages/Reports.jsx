// src/pages/Reports.jsx
import React, { useEffect, useState } from 'react';
import { incomeAPI, expenseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmt, fmtDate, monthStart, today } from '../utils/format';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const { user }  = useAuth();
  const [incomes, setIncomes]   = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ from: monthStart(), to: today() });

  const load = () => {
    setLoading(true);
    Promise.all([
      incomeAPI.getAll({ from: filters.from, to: filters.to, size: 200 }),
      expenseAPI.getAll({ from: filters.from, to: filters.to, size: 200 }),
    ]).then(([inc, exp]) => {
      setIncomes(inc.data.data.content   || []);
      setExpenses(exp.data.data.content  || []);
    }).catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const totalInc = incomes.reduce((s, i)  => s + parseFloat(i.amount || 0), 0);
  const totalExp = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const balance  = totalInc - totalExp;

  // ── All transactions sorted by date ──────────────────────────────────────
  const allTxns = [
    ...incomes.map(i  => ({ ...i, type: 'Income'  })),
    ...expenses.map(e => ({ ...e, type: 'Expense' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // ── PDF export ────────────────────────────────────────────────────────────
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pdfMoney = (value) =>
  fmt(value, user?.currency)
    .replace('₹', 'Rs.')
    .replace('−', '-');

    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FinTrack Pro', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Financial Report', 14, 28);
    doc.text(`${filters.from}  →  ${filters.to}`, pageW - 14, 28, { align: 'right' });

    // User
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Prepared for: ${user?.name}  |  ${user?.email}  |  Generated: ${new Date().toLocaleString()}`, 14, 50);

    // Summary cards
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Financial Summary', 14, 62);

    const summaryRows = [
  ['Total Income', pdfMoney(totalInc), ''],
  ['Total Expenses', pdfMoney(totalExp), ''],
  ['Net Balance', pdfMoney(balance), balance >= 0 ? 'Surplus' : 'Deficit'],
];

    doc.autoTable({
      startY: 66,
      head: [['Metric', 'Amount', 'Status']],
      body: summaryRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    // Transactions
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction History', 14, doc.lastAutoTable.finalY + 14);

    const rows = allTxns.map(t => [
      t.type,
      t.title,
      t.category,
      fmtDate(t.date),
      (t.type === 'Income' ? '+' : '-') + pdfMoney(t.amount),
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 18,
      head: [['Type', 'Title', 'Category', 'Date', 'Amount']],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 59] },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === 'body') {
          const row = allTxns[data.row.index];
          data.cell.styles.textColor = row?.type === 'Income' ? [16, 185, 129] : [239, 68, 68];
        }
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} — FinTrack Pro Confidential`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
    }

    doc.save(`FinTrack_Report_${filters.from}_${filters.to}.pdf`);
    toast.success('PDF downloaded!');
  };

  return (
    <div className="animate-fade">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Financial Reports</h2>
          <p className="section-sub">View and export detailed transaction history</p>
        </div>
        <button className="btn btn-primary" onClick={downloadPDF} disabled={loading || allTxns.length === 0}>
          ⬇ Download PDF
        </button>
      </div>

      {/* Date filters */}
      <div className="card mb-6" style={{ padding: '16px 20px' }}>
        <div className="filter-bar">
          <div className="flex items-center gap-2">
            <label className="form-label" style={{ whiteSpace:'nowrap', marginBottom:0 }}>From</label>
            <input type="date" className="form-control"
              value={filters.from}
              onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <label className="form-label" style={{ whiteSpace:'nowrap', marginBottom:0 }}>To</label>
            <input type="date" className="form-control"
              value={filters.to}
              onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={load}>Generate Report</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid stagger" style={{ marginBottom: 28 }}>
        <div className="stat-card income">
          <div className="stat-icon income">💰</div>
          <div className="stat-label">Total Income</div>
          <div className="stat-value">{fmt(totalInc, user?.currency)}</div>
          <div className="stat-sub">{incomes.length} records</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon expense">💸</div>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{fmt(totalExp, user?.currency)}</div>
          <div className="stat-sub">{expenses.length} records</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-icon balance">📊</div>
          <div className="stat-label">Net Balance</div>
          <div className="stat-value" style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {fmt(balance, user?.currency)}
          </div>
          <div className="stat-sub">{balance >= 0 ? 'Surplus' : 'Deficit'}</div>
        </div>
      </div>

      {/* Transaction history table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Transaction History</span>
          <span className="badge badge-default">{allTxns.length} records</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
          ) : allTxns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No transactions in this period</div>
              <p>Try expanding the date range</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {allTxns.map((t, i) => (
                    <tr key={`${t.type}-${t.id}`}>
                      <td>
                        <span className={`badge badge-${t.type === 'Income' ? 'income' : 'expense'}`}>
                          {t.type === 'Income' ? '↑' : '↓'} {t.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</td>
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
    </div>
  );
}
