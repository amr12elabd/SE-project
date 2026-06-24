import { useState, useEffect } from 'react';
import { sourcingAPI, eventsAPI, vendorsAPI } from '../../api';
import { useLang } from '../../context/LanguageContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const SourcingRequests = () => {
  const { t } = useLang();
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', event: '' });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ event: '', vendor: '', deliveryDate: '', eventLocation: '', items: [{ item: '', quantity: 1, unit: 'units', notes: '' }] });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchRequests = async () => {
    try {
      const res = await sourcingAPI.getAll(Object.fromEntries(Object.entries(filter).filter(([,v]) => v)));
      setRequests(res.data);
    } catch { toast('Failed to load sourcing requests', 'error'); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [eRes, vRes] = await Promise.all([eventsAPI.getAll(), vendorsAPI.getAll()]);
        setEvents(eRes.data);
        setVendors(vRes.data);
        if (eRes.data.length > 0) setForm(f => ({ ...f, event: eRes.data[0]._id }));
      } catch { /* ignore */ }
      await fetchRequests();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { fetchRequests(); }, [filter]);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { item: '', quantity: 1, unit: 'units', notes: '' }] }));
  const updateItem = (idx, key, val) => setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [key]: val } : it) }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.event || !form.deliveryDate || form.items.some(i => !i.item)) { toast('Event, delivery date, and all item names required', 'error'); return; }
    setSaving(true);
    try {
      const res = await sourcingAPI.create({ ...form, requestedItems: form.items });
      setRequests(prev => [res.data, ...prev]);
      toast('Sourcing request created!', 'success');
      setModal(false);
    } catch (err) { toast(err.response?.data?.message || 'Failed to create request', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const statusColors = { Pending: '#dd6b20', Accepted: '#38a169', Declined: '#e53e3e', Preparing: '#3182ce', 'Out for Delivery': '#7c3aed', Delivered: '#38a169' };

  return (
    <div>
      <div className="page-header">
        <h1>{t('sourcing')}</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ {t('createRequest')}</button>
      </div>

      <div className="filter-bar">
        <select className="form-control" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {['Pending', 'Accepted', 'Declined', 'Preparing', 'Out for Delivery', 'Delivered'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-control" value={filter.event} onChange={e => setFilter(f => ({ ...f, event: e.target.value }))}>
          <option value="">All Events</option>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <span className="text-muted text-sm">{requests.length} requests</span>
      </div>

      {requests.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📦</div><h3>{t('noSourcingRequests')}</h3></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {requests.map(r => (
            <div key={r._id} className="card card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <h3>📦 {r.event?.name}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, flexWrap: 'wrap' }}>
                    <span>🚚 Vendor: {r.vendor?.name || 'Any Vendor'}</span>
                    <span>📅 Delivery: {new Date(r.deliveryDate).toLocaleDateString()}</span>
                    <span>📍 {r.eventLocation || 'TBD'}</span>
                    {r.totalEstimatedCost > 0 && <span>💰 Est: {r.totalEstimatedCost?.toLocaleString()} EGP</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.requestedItems?.map((item, i) => (
                      <span key={i} className="chip">📦 {item.quantity} {item.unit} {item.item}</span>
                    ))}
                  </div>
                  {r.clarificationNote && (
                    <div style={{ marginTop: 10, padding: 10, background: 'var(--info-light)', borderRadius: 6, fontSize: 13 }}>
                      💬 <strong>Note:</strong> {r.clarificationNote}
                    </div>
                  )}
                  {r.delayNote && (
                    <div style={{ marginTop: 8, padding: 10, background: 'var(--warning-light)', borderRadius: 6, fontSize: 13 }}>
                      ⚠️ <strong>Delay Note:</strong> {r.delayNote}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>

              {/* Status timeline */}
              <div style={{ display: 'flex', gap: 0, marginTop: 16, overflowX: 'auto' }}>
                {['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'].map((step, i, arr) => {
                  const statuses = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
                  const currentIdx = statuses.indexOf(r.status);
                  const stepIdx = statuses.indexOf(step);
                  const isDone = stepIdx < currentIdx;
                  const isActive = step === r.status;
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid', borderColor: isActive ? 'var(--primary)' : isDone ? 'var(--success)' : 'var(--border)', background: isActive ? 'var(--primary)' : isDone ? 'var(--success)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: (isActive || isDone) ? 'white' : 'var(--text-muted)' }}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 10, color: isActive ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
                      </div>
                      {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: isDone ? 'var(--success)' : 'var(--border)', marginTop: -16 }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={t('createRequest')} size="lg"
        footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>{t('cancel')}</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : t('create')}</button></>}>
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Event *</label>
              <select className="form-control" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}>
                {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vendor (optional)</label>
              <select className="form-control" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}>
                <option value="">Any Vendor</option>
                {vendors.map(v => <option key={v._id} value={v.user?._id}>{v.companyName}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('deliveryDate')} *</label>
              <input type="date" className="form-control" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('eventLocation')}</label>
              <input className="form-control" placeholder="Delivery address" value={form.eventLocation} onChange={e => setForm(f => ({ ...f, eventLocation: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label className="form-label" style={{ margin: 0 }}>{t('item')} *</label>
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>+ {t('addItemRow')}</button>
          </div>
          {form.items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input className="form-control" placeholder="Item name" value={item.item} onChange={e => updateItem(idx, 'item', e.target.value)} />
              <input type="number" className="form-control" placeholder="Qty" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
              <input className="form-control" placeholder="Unit" value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} />
              <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeItem(idx)} disabled={form.items.length === 1}>✕</button>
            </div>
          ))}
        </form>
      </Modal>
    </div>
  );
};

export default SourcingRequests;
