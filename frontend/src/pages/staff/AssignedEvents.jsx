import { useState, useEffect } from 'react';
import { eventsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const AssignedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = events.filter(e => {
    if (!filter) return true;
    if (filter === 'upcoming') return new Date(e.date) >= new Date();
    if (filter === 'past') return new Date(e.date) < new Date();
    return e.status === filter;
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>My Events</h1></div>
      <div className="filter-bar">
        {['', 'upcoming', 'past', 'Confirmed', 'In Progress'].map((f, i) => (
          <button key={i} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f === '' ? 'All' : f === 'upcoming' ? 'Upcoming' : f === 'past' ? 'Past' : f}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(ev => (
          <div key={ev._id} className="card card-body" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: '14px 18px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{new Date(ev.date).getDate()}</div>
              <div style={{ fontSize: 11, color: 'var(--primary)' }}>{new Date(ev.date).toLocaleString('en', { month: 'short', year: 'numeric' })}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                <h3>{ev.name}</h3>
                <StatusBadge status={ev.status} />
              </div>
              <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 13 }}>
                <span>🕐 {ev.startTime} – {ev.endTime}</span>
                <span>🏛️ {ev.venue?.name || 'TBD'}</span>
                <span>👥 {ev.expectedGuests} guests</span>
              </div>
              {ev.dressCode && <div className="text-sm text-muted" style={{ marginTop: 4 }}>👔 Dress Code: {ev.dressCode}</div>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state"><div className="empty-state-icon">📅</div><h3>No events found</h3></div>}
      </div>
    </div>
  );
};

export default AssignedEvents;
