import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import DashboardCard from '../../components/DashboardCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [eRes, dRes] = await Promise.all([eventsAPI.getById(id), eventsAPI.getDashboard(id)]);
        setEvent(eRes.data);
        setDashboard(dRes.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!event) return <div className="empty-state"><p>Event not found</p></div>;

  const ts = dashboard?.taskStats || {};
  const gs = dashboard?.guestStats || {};
  const bud = dashboard?.budget || {};

  const taskChartData = [
    { name: 'Pending', value: ts.pending || 0 },
    { name: 'In Progress', value: ts.inProgress || 0 },
    { name: 'Done', value: ts.done || 0 },
  ];
  const guestChartData = [
    { name: 'Attending', value: gs.attending || 0 },
    { name: 'Maybe', value: gs.maybe || 0 },
    { name: 'Not Attending', value: gs.notAttending || 0 },
    { name: 'Pending', value: gs.pending || 0 },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1>{event.name}</h1>
            <StatusBadge status={event.status} />
          </div>
          <p className="text-muted text-sm">
            📅 {new Date(event.date).toLocaleDateString('en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;·&nbsp;
            🕐 {event.startTime} – {event.endTime}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(`/events/${id}/edit`)}>✏️ Edit Event</button>
      </div>

      {/* Info Grid */}
      <div className="grid-4 mb-6">
        <DashboardCard icon="📋" label="Total Tasks" value={ts.total || 0} color="#3182ce" sub={`${ts.done || 0} done`} />
        <DashboardCard icon="🎟️" label="Invited Guests" value={gs.total || 0} color="#1a6b5c" sub={`${gs.attending || 0} attending`} />
        <DashboardCard icon="✅" label="Checked In" value={gs.checkedIn || 0} color="#38a169" />
        <DashboardCard icon="💰" label="Budget Used" value={`${bud.totalActual || 0} EGP`} color="#dd6b20" sub={`of ${bud.totalBudget || 0} EGP`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Event Info */}
        <div className="card">
          <div className="card-header"><h3>Event Information</h3></div>
          <div className="card-body">
            {event.description && <p className="text-sm mb-4">{event.description}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['🏛️ Venue', event.venue?.name || 'TBD'],
                ['👔 Dress Code', event.dressCode],
                ['👥 Expected Guests', event.expectedGuests],
                ['📅 Type', event.eventType],
                ['💰 Total Budget', `${event.totalBudget?.toLocaleString()} EGP`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="text-muted">{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            {event.agenda && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--primary-light)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginBottom: 6 }}>AGENDA</div>
                <div style={{ fontSize: 12, color: 'var(--primary-dark)', whiteSpace: 'pre-line' }}>{event.agenda}</div>
              </div>
            )}
          </div>
        </div>

        {/* Task Chart */}
        <div className="card">
          <div className="card-header"><h3>Tasks</h3><button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>View All</button></div>
          <div className="card-body">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={taskChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Guest Chart */}
        <div className="card">
          <div className="card-header"><h3>Guest RSVPs</h3><button className="btn btn-ghost btn-sm" onClick={() => navigate('/guests')}>View All</button></div>
          <div className="card-body">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={guestChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--secondary)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Staff */}
      {event.staffMembers?.length > 0 && (
        <div className="card mb-4">
          <div className="card-header"><h3>Assigned Staff</h3></div>
          <div className="card-body" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {event.staffMembers.map(s => (
              <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div className="avatar avatar-sm">{s.name?.[0]}</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
                  <div className="text-xs text-muted">{s.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card card-body">
        <h3 className="mb-4">Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: '✅ Manage Tasks', to: '/tasks' },
            { label: '💰 Budget', to: '/budget' },
            { label: '🗺️ Layout Designer', to: '/layout' },
            { label: '🎟️ Manage Guests', to: '/guests' },
            { label: '✉️ Invitations', to: '/invitations' },
            { label: '💬 Communications', to: '/communications' },
            { label: '⭐ Feedback', to: '/feedback' },
            { label: '📊 Reports', to: '/reports' },
          ].map(a => (
            <button key={a.label} className="btn btn-outline btn-sm" onClick={() => navigate(a.to)}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
