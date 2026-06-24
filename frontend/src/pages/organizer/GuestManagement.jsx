import { useState, useEffect } from 'react';
import { guestsAPI, eventsAPI } from '../../api';
import { useLang } from '../../context/LanguageContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { QRCodeCanvas } from 'qrcode.react';

const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten Free', 'Dairy Free', 'Halal', 'Kosher', 'No Nuts'];

const GuestManagement = () => {
  const { t } = useLang();
  const [guests, setGuests] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ event: '', rsvpStatus: '', search: '' });
  const [modal, setModal] = useState(false);
  const [editGuest, setEditGuest] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [form, setForm] = useState({ guestName: '', email: '', phone: '', event: '', group: 'General', dietaryPreferences: [], allergies: [], specialRequirements: '' });
  const [saving, setSaving] = useState(false);
  const [qrGuest, setQrGuest] = useState(null);
  const toast = useToast();

  const fetchGuests = async () => {
    try {
      const params = {};
      if (filters.event) params.event = filters.event;
      if (filters.rsvpStatus) params.rsvpStatus = filters.rsvpStatus;
      if (filters.search) params.search = filters.search;
      const res = await guestsAPI.getAll(params);
      setGuests(res.data);
    } catch { toast('Failed to load guests', 'error'); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setForm(f => ({ ...f, event: res.data[0]._id }));
      } catch { /* ignore */ }
      await fetchGuests();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { fetchGuests(); }, [filters]);

  const openModal = (guest = null) => {
    if (guest) {
      setEditGuest(guest);
      setForm({ guestName: guest.guestName, email: guest.email, phone: guest.phone || '', event: guest.event?._id || guest.event, group: guest.group || 'General', dietaryPreferences: guest.dietaryPreferences || [], allergies: guest.allergies || [], specialRequirements: guest.specialRequirements || '' });
    } else {
      setEditGuest(null);
      setForm({ guestName: '', email: '', phone: '', event: events[0]?._id || '', group: 'General', dietaryPreferences: [], allergies: [], specialRequirements: '' });
    }
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.guestName || !form.email || !form.event) { toast('Name, email and event required', 'error'); return; }
    setSaving(true);
    try {
      if (editGuest) {
        const res = await guestsAPI.update(editGuest._id, form);
        setGuests(prev => prev.map(g => g._id === editGuest._id ? res.data : g));
        toast('Guest updated!', 'success');
      } else {
        const res = await guestsAPI.create(form);
        setGuests(prev => [...prev, res.data]);
        toast('Guest added!', 'success');
      }
      setModal(false);
    } catch (err) { toast(err.response?.data?.message || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmRemove) return;
    try {
      await guestsAPI.delete(confirmRemove._id);
      setGuests(prev => prev.filter(g => g._id !== confirmRemove._id));
      toast('Guest removed', 'success');
      setConfirmRemove(null);
    } catch { toast('Failed to remove guest', 'error'); }
  };

  const toggleDietary = (d) => setForm(f => ({ ...f, dietaryPreferences: f.dietaryPreferences.includes(d) ? f.dietaryPreferences.filter(x => x !== d) : [...f.dietaryPreferences, d] }));

  if (loading) return <LoadingSpinner fullPage />;

  const stats = { attending: guests.filter(g => g.rsvpStatus === 'Attending').length, total: guests.length };

  return (
    <div>
      <ConfirmModal isOpen={Boolean(confirmRemove)} onClose={() => setConfirmRemove(null)} onConfirm={handleDelete}
        title="Remove Guest" message={`Remove ${confirmRemove?.guestName} from this event? Their invitation and RSVP will be deleted.`} confirmLabel="Remove Guest" />
      <div className="page-header">
        <div>
          <h1>{t('guests')}</h1>
          <p className="text-muted text-sm">{stats.attending} attending out of {stats.total} invited</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>{t('addGuest')}</button>
      </div>

      <div className="filter-bar">
        <input type="search" className="form-control" placeholder={t('searchGuests')} value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        <select className="form-control" value={filters.event} onChange={e => setFilters(f => ({ ...f, event: e.target.value }))}>
          <option value="">All Events</option>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <select className="form-control" value={filters.rsvpStatus} onChange={e => setFilters(f => ({ ...f, rsvpStatus: e.target.value }))}>
          <option value="">All RSVPs</option>
          {['Pending', 'Attending', 'Not Attending', 'Maybe'].map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-muted text-sm">{guests.length} guests</span>
      </div>

      {guests.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🎟️</div><h3>No guests found</h3></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>{t('guestName')}</th><th>{t('event2')}</th><th>{t('group')}</th><th>{t('rsvpStatus')}</th><th>{t('dietaryPreferences')}</th><th>{t('checkedIn')}</th><th>{t('actions')}</th></tr>
              </thead>
              <tbody>
                {guests.map(g => (
                  <tr key={g._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{g.guestName}</div>
                      <div className="text-xs text-muted">{g.email}</div>
                      {g.phone && <div className="text-xs text-muted">{g.phone}</div>}
                    </td>
                    <td className="text-sm text-muted">{g.event?.name || '—'}</td>
                    <td><span className="chip">{g.group}</span></td>
                    <td><StatusBadge status={g.rsvpStatus} /></td>
                    <td style={{ fontSize: 12 }}>
                      {g.dietaryPreferences?.length > 0 ? g.dietaryPreferences.join(', ') : '—'}
                      {g.allergies?.length > 0 && <div className="text-xs" style={{ color: 'var(--danger)' }}>⚠️ {g.allergies.join(', ')}</div>}
                    </td>
                    <td>
                      {g.checkInStatus
                        ? <span className="badge badge-success">✓ Checked In</span>
                        : <span className="badge badge-muted">Not Checked In</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openModal(g)}>{t('edit')}</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setQrGuest(g)} title="Show QR Code">QR</button>
                        <button className="btn btn-ghost btn-sm" title="Copy RSVP link" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/rsvp/${g.qrCodeValue}`); toast('RSVP link copied!', 'success'); }}>🔗</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmRemove(g)}>{t('delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editGuest ? t('edit') : t('addGuest')} size="lg"
        footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>{t('cancel')}</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editGuest ? t('save') : t('addGuest')}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('guestName')}</label><input className="form-control" value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">{t('email')}</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('phone')}</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="form-group">
              <label className="form-label">Event *</label>
              <select className="form-control" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}>
                {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('group')}</label>
              <select className="form-control" value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                {['General', 'VIP', 'Press', 'Staff', 'Sponsor'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Dietary Preferences</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {dietaryOptions.map(d => (
                <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={form.dietaryPreferences.includes(d)} onChange={() => toggleDietary(d)} />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('specialRequirements')}</label>
            <textarea className="form-control" rows={2} value={form.specialRequirements} onChange={e => setForm(f => ({ ...f, specialRequirements: e.target.value }))} />
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      {qrGuest && (
        <div className="modal-overlay" onClick={() => setQrGuest(null)}>
          <div className="modal" style={{ maxWidth: 340 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎟️ Guest QR Code</h2>
              <button className="modal-close" onClick={() => setQrGuest(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 20 }}>
              <div style={{ padding: 16, background: 'white', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', border: '1px solid var(--border)' }}>
                <QRCodeCanvas
                  value={qrGuest._id}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#1a6b5c"
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{qrGuest.guestName}</div>
                <div className="text-sm text-muted">{qrGuest.email}</div>
                <div className="text-sm text-muted">{qrGuest.event?.name} · {qrGuest.group}</div>
              </div>
              <p className="text-xs text-muted" style={{ textAlign: 'center', margin: 0 }}>
                Staff can scan this at the entrance using the Guest Check-In scanner
              </p>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                const canvas = document.querySelector('#qr-print canvas') || document.querySelector('.modal canvas');
                if (canvas) {
                  const link = document.createElement('a');
                  link.download = `qr-${qrGuest.guestName.replace(/\s+/g, '-')}.png`;
                  link.href = canvas.toDataURL();
                  link.click();
                }
              }}>
                ⬇ Download QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestManagement;
