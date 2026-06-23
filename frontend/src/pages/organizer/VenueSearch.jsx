import { useState, useEffect } from 'react';
import { venuesAPI, bookingsAPI, eventsAPI } from '../../api';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const VenueSearch = () => {
  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', area: '', minCapacity: '', maxCapacity: '', minPrice: '', maxPrice: '' });
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingForm, setBookingForm] = useState({ event: '', date: '', expectedAttendees: '', specialRequirements: '' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [vRes, eRes] = await Promise.all([venuesAPI.getAll(filters), eventsAPI.getAll()]);
        setVenues(vRes.data);
        setEvents(eRes.data);
      } catch { toast('Failed to load venues', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await venuesAPI.getAll(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
      setVenues(res.data);
    } catch { toast('Search failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingForm.date || !bookingForm.expectedAttendees) { toast('Date and attendees are required', 'error'); return; }
    setSubmitting(true);
    try {
      await bookingsAPI.create({ venue: bookingModal._id, ...bookingForm });
      toast('Booking request submitted!', 'success');
      setBookingModal(null);
      setBookingForm({ event: '', date: '', expectedAttendees: '', specialRequirements: '' });
    } catch (err) { toast(err.response?.data?.message || 'Failed to submit booking', 'error'); }
    finally { setSubmitting(false); }
  };

  const filtered = venues.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.location?.area?.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || !(v.unavailableDates || []).some(d => new Date(d).toISOString().slice(0, 10) === dateFilter);
    return matchSearch && matchDate;
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>Venue Search</h1></div>

      <div className="card card-body mb-4">
        <h3 className="mb-4">Search & Filter Venues</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search</label>
            <input className="form-control" placeholder="Name or area..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">City</label>
            <input className="form-control" placeholder="Cairo" value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Area</label>
            <input className="form-control" placeholder="Zamalek, Maadi..." value={filters.area} onChange={e => setFilters(f => ({ ...f, area: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Min Capacity</label>
            <input type="number" className="form-control" value={filters.minCapacity} onChange={e => setFilters(f => ({ ...f, minCapacity: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Max Price/Day (EGP)</label>
            <input type="number" className="form-control" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Event Date</label>
            <input type="date" className="form-control" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={handleSearch}>Search Venues</button>
          {dateFilter && <button className="btn btn-ghost btn-sm" onClick={() => setDateFilter('')}>Clear Date</button>}
        </div>
      </div>

      <p className="text-muted text-sm mb-4">{filtered.length} venues found</p>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🏛️</div><h3>No venues found</h3><p>Try adjusting your search criteria</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map(v => (
            <div key={v._id} className="card">
              <div style={{ height: 180, background: 'linear-gradient(135deg, var(--primary-light), var(--primary))', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'white' }}>🏛️</div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ flex: 1 }}>{v.name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--secondary)' }}>{v.pricing?.perDay?.toLocaleString()} EGP/day</div>
                    {dateFilter && !(v.unavailableDates || []).some(d => new Date(d).toISOString().slice(0, 10) === dateFilter) && (
                      <span style={{ fontSize: 10, background: '#f0fdf4', color: '#38a169', border: '1px solid #bbf7d0', borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>✓ Available {new Date(dateFilter).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <p className="text-muted text-sm mb-3">{v.description?.slice(0, 100)}...</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  <span>📍 {v.location?.area}, {v.location?.city}</span>
                  <span>👥 Up to {v.capacity} guests</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {v.amenities?.slice(0, 4).map(a => <span key={a} className="chip">{a}</span>)}
                  {v.amenities?.length > 4 && <span className="chip">+{v.amenities.length - 4}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setBookingModal(v)}>Request Booking</button>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
                    ⭐ {v.rating?.toFixed(1)} ({v.reviewCount} reviews)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(bookingModal)} onClose={() => setBookingModal(null)} title={`Book: ${bookingModal?.name}`}
        footer={<><button className="btn btn-ghost" onClick={() => setBookingModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleBook} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button></>}>
        {bookingModal && (
          <div>
            <div className="alert alert-info mb-4">Price: {bookingModal.pricing?.perDay?.toLocaleString()} EGP/day · Capacity: {bookingModal.capacity} guests</div>
            <div className="form-group">
              <label className="form-label">Link to Event (optional)</label>
              <select className="form-control" value={bookingForm.event} onChange={e => setBookingForm(f => ({ ...f, event: e.target.value }))}>
                <option value="">Select event...</option>
                {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Event Date *</label>
              <input type="date" className="form-control" value={bookingForm.date} onChange={e => setBookingForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Attendees *</label>
              <input type="number" className="form-control" value={bookingForm.expectedAttendees} onChange={e => setBookingForm(f => ({ ...f, expectedAttendees: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Special Requirements</label>
              <textarea className="form-control" rows={3} value={bookingForm.specialRequirements} onChange={e => setBookingForm(f => ({ ...f, specialRequirements: e.target.value }))} placeholder="Any special setup, timing, or requirements..." />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VenueSearch;
