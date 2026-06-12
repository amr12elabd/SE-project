import { useState, useEffect } from 'react';
import { invoicesAPI, sourcingAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

const SubmitInvoice = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [sourcing, setSourcing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    sourcingRequest: '',
    notes: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await sourcingAPI.getAll();
        const eligible = res.data.filter(r => ['Preparing', 'Out for Delivery', 'Delivered'].includes(r.status));
        setSourcing(eligible);
        if (eligible.length > 0) setForm(f => ({ ...f, sourcingRequest: eligible[0]._id }));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const updateItem = (i, field, val) => {
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        items[i].total = Number(items[i].quantity) * Number(items[i].unitPrice);
      }
      return { ...f, items };
    });
  };

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }] }));
  };

  const removeItem = (i) => {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  };

  const totalAmount = form.items.reduce((s, i) => s + Number(i.total || 0), 0);

  const populateFromSourcing = () => {
    const sr = sourcing.find(s => s._id === form.sourcingRequest);
    if (!sr) return;
    const items = sr.requestedItems?.map(item => ({
      description: `${item.item} (${item.unit})`,
      quantity: item.quantity,
      unitPrice: 0,
      total: 0,
    })) || [];
    setForm(f => ({ ...f, items: items.length > 0 ? items : f.items }));
    toast('Items imported from sourcing request', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) return toast('Add at least one item', 'error');
    if (!form.sourcingRequest) return toast('Select a sourcing request', 'error');
    setSubmitting(true);
    try {
      await invoicesAPI.create({ ...form, totalAmount });
      toast('Invoice submitted successfully!', 'success');
      navigate('/vendor/invoices');
    } catch (err) { toast(err.response?.data?.message || 'Submit failed', 'error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>🧾 Submit Invoice</h1></div>

      {sourcing.length === 0 && (
        <div className="alert alert-warning mb-4">
          ⚠️ No eligible sourcing requests found. Invoices can only be submitted for orders that are being prepared or delivered.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card card-body mb-4">
          <h3 className="mb-4">Invoice Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Sourcing Request *</label>
              <select className="form-control" value={form.sourcingRequest} onChange={e => setForm(f => ({ ...f, sourcingRequest: e.target.value }))} required>
                {sourcing.length === 0 ? <option value="">No eligible requests</option>
                  : sourcing.map(s => <option key={s._id} value={s._id}>{s.event?.name} — {new Date(s.deliveryDate).toLocaleDateString()} ({s.status})</option>)}
              </select>
              {form.sourcingRequest && (
                <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={populateFromSourcing}>
                  ↓ Import Items from Sourcing Request
                </button>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-control" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="card card-body mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Line Items</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>+ Add Line</button>
          </div>
          <table className="table">
            <thead>
              <tr><th>Description</th><th>Qty</th><th>Unit Price (EGP)</th><th>Total (EGP)</th><th></th></tr>
            </thead>
            <tbody>
              {form.items.map((item, i) => (
                <tr key={i}>
                  <td><input type="text" className="form-control" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Item / service description" required /></td>
                  <td style={{ width: 80 }}><input type="number" className="form-control" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} min={1} /></td>
                  <td style={{ width: 130 }}><input type="number" className="form-control" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} min={0} step={0.01} /></td>
                  <td style={{ width: 130, fontWeight: 600 }}>EGP {Number(item.total || 0).toLocaleString()}</td>
                  <td><button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)} disabled={form.items.length === 1}>✕</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, padding: '12px 8px' }}>Total Amount:</td>
                <td style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>EGP {totalAmount.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="card card-body mb-4">
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-control" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, bank details, or any notes for the organizer..." />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting || sourcing.length === 0}>
            {submitting ? 'Submitting...' : '🧾 Submit Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitInvoice;
