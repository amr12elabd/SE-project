import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invitationsAPI, feedbackAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import OnboardingTour from '../../components/OnboardingTour';

const GuestDashboard = () => {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await invitationsAPI.getGuestInvitations();
        setInvitations(res.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const attending = invitations.filter(i => i.guest?.rsvpStatus === 'Attending').length;
  const pending = invitations.filter(i => i.guest?.rsvpStatus === 'Pending').length;
  const nextEvent = invitations
    .filter(i => i.guest?.rsvpStatus === 'Attending' && i.event?.date && new Date(i.event.date) >= new Date())
    .sort((a, b) => new Date(a.event.date) - new Date(b.event.date))[0];
  const daysUntilNext = nextEvent ? Math.ceil((new Date(nextEvent.event.date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div>
      <OnboardingTour role="guest" />
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name?.split(' ')[0]}! 🎉</h1>
          <p className="text-muted text-sm">Guest Portal · Your upcoming events and invitations</p>
        </div>
      </div>

      {/* Next Event Countdown */}
      {nextEvent && daysUntilNext !== null && (
        <div style={{ background: 'linear-gradient(135deg, #1a6b5c, #2d9b87)', borderRadius: 14, padding: '20px 28px', marginBottom: 20, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Your next confirmed event</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{nextEvent.event.name}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              📅 {new Date(nextEvent.event.date).toLocaleDateString('en-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
              {nextEvent.event.startTime && ` · ${nextEvent.event.startTime}`}
            </div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 24px' }}>
            <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{daysUntilNext === 0 ? '🎉' : daysUntilNext}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{daysUntilNext === 0 ? t('today') : daysUntilNext === 1 ? t('daysUntil') : t('daysUntil')}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#e8f5f2', color: 'var(--primary)' }}>✉️</div>
          <div className="stat-info"><div className="stat-value">{invitations.length}</div><div className="stat-label">{t('myInvitations')}</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#f0fff4', color: 'var(--success)' }}>✅</div>
          <div className="stat-info"><div className="stat-value">{attending}</div><div className="stat-label">{t('attending')}</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#fffaf0', color: 'var(--warning)' }}>⏳</div>
          <div className="stat-info"><div className="stat-value">{pending}</div><div className="stat-label">Awaiting Response</div></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>{t('myInvitations')}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/guest/invitation')}>View All</button>
          </div>
          {invitations.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}><p>{t('noInvitations')}</p></div>
          ) : invitations.slice(0, 4).map(inv => (
            <div key={inv._id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{inv.event?.name}</div>
                <div className="text-sm text-muted">📅 {new Date(inv.event?.date).toLocaleDateString()}</div>
              </div>
              <StatusBadge status={inv.guest?.rsvpStatus || inv.status} />
            </div>
          ))}
        </div>

        <div className="card card-body">
          <h3 className="mb-4">Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '✉️ ' + t('myInvitations'), desc: 'View and respond to event invitations', to: '/guest/invitation' },
              { label: '📨 ' + t('dayOfMessages'), desc: 'Real-time updates from your organizer', to: '/guest/messages' },
              { label: '🎟️ ' + t('myQRCode'), desc: t('showAtEntrance'), to: '/guest/qr' },
              { label: '⭐ ' + t('submitFeedback'), desc: 'Rate events you\'ve attended', to: '/guest/feedback' },
            ].map(a => (
              <button key={a.label} className="btn btn-outline" style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '12px 16px', height: 'auto' }} onClick={() => navigate(a.to)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{a.label}</div>
                  <div className="text-xs text-muted">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {pending > 0 && (
        <div className="alert alert-warning mt-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📬 You have {pending} invitation{pending > 1 ? 's' : ''} waiting for your response!</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/guest/invitation')}>Respond Now</button>
        </div>
      )}
    </div>
  );
};

export default GuestDashboard;
