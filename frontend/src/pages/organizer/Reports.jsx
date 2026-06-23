import { useState, useEffect } from 'react';
import { reportsAPI, eventsAPI } from '../../api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { exportReportPDF } from '../../utils/exportPDF';

const Reports = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('full');
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
      } catch { toast('Failed to load', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      setReport(null);
      try {
        const res = await reportsAPI.full(selectedEvent);
        setReport(res.data);
      } catch { /* ignore */ }
    };
    fetch();
  }, [selectedEvent]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await reportsAPI.export(selectedEvent);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-report-${selectedEvent}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast('Report exported!', 'success');
    } catch { toast('Failed to export report', 'error'); }
    finally { setExporting(false); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const budgetData = report?.financial?.items?.map(i => ({ name: i.category, Planned: i.plannedAmount, Actual: i.actualAmount })) || [];
  const rsvpData = report ? [
    { name: 'Attending', value: report.attendance.attending, color: '#38a169' },
    { name: 'Checked In', value: report.attendance.checkedIn, color: '#3182ce' },
    { name: 'Pending/No Response', value: Math.max(0, report.attendance.total - report.attendance.attending - report.attendance.notAttending), color: '#94a3b8' },
    { name: 'Not Attending', value: report.attendance.notAttending || 0, color: '#e53e3e' },
  ].filter(d => d.value > 0) : [];

  const taskData = report?.tasks ? [
    { name: 'Done', value: report.tasks.done || 0, color: '#38a169' },
    { name: 'In Progress', value: report.tasks.inProgress || 0, color: '#3182ce' },
    { name: 'Pending', value: report.tasks.pending || 0, color: '#dd6b20' },
    { name: 'Not Assigned', value: report.tasks.notAssigned || 0, color: '#94a3b8' },
  ].filter(d => d.value > 0) : [];

  const budgetUtil = report?.financial?.totalBudget > 0
    ? Math.min(100, Math.round((report.financial.totalActual / report.financial.totalBudget) * 100)) : 0;
  const rsvpRate = report?.attendance?.total > 0
    ? Math.round((report.attendance.attending / report.attendance.total) * 100) : 0;
  const checkInRate = report?.attendance?.total > 0
    ? Math.round((report.attendance.checkedIn / report.attendance.total) * 100) : 0;
  const taskCompRate = report?.tasks?.total > 0
    ? Math.round((report.tasks.done / report.tasks.total) * 100) : 0;
  const healthScore = Math.round((rsvpRate * 0.3) + (checkInRate * 0.3) + (taskCompRate * 0.2) + ((report?.feedback?.avgRating || 0) / 5 * 100 * 0.2));

  const radarData = report ? [
    { metric: 'RSVP Rate', value: rsvpRate },
    { metric: 'Check-In Rate', value: checkInRate },
    { metric: 'Task Completion', value: taskCompRate },
    { metric: 'Budget Control', value: Math.max(0, 100 - budgetUtil) },
    { metric: 'Guest Rating', value: Math.round((report.feedback?.avgRating || 0) / 5 * 100) },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <div className="page-actions">
          <select className="form-control" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ width: 220 }}>
            {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <button className="btn btn-outline" onClick={handleExport} disabled={exporting}>{exporting ? 'Exporting...' : '📤 Export CSV'}</button>
          {report && <button className="btn btn-primary" onClick={() => exportReportPDF(report, events.find(e => e._id === selectedEvent)?.name)}>📄 Export PDF</button>}
        </div>
      </div>

      <div className="tabs mb-4">
        {['full', 'attendance', 'financial', 'tasks', 'feedback'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'full' ? '📊 Overview' : t === 'attendance' ? '👥 Attendance' : t === 'financial' ? '💰 Financial' : t === 'tasks' ? '✅ Tasks' : '⭐ Feedback'}
          </button>
        ))}
      </div>

      {!report ? (
        <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No data available</h3><p>This event has no report data yet.</p></div>
      ) : (
        <>
          {/* ── OVERVIEW TAB ── */}
          {tab === 'full' && (
            <div className="mb-6">
              {/* Event Health Score */}
              <div className="card card-body mb-4" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #2d9b87 100%)', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Overall Event Health Score</div>
                    <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>{healthScore}<span style={{ fontSize: 24 }}>/100</span></div>
                    <div style={{ fontSize: 13, marginTop: 6, opacity: 0.9 }}>
                      {healthScore >= 80 ? '🌟 Excellent — event is on track' : healthScore >= 60 ? '✅ Good — minor improvements needed' : healthScore >= 40 ? '⚠️ Fair — attention required' : '🚨 Needs immediate attention'}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[['RSVP Rate', rsvpRate], ['Check-In Rate', checkInRate], ['Task Completion', taskCompRate], ['Budget Utilization', budgetUtil]].map(([label, val]) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 14px', minWidth: 120 }}>
                        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>{val}%</div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, marginTop: 6 }}>
                          <div style={{ width: `${val}%`, height: '100%', background: '#fff', borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid-4 mb-4">
                <DashboardCard icon="📅" label="Event Date" value={report.event?.date ? new Date(report.event.date).toLocaleDateString('en-EG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} color="#1a6b5c" />
                <DashboardCard icon="👥" label="Total Guests" value={report.attendance.total} color="#3182ce" sub={`${report.attendance.attending} confirmed`} />
                <DashboardCard icon="💰" label="Budget Used" value={`${budgetUtil}%`} color={budgetUtil > 100 ? '#e53e3e' : '#38a169'} sub={`${report.financial.totalActual?.toLocaleString()} EGP actual`} />
                <DashboardCard icon="⭐" label="Guest Rating" value={`${report.feedback.avgRating || 0}/5`} color="#dd6b20" sub={`${report.feedback.total} responses`} />
              </div>

              {/* Radar Chart */}
              {radarData.length > 0 && (
                <div className="card card-body">
                  <h3 className="mb-4">Event Performance Radar</h3>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                        <Radar name="Score" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} />
                        <Tooltip formatter={v => `${v}%`} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ATTENDANCE TAB ── */}
          {(tab === 'attendance') && (
            <div className="mb-6">
              <h2 className="section-title">Attendance Report</h2>
              <div className="grid-4 mb-4">
                <DashboardCard icon="👥" label="Total Invited" value={report.attendance.total} color="#3182ce" />
                <DashboardCard icon="✅" label="Attending" value={report.attendance.attending} color="#38a169" sub={`${rsvpRate}% RSVP rate`} />
                <DashboardCard icon="🎟️" label="Checked In" value={report.attendance.checkedIn} color="#7c3aed" sub={`${checkInRate}% check-in rate`} />
                <DashboardCard icon="❌" label="Not Attending" value={report.attendance.notAttending || 0} color="#e53e3e" />
              </div>
              <div className="grid-2">
                <div className="card card-body">
                  <h3 className="mb-4">RSVP Breakdown</h3>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={rsvpData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                          {rsvpData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card card-body">
                  <h3 className="mb-4">Attendance Rates</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
                    {[
                      { label: 'RSVP Rate', value: rsvpRate, color: '#38a169' },
                      { label: 'Check-In Rate', value: checkInRate, color: '#3182ce' },
                      { label: 'Check-In vs RSVP', value: report.attendance.attending > 0 ? Math.round((report.attendance.checkedIn / report.attendance.attending) * 100) : 0, color: '#7c3aed' },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                          <span>{item.label}</span><span style={{ fontWeight: 700, color: item.color }}>{item.value}%</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4 }}>
                          <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: 4, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FINANCIAL TAB ── */}
          {(tab === 'financial') && (
            <div className="mb-6">
              <h2 className="section-title">Financial Report</h2>
              <div className="grid-4 mb-4">
                <DashboardCard icon="💰" label="Total Budget" value={`${report.financial.totalBudget?.toLocaleString()} EGP`} color="#1a6b5c" />
                <DashboardCard icon="📋" label="Total Planned" value={`${report.financial.totalPlanned?.toLocaleString()} EGP`} color="#3182ce" />
                <DashboardCard icon="💳" label="Total Actual" value={`${report.financial.totalActual?.toLocaleString()} EGP`} color={report.financial.totalActual > report.financial.totalBudget ? '#e53e3e' : '#38a169'} />
                <DashboardCard icon="📊" label="Budget Used" value={`${budgetUtil}%`} color={budgetUtil > 100 ? '#e53e3e' : budgetUtil > 80 ? '#dd6b20' : '#38a169'} sub={budgetUtil > 100 ? 'Over budget!' : budgetUtil > 80 ? 'Near limit' : 'On track'} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span>Budget Utilization</span>
                  <span style={{ fontWeight: 700, color: budgetUtil > 100 ? 'var(--danger)' : budgetUtil > 80 ? 'var(--warning)' : 'var(--success)' }}>{budgetUtil}%</span>
                </div>
                <div style={{ height: 10, background: 'var(--bg)', borderRadius: 5 }}>
                  <div style={{ width: `${Math.min(100, budgetUtil)}%`, height: '100%', background: budgetUtil > 100 ? 'var(--danger)' : budgetUtil > 80 ? 'var(--warning)' : 'var(--success)', borderRadius: 5, transition: 'width 0.5s' }} />
                </div>
              </div>
              {budgetData.length > 0 && (
                <div className="card card-body">
                  <h3 className="mb-4">Budget vs Actual by Category</h3>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetData} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip formatter={v => `${v?.toLocaleString()} EGP`} />
                        <Legend />
                        <Bar dataKey="Planned" fill="var(--primary)" radius={[0,4,4,0]} />
                        <Bar dataKey="Actual" fill="var(--secondary)" radius={[0,4,4,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TASKS TAB ── */}
          {(tab === 'tasks') && (
            <div className="mb-6">
              <h2 className="section-title">Task Completion Report</h2>
              <div className="grid-4 mb-4">
                <DashboardCard icon="📋" label="Total Tasks" value={report.tasks?.total || 0} color="#1a6b5c" />
                <DashboardCard icon="✅" label="Done" value={report.tasks?.done || 0} color="#38a169" sub={`${taskCompRate}% complete`} />
                <DashboardCard icon="🔄" label="In Progress" value={report.tasks?.inProgress || 0} color="#3182ce" />
                <DashboardCard icon="⏳" label="Pending / Unassigned" value={(report.tasks?.pending || 0) + (report.tasks?.notAssigned || 0)} color="#dd6b20" />
              </div>
              <div className="grid-2">
                <div className="card card-body">
                  <h3 className="mb-4">Task Status Breakdown</h3>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={taskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                          {taskData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card card-body">
                  <h3 className="mb-4">Completion Progress</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
                    {taskData.map(item => (
                      <div key={item.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                          <span>{item.name}</span>
                          <span style={{ fontWeight: 700, color: item.color }}>{item.value} tasks</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4 }}>
                          <div style={{ width: `${report.tasks?.total > 0 ? (item.value / report.tasks.total * 100) : 0}%`, height: '100%', background: item.color, borderRadius: 4, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FEEDBACK TAB ── */}
          {(tab === 'feedback') && (
            <div className="mb-6">
              <h2 className="section-title">Feedback Summary</h2>
              <div className="grid-4 mb-4">
                <DashboardCard icon="📝" label="Total Responses" value={report.feedback.total} color="#1a6b5c" />
                <DashboardCard icon="⭐" label="Avg Rating" value={`${report.feedback.avgRating || 0}/5`} color="#dd6b20" />
                <DashboardCard icon="😊" label="Positive (4–5 ⭐)" value={report.feedback.positive} color="#38a169" />
                <DashboardCard icon="😞" label="Negative (1–2 ⭐)" value={report.feedback.negative} color="#e53e3e" />
              </div>
              <div className="card card-body">
                <h3 className="mb-4">Rating Distribution</h3>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[1,2,3,4,5].map(r => ({ rating: `${r} ⭐`, count: report.feedback.ratings?.[r] || 0 }))}>
                      <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
