import { useState, useEffect } from 'react';
import { feedbackAPI, invitationsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const StarRating = ({ value, onChange, label }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: star <= value ? '#f59e0b' : '#e5e7eb', transition: 'color 0.15s' }}
          onClick={() => onChange(star)}>
          ★
        </button>
      ))}
      <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        {value > 0 ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value] : 'Not rated'}
      </span>
    </div>
  </div>
);

const FeedbackForm = () => {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    event: '',
    overallRating: 0,
    foodRating: 0,
    venueRating: 0,
    organizationRating: 0,
    comments: '',
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await invitationsAPI.getGuestInvitations();
        const attended = res.data.filter(i => i.guest?.rsvpStatus === 'Attending' || i.guest?.checkInStatus);
        const evts = attended.map(i => i.event).filter(Boolean);
        const unique = evts.filter((e, i, a) => a.findIndex(x => x._id === e._id) === i);
        setEvents(unique);
        if (unique.length > 0) setForm(f => ({ ...f, event: unique[0]._id }));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.event) return toast('Please select an event', 'error');
    if (form.overallRating === 0) return toast('Overall rating is required', 'error');
    setSubmitting(true);
    try {
      await feedbackAPI.submit(form.event, form);
      setSubmitted(true);
      toast('Thank you for your feedback!', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Submission failed', 'error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (submitted) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
      <h2>Thank You for Your Feedback!</h2>
      <p className="text-muted" style={{ maxWidth: 400, lineHeight: 1.7 }}>
        Your review helps organizers improve future events. We really appreciate you taking the time to share your experience.
      </p>
      <div style={{ fontSize: 36, marginTop: 20 }}>{'★'.repeat(form.overallRating)}{'☆'.repeat(5 - form.overallRating)}</div>
    </div>
  );

  return (
    <div>
      <div className="page-header"><h1>⭐ Leave Feedback</h1></div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>No events to review</h3>
          <p>Feedback is available for events you attended or confirmed attendance.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
          <div className="card card-body mb-4">
            <div className="form-group">
              <label className="form-label">Select Event *</label>
              <select className="form-control" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}>
                {events.map(e => <option key={e._id} value={e._id}>{e.name} — {new Date(e.date).toLocaleDateString()}</option>)}
              </select>
            </div>
          </div>

          <div className="card card-body mb-4">
            <h3 className="mb-4">Rate Your Experience</h3>
            <StarRating label="Overall Experience *" value={form.overallRating} onChange={v => setForm(f => ({ ...f, overallRating: v }))} />
            <StarRating label="Food & Beverages" value={form.foodRating} onChange={v => setForm(f => ({ ...f, foodRating: v }))} />
            <StarRating label="Venue & Ambience" value={form.venueRating} onChange={v => setForm(f => ({ ...f, venueRating: v }))} />
            <StarRating label="Organization & Logistics" value={form.organizationRating} onChange={v => setForm(f => ({ ...f, organizationRating: v }))} />
          </div>

          <div className="card card-body mb-4">
            <div className="form-group">
              <label className="form-label">Comments (optional)</label>
              <textarea className="form-control" rows={5} value={form.comments}
                onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
                placeholder="Share what you loved, what could be improved, or any other thoughts..." />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Your feedback is anonymous to other guests but visible to the event organizer.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting || form.overallRating === 0}>
              {submitting ? 'Submitting...' : '⭐ Submit Feedback'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;
