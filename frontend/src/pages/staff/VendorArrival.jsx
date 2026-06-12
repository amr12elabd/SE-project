import { useState, useEffect } from 'react';
import { sourcingAPI, eventsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const VendorArrival = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      try {
        const res = await sourcingAPI.getAll({ event: selectedEvent });
        setRequests(res.data);
      } catch { /* ignore */ }
    };
    fetch();
  }, [selectedEvent]);

  const markArrived = async (id) => {
    try {
      await sourcingAPI.updateStatus(id, { status: 'Delivered' });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'Delivered' } : r));
      toast('Vendor marked as arrived/delivered!', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to update', 'error'); }
  };

  const statusColor = { 'Pending': 'var(--text-muted)', 'Accepted': 'var(--info)', 'Preparing': 'var(--warning)', 'Out for Delivery': 'var(--secondary)', 'Delivered': 'var(--success)', 'Declined': 'var(--danger)' };
  const statusIcon = { 'Pending': '⏳', 'Accepted': '✅', 'Preparing': '🏭', 'Out for Delivery': '🚛', 'Delivered': '🎉', 'Declined': '❌' };

  if (loading) return <LoadingSpinner fullPage />;

  const activeRequests = requests.filter(r => r.status !== 'Declined');
  const delivered = requests.filter(r => r.status === 'Delivered').length;
  const outForDelivery = requests.filter(r => r.status === 'Out for Delivery').length;

  return (
    <div>
      <div className="page-header"><h1>🚚 Vendor Arrivals</h1></div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ width: 220 }}>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#e8f5f2', color: 'var(--primary)' }}>📦</div>
          <div className="stat-info"><div className="stat-value">{activeRequests.length}</div><div className="stat-label">Expected Vendors</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#fff3e0', color: 'var(--secondary)' }}>🚛</div>
          <div className="stat-info"><div className="stat-value">{outForDelivery}</div><div className="stat-label">En Route</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#f0fff4', color: 'var(--success)' }}>🎉</div>
          <div className="stat-info"><div className="stat-value">{delivered}</div><div className="stat-label">Arrived</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Vendor Delivery Tracking</h3></div>
        {activeRequests.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}><div style={{ fontSize: 40 }}>🚚</div><p>No vendor deliveries for this event</p></div>
        ) : (
          <div>
            {activeRequests.map(r => (
              <div key={r._id} style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', background: r.status === 'Delivered' ? '#f0fff4' : 'white' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{statusIcon[r.status] || '📦'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                      <h3 style={{ margin: 0 }}>{r.vendor?.vendorProfile?.companyName || r.vendor?.name || 'Unknown Vendor'}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      <span>📅 Delivery Date: {new Date(r.deliveryDate).toLocaleDateString()}</span>
                      <span>📍 {r.eventLocation}</span>
                      {r.totalEstimatedCost > 0 && <span>💰 EGP {r.totalEstimatedCost.toLocaleString()}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {r.requestedItems?.map((item, i) => (
                        <span key={i} className="chip">{item.quantity} {item.unit} {item.item}</span>
                      ))}
                    </div>
                    {r.delayNote && (
                      <div className="alert" style={{ marginTop: 10, padding: '8px 12px', background: '#fff3cd', borderColor: '#ffc107', borderRadius: 6, fontSize: 13 }}>
                        ⚠️ Delay Note: {r.delayNote}
                      </div>
                    )}
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Delivery Progress:</span>
                      {['Accepted', 'Preparing', 'Out for Delivery', 'Delivered'].map((step, i) => {
                        const steps = ['Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
                        const currentIdx = steps.indexOf(r.status);
                        const isActive = i <= currentIdx;
                        return (
                          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: isActive ? 'var(--primary)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: isActive ? 'white' : 'var(--text-muted)' }}>
                              {isActive ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: 10, color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{step}</span>
                            {i < 3 && <div style={{ width: 20, height: 2, background: i < currentIdx ? 'var(--primary)' : 'var(--border)' }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {r.status === 'Out for Delivery' && (
                      <button className="btn btn-primary btn-sm" onClick={() => markArrived(r._id)}>
                        ✓ Mark Arrived
                      </button>
                    )}
                    {r.status === 'Delivered' && (
                      <span className="badge badge-success">✓ Arrived</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorArrival;
