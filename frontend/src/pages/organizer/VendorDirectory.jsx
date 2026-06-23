import { useState, useEffect } from 'react';
import { vendorsAPI, eventsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';

const VendorDirectory = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [events, setEvents] = useState([]);
  const [ratingForm, setRatingForm] = useState({ rating: 5, review: '', eventId: '', categories: { quality: 5, punctuality: 5, communication: 5, value: 5 } });
  const [ratings, setRatings] = useState([]);
  const [submittingRating, setSubmittingRating] = useState(false);
  const toast = useToast();

  const fetchVendors = async () => {
    try {
      const res = await vendorsAPI.getAll({ search, category });
      setVendors(res.data);
    } catch { toast('Failed to load vendors', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchVendors();
    eventsAPI.getAll().then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const openRatingModal = async (vendor) => {
    setRatingModal(vendor);
    setRatingForm({ rating: 5, review: '', eventId: events[0]?._id || '', categories: { quality: 5, punctuality: 5, communication: 5, value: 5 } });
    try {
      const r = await vendorsAPI.getRatings(vendor.user?._id || vendor._id);
      setRatings(r.data);
    } catch { setRatings([]); }
  };

  const handleSubmitRating = async () => {
    if (!ratingForm.rating) { toast('Please select a rating', 'error'); return; }
    setSubmittingRating(true);
    try {
      await vendorsAPI.submitRating({ vendorId: ratingModal.user?._id, eventId: ratingForm.eventId || undefined, rating: ratingForm.rating, review: ratingForm.review, categories: ratingForm.categories });
      toast('Rating submitted! Thank you.', 'success');
      setRatingModal(null);
      fetchVendors();
    } catch (err) { toast(err.response?.data?.message || 'Failed to submit rating', 'error'); }
    finally { setSubmittingRating(false); }
  };

  const categories = [...new Set(vendors.flatMap(v => v.suppliesOffered))].sort();

  const filtered = vendors.filter(v => {
    const matchSearch = !search || v.companyName?.toLowerCase().includes(search.toLowerCase()) || v.mainLocation?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || v.suppliesOffered?.includes(category);
    return matchSearch && matchCat;
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>Vendor Directory</h1></div>

      <div className="filter-bar">
        <input type="search" className="form-control" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={fetchVendors}>Search</button>
        <span className="text-muted text-sm">{filtered.length} vendors</span>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🚚</div><h3>{search || category ? 'No vendors match your filters' : 'No vendors in the directory yet'}</h3><p>{search || category ? 'Try clearing your filters to see all vendors.' : 'Vendors will appear here once they register and set up their profiles.'}</p>{(search || category) && <button className="btn btn-outline mt-4" onClick={() => { setSearch(''); setCategory(''); fetchVendors(); }}>Clear Filters</button>}</div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(v => (
            <div key={v._id} className="card card-body">
              <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: 22, background: 'var(--secondary)' }}>🚚</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 4 }}>{v.companyName}</h3>
                  <div className="text-sm text-muted">📍 {v.mainLocation}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    {'⭐'.repeat(Math.round(v.rating || 0))}
                    <span className="text-xs text-muted">({v.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {v.suppliesOffered?.map(s => <span key={s} className="chip">{s}</span>)}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Min order: {v.minimumOrder} EGP · Lead time: {v.leadTime}
              </div>

              {v.pricingList?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Sample Prices:</div>
                  {v.pricingList.slice(0, 2).map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                      <span>{p.item}</span>
                      <span style={{ fontWeight: 600 }}>{p.price} EGP/{p.unit}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setSelected(v)}>View Details</button>
                <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }} onClick={() => openRatingModal(v)}>⭐ Rate</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      <Modal isOpen={Boolean(ratingModal)} onClose={() => setRatingModal(null)} title={`Rate ${ratingModal?.companyName}`} size="md"
        footer={<><button className="btn btn-ghost" onClick={() => setRatingModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmitRating} disabled={submittingRating}>{submittingRating ? 'Submitting...' : 'Submit Rating'}</button></>}>
        <div>
          <div className="form-group mb-4">
            <label className="form-label">Overall Rating *</label>
            <div style={{ display: 'flex', gap: 8, fontSize: 28 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={{ cursor: 'pointer', color: n <= ratingForm.rating ? '#f59e0b' : '#e2e8f0' }} onClick={() => setRatingForm(f => ({ ...f, rating: n }))}>★</span>
              ))}
              <span style={{ fontSize: 14, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 8 }}>{ratingForm.rating}/5</span>
            </div>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Category Ratings</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {Object.entries(ratingForm.categories).map(([key, val]) => (
                <div key={key}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, textTransform: 'capitalize' }}>{key}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} style={{ cursor: 'pointer', fontSize: 18, color: n <= val ? '#f59e0b' : '#e2e8f0' }} onClick={() => setRatingForm(f => ({ ...f, categories: { ...f.categories, [key]: n } }))}>★</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {events.length > 0 && (
            <div className="form-group mb-4">
              <label className="form-label">Related Event</label>
              <select className="form-control" value={ratingForm.eventId} onChange={e => setRatingForm(f => ({ ...f, eventId: e.target.value }))}>
                <option value="">Select event (optional)</option>
                {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Written Review</label>
            <textarea className="form-control" rows={3} placeholder="Share your experience with this vendor..." value={ratingForm.review} onChange={e => setRatingForm(f => ({ ...f, review: e.target.value }))} />
          </div>
          {ratings.length > 0 && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Previous Reviews ({ratings.length})</div>
              {ratings.slice(0, 3).map((r, i) => (
                <div key={i} style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.organizer?.name}</span>
                    <span style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.review && <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{r.review}</p>}
                  {r.event && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Event: {r.event.name}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.companyName} size="lg">
        {selected && (
          <div>
            <div className="grid-2 mb-4">
              <div>
                <div className="text-muted text-xs mb-1">LOCATION</div>
                <div style={{ fontWeight: 500 }}>{selected.mainLocation}</div>
              </div>
              <div>
                <div className="text-muted text-xs mb-1">LEAD TIME</div>
                <div style={{ fontWeight: 500 }}>{selected.leadTime}</div>
              </div>
              <div>
                <div className="text-muted text-xs mb-1">MIN ORDER</div>
                <div style={{ fontWeight: 500 }}>{selected.minimumOrder} EGP</div>
              </div>
              <div>
                <div className="text-muted text-xs mb-1">CONTACT</div>
                <div style={{ fontWeight: 500 }}>{selected.contactInfo?.phone || selected.user?.phone || 'N/A'}</div>
              </div>
            </div>

            <h4 className="mb-2">Supplies Offered</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {selected.suppliesOffered?.map(s => <span key={s} className="chip">{s}</span>)}
            </div>

            <h4 className="mb-2">Delivery Regions</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {selected.deliveryRegions?.map(r => <span key={r} className="chip">📍 {r}</span>)}
            </div>

            {selected.pricingList?.length > 0 && (
              <>
                <h4 className="mb-2">Pricing List</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>Item</th><th style={{ textAlign: 'right', fontSize: 12 }}>Price</th></tr>
                  </thead>
                  <tbody>
                    {selected.pricingList.map((p, i) => (
                      <tr key={i}><td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>{p.item}</td><td style={{ textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{p.price} EGP/{p.unit}</td></tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorDirectory;
