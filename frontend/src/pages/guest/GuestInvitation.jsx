import { useState, useEffect } from 'react';
import { invitationsAPI, guestsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const RSVP_OPTIONS = [
  { label: '✅ Attending', value: 'Attending', color: 'var(--success)' },
  { label: '❌ Not Attending', value: 'Not Attending', color: 'var(--danger)' },
  { label: '🤔 Maybe', value: 'Maybe', color: 'var(--warning)' },
];

const GuestInvitation = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [confirmed, setConfirmed] = useState(null); // { status, eventName, qrCode }
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await invitationsAPI.getGuestInvitations();
        setInvitations(res.data);
      } catch { toast('Failed to load invitations', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRSVP = async (guestId, invitationId, rsvpStatus, eventName, qrCode) => {
    setResponding(guestId);
    try {
      await guestsAPI.updateRSVP(guestId, { rsvpStatus });
      setInvitations(prev => prev.map(inv => inv._id === invitationId
        ? { ...inv, guest: { ...inv.guest, rsvpStatus }, status: 'Responded' }
        : inv
      ));
      if (rsvpStatus === 'Attending') {
        setConfirmed({ status: rsvpStatus, eventName, qrCode });
      } else {
        toast(`RSVP updated: ${rsvpStatus}`, rsvpStatus === 'Not Attending' ? 'info' : 'success');
      }
    } catch (err) { toast(err.response?.data?.message || 'RSVP failed', 'error'); }
    finally { setResponding(null); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (confirmed) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 460, width: '100%', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        <div style={{ background: 'linear-gradient(135deg, #1a6b5c, #2d9b87)', padding: '32px 32px 24px', color: '#fff' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🎉</div>
          <h2 style={{ margin: 0, fontWeight: 800 }}>You're Confirmed!</h2>
          <p style={{ margin: '8px 0 0', opacity: 0.85 }}>Your attendance has been recorded</p>
        </div>
        <div style={{ padding: 32 }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Event</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1a6b5c' }}>{confirmed.eventName}</div>
          </div>
          {confirmed.qrCode && (
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Your Check-In QR Code</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: 'var(--primary)', background: '#fff', padding: '10px 16px', borderRadius: 8, border: '2px dashed var(--primary)', display: 'inline-block' }}>
                {confirmed.qrCode}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Show this or your QR code page at the event entrance</div>
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
            A confirmation has been noted. You can view your QR code anytime from <strong>My QR Code</strong> in the menu. See you at the event! ☕
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setConfirmed(null)}>
            Back to My Invitations
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header"><h1>✉️ My Invitations</h1></div>

      {invitations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✉️</div>
          <h3>No invitations yet</h3>
          <p>When organizers invite you to events, they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {invitations.map(inv => {
            const event = inv.event;
            const guest = inv.guest;
            return (
              <div key={inv._id} className="card card-body">
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--primary-light)', borderRadius: 12, padding: '16px 20px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>
                      {event?.date ? new Date(event.date).getDate() : '—'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                      {event?.date ? new Date(event.date).toLocaleString('en', { month: 'short', year: 'numeric' }) : ''}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                      <h2 style={{ margin: 0 }}>{event?.name}</h2>
                      <StatusBadge status={guest?.rsvpStatus || 'Pending'} />
                    </div>

                    <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>
                      <span>🕐 {event?.startTime} – {event?.endTime}</span>
                      <span>🏛️ {event?.venue?.name || 'Venue TBD'}</span>
                      {event?.dressCode && <span>👔 {event.dressCode}</span>}
                      {event?.eventType && <span>🎭 {event.eventType}</span>}
                    </div>

                    {inv.message && (
                      <div style={{ padding: '10px 14px', background: '#f8fbff', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, marginBottom: 14, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        💌 "{inv.message}"
                      </div>
                    )}

                    {guest?.rsvpStatus === 'Pending' ? (
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Will you attend this event?</p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {RSVP_OPTIONS.map(opt => (
                            <button key={opt.value} className="btn btn-outline" style={{ borderColor: opt.color, color: opt.color, minWidth: 140 }}
                              onClick={() => handleRSVP(guest._id, inv._id, opt.value, event?.name, guest?.qrCodeValue)}
                              disabled={responding === guest._id}>
                              {responding === guest._id ? '...' : opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your response:</span>
                        <StatusBadge status={guest?.rsvpStatus} />
                        {guest?.rsvpStatus === 'Attending' && guest?.qrCodeValue && (
                          <span style={{ fontSize: 12, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 10px', borderRadius: 6 }}>
                            🎟️ QR: {guest.qrCodeValue}
                          </span>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                          {RSVP_OPTIONS.filter(o => o.value !== guest?.rsvpStatus).map(opt => (
                            <button key={opt.value} className="btn btn-ghost btn-sm" style={{ color: opt.color, borderColor: opt.color }}
                              onClick={() => handleRSVP(guest._id, inv._id, opt.value, event?.name, guest?.qrCodeValue)}>
                              Change to {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {event?.agenda && (
                      <details style={{ marginTop: 14 }}>
                        <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>📋 View Event Agenda</summary>
                        <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, whiteSpace: 'pre-line', color: 'var(--text-secondary)' }}>
                          {event.agenda}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuestInvitation;
