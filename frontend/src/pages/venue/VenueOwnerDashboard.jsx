import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { venuesAPI, bookingsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const VenueOwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [vRes, bRes] = await Promise.all([venuesAPI.getOwnerVenues(), bookingsAPI.getAll()]);
        setVenues(vRes.data);
        setBookings(bRes.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const approvedBookings = bookings.filter(b => b.status === 'Approved');
  const totalRating = venues.reduce((s, v) => s + (v.rating || 0), 0);
  const avgRating = venues.length > 0 ? (totalRating / venues.length).toFixed(1) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name?.split(' ')[0]}! 🏛️</h1>
          <p className="text-muted text-sm">Venue Owner Dashboard · {new Date().toLocaleDateString('en-EG', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/venue/new')}>+ Add Venue</button>
      </div>

      <div className="grid-4 mb-6">
        <DashboardCard icon="🏛️" label="My Venues" value={venues.length} color="#1a6b5c" />
        <DashboardCard icon="📥" label="Pending Requests" value={pendingBookings.length} color="#dd6b20" />
        <DashboardCard icon="✅" label="Confirmed Bookings" value={approvedBookings.length} color="#38a169" />
        <DashboardCard icon="⭐" label="Avg Rating" value={avgRating} color="#d4875a" />
      </div>

      {pendingBookings.length > 0 && (
        <div className="alert alert-warning mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📬 You have {pendingBookings.length} pending booking request{pendingBookings.length > 1 ? 's' : ''} awaiting your response!</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/venue/bookings')}>Review Now</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>My Venues</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/venue/listings')}>View All</button>
          </div>
          {venues.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <p>No venues listed yet</p>
              <button className="btn btn-primary btn-sm mt-3" onClick={() => navigate('/venue/new')}>Add Your First Venue</button>
            </div>
          ) : venues.map(v => (
            <div key={v._id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{v.name}</div>
                <div className="text-sm text-muted">👥 Capacity: {v.capacity} · ⭐ {v.rating?.toFixed(1) || 'New'}</div>
              </div>
              <span className={`badge ${v.isActive ? 'badge-success' : 'badge-warning'}`}>{v.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Booking Requests</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/venue/bookings')}>View All</button>
          </div>
          {bookings.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}><p>No booking requests yet</p></div>
          ) : bookings.slice(0, 5).map(b => (
            <div key={b._id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{b.venue?.name}</div>
                <div className="text-sm text-muted">👤 {b.organizer?.name} · {new Date(b.date).toLocaleDateString()}</div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="card card-body mt-4">
        <h3 className="mb-4">Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '🏛️ My Venues', to: '/venue/listings' },
            { label: '+ Add Venue', to: '/venue/new' },
            { label: '📥 Booking Requests', to: '/venue/bookings' },
            { label: '✅ Confirmed Bookings', to: '/venue/confirmed' },
            { label: '📊 Venue Reports', to: '/venue/reports' },
          ].map(a => (
            <button key={a.label} className="btn btn-outline" onClick={() => navigate(a.to)}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VenueOwnerDashboard;
