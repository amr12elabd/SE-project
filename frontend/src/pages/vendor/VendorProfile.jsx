import { useState, useEffect } from 'react';
import { vendorsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const SUPPLY_CATEGORIES = ['Food & Beverages', 'Audio & Visual', 'Décor & Flowers', 'Furniture & Tents', 'Catering Equipment', 'Photography', 'Entertainment', 'Transportation', 'Cleaning Services', 'Security'];
const CAIRO_AREAS = ['Maadi', 'Zamalek', 'Heliopolis', 'Nasr City', 'New Cairo', 'October City', 'Downtown', 'Dokki', 'Mohandessin', 'Sheikh Zayed'];

const VendorProfile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [form, setForm] = useState({
    companyName: '',
    suppliesOffered: [],
    mainLocation: '',
    contactInfo: { phone: '', email: '', website: '' },
    deliveryRegions: [],
    minimumOrder: '',
    leadTime: '',
    pricingList: [],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vendorsAPI.getMyProfile();
        if (res.data) {
          setForm({
            companyName: res.data.companyName || '',
            suppliesOffered: res.data.suppliesOffered || [],
            mainLocation: res.data.mainLocation || '',
            contactInfo: res.data.contactInfo || { phone: '', email: '', website: '' },
            deliveryRegions: res.data.deliveryRegions || [],
            minimumOrder: res.data.minimumOrder || '',
            leadTime: res.data.leadTime || '',
            pricingList: res.data.pricingList || [],
          });
        }
      } catch { /* no profile yet */ }
      // Load ratings
      try {
        const rRes = await vendorsAPI.getRatings(user._id);
        setRatings(rRes.data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await vendorsAPI.upsertProfile(form);
      toast('Vendor profile saved!', 'success');
    } catch (err) { toast(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const toggleSupply = (cat) => {
    setForm(f => ({
      ...f,
      suppliesOffered: f.suppliesOffered.includes(cat) ? f.suppliesOffered.filter(c => c !== cat) : [...f.suppliesOffered, cat]
    }));
  };

  const toggleRegion = (area) => {
    setForm(f => ({
      ...f,
      deliveryRegions: f.deliveryRegions.includes(area) ? f.deliveryRegions.filter(a => a !== area) : [...f.deliveryRegions, area]
    }));
  };

  const addPricingItem = () => {
    setForm(f => ({ ...f, pricingList: [...f.pricingList, { item: '', price: '', unit: 'per unit' }] }));
  };

  const updatePricingItem = (i, field, val) => {
    setForm(f => {
      const list = [...f.pricingList];
      list[i] = { ...list[i], [field]: val };
      return { ...f, pricingList: list };
    });
  };

  const removePricingItem = (i) => {
    setForm(f => ({ ...f, pricingList: f.pricingList.filter((_, idx) => idx !== i) }));
  };

  if (loading) return <LoadingSpinner fullPage />;

  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1) : null;
  const categoryAvgs = ratings.length > 0 ? ['quality','punctuality','communication','value'].map(k => ({ metric: k.charAt(0).toUpperCase() + k.slice(1), value: Math.round(ratings.filter(r => r.categories?.[k]).reduce((s, r) => s + (r.categories[k] || 0), 0) / ratings.filter(r => r.categories?.[k]).length * 20) || 0 })) : [];

  return (
    <div>
      <div className="page-header"><h1>👤 Vendor Profile</h1></div>

      {/* Ratings Summary */}
      {ratings.length > 0 && (
        <div className="card card-body mb-4">
          <h3 className="mb-4">⭐ My Ratings & Reviews</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{avgRating}</div>
              <div style={{ color: '#f59e0b', fontSize: 22, margin: '6px 0' }}>{'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{ratings.length} review{ratings.length !== 1 ? 's' : ''}</div>
            </div>
            {categoryAvgs.length > 0 && (
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={categoryAvgs}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
                    <Tooltip formatter={v => `${v}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            {ratings.slice(0, 3).map((r, i) => (
              <div key={i} style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.organizer?.name || 'Organizer'}</span>
                  <span style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.review && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{r.review}</p>}
                {r.event && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Event: {r.event.name}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card card-body mb-4">
          <h3 className="mb-4">Company Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input type="text" className="form-control" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Main Location</label>
              <select className="form-control" value={form.mainLocation} onChange={e => setForm(f => ({ ...f, mainLocation: e.target.value }))}>
                <option value="">Select area...</option>
                {CAIRO_AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Minimum Order (EGP)</label>
              <input type="number" className="form-control" value={form.minimumOrder} onChange={e => setForm(f => ({ ...f, minimumOrder: e.target.value }))} min={0} />
            </div>
            <div className="form-group">
              <label className="form-label">Lead Time (days)</label>
              <input type="number" className="form-control" value={form.leadTime} onChange={e => setForm(f => ({ ...f, leadTime: e.target.value }))} min={0} />
            </div>
          </div>
        </div>

        <div className="card card-body mb-4">
          <h3 className="mb-4">Contact Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-control" value={form.contactInfo.phone} onChange={e => setForm(f => ({ ...f, contactInfo: { ...f.contactInfo, phone: e.target.value } }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Business Email</label>
              <input type="email" className="form-control" value={form.contactInfo.email} onChange={e => setForm(f => ({ ...f, contactInfo: { ...f.contactInfo, email: e.target.value } }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Website</label>
              <input type="url" className="form-control" value={form.contactInfo.website} onChange={e => setForm(f => ({ ...f, contactInfo: { ...f.contactInfo, website: e.target.value } }))} placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className="card card-body mb-4">
          <h3 className="mb-3">Supplies Offered</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {SUPPLY_CATEGORIES.map(cat => (
              <button key={cat} type="button"
                className={`btn btn-sm ${form.suppliesOffered.includes(cat) ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleSupply(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="card card-body mb-4">
          <h3 className="mb-3">Delivery Regions (Cairo)</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CAIRO_AREAS.map(area => (
              <button key={area} type="button"
                className={`btn btn-sm ${form.deliveryRegions.includes(area) ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleRegion(area)}>
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="card card-body mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Pricing List</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addPricingItem}>+ Add Item</button>
          </div>
          {form.pricingList.length === 0 ? (
            <p className="text-muted">No pricing items yet. Click "Add Item" to start.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Item</th><th>Price (EGP)</th><th>Unit</th><th></th></tr></thead>
              <tbody>
                {form.pricingList.map((item, i) => (
                  <tr key={i}>
                    <td><input type="text" className="form-control" value={item.item} onChange={e => updatePricingItem(i, 'item', e.target.value)} placeholder="Item name" /></td>
                    <td><input type="number" className="form-control" value={item.price} onChange={e => updatePricingItem(i, 'price', e.target.value)} min={0} /></td>
                    <td>
                      <select className="form-control" value={item.unit} onChange={e => updatePricingItem(i, 'unit', e.target.value)}>
                        {['per unit', 'per kg', 'per hour', 'per day', 'per person', 'per event'].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td><button type="button" className="btn btn-danger btn-sm" onClick={() => removePricingItem(i)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProfile;
