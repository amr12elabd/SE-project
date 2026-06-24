import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { venuesAPI } from '../../api';
import { useLang } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const AvailabilityCalendar = ({ venueId }) => {
  const { t } = useLang();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unavailable, setUnavailable] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!venueId) return;
    venuesAPI.getById(venueId).then(r => setUnavailable((r.data.unavailableDates || []).map(d => new Date(d).toISOString().slice(0, 10)))).catch(() => {});
  }, [venueId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const toggleDate = async (dateStr) => {
    if (dateStr < today) return;
    setLoading(true);
    try {
      if (unavailable.includes(dateStr)) {
        await venuesAPI.removeUnavailable(venueId, dateStr);
        setUnavailable(prev => prev.filter(d => d !== dateStr));
        toast('Date marked as available', 'success');
      } else {
        await venuesAPI.markUnavailable(venueId, dateStr);
        setUnavailable(prev => [...prev, dateStr]);
        toast('Date marked as unavailable', 'info');
      }
    } catch { toast('Failed to update availability', 'error'); }
    finally { setLoading(false); }
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card card-body mb-4">
      <h3 className="mb-2">{t('availabilityCalendar')}</h3>
      <p className="text-muted text-sm mb-4">Click a date to {t('markUnavailable').toLowerCase()} (red) or {t('markAvailable').toLowerCase()} (white). Past dates cannot be changed.</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>← Prev</button>
        <strong>{currentDate.toLocaleString('en', { month: 'long', year: 'numeric' })}</strong>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>Next →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isUnavailable = unavailable.includes(dateStr);
          const isPast = dateStr < today;
          const isToday = dateStr === today;
          return (
            <button key={i} type="button" disabled={isPast || loading}
              onClick={() => toggleDate(dateStr)}
              style={{ padding: '8px 4px', borderRadius: 6, border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)', background: isUnavailable ? '#fee2e2' : isPast ? 'var(--bg)' : '#fff', color: isUnavailable ? '#991b1b' : isPast ? 'var(--text-muted)' : 'var(--text)', cursor: isPast ? 'default' : 'pointer', fontSize: 13, fontWeight: isUnavailable ? 700 : 400 }}>
              {day}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 14, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 3 }} /> {t('unavailable')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 14, height: 14, background: '#fff', border: '1px solid var(--border)', borderRadius: 3 }} /> {t('available')}</div>
      </div>
    </div>
  );
};

const AMENITIES = ['WiFi', 'Parking', 'Air Conditioning', 'Audio System', 'Projector', 'Stage', 'Kitchen', 'Outdoor Space', 'Catering Included', 'Security', 'Disabled Access', 'Prayer Room'];
const CAIRO_AREAS = ['Maadi', 'Zamalek', 'Heliopolis', 'Nasr City', 'New Cairo', 'October City', 'Downtown', 'Dokki', 'Mohandessin', 'Sheikh Zayed', 'Ain Sokhna'];

const EMPTY_FORM = {
  name: '', description: '',
  location: { address: '', city: 'Cairo', area: '' },
  capacity: '', dimensions: '',
  amenities: [],
  pricing: { perDay: '', perHour: '', currency: 'EGP' },
};

const VenueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const toast = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        const res = await venuesAPI.getById(id);
        const v = res.data;
        setForm({
          name: v.name || '',
          description: v.description || '',
          location: v.location || EMPTY_FORM.location,
          capacity: v.capacity || '',
          dimensions: v.dimensions || '',
          amenities: v.amenities || [],
          pricing: v.pricing || EMPTY_FORM.pricing,
        });
      } catch { toast('Failed to load venue', 'error'); navigate('/venue/listings'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const toggleAmenity = (a) => {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.capacity) return toast('Name and capacity are required', 'error');
    setSaving(true);
    try {
      if (isEdit) {
        await venuesAPI.update(id, form);
        toast('Venue updated!', 'success');
      } else {
        await venuesAPI.create(form);
        toast('Venue created!', 'success');
      }
      navigate('/venue/listings');
    } catch (err) { toast(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? '✏️ Edit Venue' : t('addNewVenue')}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card card-body mb-4">
          <h3 className="mb-4">{t('basicInfo')}</h3>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">{t('venueName')} *</label>
              <input type="text" className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. The Grand Ballroom" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">{t('venueDescription')}</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe what makes your venue special..." />
            </div>
            <div className="form-group">
              <label className="form-label">{t('capacityLabel')} *</label>
              <input type="number" className="form-control" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('dimensions')}</label>
              <input type="text" className="form-control" value={form.dimensions} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} placeholder="500 sqm" />
            </div>
          </div>
        </div>

        <div className="card card-body mb-4">
          <h3 className="mb-4">{t('location')}</h3>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">{t('address')}</label>
              <input type="text" className="form-control" value={form.location.address} onChange={e => setForm(f => ({ ...f, location: { ...f.location, address: e.target.value } }))} placeholder="123 Nile Corniche St" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('area')}</label>
              <select className="form-control" value={form.location.area} onChange={e => setForm(f => ({ ...f, location: { ...f.location, area: e.target.value } }))}>
                <option value="">Select area...</option>
                {CAIRO_AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('city')}</label>
              <input type="text" className="form-control" value={form.location.city} onChange={e => setForm(f => ({ ...f, location: { ...f.location, city: e.target.value } }))} />
            </div>
          </div>
        </div>

        <div className="card card-body mb-4">
          <h3 className="mb-4">Pricing</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t('pricePerDay')}</label>
              <input type="number" className="form-control" value={form.pricing.perDay} onChange={e => setForm(f => ({ ...f, pricing: { ...f.pricing, perDay: e.target.value } }))} min={0} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('pricePerHour')}</label>
              <input type="number" className="form-control" value={form.pricing.perHour} onChange={e => setForm(f => ({ ...f, pricing: { ...f.pricing, perHour: e.target.value } }))} min={0} />
            </div>
          </div>
        </div>

        <div className="card card-body mb-4">
          <h3 className="mb-3">{t('amenities')}</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {AMENITIES.map(a => (
              <button key={a} type="button"
                className={`btn btn-sm ${form.amenities.includes(a) ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleAmenity(a)}>
                {a}
              </button>
            ))}
          </div>
          {form.amenities.length > 0 && <div className="text-sm text-muted mt-2">{form.amenities.length} amenities selected</div>}
        </div>

        {isEdit && <AvailabilityCalendar venueId={id} />}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/venue/listings')}>{t('cancel')}</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? t('update') + ' Venue' : t('create') + ' Venue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VenueForm;
