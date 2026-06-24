import { useState, useEffect } from 'react';
import { notificationsAPI } from '../../api';
import { useLang } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const Notifications = () => {
  const { t } = useLang();
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  const fetchNotifs = async () => {
    try {
      const res = await notificationsAPI.getAll(filter === 'unread' ? { isRead: false } : {});
      setData(res.data);
    } catch { toast('Failed to load notifications', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, [filter]);

  const markRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setData(d => ({
        ...d,
        notifications: d.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, d.unreadCount - 1)
      }));
    } catch { toast('Failed to mark as read', 'error'); }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setData(d => ({ ...d, notifications: d.notifications.map(n => ({ ...n, isRead: true })), unreadCount: 0 }));
      toast('All marked as read', 'success');
    } catch { toast('Failed to mark all as read', 'error'); }
  };

  const typeIcons = { task: '✅', booking: '📋', invoice: '🧾', rsvp: '🎟️', communication: '💬', event: '📅', general: '🔔' };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('notifications')}</h1>
          {data.unreadCount > 0 && <p className="text-muted text-sm">{data.unreadCount} {t('unread')}</p>}
        </div>
        <div className="page-actions">
          {data.unreadCount > 0 && <button className="btn btn-outline btn-sm" onClick={markAllRead}>{t('markAllRead')}</button>}
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'unread'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? t('all') : t('unread')}
          </button>
        ))}
      </div>

      <div className="card">
        {data.notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <h3>{t('noNotifications')}</h3>
            <p>{t('noNotifDesc')}</p>
          </div>
        ) : (
          <div>
            {data.notifications.map(n => (
              <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
                style={{ display: 'flex', gap: 14, padding: '16px 20px', borderBottom: '1px solid var(--border)', background: n.isRead ? 'white' : 'var(--primary-light)', cursor: n.isRead ? 'default' : 'pointer', transition: 'background 0.2s' }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{typeIcons[n.type] || '🔔'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.isRead ? 400 : 600, marginBottom: 4 }}>{n.title}</div>
                  <div className="text-sm text-muted">{n.message}</div>
                  <div className="text-xs text-muted mt-2">{new Date(n.createdAt).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
