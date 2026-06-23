import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sourcingAPI, invoicesAPI, vendorsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';
import OnboardingTour from '../../components/OnboardingTour';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sourcing, setSourcing] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sRes, iRes, pRes] = await Promise.all([
          sourcingAPI.getAll(),
          invoicesAPI.getAll(),
          vendorsAPI.getMyProfile(),
        ]);
        setSourcing(sRes.data);
        setInvoices(iRes.data);
        setProfile(pRes.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await sourcingAPI.updateStatus(id, { status });
      setSourcing(prev => prev.map(item => item._id === id ? { ...item, status } : item));
    } catch { /* ignore */ }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const pending = sourcing.filter(s => s.status === 'Pending').length;
  const active = sourcing.filter(s => ['Accepted', 'Preparing', 'Out for Delivery'].includes(s.status)).length;
  const pendingInvoices = invoices.filter(i => i.status === 'Pending Review').length;
  const paidInvoices = invoices.filter(i => i.status === 'Paid');
  const totalEarned = paidInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  return (
    <div>
      <OnboardingTour role="vendor" />
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name?.split(' ')[0]}! 🏪</h1>
          <p className="text-muted text-sm">
            {profile ? profile.companyName : 'Vendor Dashboard'} · {new Date().toLocaleDateString('en-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!profile && (
          <button className="btn btn-primary" onClick={() => navigate('/vendor/profile')}>
            Complete Your Profile
          </button>
        )}
      </div>

      {!profile && (
        <div className="alert alert-warning mb-4">
          ⚠️ Your vendor profile is not set up yet. <button className="btn btn-link" onClick={() => navigate('/vendor/profile')}>Complete it now</button> to start receiving sourcing requests.
        </div>
      )}

      <div className="grid-4 mb-6">
        <DashboardCard icon="📥" label="New Requests" value={pending} color="#dd6b20" />
        <DashboardCard icon="🚛" label="Active Orders" value={active} color="#2563eb" />
        <DashboardCard icon="🧾" label="Pending Invoices" value={pendingInvoices} color="#805ad5" />
        <DashboardCard icon="💰" label="Total Earned (EGP)" value={totalEarned.toLocaleString()} color="#38a169" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>Recent Sourcing Requests</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/vendor/sourcing')}>View All</button>
          </div>
          {sourcing.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}><p>No sourcing requests yet</p></div>
          ) : sourcing.slice(0, 5).map(s => (
            <div key={s._id} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.event?.name || 'Event'}</div>
                  <div className="text-sm text-muted">📅 {new Date(s.deliveryDate).toLocaleDateString()} · {s.requestedItems?.length || 0} items</div>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                {s.status === 'Pending' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(s._id, 'Accepted')} style={{ minWidth: 100 }}>✓ Accept</button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(s._id, 'Declined')} style={{ minWidth: 100 }}>✕ Decline</button>
                  </>
                )}
                {s.status === 'Accepted' && (
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(s._id, 'Preparing')} style={{ minWidth: 150 }}>🏭 Start Preparing</button>
                )}
                {s.status === 'Preparing' && (
                  <button className="btn btn-primary btn-sm" onClick={() => updateStatus(s._id, 'Out for Delivery')} style={{ minWidth: 170 }}>🚛 Out for Delivery</button>
                )}
                {s.status === 'Out for Delivery' && (
                  <button className="btn btn-primary btn-sm" onClick={() => updateStatus(s._id, 'Delivered')} style={{ minWidth: 150 }}>📦 Mark Delivered</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Invoices</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/vendor/invoices')}>View All</button>
          </div>
          {invoices.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}><p>No invoices submitted yet</p></div>
          ) : invoices.slice(0, 5).map(i => (
            <div key={i._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{i.invoiceNumber}</div>
                <div className="text-sm text-muted">EGP {i.totalAmount?.toLocaleString()}</div>
              </div>
              <StatusBadge status={i.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="card card-body mt-4">
        <h3 className="mb-4">Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '👤 My Profile', to: '/vendor/profile' },
            { label: '📦 Product Catalogue', to: '/vendor/catalogue' },
            { label: '📥 Incoming Orders', to: '/vendor/sourcing' },
            { label: '� Change Status', to: '/vendor/sourcing' },
            { label: '�🚛 Delivery Status', to: '/vendor/delivery' },
            { label: '🧾 Submit Invoice', to: '/vendor/submit-invoice' },
            { label: '📊 Invoice Status', to: '/vendor/invoices' },
          ].map(a => (
            <button key={a.label} className="btn btn-outline" onClick={() => navigate(a.to)}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
