import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [responding, setResponding] = useState(null);
  const [counteringId, setCounteringId] = useState(null);
  const [counterForm, setCounterForm] = useState({ date: '', price: '', notes: '' });
  const toast = useToast();

  const handleRespond = async (id, accept) => {
    setResponding(id + (accept ? '_accept' : '_decline'));
    try {
      await bookingsAPI.respondToCounter(id, accept);
      toast(accept ? 'Counter proposal accepted!' : 'Counter proposal declined.', accept ? 'success' : 'info');
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status: accept ? 'Approved' : 'Declined' } : b));
    } catch { toast('Failed to respond', 'error'); }
    finally { setResponding(null); }
  };

  const handleSendCounter = async (id) => {
    if (!counterForm.notes.trim()) { toast('Please add a note for your counter offer', 'error'); return; }
    setResponding(id + '_counter');
    try {
      const res = await bookingsAPI.sendCounter(id, {
        date: counterForm.date || undefined,
        price: counterForm.price ? Number(counterForm.price) : undefined,
        notes: counterForm.notes
      });
      toast('Counter offer sent!', 'success');
      setBookings(bs => bs.map(b => b._id === id ? res.data : b));
      setCounteringId(null);
      setCounterForm({ date: '', price: '', notes: '' });
    } catch { toast('Failed to send counter offer', 'error'); }
    finally { setResponding(null); }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookingsAPI.getAll(filter ? { status: filter } : {});
        setBookings(res.data);
      } catch { toast('Failed to load bookings', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>Booking Requests</h1></div>

      <div className="filter-bar">
        <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['Pending', 'Approved', 'Declined', 'Counter-Proposed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-muted text-sm">{bookings.length} requests</span>
      </div>

      {bookings.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No booking requests</h3>
            <p>Go to Venue Search to submit a booking request.</p>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🏛️</div><h3>{filter ? `No ${filter} bookings` : 'No booking requests yet'}</h3><p>{filter ? 'Try selecting a different status filter.' : 'Submit a booking request from the Venue Search page to get started.'}</p>{!filter && <a href="/venues" className="btn btn-primary mt-4">Browse Venues</a>}</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bookings.map(b => (
            <div key={b._id} className="card card-body">
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3>🏛️ {b.venue?.name}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>📅 {new Date(b.date).toLocaleDateString('en-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>📍 {b.venue?.location?.area}, {b.venue?.location?.city}</span>
                    <span>👥 {b.expectedAttendees} attendees</span>
                    <span>💰 {b.venue?.pricing?.perDay?.toLocaleString()} EGP/day</span>
                    {b.event && <span>🎉 Event: {b.event?.name}</span>}
                  </div>
                  {b.specialRequirements && (
                    <div style={{ marginTop: 10, fontSize: 13 }}>
                      <span className="text-muted">Requirements: </span>{b.specialRequirements}
                    </div>
                  )}
                  {b.ownerMessage && (
                    <div style={{ marginTop: 10, padding: 12, background: 'var(--info-light)', borderRadius: 8, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: 'var(--info)' }}>Venue Owner Response: </span>{b.ownerMessage}
                    </div>
                  )}
                  {b.status === 'Counter-Proposed' && b.counterProposal?.notes && (
                    <div style={{ marginTop: 8, padding: 12, background: 'var(--warning-light)', borderRadius: 8, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: 'var(--warning)' }}>
                        {b.counterProposal.by === 'organizer' ? 'Your Counter Offer (awaiting venue owner): ' : 'Counter Proposal from Venue Owner: '}
                      </span>
                      {b.counterProposal.date && `Date: ${new Date(b.counterProposal.date).toLocaleDateString()}`}
                      {b.counterProposal.price && ` | Price: ${b.counterProposal.price} EGP`}
                      {b.counterProposal.notes && ` | ${b.counterProposal.notes}`}
                      {b.counterProposal.by !== 'organizer' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button className="btn btn-primary btn-sm" disabled={!!responding}
                            onClick={() => handleRespond(b._id, true)}>
                            {responding === b._id + '_accept' ? 'Accepting...' : 'Accept'}
                          </button>
                          <button className="btn btn-danger btn-sm" disabled={!!responding}
                            onClick={() => handleRespond(b._id, false)}>
                            {responding === b._id + '_decline' ? 'Declining...' : 'Decline'}
                          </button>
                          <button className="btn btn-ghost btn-sm" disabled={!!responding}
                            style={{ border: '1px solid var(--border)' }}
                            onClick={() => setCounteringId(counteringId === b._id ? null : b._id)}>
                            Counter Offer
                          </button>
                        </div>
                      )}
                      {counteringId === b._id && (
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Proposed Date</label>
                              <input type="date" className="form-control" value={counterForm.date}
                                onChange={e => setCounterForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Proposed Price (EGP)</label>
                              <input type="number" className="form-control" placeholder="e.g. 4500" value={counterForm.price}
                                onChange={e => setCounterForm(f => ({ ...f, price: e.target.value }))} />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Notes *</label>
                            <input className="form-control" placeholder="Explain your counter offer..." value={counterForm.notes}
                              onChange={e => setCounterForm(f => ({ ...f, notes: e.target.value }))} />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary btn-sm" disabled={!!responding}
                              onClick={() => handleSendCounter(b._id)}>
                              {responding === b._id + '_counter' ? 'Sending...' : 'Send Counter Offer'}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setCounteringId(null)}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                  Submitted<br />{new Date(b.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingRequests;
