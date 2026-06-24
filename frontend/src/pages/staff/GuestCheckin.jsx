import { useState, useEffect } from 'react';
import { guestsAPI, eventsAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useLang } from '../../context/LanguageContext';

const RSVP_STATUSES = ['Pending', 'Attending', 'Not Attending', 'Maybe'];

const GuestCheckin = () => {
  const { t } = useLang();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      try {
        const res = await guestsAPI.getAll({ event: selectedEvent });
        setGuests(res.data);
      } catch { /* ignore */ }
    };
    fetch();
  }, [selectedEvent]);

  const toggleCheckIn = async (guest) => {
    setUpdating(guest._id + '_checkin');
    try {
      const res = await guestsAPI.checkIn(guest._id, {});
      const updated = res.data.guest;
      setGuests(prev => prev.map(g => g._id === guest._id ? { ...g, checkInStatus: updated.checkInStatus, checkedInAt: updated.checkedInAt, rsvpStatus: updated.rsvpStatus } : g));
      toast(res.data.message, 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed', 'error'); }
    finally { setUpdating(null); }
  };

  const updateRSVP = async (guestId, rsvpStatus) => {
    setUpdating(guestId + '_rsvp');
    try {
      await guestsAPI.updateRSVP(guestId, { rsvpStatus });
      setGuests(prev => prev.map(g => g._id === guestId ? { ...g, rsvpStatus } : g));
      toast(`RSVP updated to "${rsvpStatus}"`, 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to update RSVP', 'error'); }
    finally { setUpdating(null); }
  };

  const filtered = guests.filter(g => {
    const matchSearch = !search || g.guestName.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === '' || (filter === 'checkedIn' ? g.checkInStatus : !g.checkInStatus);
    return matchSearch && matchFilter;
  });

  const checkedIn = guests.filter(g => g.checkInStatus).length;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>🎟️ {t('guestCheckIn')}</h1></div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ width: 220 }}>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <input type="search" className="form-control" placeholder={t('searchGuest')} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">{t('filterByStatus')}</option>
          <option value="checkedIn">{t('checkIn')}</option>
          <option value="pending">{t('pending')}</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#e8f5f2', color: 'var(--primary)' }}>👥</div>
          <div className="stat-info"><div className="stat-value">{guests.length}</div><div className="stat-label">{t('guestCheckIn')}</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#f0fff4', color: 'var(--success)' }}>✅</div>
          <div className="stat-info"><div className="stat-value">{checkedIn}</div><div className="stat-label">{t('checkIn')}</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ background: '#fffaf0', color: 'var(--warning)' }}>⏳</div>
          <div className="stat-info"><div className="stat-value">{guests.length - checkedIn}</div><div className="stat-label">{t('remainingTasks')}</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Guest List ({filtered.length} shown)</h3></div>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}><p>{t('noData')}</p></div>
        ) : (
          <div>
            {filtered.map(g => (
              <div key={g._id} style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', background: g.checkInStatus ? '#f0fff4' : 'white', alignItems: 'center' }}>
                {/* Avatar */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: g.checkInStatus ? 'var(--success)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: g.checkInStatus ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {g.checkInStatus ? '✓' : g.guestName[0]}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{g.guestName}</div>
                  <div className="text-sm text-muted">{g.email}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* RSVP dropdown */}
                    <select
                      className="form-control"
                      value={g.rsvpStatus}
                      disabled={updating === g._id + '_rsvp'}
                      onChange={e => updateRSVP(g._id, e.target.value)}
                      style={{ width: 148, fontSize: 12, padding: '3px 8px', height: 28 }}
                    >
                      {RSVP_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span className="chip">{g.group}</span>
                    {g.dietaryPreferences?.length > 0 && <span style={{ fontSize: 11, color: 'var(--info)' }}>🥗 {g.dietaryPreferences.join(', ')}</span>}
                    {g.allergies?.length > 0 && <span style={{ fontSize: 11, color: 'var(--danger)' }}>⚠️ {g.allergies.join(', ')}</span>}
                  </div>
                </div>

                {/* Check-in control */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  {g.checkInStatus ? (
                    <div>
                      <div className="badge badge-success" style={{ display: 'block', marginBottom: 6 }}>✓ {t('checkIn')}</div>
                      {g.checkedInAt && <div className="text-xs text-muted" style={{ marginBottom: 6 }}>{new Date(g.checkedInAt).toLocaleTimeString()}</div>}
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: 11, padding: '3px 10px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        disabled={updating === g._id + '_checkin'}
                        onClick={() => toggleCheckIn(g)}
                      >
                        {t('undoArrived')}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => toggleCheckIn(g)}
                      disabled={updating === g._id + '_checkin' || g.rsvpStatus === 'Not Attending'}
                    >
                      {t('checkIn')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestCheckin;
