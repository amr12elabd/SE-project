import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { venuesAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

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
        <h1>{isEdit ? '✏️ Edit Venue' : '+ Add New Venue'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card card-body mb-4">
          <h3 className="mb-4">Basic Information</h3>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Venue Name *</label>
              <input type="text" className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. The Grand Ballroom" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe what makes your venue special..." />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity (persons) *</label>
              <input type="number" className="form-control" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Dimensions (e.g. 500 sqm)</label>
              <input type="text" className="form-control" value={form.dimensions} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} placeholder="500 sqm" />
            </div>
          </div>
        </div>

        <div className="card card-body mb-4">
          <h3 className="mb-4">Location</h3>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Street Address</label>
              <input type="text" className="form-control" value={form.location.address} onChange={e => setForm(f => ({ ...f, location: { ...f.location, address: e.target.value } }))} placeholder="123 Nile Corniche St" />
            </div>
            <div className="form-group">
              <label className="form-label">Area</label>
              <select className="form-control" value={form.location.area} onChange={e => setForm(f => ({ ...f, location: { ...f.location, area: e.target.value } }))}>
                <option value="">Select area...</option>
                {CAIRO_AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-control" value={form.location.city} onChange={e => setForm(f => ({ ...f, location: { ...f.location, city: e.target.value } }))} />
            </div>
          </div>
        </div>

        <div className="card card-body mb-4">
          <h3 className="mb-4">Pricing</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Price per Day (EGP)</label>
              <input type="number" className="form-control" value={form.pricing.perDay} onChange={e => setForm(f => ({ ...f, pricing: { ...f.pricing, perDay: e.target.value } }))} min={0} />
            </div>
            <div className="form-group">
              <label className="form-label">Price per Hour (EGP)</label>
              <input type="number" className="form-control" value={form.pricing.perHour} onChange={e => setForm(f => ({ ...f, pricing: { ...f.pricing, perHour: e.target.value } }))} min={0} />
            </div>
          </div>
        </div>

        <div className="card card-body mb-4">
          <h3 className="mb-3">Amenities</h3>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/venue/listings')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Venue' : 'Create Venue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VenueForm;
