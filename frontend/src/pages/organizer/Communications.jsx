import { useState, useEffect } from 'react';
import { commsAPI, eventsAPI, guestsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';

const Communications = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [comms, setComms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [followUpModal, setFollowUpModal] = useState(null);
  const [message, setMessage] = useState('');
  const [followUpMsg, setFollowUpMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sendMode, setSendMode] = useState('all'); // 'all' | 'specific'
  const [selectedGuests, setSelectedGuests] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
      } catch { toast('Failed to load events', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      try {
        const [cRes, gRes] = await Promise.all([commsAPI.getForEvent(selectedEvent), guestsAPI.getAll({ event: selectedEvent })]);
        setComms(cRes.data);
        setGuests(gRes.data);
      } catch { /* ignore */ }
    };
    fetch();
  }, [selectedEvent]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) { toast('Message is required', 'error'); return; }
    if (sendMode === 'specific' && selectedGuests.length === 0) { toast('Please select at least one guest', 'error'); return; }
    setSending(true);
    try {
      const payload = { message };
      if (sendMode === 'specific') payload.recipientIds = selectedGuests;
      const res = await commsAPI.send(selectedEvent, payload);
      setComms(prev => [res.data, ...prev]);
      toast(sendMode === 'specific' ? `Message sent to ${selectedGuests.length} guest(s)!` : 'Message sent to all guests!', 'success');
      setMessage('');
      setSelectedGuests([]);
      setSendMode('all');
      setModal(false);
    } catch (err) { toast(err.response?.data?.message || 'Failed to send', 'error'); }
    finally { setSending(false); }
  };

  const toggleGuest = (id) => setSelectedGuests(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const handleFollowUp = async () => {
    if (!followUpMsg.trim()) { toast('Message required', 'error'); return; }
    setSending(true);
    try {
      const res = await commsAPI.followUp(selectedEvent, { followUpMessage: followUpMsg, originalCommId: followUpModal._id });
      setComms(prev => [res.data.followUp, ...prev]);
      toast(res.data.message, 'success');
      setFollowUpModal(null);
      setFollowUpMsg('');
    } catch (err) { toast(err.response?.data?.message || 'Failed to send follow-up', 'error'); }
    finally { setSending(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>Communications</h1>
        <div className="page-actions">
          <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ width: 220 }}>
            {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setModal(true)}>📢 Send Message</button>
        </div>
      </div>

      <div className="grid-3 mb-6">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#e8f5f2', color: 'var(--primary)' }}>👥</div><div className="stat-info"><div className="stat-value">{guests.length}</div><div className="stat-label">Total Guests</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#ebf8ff', color: 'var(--info)' }}>💬</div><div className="stat-info"><div className="stat-value">{comms.length}</div><div className="stat-label">Messages Sent</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fffaf0', color: 'var(--warning)' }}>👁️</div><div className="stat-info"><div className="stat-value">{comms.length > 0 ? comms[0]?.seenBy?.length : 0}</div><div className="stat-label">Seen (Latest)</div></div></div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Message History</h3></div>
        {comms.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}><div className="empty-state-icon">💬</div><h3>No messages sent</h3><p>Send a message to all guests for this event.</p></div>
        ) : (
          <div>
            {comms.map(c => {
              const total = c.recipients?.length || 0;
              const seen = c.seenBy?.length || 0;
              const unseen = total - seen;
              return (
                <div key={c._id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: c.isFollowUp ? 'var(--info-light)' : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      {c.isFollowUp && <span className="badge badge-info mb-2" style={{ display: 'inline-block' }}>↩ Follow-Up</span>}
                      <p style={{ fontSize: 14, marginBottom: 10 }}>{c.message}</p>
                      <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
                        <span style={{ color: 'var(--text-muted)' }}>👤 {c.sentBy?.name} · {new Date(c.createdAt).toLocaleString()}</span>
                        <span style={{ color: 'var(--info)' }}>📤 Sent to {total} guests</span>
                        <span style={{ color: 'var(--success)' }}>👁️ {seen} seen</span>
                        {unseen > 0 && <span style={{ color: 'var(--warning)' }}>⚠️ {unseen} not seen</span>}
                      </div>
                    </div>
                    {unseen > 0 && !c.isFollowUp && (
                      <button className="btn btn-outline btn-sm" onClick={() => setFollowUpModal(c)}>Send Follow-Up</button>
                    )}
                  </div>
                  <div style={{ width: '100%', background: 'var(--border)', height: 4, borderRadius: 2 }}>
                    <div style={{ width: `${total > 0 ? (seen / total) * 100 : 0}%`, background: 'var(--success)', height: '100%', borderRadius: 2, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => { setModal(false); setSendMode('all'); setSelectedGuests([]); setMessage(''); }} title="Send Message to Guests"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => { setModal(false); setSendMode('all'); setSelectedGuests([]); setMessage(''); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : sendMode === 'specific' ? `Send to ${selectedGuests.length} Guest${selectedGuests.length !== 1 ? 's' : ''}` : `Send to All ${guests.length} Guests`}
            </button>
          </>
        }>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button type="button" className={`btn btn-sm ${sendMode === 'all' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => { setSendMode('all'); setSelectedGuests([]); }}>
            📢 All Guests ({guests.length})
          </button>
          <button type="button" className={`btn btn-sm ${sendMode === 'specific' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setSendMode('specific')}>
            👤 Specific Guest(s)
          </button>
        </div>

        {/* Guest selector (shown only in specific mode) */}
        {sendMode === 'specific' && (
          <div className="card card-body mb-4" style={{ padding: '12px 16px', maxHeight: 200, overflowY: 'auto' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>SELECT RECIPIENTS</div>
            {guests.length === 0 ? (
              <p className="text-muted text-sm">No guests found for this event.</p>
            ) : guests.map(g => (
              <label key={g._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                <input type="checkbox" checked={selectedGuests.includes(g._id)} onChange={() => toggleGuest(g._id)} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{g.guestName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.email} · {g.rsvpStatus} · {g.group}</div>
                </div>
              </label>
            ))}
            {guests.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedGuests(guests.map(g => g._id))}>Select All</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedGuests([])}>Clear</button>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Message *</label>
          <textarea className="form-control" rows={4} placeholder="Type your message here..." value={message} onChange={e => setMessage(e.target.value)} />
        </div>
      </Modal>

      <Modal isOpen={Boolean(followUpModal)} onClose={() => setFollowUpModal(null)} title="Send Follow-Up Message"
        footer={<><button className="btn btn-ghost" onClick={() => setFollowUpModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleFollowUp} disabled={sending}>{sending ? 'Sending...' : 'Send Follow-Up'}</button></>}>
        {followUpModal && (
          <div>
            <div className="alert alert-info mb-4">
              This follow-up will be sent to guests who have NOT seen the original message ({(followUpModal.recipients?.length || 0) - (followUpModal.seenBy?.length || 0)} guests).
            </div>
            <div className="form-group">
              <label className="form-label">Follow-Up Message</label>
              <textarea className="form-control" rows={4} placeholder="Type follow-up message..." value={followUpMsg} onChange={e => setFollowUpMsg(e.target.value)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Communications;
