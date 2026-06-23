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
  const [eventOptions, setEventOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wasUpdated, setWasUpdated] = useState(false);
  const [form, setForm] = useState({
    event: '',
    guest: '',
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
        const attendedOptions = res.data
          .filter(i => i.guest?.rsvpStatus === 'Attending' || i.guest?.checkInStatus)
          .map(i => ({
            event: i.event,
            guest: i.guest?._id || i.guest,
          }))
          .filter(opt => opt.event && opt.guest);

        const uniqueOptions = attendedOptions.filter((opt, idx, arr) =>
          arr.findIndex(item => item.event?._id === opt.event?._id && item.guest === opt.guest) === idx
        );

        setEventOptions(uniqueOptions);
        if (uniqueOptions.length > 0) {
          setForm(f => ({
            ...f,
            event: uniqueOptions[0].event._id,
            guest: uniqueOptions[0].guest,
          }));
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.event) return toast('Please select an event', 'error');
    if (!form.guest) return toast('Unable to match your guest profile for this event', 'error');
    if (form.overallRating === 0) return toast('Overall rating is required', 'error');
    setSubmitting(true);
    try {
      const res = await feedbackAPI.submit(form.event, { ...form, guest: form.guest });
      setSubmitted(true);
      setWasUpdated(Boolean(res?.data && res.data._id));
      toast(
        res?.data && res.data._id ? 'Your feedback has been updated successfully!' : 'Thank you for your feedback!',
        'success'
      );
    } catch (err) { toast(err.response?.data?.message || 'Submission failed', 'error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const selectedEventName = eventOptions.find(o => o.event._id === form.event)?.event?.name || 'the event';

  if (submitted) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 480, width: '100%', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a6b5c, #2d9b87)', padding: '36px 32px 28px', color: '#fff' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>⭐</div>
          <h2 style={{ margin: 0, fontWeight: 800 }}>{wasUpdated ? 'Review Updated!' : 'Thank You!'}</h2>
          <p style={{ margin: '8px 0 0', opacity: 0.85 }}>{wasUpdated ? 'Your feedback has been updated' : 'Your feedback has been submitted'}</p>
        </div>
        <div style={{ padding: 32 }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Your rating for</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a6b5c', marginBottom: 10 }}>{selectedEventName}</div>
            <div style={{ fontSize: 32, color: '#f59e0b', letterSpacing: 2 }}>
              {'★'.repeat(form.overallRating)}{'☆'.repeat(5 - form.overallRating)}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 6 }}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][form.overallRating]}
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
            {wasUpdated
              ? 'Your updated review has been saved. Thank you for taking the time to improve your feedback!'
              : 'Your review helps organizers make every future event better. We truly appreciate you sharing your experience with us. ☕'}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setSubmitted(false); setForm(f => ({ ...f, overallRating: 0, foodRating: 0, venueRating: 0, organizationRating: 0, comments: '' })); }}>
              Leave Another Review
            </button>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => window.location.href = '/dashboard'}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header"><h1>⭐ Leave Feedback</h1></div>

      {eventOptions.length === 0 ? (
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
              <select
                className="form-control"
                value={form.event}
                onChange={e => {
                  const selected = eventOptions.find(opt => opt.event?._id === e.target.value);
                  setForm(f => ({
                    ...f,
                    event: e.target.value,
                    guest: selected?.guest || '',
                  }));
                }}
              >
                {eventOptions.map(({ event, guest }) => (
                  <option key={event._id} value={event._id}>
                    {event.name} — {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
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
