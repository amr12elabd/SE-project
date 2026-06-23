import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

const PublicRSVP = () => {
  const { qrCode } = useParams();
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/guests/public/${qrCode}`);
        setGuest(res.data.guest);
        setStatus(res.data.guest.rsvpStatus !== 'Pending' ? res.data.guest.rsvpStatus : '');
      } catch (err) {
        setError(err.response?.data?.message || 'Invitation not found. Please check your link.');
      } finally { setLoading(false); }
    };
    fetch();
  }, [qrCode]);

  const handleRSVP = async (rsvpStatus) => {
    setSubmitting(true);
    try {
      await api.patch(`/guests/public/${qrCode}/rsvp`, { rsvpStatus });
      setStatus(rsvpStatus);
      setSubmitted(true);
    } catch { setError('Failed to submit your RSVP. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>☕</div>
        <p style={{ color: '#64748b' }}>Loading your invitation...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, maxWidth: 480, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <h2 style={{ color: '#1a202c', marginBottom: 8 }}>Invitation Not Found</h2>
        <p style={{ color: '#64748b' }}>{error}</p>
      </div>
    </div>
  );

  const event = guest?.event;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5f2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 520, width: '100%', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1a6b5c 0%, #2d9b87 100%)', padding: '32px 32px 24px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>☕</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>PopEyez</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 14 }}>You have been invited!</p>
        </div>

        <div style={{ padding: 32 }}>
          <h2 style={{ margin: '0 0 6px', color: '#1a202c' }}>Hello, {guest?.guestName}! 👋</h2>
          <p style={{ color: '#64748b', margin: '0 0 24px' }}>You have been cordially invited to join us at a curated pop-up café experience.</p>

          {/* Event Card */}
          {event && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px', color: '#1a6b5c', fontSize: 18 }}>{event.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#374151' }}>
                <div>📅 <strong>{new Date(event.date).toLocaleDateString('en-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                {event.startTime && <div>🕐 {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</div>}
                {event.venue && <div>🏛️ {typeof event.venue === 'object' ? `${event.venue.name}, ${event.venue.location?.area}` : 'Venue TBD'}</div>}
                {event.dressCode && <div>👗 Dress Code: {event.dressCode}</div>}
              </div>
              {event.description && <p style={{ margin: '12px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{event.description}</p>}
            </div>
          )}

          {/* Guest Details */}
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Group</span>
              <span style={{ fontWeight: 600, color: '#1a6b5c' }}>{guest?.group}</span>
            </div>
            {guest?.dietaryPreferences?.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ color: '#64748b' }}>Dietary Preferences</span>
                <span style={{ fontWeight: 600 }}>{guest.dietaryPreferences.join(', ')}</span>
              </div>
            )}
          </div>

          {/* RSVP Section */}
          {submitted || (status && status !== 'Pending') ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{status === 'Attending' ? '🎉' : status === 'Not Attending' ? '😔' : '🤔'}</div>
              <h3 style={{ color: '#1a202c', marginBottom: 8 }}>
                {status === 'Attending' ? 'See you there!' : status === 'Not Attending' ? 'We\'ll miss you!' : 'RSVP noted!'}
              </h3>
              <p style={{ color: '#64748b', margin: '0 0 20px' }}>
                {status === 'Attending' ? 'Your attendance has been confirmed. We look forward to seeing you!' : status === 'Not Attending' ? 'Thank you for letting us know. Hope to see you at the next event.' : 'Your response has been recorded.'}
              </p>
              <div style={{ display: 'inline-block', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 20px', fontWeight: 600, color: '#1a6b5c' }}>Status: {status}</div>
              {status === 'Attending' && (
                <p style={{ marginTop: 16, fontSize: 13, color: '#64748b' }}>📱 Your QR code: <strong>{guest?.qrCodeValue}</strong><br />Bring this to the event for quick check-in.</p>
              )}
              <button className="btn btn-ghost" style={{ marginTop: 16, display: 'block', margin: '16px auto 0' }} onClick={() => { setSubmitted(false); }}>Change my response</button>
            </div>
          ) : (
            <div>
              <h3 style={{ margin: '0 0 16px', color: '#1a202c' }}>Will you be attending?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => handleRSVP('Attending')} disabled={submitting} style={{ background: '#1a6b5c', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  ✅ {submitting ? 'Submitting...' : "Yes, I'll be there!"}
                </button>
                <button onClick={() => handleRSVP('Maybe')} disabled={submitting} style={{ background: '#f8fafc', color: '#374151', border: '2px solid #e2e8f0', borderRadius: 10, padding: '14px', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
                  🤔 Maybe
                </button>
                <button onClick={() => handleRSVP('Not Attending')} disabled={submitting} style={{ background: '#fff', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px', fontSize: 14, cursor: 'pointer' }}>
                  ❌ Sorry, I can't make it
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#f8fafc', padding: '16px 32px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Powered by <strong style={{ color: '#1a6b5c' }}>PopEyez</strong> — Pop-Up Café Event Management</p>
        </div>
      </div>
    </div>
  );
};

export default PublicRSVP;
