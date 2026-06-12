import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { venuesAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const VenueListings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await venuesAPI.getOwnerVenues();
      setVenues(res.data);
    } catch { toast('Failed to load venues', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (venue) => {
    try {
      const endpoint = venue.isActive ? venuesAPI.delete(venue._id) : venuesAPI.update(venue._id, { isActive: true });
      await endpoint;
      setVenues(prev => prev.map(v => v._id === venue._id ? { ...v, isActive: !v.isActive } : v));
      toast(venue.isActive ? 'Venue deactivated' : 'Venue activated', 'success');
    } catch { toast('Update failed', 'error'); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>🏛️ My Venue Listings</h1>
        <button className="btn btn-primary" onClick={() => navigate('/venue/new')}>+ Add Venue</button>
      </div>

      {venues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏛️</div>
          <h3>No venues listed yet</h3>
          <p>Add your first venue to start receiving booking requests from event organizers.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/venue/new')}>Add Your First Venue</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {venues.map(v => (
            <div key={v._id} className="card card-body">
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                  🏛️
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <h2 style={{ margin: 0 }}>{v.name}</h2>
                    <span className={`badge ${v.isActive ? 'badge-success' : 'badge-warning'}`}>{v.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>📍 {v.location?.address}, {v.location?.area}, {v.location?.city}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, marginBottom: 10 }}>
                    <span>👥 Capacity: {v.capacity}</span>
                    <span>💰 EGP {v.pricing?.perDay?.toLocaleString()} / day</span>
                    {v.rating > 0 && <span>⭐ {v.rating?.toFixed(1)} ({v.reviewCount} reviews)</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {v.amenities?.slice(0, 5).map(a => <span key={a} className="chip">{a}</span>)}
                    {v.amenities?.length > 5 && <span className="chip">+{v.amenities.length - 5} more</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/venue/edit/${v._id}`)}>✏️ Edit</button>
                  <button className={`btn btn-sm ${v.isActive ? 'btn-danger' : 'btn-outline'}`} onClick={() => toggleActive(v)}>
                    {v.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VenueListings;
