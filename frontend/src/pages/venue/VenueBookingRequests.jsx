import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';

const VenueBookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [responding, setResponding] = useState(null);
  const [confirmDecline, setConfirmDecline] = useState(null);
  const [responseForm, setResponseForm] = useState({ ownerMessage: '', counterDate: '', counterPrice: '', counterNotes: '' });
  const [responseType, setResponseType] = useState('approve');
  const toast = useToast();

  const load = async () => {
    try {
      const res = await bookingsAPI.getAll();
      setBookings(res.data);
    } catch { toast('Failed to load bookings', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openResponse = (booking, type) => {
    setResponding(booking);
    setResponseType(type);
    setResponseForm({ ownerMessage: '', counterDate: '', counterPrice: '', counterNotes: '' });
  };

  const submitResponse = async () => {
    try {
      const payload = { ownerMessage: responseForm.ownerMessage };
      if (responseType === 'approve') payload.status = 'Approved';
      if (responseType === 'decline') payload.status = 'Declined';
      if (responseType === 'counter') {
        payload.status = 'Counter-Proposed';
        payload.counterProposal = { date: responseForm.counterDate, price: responseForm.counterPrice, notes: responseForm.counterNotes };
      }
      await bookingsAPI.updateStatus(responding._id, payload);
      setResponding(null);
      await load();
      if (payload.status) setFilter(payload.status);
      toast('Response sent to organizer', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to respond', 'error'); }
  };

  const filtered = bookings.filter(b => !filter || b.status === filter);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <ConfirmModal isOpen={Boolean(confirmDecline)} onClose={() => setConfirmDecline(null)}
        onConfirm={async () => { if (!confirmDecline) return; await handleResponse(confirmDecline, 'Declined', 'This request has been declined.'); setConfirmDecline(null); }}
        title="Decline Booking Request" message={`Decline the booking request from ${confirmDecline?.organizer?.name} for ${new Date(confirmDecline?.date || Date.now()).toDateString()}? This will notify the organizer.`} confirmLabel="Decline Request" />
      <div className="page-header"><h1>📥 Booking Requests</h1></div>

      <div className="filter-bar mb-4">
        {['', 'Pending', 'Approved', 'Declined', 'Counter-Proposed'].map((s, i) => (
          <button key={i} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📥</div><h3>No booking requests found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(b => (
            <div key={b._id} className="card card-body">
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ margin: 0 }}>🏛️ {b.venue?.name}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                    <span>👤 {b.organizer?.name} ({b.organizer?.email})</span>
                    <span>📅 {new Date(b.date).toLocaleDateString()}</span>
                    <span>👥 {b.expectedAttendees} attendees</span>
                  </div>
                  {b.specialRequirements && (
                    <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 6, fontSize: 13, marginBottom: 8 }}>
                      📝 Special Requirements: {b.specialRequirements}
                    </div>
                  )}
                  {b.ownerMessage && (
                    <div style={{ padding: '8px 12px', background: '#f0f9ff', borderRadius: 6, fontSize: 13, marginBottom: 8 }}>
                      💬 Your response: {b.ownerMessage}
                    </div>
                  )}
                  {b.counterProposal && b.status === 'Counter-Proposed' && (
                    <div style={{ padding: '10px 14px', background: '#fff3e0', borderRadius: 6, fontSize: 13 }}>
                      🔄 Counter Proposal: Date {b.counterProposal.date ? new Date(b.counterProposal.date).toLocaleDateString() : '—'} · EGP {b.counterProposal.price || '—'} · {b.counterProposal.notes}
                    </div>
                  )}
                </div>
                {b.status === 'Pending' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => openResponse(b, 'approve')}>✓ Approve</button>
                    <button className="btn btn-outline btn-sm" onClick={() => openResponse(b, 'counter')}>🔄 Counter</button>
                    <button className="btn btn-danger btn-sm" onClick={() => openResponse(b, 'decline')}>✕ Decline</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {responding && (
        <div className="modal-overlay" onClick={() => setResponding(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {responseType === 'approve' ? '✓ Approve Booking' : responseType === 'decline' ? '✕ Decline Booking' : '🔄 Counter-Propose'}
              </h2>
              <button className="modal-close" onClick={() => setResponding(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-3">Responding to booking request for <strong>{responding.venue?.name}</strong> on {new Date(responding.date).toLocaleDateString()}</p>

              <div className="form-group">
                <label className="form-label">Message to Organizer</label>
                <textarea className="form-control" rows={3} value={responseForm.ownerMessage} onChange={e => setResponseForm(f => ({ ...f, ownerMessage: e.target.value }))} placeholder={responseType === 'approve' ? "We're happy to confirm your booking..." : responseType === 'decline' ? "Unfortunately we cannot accommodate..." : "We'd like to propose an alternative..."} />
              </div>

              {responseType === 'counter' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Alternative Date</label>
                    <input type="date" className="form-control" value={responseForm.counterDate} onChange={e => setResponseForm(f => ({ ...f, counterDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Proposed Price (EGP)</label>
                    <input type="number" className="form-control" value={responseForm.counterPrice} onChange={e => setResponseForm(f => ({ ...f, counterPrice: e.target.value }))} min={0} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Additional Notes</label>
                    <textarea className="form-control" rows={2} value={responseForm.counterNotes} onChange={e => setResponseForm(f => ({ ...f, counterNotes: e.target.value }))} />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setResponding(null)}>Cancel</button>
              <button className={`btn ${responseType === 'decline' ? 'btn-danger' : 'btn-primary'}`} onClick={submitResponse}>
                {responseType === 'approve' ? 'Confirm Approval' : responseType === 'decline' ? 'Send Decline' : 'Send Counter Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueBookingRequests;
