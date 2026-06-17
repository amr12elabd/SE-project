import { useState, useEffect } from 'react';
import { reportsAPI, eventsAPI } from '../../api';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
    { name: 'Total Invited', value: report.attendance.total - report.attendance.attending, color: '#94a3b8' },
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
        {['full', 'attendance', 'financial', 'feedback'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'full' ? '📊 Full Report' : t === 'attendance' ? '👥 Attendance' : t === 'financial' ? '💰 Financial' : '⭐ Feedback'}
          </button>
        ))}
      </div>

      {!report ? (
        <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No data available</h3><p>This event has no report data yet.</p></div>
      ) : (
        <>
          {(tab === 'full' || tab === 'attendance') && (
            <div className="mb-6">
              <h2 className="section-title">Attendance Report</h2>
              <div className="grid-4 mb-4">
                <DashboardCard icon="📅" label="Event Date" value={report.event?.date ? new Date(report.event.date).toLocaleDateString() : '—'} color="#1a6b5c" />
                <DashboardCard icon="👥" label="Total Invited" value={report.attendance.total} color="#3182ce" />
                <DashboardCard icon="✅" label="Attending" value={report.attendance.attending} color="#38a169" />
                <DashboardCard icon="🎟️" label="Checked In" value={report.attendance.checkedIn} color="#7c3aed" sub={`${report.attendance.total > 0 ? ((report.attendance.checkedIn / report.attendance.total) * 100).toFixed(0) : 0}% rate`} />
              </div>
              <div className="card card-body">
                <h3 className="mb-4">Attendance vs RSVPs</h3>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={rsvpData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                        {rsvpData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {(tab === 'full' || tab === 'financial') && (
            <div className="mb-6">
              <h2 className="section-title">Financial Report</h2>
              <div className="grid-3 mb-4">
                <DashboardCard icon="💰" label="Total Budget" value={`${report.financial.totalBudget?.toLocaleString()} EGP`} color="#1a6b5c" />
                <DashboardCard icon="📋" label="Total Planned" value={`${report.financial.totalPlanned?.toLocaleString()} EGP`} color="#3182ce" />
                <DashboardCard icon="💳" label="Total Actual" value={`${report.financial.totalActual?.toLocaleString()} EGP`} color={report.financial.totalActual > report.financial.totalBudget ? '#e53e3e' : '#38a169'} sub={`${report.financial.totalActual > report.financial.totalBudget ? 'Over' : 'Under'} budget`} />
              </div>
              {budgetData.length > 0 && (
                <div className="card card-body">
                  <h3 className="mb-4">Budget vs Actual by Category</h3>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetData}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={v => `${v?.toLocaleString()} EGP`} />
                        <Legend />
                        <Bar dataKey="Planned" fill="var(--primary)" radius={[4,4,0,0]} />
                        <Bar dataKey="Actual" fill="var(--secondary)" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {(tab === 'full' || tab === 'feedback') && (
            <div className="mb-6">
              <h2 className="section-title">Feedback Summary</h2>
              <div className="grid-4">
                <DashboardCard icon="📝" label="Total Responses" value={report.feedback.total} color="#1a6b5c" />
                <DashboardCard icon="⭐" label="Avg Rating" value={`${report.feedback.avgRating}/5`} color="#dd6b20" />
                <DashboardCard icon="😊" label="Positive" value={report.feedback.positive} color="#38a169" />
                <DashboardCard icon="😞" label="Negative" value={report.feedback.negative} color="#e53e3e" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
