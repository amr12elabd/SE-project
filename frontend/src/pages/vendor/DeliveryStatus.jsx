import { useState, useEffect } from 'react';
import { sourcingAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const STEPS = ['Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];

const DeliveryStatus = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delayModal, setDelayModal] = useState(null);
  const [delayNote, setDelayNote] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await sourcingAPI.getAll();
        setRequests(res.data.filter(r => !['Pending', 'Declined'].includes(r.status)));
      } catch { toast('Failed to load', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await sourcingAPI.updateStatus(id, { status });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      toast(`Status updated to "${status}"`, 'success');
    } catch { toast('Update failed', 'error'); }
  };

  const sendDelayNote = async () => {
    try {
      await sourcingAPI.updateStatus(delayModal._id, { status: delayModal.status, delayNote });
      setRequests(prev => prev.map(r => r._id === delayModal._id ? { ...r, delayNote } : r));
      setDelayModal(null);
      setDelayNote('');
      toast('Delay note sent', 'success');
    } catch { toast('Failed to send delay note', 'error'); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>🚛 Delivery Status</h1></div>

      {requests.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🚛</div><h3>No active deliveries</h3><p>Accepted orders will appear here with their delivery timeline.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map(r => {
            const currentStep = STEPS.indexOf(r.status);
            return (
              <div key={r._id} className="card card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{r.event?.name || 'Event'}</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                      <span>👤 {r.organizer?.name}</span>
                      <span style={{ marginLeft: 16 }}>📅 Due: {new Date(r.deliveryDate).toLocaleDateString()}</span>
                      <span style={{ marginLeft: 16 }}>📍 {r.eventLocation}</span>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {r.requestedItems?.map((item, i) => <span key={i} className="chip">{item.quantity} {item.unit} {item.item}</span>)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14 }}>
                  {STEPS.map((step, i) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: i <= currentStep ? 'var(--primary)' : 'var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, color: i <= currentStep ? 'white' : 'var(--text-muted)',
                          fontWeight: 700, transition: 'background 0.3s'
                        }}>
                          {i < currentStep ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 10, color: i <= currentStep ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div style={{ flex: 1, height: 3, background: i < currentStep ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s', margin: '0 4px', marginBottom: 14 }} />
                      )}
                    </div>
                  ))}
                </div>

                {r.delayNote && (
                  <div style={{ padding: '8px 12px', background: '#fff3cd', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
                    ⚠️ Delay note sent: {r.delayNote}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {r.status === 'Accepted' && <button className="btn btn-outline btn-sm" onClick={() => updateStatus(r._id, 'Preparing')}>🏭 Start Preparing</button>}
                  {r.status === 'Preparing' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'Out for Delivery')}>🚛 Out for Delivery</button>}
                  {r.status === 'Out for Delivery' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'Delivered')}>✓ Mark Delivered</button>}
                  {r.status !== 'Delivered' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setDelayModal(r); setDelayNote(r.delayNote || ''); }}>
                      ⚠️ Report Delay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {delayModal && (
        <div className="modal-overlay" onClick={() => setDelayModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Delay</h2>
              <button className="modal-close" onClick={() => setDelayModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-3">Notify the organizer of a delay for: <strong>{delayModal.event?.name}</strong></p>
              <div className="form-group">
                <label className="form-label">Delay Reason / Note</label>
                <textarea className="form-control" rows={3} value={delayNote} onChange={e => setDelayNote(e.target.value)} placeholder="E.g. Traffic delays, supply shortage..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDelayModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendDelayNote}>Send Delay Notice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatus;
