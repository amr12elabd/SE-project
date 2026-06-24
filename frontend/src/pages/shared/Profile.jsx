import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { usersAPI } from '../../api';
import { useToast } from '../../components/Toast';

const Profile = () => {
  const { user, updateLocalUser } = useAuth();
  const { t } = useLang();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '', avatarUrl: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, inApp: true });
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', bio: user.bio || '', avatarUrl: user.avatarUrl || '' });
      if (user.notificationPreferences) setNotifPrefs(user.notificationPreferences);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await usersAPI.update(user._id, { ...form, notificationPreferences: notifPrefs });
      updateLocalUser(res.data);
      toast('Profile updated successfully!', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast('Passwords do not match', 'error'); return; }
    if (pwForm.newPassword.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setPwLoading(true);
    try {
      await usersAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast('Password changed successfully!', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally { setPwLoading(false); }
  };

  const roleLabel = { organizer: 'Event Organizer', staff: 'Staff Member', vendor: 'Vendor', guest: 'Guest', venueOwner: 'Venue Owner' };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="page-header"><h1>{t('profile')}</h1></div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column */}
        <div>
          <div className="card card-body" style={{ textAlign: 'center', marginBottom: 16 }}>
            <div className="avatar avatar-lg" style={{ margin: '0 auto 12px', fontSize: 28, width: 80, height: 80 }}>{initials}</div>
            <h3>{user?.name}</h3>
            <p className="text-muted text-sm">{roleLabel[user?.role]}</p>
            <p className="text-muted text-sm" style={{ marginTop: 4 }}>{user?.email}</p>
            {user?.phone && <p className="text-muted text-sm">{user.phone}</p>}
            {user?.bio && <p className="text-sm" style={{ marginTop: 12, color: 'var(--text-secondary)' }}>{user.bio}</p>}
          </div>

          <div className="tabs" style={{ flexDirection: 'column', borderBottom: 'none', borderRight: '2px solid var(--border)' }}>
            {['profile', 'password', 'notifications'].map(tab_key => (
              <button key={tab_key} className={`tab-btn ${tab === tab_key ? 'active' : ''}`} style={{ textAlign: 'left', borderBottom: 'none', borderRight: '2px solid transparent', marginRight: -2 }}
                onClick={() => setTab(tab_key)}>
                {tab_key === 'profile' ? t('profileInfo') : tab_key === 'password' ? t('changePassword') : t('notificationPrefs')}
              </button>
            ))}
          </div>

          {/* Restart Tour */}
          <div className="card card-body" style={{ marginTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🧭</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('newToPopeyez')}</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px' }}>{t('restartTourDesc')}</p>
            <button className="btn btn-outline btn-sm" onClick={() => { localStorage.removeItem(`popeyez_tour_${user?.role}`); window.location.href = '/dashboard'; }}>
              {t('restartTour')}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="card">
          <div className="card-header"><h3>{tab === 'profile' ? t('profileInfo') : tab === 'password' ? t('changePassword') : t('notificationPrefs')}</h3></div>
          <div className="card-body">
            {tab === 'profile' && (
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('fullName')} *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('emailAddress')} *</label>
                    <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('phone')}</label>
                    <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Avatar URL</label>
                    <input className="form-control" placeholder="https://..." value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('bio')}</label>
                  <textarea className="form-control" rows={4} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : t('save')}</button>
              </form>
            )}

            {tab === 'password' && (
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-label">{t('currentPassword')}</label>
                  <input type="password" className="form-control" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('newPassword')}</label>
                  <input type="password" className="form-control" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('confirmPassword')}</label>
                  <input type="password" className="form-control" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={pwLoading}>{pwLoading ? 'Changing...' : t('changePasswordBtn')}</button>
              </form>
            )}

            {tab === 'notifications' && (
              <form onSubmit={handleSave}>
                <p className="text-muted mb-4">Choose how you'd like to receive notifications from PopEyez.</p>
                {[
                  ['email', t('emailNotifs'), 'Receive updates via email'],
                  ['push', t('pushNotifs'), 'Receive browser push notifications'],
                  ['inApp', t('inAppNotifs'), 'See notifications inside the platform']
                ].map(([key, label, desc]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{label}</div>
                      <div className="text-muted text-sm">{desc}</div>
                    </div>
                    <input type="checkbox" checked={notifPrefs[key]} onChange={e => setNotifPrefs(p => ({ ...p, [key]: e.target.checked }))} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  </div>
                ))}
                <button type="submit" className="btn btn-primary mt-4" disabled={loading}>{loading ? 'Saving...' : t('save')}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
