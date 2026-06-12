import { useState, useEffect } from 'react';
import { usersAPI, tasksAPI } from '../../api';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [staffTasks, setStaffTasks] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: 'password123', phone: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await usersAPI.getAll({ role: 'staff' });
        setStaff(res.data);
      } catch { toast('Failed to load staff', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast('Name, email and password required', 'error'); return; }
    setSaving(true);
    try {
      const res = await usersAPI.create({ ...form, role: 'staff' });
      setStaff(prev => [...prev, res.data]);
      toast('Staff member created!', 'success');
      setCreateModal(false);
      setForm({ name: '', email: '', password: 'password123', phone: '', bio: '' });
    } catch (err) { toast(err.response?.data?.message || 'Failed to create staff', 'error'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    try {
      await usersAPI.deactivate(id);
      setStaff(prev => prev.map(s => s._id === id ? { ...s, isActive: false } : s));
      toast('Staff member deactivated', 'success');
    } catch { toast('Failed to deactivate', 'error'); }
  };

  const viewStaffTasks = async (staffMember) => {
    setViewModal(staffMember);
    try {
      const res = await tasksAPI.getAll({ assignedTo: staffMember._id });
      setStaffTasks(res.data);
    } catch { setStaffTasks([]); }
  };

  const filtered = staff.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>Staff Management</h1>
        <button className="btn btn-primary" onClick={() => setCreateModal(true)}>+ Add Staff Member</button>
      </div>

      <div className="filter-bar">
        <input type="search" className="form-control" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
        <span className="text-muted text-sm">{filtered.length} staff members</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map(s => (
          <div key={s._id} className="card card-body">
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
              <div className="avatar" style={{ width: 52, height: 52, fontSize: 20, background: s.isActive ? 'var(--primary)' : '#94a3b8' }}>{s.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
                <div className="text-sm text-muted truncate">{s.email}</div>
                {s.phone && <div className="text-sm text-muted">{s.phone}</div>}
              </div>
              <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            {s.bio && <p className="text-sm text-muted mb-3">{s.bio}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => viewStaffTasks(s)}>View Tasks</button>
              {s.isActive && <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(s._id, s.name)}>Deactivate</button>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No staff found</h3></div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Add Staff Member"
        footer={<><button className="btn btn-ghost" onClick={() => setCreateModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</button></>}>
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Bio</label><textarea className="form-control" rows={2} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></div>
        </form>
      </Modal>

      {/* View Tasks Modal */}
      <Modal isOpen={Boolean(viewModal)} onClose={() => setViewModal(null)} title={`Tasks — ${viewModal?.name}`} size="lg">
        {staffTasks.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}><p>No tasks assigned to this staff member.</p></div>
        ) : (
          <div>
            {staffTasks.map(t => (
              <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{t.title}</div>
                  <div className="text-sm text-muted">{t.event?.name} · Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No deadline'}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffManagement;
