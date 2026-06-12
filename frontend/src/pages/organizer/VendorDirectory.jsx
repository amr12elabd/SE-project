import { useState, useEffect } from 'react';
import { vendorsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';

const VendorDirectory = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(null);
  const toast = useToast();

  const fetchVendors = async () => {
    try {
      const res = await vendorsAPI.getAll({ search, category });
      setVendors(res.data);
    } catch { toast('Failed to load vendors', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVendors(); }, []);

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
        <div className="empty-state"><div className="empty-state-icon">🚚</div><h3>No vendors found</h3></div>
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

              <button className="btn btn-outline btn-sm" onClick={() => setSelected(v)}>View Details</button>
            </div>
          ))}
        </div>
      )}

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
