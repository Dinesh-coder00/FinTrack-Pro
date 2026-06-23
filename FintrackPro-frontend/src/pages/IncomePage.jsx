// src/pages/IncomePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { incomeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fmt, fmtDate, today, INCOME_CATEGORIES } from '../utils/format';
import toast from 'react-hot-toast';

const EMPTY = { title:'', amount:'', category:'Salary', date: today(), description:'' };

export default function IncomePage() {
  const { user } = useAuth();
  const [items, setItems]     = useState([]);
  const [meta, setMeta]       = useState({ totalPages: 1, number: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [page, setPage]       = useState(0);

  const load = useCallback((p = 0) => {
    setLoading(true);
    incomeAPI.getAll({ page: p, size: 10 })
      .then(r => {
        setItems(r.data.data.content);
        setMeta(r.data.data);
        setPage(p);
      })
      .catch(() => toast.error('Failed to load income'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (item) => {
    setForm({ title: item.title, amount: item.amount, category: item.category,
              date: item.date, description: item.description || '' });
    setEditing(item.id); setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await incomeAPI.update(editing, form);
        toast.success('Income updated');
      } else {
        await incomeAPI.create(form);
        toast.success('Income added');
      }
      setModal(false); load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
  
    try {
      await incomeAPI.remove(id);
      toast.success('Income deleted');
      load(page);
    } catch { toast.error('Delete failed'); }
  };

  const totalShown = items.reduce((s, i) => s + parseFloat(i.amount || 0), 0);

  return (
    <div className="animate-fade">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Income Management</h2>
          <p className="section-sub">Track all your income sources</p>
        </div>
        <button className="btn btn-success" onClick={openAdd}>+ Add Income</button>
      </div>

      {/* Summary card */}
      <div className="card mb-6" style={{ padding: 24 }}>
        <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
          <div>
            <div className="stat-label">Showing Total</div>
          <div className="summary-value" style={{ color:'var(--success)' }}>
  {fmt(totalShown, user?.currency)}
</div>
          </div>
          <div>
            <div className="stat-label">Records</div>
            <div className="summary-value">
  {meta.totalElements ?? items.length}
</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div style={{ padding: 40, textAlign:'center', color:'var(--text-muted)' }}>Loading…</div>
          : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <div className="empty-title">No income records</div>
              <p>Add your first income entry to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th style={{ textAlign:'right' }}>Amount</th>
                    <th style={{ textAlign:'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} style={{ animationDelay: `${i*0.04}s` }} className="animate-up">
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</div>
                        {item.description && <div className="text-xs text-muted">{item.description}</div>}
                      </td>
                      <td><span className="badge badge-success">{item.category}</span></td>
                      <td className="text-muted text-sm">{fmtDate(item.date)}</td>
                      <td style={{ textAlign:'right' }}>
                        <span className="font-bold text-success">+{fmt(item.amount, user?.currency)}</span>
                      </td>
                      <td style={{ textAlign:'center' }}>
                        <div className="flex items-center gap-2" style={{ justifyContent:'center' }}>
                          <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(item)} title="Edit">✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon"  onClick={() => remove(item.id)} title="Delete">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 0} onClick={() => load(page-1)}>‹</button>
            {Array.from({ length: meta.totalPages }, (_, i) => (
              <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => load(i)}>{i+1}</button>
            ))}
            <button className="page-btn" disabled={page >= meta.totalPages-1} onClick={() => load(page+1)}>›</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Income' : 'Add Income'}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-control" placeholder="e.g. Monthly Salary"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Amount ({user?.currency})</label>
                    <input type="number" min="0.01" step="0.01" className="form-control" placeholder="0.00"
                      value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {INCOME_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control"
                    value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <textarea className="form-control" rows={2} placeholder="Notes..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">{editing ? 'Update' : 'Add Income'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
