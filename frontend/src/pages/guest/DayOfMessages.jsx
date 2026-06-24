import { useState, useEffect, useRef } from 'react';
import { commsAPI, invitationsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

const DayOfMessages = () => {
  const { user } = useAuth();
  const { t } = useLang();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await invitationsAPI.getGuestInvitations();
        const evts = res.data.map(i => i.event).filter(Boolean);
        const unique = evts.filter((e, i, a) => a.findIndex(x => x._id === e._id) === i);
        setEvents(unique);
        if (unique.length > 0) setSelectedEvent(unique[0]._id);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      try {
        const res = await commsAPI.getEventCommunications(selectedEvent);
        setMessages(res.data);
      } catch { /* ignore */ }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [selectedEvent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>📨 {t('dayOfMessages')}</h1>
        <select className="form-control" style={{ width: 240 }} value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          {events.length === 0 ? <option value="">No events</option> : events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📨</div>
          <h3>{t('noMessages')}</h3>
          <p>Messages from your event organizer will appear here on the day of the event.</p>
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 10, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            🔄 Messages auto-refresh every 30 seconds
          </div>

          <div className="card" style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.length === 0 ? (
                <div className="empty-state" style={{ margin: 'auto' }}>
                  <div className="empty-state-icon">💬</div>
                  <p>No messages for this event yet.</p>
                </div>
              ) : messages.map(msg => (
                <div key={msg._id} style={{ maxWidth: '80%', alignSelf: 'flex-start' }}>
                  <div style={{ background: 'var(--primary)', color: 'white', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', fontSize: 14 }}>
                    {msg.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, paddingLeft: 4 }}>
                    👤 {msg.sentBy?.name || 'Organizer'} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.isFollowUp && <span style={{ marginLeft: 8, color: 'var(--secondary)', fontWeight: 600 }}>↩️ Follow-up</span>}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>

          <div style={{ marginTop: 12, padding: '10px 16px', background: '#f0fff4', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            ✅ Your responses to messages are tracked automatically when you view them.
          </div>
        </>
      )}
    </div>
  );
};

export default DayOfMessages;
