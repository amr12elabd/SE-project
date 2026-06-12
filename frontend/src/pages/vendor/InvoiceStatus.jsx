import { useState, useEffect } from 'react';
import { invoicesAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const InvoiceStatus = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await invoicesAPI.getAll();
        setInvoices(res.data);
      } catch { toast('Failed to load invoices', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = invoices.filter(i => !filter || i.status === filter);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.totalAmount, 0);
  const totalPending = invoices.filter(i => i.status === 'Pending Review').reduce((s, i) => s + i.totalAmount, 0);

  const statusColor = { 'Pending Review': 'var(--warning)', 'Approved': 'var(--info)', 'Rejected': 'var(--danger)', 'Paid': 'var(--success)' };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>📊 Invoice Status</h1></div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#e8f5f2', color: 'var(--primary)' }}>🧾</div>
          <div className="stat-info"><div className="stat-value">{invoices.length}</div><div className="stat-label">Total Invoices</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#fff3e0', color: 'var(--warning)' }}>⏳</div>
          <div className="stat-info"><div className="stat-value">EGP {totalPending.toLocaleString()}</div><div className="stat-label">Pending Review</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#f0fff4', color: 'var(--success)' }}>💰</div>
          <div className="stat-info"><div className="stat-value">EGP {totalPaid.toLocaleString()}</div><div className="stat-label">Total Paid</div></div>
        </div>
      </div>

      <div className="filter-bar mb-4">
        <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['Pending Review', 'Approved', 'Rejected', 'Paid'].map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-muted text-sm">{filtered.length} invoices</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🧾</div><h3>No invoices found</h3></div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Event</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv._id}>
                  <td style={{ fontWeight: 600 }}>{inv.invoiceNumber}</td>
                  <td>{inv.event?.name || '—'}</td>
                  <td style={{ fontWeight: 600 }}>EGP {inv.totalAmount?.toLocaleString()}</td>
                  <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(inv)}>👁️ View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.invoiceNumber}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div className="text-muted text-sm">Event</div>
                  <div style={{ fontWeight: 600 }}>{selected.event?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-muted text-sm">Status</div>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <table className="table mb-4">
                <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>
                  {selected.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>EGP {item.unitPrice?.toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>EGP {item.total?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td><td style={{ fontWeight: 700, color: 'var(--primary)' }}>EGP {selected.totalAmount?.toLocaleString()}</td></tr>
                </tfoot>
              </table>

              {selected.notes && (
                <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13 }}>
                  <strong>Notes:</strong> {selected.notes}
                </div>
              )}

              {selected.status === 'Rejected' && (
                <div className="alert" style={{ marginTop: 12, background: '#fff5f5', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  ❌ This invoice was rejected by the organizer. Please review and resubmit if needed.
                </div>
              )}
              {selected.status === 'Paid' && (
                <div className="alert" style={{ marginTop: 12, background: '#f0fff4', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  ✅ Payment received! Thank you for your services.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceStatus;
