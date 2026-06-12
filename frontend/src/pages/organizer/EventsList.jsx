import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll(statusFilter ? { status: statusFilter } : {});
        setEvents(res.data);
      } catch { toast('Failed to load events', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [statusFilter]);

  const filtered = events.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete event "${name}"? This cannot be undone.`)) return;
    try {
      await eventsAPI.delete(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast('Event deleted', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to delete', 'error'); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>Events</h1>
        <button className="btn btn-primary" onClick={() => navigate('/events/new')}>+ Create Event</button>
      </div>

      <div className="filter-bar">
        <input type="search" className="form-control" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-muted text-sm">{filtered.length} events</span>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No events found</h3>
            <p>Create your first pop-up café event to get started.</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/events/new')}>Create Event</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(ev => (
            <div key={ev._id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/events/${ev._id}`)}>
              <div className="card-body" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: '16px 20px', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{new Date(ev.date).getDate()}</div>
                  <div style={{ fontSize: 12, color: 'var(--primary)' }}>{new Date(ev.date).toLocaleString('en', { month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0 }}>{ev.name}</h3>
                    <StatusBadge status={ev.status} />
                    <span className="badge badge-muted">{ev.eventType}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, color: 'var(--text-muted)', fontSize: 13, flexWrap: 'wrap' }}>
                    <span>🕐 {ev.startTime} – {ev.endTime}</span>
                    <span>🏛️ {ev.venue?.name || 'Venue TBD'}</span>
                    <span>👥 {ev.expectedGuests} expected guests</span>
                    <span>👔 {ev.dressCode}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); navigate(`/events/${ev._id}/edit`); }}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(ev._id, ev.name); }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;
