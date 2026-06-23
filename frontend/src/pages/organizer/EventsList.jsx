import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

const STATUS_COLORS = { Planning: '#3182ce', Confirmed: '#38a169', 'In Progress': '#dd6b20', Completed: '#7c3aed', Cancelled: '#e53e3e' };

const CalendarView = ({ events, navigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventsInMonth = events.reduce((acc, ev) => {
    const d = new Date(ev.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(ev);
    }
    return acc;
  }, {});

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card card-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>← Prev</button>
        <h3 style={{ margin: 0 }}>{currentDate.toLocaleString('en', { month: 'long', year: 'numeric' })}</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>Next →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const dayEvents = day ? (eventsInMonth[day] || []) : [];
          return (
            <div key={i} style={{ minHeight: 72, background: isToday ? 'var(--primary-light)' : day ? 'var(--bg)' : 'transparent', borderRadius: 6, padding: '4px 6px', border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
              {day && <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--primary)' : 'var(--text)', marginBottom: 3 }}>{day}</div>}
              {dayEvents.map(ev => (
                <div key={ev._id} onClick={() => navigate(`/events/${ev._id}`)} style={{ background: STATUS_COLORS[ev.status] || 'var(--primary)', color: '#fff', fontSize: 10, padding: '2px 5px', borderRadius: 3, marginBottom: 2, cursor: 'pointer', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={ev.name}>{ev.name}</div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{s}
          </div>
        ))}
      </div>
    </div>
  );
};

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState('list');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await eventsAPI.delete(confirmDelete._id);
      setEvents(prev => prev.filter(e => e._id !== confirmDelete._id));
      toast('Event deleted successfully', 'success');
      setConfirmDelete(null);
    } catch (err) { toast(err.response?.data?.message || 'Failed to delete', 'error'); }
    finally { setDeleting(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <ConfirmModal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This will permanently remove all associated tasks, budget items, and guest data. This action cannot be undone.`}
        confirmLabel="Delete Event"
        loading={deleting}
      />
      <div className="page-header">
        <h1>Events</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: 0 }} onClick={() => setView('list')}>☰ List</button>
            <button className={`btn btn-sm ${view === 'calendar' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: 0 }} onClick={() => setView('calendar')}>📅 Calendar</button>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/events/new')}>+ Create Event</button>
        </div>
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

      {view === 'calendar' && <CalendarView events={events} navigate={navigate} />}

      {view === 'list' && filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No events found</h3>
            <p>Create your first pop-up café event to get started.</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/events/new')}>Create Event</button>
          </div>
        </div>
      ) : view === 'list' && (
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
                  <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }} title="Duplicate this event" onClick={async e => { e.stopPropagation(); try { const r = await eventsAPI.duplicate(ev._id); setEvents(prev => [r.data, ...prev]); toast('Event duplicated!', 'success'); } catch { toast('Failed to duplicate', 'error'); } }}>⧉ Dup</button>
                  <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); setConfirmDelete(ev); }}>Delete</button>
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
