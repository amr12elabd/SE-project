import { useState, useEffect } from 'react';
import { sourcingAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const STATUS_FLOW = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];

const IncomingSourcing = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [clarification, setClarification] = useState('');
  const toast = useToast();

  const load = async () => {
    try {
      const res = await sourcingAPI.getAll();
      setRequests(res.data);
    } catch { toast('Failed to load requests', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status, extra = {}) => {
    try {
      await sourcingAPI.updateStatus(id, { status, ...extra });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status, ...extra } : r));
      setSelected(null);
      toast(`Status updated to ${status}`, 'success');
    } catch (err) { toast(err.response?.data?.message || 'Update failed', 'error'); }
  };

  const filtered = requests.filter(r => !filter || r.status === filter);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>📥 Incoming Sourcing Requests</h1></div>

      <div className="filter-bar mb-4">
        <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_FLOW.concat(['Declined']).map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-muted text-sm">{filtered.length} requests</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📥</div><h3>No requests found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => (
            <div key={r._id} className="card card-body">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ margin: 0 }}>{r.event?.name || 'Event'}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>
                    <span>👤 Organizer: {r.organizer?.name}</span>
                    <span>📅 Delivery: {new Date(r.deliveryDate).toLocaleDateString()}</span>
                    <span>📍 {r.eventLocation}</span>
                    {r.totalEstimatedCost > 0 && <span>💰 EGP {r.totalEstimatedCost.toLocaleString()}</span>}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <strong style={{ fontSize: 13 }}>Requested Items:</strong>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                      {r.requestedItems?.map((item, i) => (
                        <div key={i} className="chip">
                          {item.quantity} {item.unit} {item.item}
                          {item.notes && <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>({item.notes})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  {r.clarificationNote && (
                    <div className="alert" style={{ padding: '6px 12px', background: '#e8f4fd', borderRadius: 6, fontSize: 13 }}>
                      💬 Clarification: {r.clarificationNote}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  {r.status === 'Pending' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'Accepted')}>✓ Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(r._id, 'Declined')}>✕ Decline</button>
                      <button className="btn btn-outline btn-sm" onClick={() => setSelected(r)}>💬 Clarify</button>
                    </>
                  )}
                  {r.status === 'Accepted' && (
                    <button className="btn btn-outline btn-sm" onClick={() => updateStatus(r._id, 'Preparing')}>🏭 Start Preparing</button>
                  )}
                  {r.status === 'Preparing' && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'Out for Delivery')}>🚛 Out for Delivery</button>
                  )}
                  {r.status === 'Out for Delivery' && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'Delivered')}>📦 Mark Delivered</button>
                  )}
                  {r.status === 'Delivered' && <span className="badge badge-success">✓ Delivered</span>}
                  {r.status === 'Declined' && <span className="badge badge-danger">Declined</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Clarification</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-3">Send a clarification note to the organizer for: <strong>{selected.event?.name}</strong></p>
              <div className="form-group">
                <label className="form-label">Clarification Note</label>
                <textarea className="form-control" rows={4} value={clarification} onChange={e => setClarification(e.target.value)} placeholder="E.g. We need to confirm the delivery address. Which entrance should we use?" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                updateStatus(selected._id, selected.status, { clarificationNote: clarification });
                setClarification('');
              }}>Send Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomingSourcing;
