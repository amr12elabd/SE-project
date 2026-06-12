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

  const handleRSVP = async (guestId, invitationId, rsvpStatus) => {
    setResponding(guestId);
    try {
      await guestsAPI.updateRSVP(guestId, { rsvpStatus });
      setInvitations(prev => prev.map(inv => inv._id === invitationId
        ? { ...inv, guest: { ...inv.guest, rsvpStatus }, status: 'Responded' }
        : inv
      ));
      toast(`RSVP updated: ${rsvpStatus}`, 'success');
    } catch (err) { toast(err.response?.data?.message || 'RSVP failed', 'error'); }
    finally { setResponding(null); }
  };

  if (loading) return <LoadingSpinner fullPage />;

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
                              onClick={() => handleRSVP(guest._id, inv._id, opt.value)}
                              disabled={responding === guest._id}>
                              {responding === guest._id ? '...' : opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your response:</span>
                        <StatusBadge status={guest?.rsvpStatus} />
                        {guest?.rsvpStatus !== 'Not Attending' && (
                          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                            {RSVP_OPTIONS.filter(o => o.value !== guest?.rsvpStatus).map(opt => (
                              <button key={opt.value} className="btn btn-ghost btn-sm" style={{ color: opt.color, borderColor: opt.color }}
                                onClick={() => handleRSVP(guest._id, inv._id, opt.value)}>
                                Change to {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
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
