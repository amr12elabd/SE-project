import { useState, useEffect } from 'react';
import { invoicesAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { exportInvoicePDF } from '../../utils/exportPDF';

const INVOICE_STATUSES = ['Pending Review', 'Approved', 'Rejected', 'Paid'];

const statusColors = {
  'Pending Review': '#92400e',
  'Approved': '#1e40af',
  'Rejected': '#991b1b',
  'Paid': '#065f46',
};

const InvoiceReview = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  const fetchInvoices = async () => {
    try {
      const res = await invoicesAPI.getAll(filter ? { status: filter } : {});
      setInvoices(res.data);
    } catch { toast('Failed to load invoices', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [filter]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await invoicesAPI.updateStatus(id, { status });
      setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status } : inv));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
      toast(`Status updated to "${status}"`, 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to update', 'error'); }
    finally { setUpdating(null); }
  };

  const totalPending = invoices.filter(i => i.status === 'Pending Review').reduce((s, i) => s + i.totalAmount, 0);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>Invoice Review</h1></div>

      {totalPending > 0 && (
        <div className="alert alert-warning mb-4">💰 {invoices.filter(i => i.status === 'Pending Review').length} invoices pending review, totaling {totalPending.toLocaleString()} EGP</div>
      )}

      <div className="filter-bar">
        <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['Pending Review', 'Approved', 'Rejected', 'Paid'].map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-muted text-sm">{invoices.length} invoices</span>
      </div>

      {invoices.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🧾</div><h3>No invoices found</h3></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Invoice #</th><th>Vendor</th><th>Event</th><th>Total (EGP)</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td style={{ fontWeight: 500, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setSelected(inv)}>{inv.invoiceNumber}</td>
                    <td>{inv.vendor?.name}</td>
                    <td className="text-sm text-muted">{inv.event?.name}</td>
                    <td style={{ fontWeight: 600 }}>{inv.totalAmount?.toLocaleString()}</td>
                    <td className="text-sm text-muted">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <select
                        className="form-control"
                        value={inv.status}
                        disabled={updating === inv._id}
                        onChange={e => updateStatus(inv._id, e.target.value)}
                        style={{ fontSize: 12, padding: '3px 8px', height: 30, width: 140, color: statusColors[inv.status], fontWeight: 600, cursor: 'pointer' }}
                      >
                        {INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(inv)}>View</button>
                      <button className="btn btn-outline btn-sm" onClick={() => exportInvoicePDF(inv)} title="Download PDF">📄 PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={`Invoice: ${selected?.invoiceNumber}`} size="lg">
        {selected && (
          <div>
            <div className="grid-2 mb-4">
              <div><div className="text-muted text-xs mb-1">VENDOR</div><div style={{ fontWeight: 500 }}>{selected.vendor?.name}</div><div className="text-sm text-muted">{selected.vendor?.email}</div></div>
              <div><div className="text-muted text-xs mb-1">EVENT</div><div style={{ fontWeight: 500 }}>{selected.event?.name}</div></div>
              <div>
                <div className="text-muted text-xs mb-1">STATUS</div>
                <select
                  className="form-control"
                  value={selected.status}
                  disabled={updating === selected._id}
                  onChange={e => updateStatus(selected._id, e.target.value)}
                  style={{ fontSize: 13, padding: '4px 10px', height: 32, color: statusColors[selected.status], fontWeight: 600, cursor: 'pointer' }}
                >
                  {INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><div className="text-muted text-xs mb-1">DUE DATE</div><div>{selected.dueDate ? new Date(selected.dueDate).toLocaleDateString() : '—'}</div></div>
            </div>

            <h4 className="mb-3">Line Items</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead><tr>{['Description', 'Qty', 'Unit Price', 'Total'].map(h => <th key={h} style={{ textAlign: h === 'Description' ? 'left' : 'right', padding: '8px 0', borderBottom: '2px solid var(--border)', fontSize: 12 }}>{h}</th>)}</tr></thead>
              <tbody>
                {selected.items?.map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>{item.description}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>{item.unitPrice?.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>{item.total?.toLocaleString()}</td>
                  </tr>
                ))}
                <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, paddingTop: 12 }}>TOTAL</td><td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', paddingTop: 12, fontSize: '1.1rem' }}>{selected.totalAmount?.toLocaleString()} EGP</td></tr>
              </tbody>
            </table>

            {selected.itemizedBreakdown && (
              <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Vendor Notes:</div>
                {selected.itemizedBreakdown}
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => exportInvoicePDF(selected)}>
                📄 Export PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceReview;
