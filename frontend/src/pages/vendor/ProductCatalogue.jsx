import { useState, useEffect } from 'react';
import { vendorsAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useLang } from '../../context/LanguageContext';

const ProductCatalogue = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricingList, setPricingList] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editItem, setEditItem] = useState({ item: '', price: '', unit: 'per unit' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vendorsAPI.getMyProfile();
        setProfile(res.data);
        setPricingList(res.data?.pricingList || []);
      } catch { /* no profile */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const saveList = async (newList) => {
    setSaving(true);
    try {
      await vendorsAPI.upsertProfile({ ...profile, pricingList: newList });
      toast('Catalogue updated!', 'success');
    } catch { toast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const startEdit = (i) => {
    setEditIdx(i);
    setEditItem({ ...pricingList[i] });
  };

  const saveEdit = async () => {
    const newList = pricingList.map((item, i) => i === editIdx ? editItem : item);
    setPricingList(newList);
    setEditIdx(null);
    await saveList(newList);
  };

  const addItem = async () => {
    const newList = [...pricingList, { item: 'New Item', price: 0, unit: 'per unit' }];
    setPricingList(newList);
    setEditIdx(newList.length - 1);
    setEditItem({ item: 'New Item', price: 0, unit: 'per unit' });
  };

  const deleteItem = async (i) => {
    const newList = pricingList.filter((_, idx) => idx !== i);
    setPricingList(newList);
    await saveList(newList);
  };

  if (loading) return <LoadingSpinner fullPage />;

  if (!profile) return (
    <div className="empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-state-icon">📦</div>
      <h3>{t('noData')}</h3>
      <p>{t('catalogue')}</p>
      <button className="btn btn-primary mt-4" onClick={() => navigate('/vendor/profile')}>{t('profile')}</button>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>📦 {t('catalogue')}</h1>
        <button className="btn btn-primary" onClick={addItem}>+ {t('add')}</button>
      </div>

      <div className="card card-body mb-4" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{profile.companyName}</div>
          <div className="text-sm text-muted">{profile.suppliesOffered?.join(' · ')}</div>
        </div>
        <div className="text-sm text-muted">
          {pricingList.length} items · Min order: EGP {profile.minimumOrder || '—'} · Lead time: {profile.leadTime || '—'} days
        </div>
      </div>

      {pricingList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>{t('noData')}</h3>
          <p>{t('catalogue')}</p>
          <button className="btn btn-primary mt-4" onClick={addItem}>{t('add')}</button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('item')}</th>
                <th>{t('unitPrice')}</th>
                <th>{t('unit')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {pricingList.map((item, i) => (
                <tr key={i}>
                  {editIdx === i ? (
                    <>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{i + 1}</td>
                      <td><input type="text" className="form-control" value={editItem.item} onChange={e => setEditItem(v => ({ ...v, item: e.target.value }))} /></td>
                      <td><input type="number" className="form-control" value={editItem.price} onChange={e => setEditItem(v => ({ ...v, price: e.target.value }))} min={0} /></td>
                      <td>
                        <select className="form-control" value={editItem.unit} onChange={e => setEditItem(v => ({ ...v, unit: e.target.value }))}>
                          {['per unit', 'per kg', 'per hour', 'per day', 'per person', 'per event', 'per dozen', 'per litre'].map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>{t('save')}</button>
                        <button className="btn btn-ghost btn-sm ml-2" onClick={() => setEditIdx(null)}>{t('cancel')}</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{item.item}</td>
                      <td>EGP {Number(item.price).toLocaleString()}</td>
                      <td><span className="chip">{item.unit}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(i)}>✏️ {t('edit')}</button>
                        <button className="btn btn-danger btn-sm ml-2" onClick={() => deleteItem(i)}>🗑️ {t('delete')}</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogue;
