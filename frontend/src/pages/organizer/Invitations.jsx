import { useState, useEffect } from 'react';
import { eventsAPI, guestsAPI, invitationsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const Invitations = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [guests, setGuests] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
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
        const [gRes, iRes] = await Promise.all([guestsAPI.getAll({ event: selectedEvent }), invitationsAPI.getForEvent(selectedEvent)]);
        setGuests(gRes.data);
        setInvitations(iRes.data);
      } catch { /* ignore */ }
    };
    fetch();
  }, [selectedEvent]);

  const toggleGuest = (id) => setSelectedGuests(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  const selectAll = () => setSelectedGuests(guests.filter(g => !hasInvitation(g._id)).map(g => g._id));

  const hasInvitation = (guestId) => invitations.some(i => (i.guest?._id || i.guest) === guestId);
  const getInvStatus = (guestId) => invitations.find(i => (i.guest?._id || i.guest) === guestId)?.status;

  const handleSend = async () => {
    if (!selectedGuests.length) { toast('Select at least one guest', 'error'); return; }
    setSending(true);
    try {
      const res = await invitationsAPI.send(selectedEvent, { event: selectedEvent, guestIds: selectedGuests, message });
      toast(`${res.data.invitations.length} invitations sent!`, 'success');
      const iRes = await invitationsAPI.getForEvent(selectedEvent);
      setInvitations(iRes.data);
      setSelectedGuests([]);
    } catch (err) { toast(err.response?.data?.message || 'Failed to send', 'error'); }
    finally { setSending(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const sentCount = invitations.length;
  const viewedCount = invitations.filter(i => i.status === 'Viewed' || i.status === 'Responded').length;
  const respondedCount = invitations.filter(i => i.status === 'Responded').length;

  return (
    <div>
      <div className="page-header"><h1>Invitations</h1></div>

      <div className="filter-bar">
        <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ width: 250 }}>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
      </div>

      <div className="grid-3 mb-6">
        <div className="stat-card"><div className="stat-icon" style={{ background: '#ebf8ff', color: 'var(--info)' }}>✉️</div><div className="stat-info"><div className="stat-value" style={{ color: 'var(--info)' }}>{sentCount}</div><div className="stat-label">Invitations Sent</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#fffaf0', color: 'var(--warning)' }}>👁️</div><div className="stat-info"><div className="stat-value" style={{ color: 'var(--warning)' }}>{viewedCount}</div><div className="stat-label">Viewed</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#f0fff4', color: 'var(--success)' }}>✅</div><div className="stat-info"><div className="stat-value" style={{ color: 'var(--success)' }}>{respondedCount}</div><div className="stat-label">Responded</div></div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Guest List */}
        <div className="card">
          <div className="card-header">
            <h3>Send Invitations</h3>
            <button className="btn btn-ghost btn-sm" onClick={selectAll}>Select Uninvited</button>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Custom Message (optional)</label>
              <textarea className="form-control" rows={3} placeholder="Add a personal message to the invitation..." value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {guests.length === 0 ? <p className="text-muted text-sm">No guests added for this event yet.</p> : guests.map(g => (
                <label key={g._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: selectedGuests.includes(g._id) ? 'var(--primary-light)' : 'white' }}>
                  <input type="checkbox" checked={selectedGuests.includes(g._id)} onChange={() => toggleGuest(g._id)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{g.guestName}</div>
                    <div className="text-xs text-muted">{g.email}</div>
                  </div>
                  {hasInvitation(g._id)
                    ? <span className="badge badge-info">{getInvStatus(g._id)}</span>
                    : <span className="badge badge-muted">Not Invited</span>}
                </label>
              ))}
            </div>
            <button className="btn btn-primary btn-block" onClick={handleSend} disabled={sending || selectedGuests.length === 0}>
              {sending ? 'Sending...' : `Send to ${selectedGuests.length} Guest${selectedGuests.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>

        {/* Invitation Status */}
        <div className="card">
          <div className="card-header"><h3>Invitation Status</h3></div>
          {invitations.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}><p>No invitations sent yet</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Guest</th><th>RSVP</th><th>Invitation</th></tr></thead>
                <tbody>
                  {invitations.map(inv => (
                    <tr key={inv._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{inv.guest?.guestName}</div>
                        <div className="text-xs text-muted">{inv.guest?.email}</div>
                      </td>
                      <td><StatusBadge status={inv.guest?.rsvpStatus || 'Pending'} /></td>
                      <td><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invitations;
