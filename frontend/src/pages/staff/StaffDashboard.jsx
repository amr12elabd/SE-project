import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, tasksAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import OnboardingTour from '../../components/OnboardingTour';
import { useToast } from '../../components/Toast';
import { useLang } from '../../context/LanguageContext';

const EVENT_STATUSES = ['Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

const StaffDashboard = () => {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingEvent, setUpdatingEvent] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [eRes, tRes] = await Promise.all([eventsAPI.getAll(), tasksAPI.getAll()]);
        setEvents(eRes.data);
        setTasks(tRes.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const updateEventStatus = async (id, status) => {
    setUpdatingEvent(id);
    try {
      await eventsAPI.updateStatus(id, status);
      setEvents(prev => prev.map(ev => ev._id === id ? { ...ev, status } : ev));
      toast(`Event status updated to "${status}"`, 'success');
    } catch (err) { toast(err.response?.data?.message || 'Failed to update', 'error'); }
    finally { setUpdatingEvent(null); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div>
      <OnboardingTour role="staff" />
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name?.split(' ')[0]}! 👷</h1>
          <p className="text-muted text-sm">Staff Member Dashboard · {new Date().toLocaleDateString('en-EG', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid-4 mb-6">
        <DashboardCard icon="📅" label={t('myEvents')} value={events.length} color="#2563eb" />
        <DashboardCard icon="✅" label={t('myTasks')} value={pendingTasks.length} color="#dd6b20" />
        <DashboardCard icon="🏆" label={t('completedTasks')} value={doneTasks.length} color="#38a169" />
        <DashboardCard icon="📋" label={t('myTasks')} value={tasks.length} color="#1a6b5c" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header"><h3>{t('myEvents')}</h3><button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-events')}>{t('view')}</button></div>
          {events.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}><p>{t('noData')}</p></div>
          ) : events.slice(0, 4).map(ev => (
            <div key={ev._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{ev.name}</div>
                <div className="text-sm text-muted">📅 {new Date(ev.date).toLocaleDateString()}</div>
              </div>
              <select
                value={ev.status}
                disabled={updatingEvent === ev._id}
                onChange={e => updateEventStatus(ev._id, e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px', height: 28, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer' }}
              >
                {EVENT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h3>{t('myTasks')}</h3><button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-tasks')}>{t('view')}</button></div>
          {pendingTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}><p>{t('noData')}</p></div>
          ) : pendingTasks.slice(0, 5).map(t => (
            <div key={t._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{t.title}</div>
                <div className="text-sm text-muted">{t.event?.name} · {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No deadline'}</div>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="card card-body mt-4">
        <h3 className="mb-4">{t('dashboard')}</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[{ label: `✅ ${t('myTasks')}`, to: '/my-tasks' }, { label: `📅 ${t('myEvents')}`, to: '/my-events' }, { label: `🗺️ ${t('floorPlan')}`, to: '/layout-view' }, { label: `🎟️ ${t('guestCheckIn')}`, to: '/checkin' }, { label: `🚚 ${t('vendorArrivals')}`, to: '/vendor-arrivals' }].map(a => (
            <button key={a.label} className="btn btn-outline" onClick={() => navigate(a.to)}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
