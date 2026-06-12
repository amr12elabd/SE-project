import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const ConfirmedBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookingsAPI.getAll();
        setBookings(res.data.filter(b => b.status === 'Approved'));
      } catch { toast('Failed to load bookings', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = bookings.filter(b =>
    !search ||
    b.venue?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.organizer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.event?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = filtered.filter(b => new Date(b.date) >= new Date());
  const past = filtered.filter(b => new Date(b.date) < new Date());

  if (loading) return <LoadingSpinner fullPage />;

  const BookingCard = ({ b }) => (
    <div className="card card-body" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: '12px 16px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{new Date(b.date).getDate()}</div>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{new Date(b.date).toLocaleString('en', { month: 'short', year: '2-digit' })}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>🏛️ {b.venue?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', gap: 16 }}>
            <span>👤 Organizer: {b.organizer?.name}</span>
            <span>📧 {b.organizer?.email}</span>
            <span>👥 {b.expectedAttendees} attendees</span>
          </div>
          {b.event?.name && <div className="text-sm text-muted mt-1">🎭 Event: {b.event.name}</div>}
          {b.specialRequirements && <div className="text-sm text-muted mt-1">📝 {b.specialRequirements}</div>}
        </div>
        <div style={{ flexShrink: 0 }}>
          <span className="badge badge-success">✓ Confirmed</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header"><h1>✅ Confirmed Bookings</h1></div>

      <div className="filter-bar mb-4">
        <input type="search" className="form-control" placeholder="Search by venue, organizer, or event..." value={search} onChange={e => setSearch(e.target.value)} />
        <span className="text-muted text-sm">{filtered.length} confirmed bookings</span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#e8f5f2', color: 'var(--primary)' }}>📅</div>
          <div className="stat-info"><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>🕐</div>
          <div className="stat-info"><div className="stat-value">{past.length}</div><div className="stat-label">Past Bookings</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#fff3e0', color: 'var(--secondary)' }}>✅</div>
          <div className="stat-info"><div className="stat-value">{bookings.length}</div><div className="stat-label">Total Confirmed</div></div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No confirmed bookings found</h3></div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h3 style={{ marginBottom: 12, color: 'var(--primary)' }}>📅 Upcoming ({upcoming.length})</h3>
              {upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)).map(b => <BookingCard key={b._id} b={b} />)}
            </div>
          )}
          {past.length > 0 && (
            <div style={{ marginTop: upcoming.length > 0 ? 24 : 0 }}>
              <h3 style={{ marginBottom: 12, color: 'var(--text-muted)' }}>🕐 Past Bookings ({past.length})</h3>
              {past.sort((a, b) => new Date(b.date) - new Date(a.date)).map(b => (
                <div key={b._id} style={{ opacity: 0.7 }}><BookingCard b={b} /></div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConfirmedBookings;
