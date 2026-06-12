import { useState, useEffect } from 'react';
import { budgetAPI, eventsAPI } from '../../api';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BudgetManagement = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [budget, setBudget] = useState({ items: [], totalBudget: 0, totalPlanned: 0, totalActual: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ category: '', description: '', plannedAmount: '', actualAmount: '', notes: '' });
  const [totalBudgetEdit, setTotalBudgetEdit] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
      } catch { toast('Failed to load events', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      try {
        const res = await budgetAPI.get(selectedEvent);
        setBudget(res.data);
        setTotalBudgetEdit(res.data.totalBudget || '');
      } catch { toast('Failed to load budget', 'error'); }
    };
    fetch();
  }, [selectedEvent]);

  const openModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { category: item.category, description: item.description || '', plannedAmount: item.plannedAmount, actualAmount: item.actualAmount, notes: item.notes || '' }
      : { category: '', description: '', plannedAmount: '', actualAmount: '', notes: '' });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category || form.plannedAmount === '') { toast('Category and planned amount required', 'error'); return; }
    setSaving(true);
    try {
      if (editItem) {
        const res = await budgetAPI.update(selectedEvent, editItem._id, form);
        setBudget(prev => {
          const items = prev.items.map(i => i._id === editItem._id ? res.data : i);
          return { ...prev, items, totalPlanned: items.reduce((s, i) => s + i.plannedAmount, 0), totalActual: items.reduce((s, i) => s + i.actualAmount, 0) };
        });
      } else {
        const res = await budgetAPI.create(selectedEvent, form);
        setBudget(prev => {
          const items = [...prev.items, res.data];
          return { ...prev, items, totalPlanned: items.reduce((s, i) => s + i.plannedAmount, 0), totalActual: items.reduce((s, i) => s + i.actualAmount, 0) };
        });
      }
      toast('Budget item saved!', 'success');
      setModal(false);
    } catch (err) { toast(err.response?.data?.message || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget item?')) return;
    try {
      await budgetAPI.delete(selectedEvent, id);
      setBudget(prev => {
        const items = prev.items.filter(i => i._id !== id);
        return { ...prev, items, totalPlanned: items.reduce((s, i) => s + i.plannedAmount, 0), totalActual: items.reduce((s, i) => s + i.actualAmount, 0) };
      });
      toast('Budget item deleted', 'success');
    } catch { toast('Failed to delete', 'error'); }
  };

  const handleUpdateTotal = async () => {
    try {
      await budgetAPI.updateTotal(selectedEvent, { totalBudget: Number(totalBudgetEdit) });
      setBudget(prev => ({ ...prev, totalBudget: Number(totalBudgetEdit) }));
      toast('Total budget updated!', 'success');
    } catch { toast('Failed to update total budget', 'error'); }
  };

  const isOverBudget = budget.totalActual > budget.totalBudget && budget.totalBudget > 0;
  const chartData = budget.items.map(i => ({ name: i.category, Planned: i.plannedAmount, Actual: i.actualAmount }));

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>Budget Management</h1>
        <div className="page-actions">
          <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ width: 220 }}>
            {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => openModal()}>+ Add Item</button>
        </div>
      </div>

      {!selectedEvent ? (
        <div className="empty-state"><p>Select an event to manage its budget</p></div>
      ) : (
        <>
          {isOverBudget && (
            <div className="alert alert-danger mb-4">⚠️ <strong>Budget Alert:</strong> Actual spending ({budget.totalActual?.toLocaleString()} EGP) exceeds total budget ({budget.totalBudget?.toLocaleString()} EGP) by {(budget.totalActual - budget.totalBudget)?.toLocaleString()} EGP!</div>
          )}

          {/* Budget Summary */}
          <div className="grid-4 mb-6">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#e8f5f2', color: 'var(--primary)' }}>💰</div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '1.3rem' }}>{budget.totalBudget?.toLocaleString()} EGP</div>
                <div className="stat-label">Total Budget</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input type="number" style={{ width: 100, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12 }} value={totalBudgetEdit} onChange={e => setTotalBudgetEdit(e.target.value)} />
                  <button className="btn btn-primary btn-sm" onClick={handleUpdateTotal}>Set</button>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ebf8ff', color: 'var(--info)' }}>📋</div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--info)' }}>{budget.totalPlanned?.toLocaleString()} EGP</div>
                <div className="stat-label">Total Planned</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: isOverBudget ? '#fff5f5' : '#f0fff4', color: isOverBudget ? 'var(--danger)' : 'var(--success)' }}>💳</div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '1.3rem', color: isOverBudget ? 'var(--danger)' : 'var(--success)' }}>{budget.totalActual?.toLocaleString()} EGP</div>
                <div className="stat-label">Total Actual</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fffaf0', color: 'var(--warning)' }}>📊</div>
              <div className="stat-info">
                <div className="stat-value" style={{ fontSize: '1.3rem', color: (budget.totalPlanned - budget.totalActual) < 0 ? 'var(--danger)' : 'var(--success)' }}>{(budget.totalPlanned - budget.totalActual)?.toLocaleString()} EGP</div>
                <div className="stat-label">Variance (Planned – Actual)</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card card-body mb-4">
              <h3 className="mb-4">Budget vs Actual by Category</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `${value?.toLocaleString()} EGP`} />
                    <Legend />
                    <Bar dataKey="Planned" fill="var(--primary)" radius={[4,4,0,0]} />
                    <Bar dataKey="Actual" fill="var(--secondary)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="card">
            <div className="card-header"><h3>Budget Items</h3></div>
            {budget.items.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}><div className="empty-state-icon">💰</div><h3>No budget items yet</h3><p>Add items to track your planned and actual costs.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Category</th><th>Description</th><th>Planned (EGP)</th><th>Actual (EGP)</th><th>Variance</th><th>Notes</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {budget.items.map(item => {
                      const variance = item.plannedAmount - item.actualAmount;
                      return (
                        <tr key={item._id}>
                          <td style={{ fontWeight: 500 }}>{item.category}</td>
                          <td className="text-sm text-muted">{item.description || '—'}</td>
                          <td style={{ fontWeight: 500 }}>{item.plannedAmount?.toLocaleString()}</td>
                          <td style={{ fontWeight: 500, color: item.actualAmount > item.plannedAmount ? 'var(--danger)' : '' }}>{item.actualAmount?.toLocaleString()}</td>
                          <td style={{ color: variance < 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>{variance >= 0 ? '+' : ''}{variance?.toLocaleString()}</td>
                          <td className="text-sm text-muted">{item.notes || '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openModal(item)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editItem ? 'Edit Budget Item' : 'Add Budget Item'}
        footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Category *</label><input className="form-control" placeholder="e.g. Venue, Coffee, Staff..." value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Planned Amount (EGP) *</label><input type="number" className="form-control" value={form.plannedAmount} onChange={e => setForm(f => ({ ...f, plannedAmount: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Actual Amount (EGP)</label><input type="number" className="form-control" value={form.actualAmount} onChange={e => setForm(f => ({ ...f, actualAmount: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetManagement;
