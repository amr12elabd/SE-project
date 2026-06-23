import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, tasksAPI, guestsAPI, notificationsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import OnboardingTour from '../../components/OnboardingTour';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [evRes, taskRes, notifRes] = await Promise.all([
          eventsAPI.getAll(), tasksAPI.getAll(), notificationsAPI.getAll()
        ]);
        setEvents(evRes.data);
        setTasks(taskRes.data);
        setNotifications(notifRes.data.notifications.slice(0, 5));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).slice(0, 3);
  const taskStats = [
    { name: 'Not Assigned', value: tasks.filter(t => t.status === 'Not Assigned').length, color: '#94a3b8' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'Pending').length, color: '#dd6b20' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#3182ce' },
    { name: 'Done', value: tasks.filter(t => t.status === 'Done').length, color: '#38a169' },
  ];

  const today = new Date().toDateString();
  const todayEvents = events.filter(e => new Date(e.date).toDateString() === today);

  return (
    <div>
      <OnboardingTour role="organizer" />
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-muted text-sm">{new Date().toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/events/new')}>+ Create Event</button>
      </div>

      {/* Today's events alert */}
      {todayEvents.length > 0 && (
        <div className="alert alert-info mb-4">
          ⚡ <strong>Today's Events:</strong> {todayEvents.map(e => e.name).join(', ')} — Go to <button className="btn btn-ghost btn-sm" onClick={() => navigate('/day-of')}>Day-Of Dashboard</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4 mb-6">
        <DashboardCard icon="📅" label="Total Events" value={events.length} color="#1a6b5c" sub={`${upcomingEvents.length} upcoming`} />
        <DashboardCard icon="✅" label="Total Tasks" value={tasks.length} color="#3182ce" sub={`${tasks.filter(t => t.status === 'Done').length} completed`} />
        <DashboardCard icon="⚡" label="In Progress" value={tasks.filter(t => t.status === 'In Progress').length} color="#dd6b20" />
        <DashboardCard icon="🔔" label="Unread Notifications" value={notifications.filter(n => !n.isRead).length} color="#7c3aed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Events</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>View All</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {upcomingEvents.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div style={{ fontSize: 32 }}>📅</div>
                <p>No upcoming events. <a onClick={() => navigate('/events/new')}>Create one</a></p>
              </div>
            ) : upcomingEvents.map(ev => (
              <div key={ev._id} onClick={() => navigate(`/events/${ev._id}`)}
                style={{ display: 'flex', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '10px 14px', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{new Date(ev.date).getDate()}</div>
                  <div style={{ fontSize: 11, color: 'var(--primary)' }}>{new Date(ev.date).toLocaleString('en', { month: 'short' })}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{ev.name}</div>
                  <div className="text-sm text-muted">{ev.venue?.name || 'Venue TBD'} · {ev.expectedGuests} guests</div>
                </div>
                <StatusBadge status={ev.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Task Status Chart */}
        <div className="card">
          <div className="card-header">
            <h3>Task Status Overview</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>Manage Tasks</button>
          </div>
          <div className="card-body">
            {tasks.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}><p>No tasks yet</p></div>
            ) : (
              <>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={taskStats.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                        {taskStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {taskStats.map(s => s.value > 0 && (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                      {s.name}: {s.value}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Notifications</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notifications')}>View All</button>
        </div>
        <div>
          {notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}><p>No notifications</p></div>
          ) : notifications.map(n => (
            <div key={n._id} style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)', background: n.isRead ? 'white' : 'var(--primary-light)' }}>
              <div style={{ fontSize: 18 }}>🔔</div>
              <div>
                <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 14 }}>{n.title}</div>
                <div className="text-sm text-muted">{n.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
