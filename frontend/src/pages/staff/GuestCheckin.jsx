import { useState, useEffect } from 'react';
import { guestsAPI, eventsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const GuestCheckin = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
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
        const res = await guestsAPI.getAll({ event: selectedEvent });
        setGuests(res.data);
      } catch { /* ignore */ }
    };
    fetch();
  }, [selectedEvent]);

  const handleCheckIn = async (guestId) => {
    try {
      await guestsAPI.checkIn(guestId, {});
      setGuests(prev => prev.map(g => g._id === guestId ? { ...g, checkInStatus: true, checkedInAt: new Date() } : g));
      toast('Guest checked in successfully!', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to check in', 'error'); }
  };

  const filtered = guests.filter(g => {
    const matchSearch = !search || g.guestName.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === '' || (filter === 'checkedIn' ? g.checkInStatus : !g.checkInStatus);
    return matchSearch && matchFilter;
  });

  const checkedIn = guests.filter(g => g.checkInStatus).length;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>🎟️ Guest Check-In</h1></div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ width: 220 }}>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <input type="search" className="form-control" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Guests</option>
          <option value="checkedIn">Checked In</option>
          <option value="pending">Not Checked In</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#e8f5f2', color: 'var(--primary)' }}>👥</div>
          <div className="stat-info"><div className="stat-value">{guests.length}</div><div className="stat-label">Total Guests</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#f0fff4', color: 'var(--success)' }}>✅</div>
          <div className="stat-info"><div className="stat-value">{checkedIn}</div><div className="stat-label">Checked In</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#fffaf0', color: 'var(--warning)' }}>⏳</div>
          <div className="stat-info"><div className="stat-value">{guests.length - checkedIn}</div><div className="stat-label">Remaining</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Guest List ({filtered.length} shown)</h3></div>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}><p>No guests found</p></div>
        ) : (
          <div>
            {filtered.map(g => (
              <div key={g._id} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', background: g.checkInStatus ? '#f0fff4' : 'white', alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: g.checkInStatus ? 'var(--success)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: g.checkInStatus ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {g.checkInStatus ? '✓' : g.guestName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{g.guestName}</div>
                  <div className="text-sm text-muted">{g.email}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                    <StatusBadge status={g.rsvpStatus} />
                    <span className="chip">{g.group}</span>
                    {g.dietaryPreferences?.length > 0 && <span style={{ fontSize: 11, color: 'var(--info)' }}>🥗 {g.dietaryPreferences.join(', ')}</span>}
                    {g.allergies?.length > 0 && <span style={{ fontSize: 11, color: 'var(--danger)' }}>⚠️ {g.allergies.join(', ')}</span>}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {g.checkInStatus ? (
                    <div style={{ textAlign: 'right' }}>
                      <div className="badge badge-success">✓ Checked In</div>
                      {g.checkedInAt && <div className="text-xs text-muted mt-2">{new Date(g.checkedInAt).toLocaleTimeString()}</div>}
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleCheckIn(g._id)} disabled={g.rsvpStatus === 'Not Attending'}>
                      Check In
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestCheckin;
