import { useState, useEffect } from 'react';
import { eventsAPI, guestsAPI, sourcingAPI } from '../../api';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const DayOfOperations = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [guests, setGuests] = useState([]);
  const [sourcingRequests, setSourcingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guestFilter, setGuestFilter] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
      } catch { toast('Failed to load', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      try {
        const [gRes, sRes] = await Promise.all([guestsAPI.getAll({ event: selectedEvent }), sourcingAPI.getAll({ event: selectedEvent })]);
        setGuests(gRes.data);
        setSourcingRequests(sRes.data);
      } catch { /* ignore */ }
    };
    fetch();
  }, [selectedEvent]);

  const handleCheckIn = async (guestId) => {
    try {
      await guestsAPI.checkIn(guestId, {});
      setGuests(prev => prev.map(g => g._id === guestId ? { ...g, checkInStatus: true, checkedInAt: new Date() } : g));
      toast('Guest checked in!', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to check in', 'error'); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const checkedIn = guests.filter(g => g.checkInStatus).length;
  const attending = guests.filter(g => g.rsvpStatus === 'Attending').length;
  const vendorStatuses = { Delivered: sourcingRequests.filter(r => r.status === 'Delivered').length, 'Out for Delivery': sourcingRequests.filter(r => r.status === 'Out for Delivery').length, Preparing: sourcingRequests.filter(r => r.status === 'Preparing').length };

  const filteredGuests = guestFilter === 'checkedIn' ? guests.filter(g => g.checkInStatus) : guestFilter === 'notCheckedIn' ? guests.filter(g => !g.checkInStatus && g.rsvpStatus === 'Attending') : guests;

  return (
    <div>
      <div className="page-header">
        <h1>⚡ Day-Of Operations</h1>
        <select className="form-control" style={{ width: 220 }} value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
      </div>

      <div className="grid-4 mb-6">
        <DashboardCard icon="👥" label="Total Guests" value={guests.length} color="#1a6b5c" />
        <DashboardCard icon="✅" label="Attending (RSVP)" value={attending} color="#38a169" />
        <DashboardCard icon="🎟️" label="Checked In" value={checkedIn} color="#3182ce" sub={`${guests.length > 0 ? ((checkedIn/guests.length)*100).toFixed(0) : 0}% attendance rate`} />
        <DashboardCard icon="🚚" label="Deliveries Done" value={vendorStatuses.Delivered} color="#7c3aed" sub={`${vendorStatuses['Out for Delivery']} en route`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Guest Check-In */}
        <div className="card">
          <div className="card-header">
            <h3>Guest Check-In</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {['', 'checkedIn', 'notCheckedIn'].map((f, i) => (
                <button key={i} className={`btn btn-sm ${guestFilter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setGuestFilter(f)}>
                  {f === '' ? 'All' : f === 'checkedIn' ? '✓ In' : '○ Pending'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {filteredGuests.map(g => (
              <div key={g._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: g.checkInStatus ? 'var(--success-light)' : 'white' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: g.checkInStatus ? 'var(--success)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: g.checkInStatus ? 'white' : 'var(--text-muted)', flexShrink: 0 }}>
                  {g.checkInStatus ? '✓' : g.guestName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{g.guestName}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    <StatusBadge status={g.rsvpStatus} />
                    {g.dietaryPreferences?.length > 0 && <span style={{ color: 'var(--info)' }}>🥗 {g.dietaryPreferences.join(', ')}</span>}
                  </div>
                </div>
                {!g.checkInStatus && g.rsvpStatus !== 'Not Attending' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleCheckIn(g._id)}>Check In</button>
                )}
                {g.checkInStatus && <span className="text-xs text-muted">{g.checkedInAt ? new Date(g.checkedInAt).toLocaleTimeString() : ''}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Tracking */}
        <div className="card">
          <div className="card-header"><h3>Vendor / Delivery Status</h3></div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {sourcingRequests.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}><p>No sourcing requests for this event</p></div>
            ) : sourcingRequests.map(r => (
              <div key={r._id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{r.vendor?.name || 'Unassigned Vendor'}</div>
                    <div className="text-sm text-muted">{r.requestedItems?.length} item types · Due {new Date(r.deliveryDate).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {r.requestedItems?.slice(0, 3).map((item, i) => <span key={i} className="chip">{item.quantity} {item.item}</span>)}
                </div>
                {r.delayNote && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--warning)', padding: '6px 10px', background: 'var(--warning-light)', borderRadius: 6 }}>⚠️ {r.delayNote}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayOfOperations;
