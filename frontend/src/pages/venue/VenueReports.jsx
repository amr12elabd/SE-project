import { useState, useEffect } from 'react';
import { reportsAPI, venuesAPI } from '../../api';
import { useLang } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1a6b5c', '#d4875a', '#2563eb', '#38a169', '#805ad5'];

const VenueReports = () => {
  const { t } = useLang();
  const toast = useToast();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await venuesAPI.getOwnerVenues();
        setVenues(res.data);
        if (res.data.length > 0) setSelectedVenue(res.data[0]._id);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedVenue) return;
    const fetch = async () => {
      try {
        const res = await reportsAPI.getVenueReport(selectedVenue);
        setReport(res.data);
      } catch { toast('Failed to load report', 'error'); }
    };
    fetch();
  }, [selectedVenue]);

  if (loading) return <LoadingSpinner fullPage />;

  const bookingStatusData = report ? [
    { name: 'Approved', value: report.bookings?.approved || 0 },
    { name: 'Pending', value: report.bookings?.pending || 0 },
    { name: 'Declined', value: report.bookings?.declined || 0 },
    { name: 'Counter-Proposed', value: report.bookings?.counterProposed || 0 },
  ].filter(d => d.value > 0) : [];

  const venueName = venues.find(v => v._id === selectedVenue)?.name || 'venue';

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      ['Venue Report — ' + venueName],
      ['Generated', new Date().toLocaleString()],
      [],
      ['BOOKING SUMMARY'],
      ['Total Requests', report.bookings?.total || 0],
      ['Approved', report.bookings?.approved || 0],
      ['Pending', report.bookings?.pending || 0],
      ['Declined', report.bookings?.declined || 0],
      ['Counter-Proposed', report.bookings?.counterProposed || 0],
      [],
      ['FEEDBACK SUMMARY'],
      ['Total Reviews', report.feedback?.count || 0],
      ['Average Rating', report.feedback?.avgRating?.toFixed(1) || 'N/A'],
      ['Overall Avg', report.feedback?.avgOverall?.toFixed(1) || 'N/A'],
      ['Food Avg', report.feedback?.avgFood?.toFixed(1) || 'N/A'],
      ['Venue Avg', report.feedback?.avgVenue?.toFixed(1) || 'N/A'],
      ['Organization Avg', report.feedback?.avgOrg?.toFixed(1) || 'N/A'],
      [],
      ['VENUE DETAILS'],
      ['Rating', report.venue?.rating?.toFixed(1) || 'N/A'],
      ['Review Count', report.venue?.reviewCount || 0],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${venueName.replace(/\s+/g, '-').toLowerCase()}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <h1>📊 {t('reports')}</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className="form-control" style={{ width: 220 }} value={selectedVenue} onChange={e => setSelectedVenue(e.target.value)}>
            {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
          {report && <button className="btn btn-outline" onClick={handleExportCSV}>{t('exportCSVReport')}</button>}
        </div>
      </div>

      {venues.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No venues to report on</h3></div>
      ) : !report ? (
        <div className="empty-state"><LoadingSpinner /></div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-icon" style={{ background: '#e8f5f2', color: 'var(--primary)' }}>📅</div>
              <div className="stat-info"><div className="stat-value">{report.bookings?.total || 0}</div><div className="stat-label">{t('totalBookings')}</div></div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-icon" style={{ background: '#f0fff4', color: 'var(--success)' }}>✅</div>
              <div className="stat-info"><div className="stat-value">{report.bookings?.approved || 0}</div><div className="stat-label">{t('confirmedCount')}</div></div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-icon" style={{ background: '#fff3e0', color: 'var(--secondary)' }}>⭐</div>
              <div className="stat-info"><div className="stat-value">{report.venue?.rating ? report.venue.rating.toFixed(1) : '—'}</div><div className="stat-label">{t('avgRatingVenue')}</div></div>
            </div>
            <div className="stat-card" style={{ flex: 1 }}>
              <div className="stat-icon" style={{ background: '#f5f3ff', color: '#805ad5' }}>💬</div>
              <div className="stat-info"><div className="stat-value">{report.venue?.reviewCount || 0}</div><div className="stat-label">{t('reviewCount')}</div></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div className="card card-body">
              <h3 className="mb-4">{t('bookingStatus')}</h3>
              {bookingStatusData.length === 0 ? (
                <div className="empty-state" style={{ height: 200 }}><p>No booking data yet</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {bookingStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card card-body">
              <h3 className="mb-4">{t('feedbackSummary')}</h3>
              {!report.feedback?.count ? (
                <div className="empty-state" style={{ height: 200 }}><p>No feedback yet for this venue</p></div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: t('overallExperience'), value: report.feedback?.avgOverall },
                      { label: t('venueAmbience'), value: report.feedback?.avgVenue },
                      { label: t('organization'), value: report.feedback?.avgOrganization },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span>{item.label}</span>
                          <strong>{item.value ? item.value.toFixed(1) : '—'} / 5</strong>
                        </div>
                        <div style={{ background: 'var(--border)', borderRadius: 4, height: 8 }}>
                          <div style={{ background: 'var(--primary)', width: `${((item.value || 0) / 5) * 100}%`, height: 8, borderRadius: 4, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                    Based on {report.feedback?.count} review{report.feedback?.count !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </div>
          </div>

          {report.monthlyBookings?.length > 0 && (
            <div className="card card-body">
              <h3 className="mb-4">Monthly Booking Requests</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={report.monthlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Requests" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card card-body mt-4">
            <h3 className="mb-4">Venue Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 14 }}>
              <div><span className="text-muted">{t('capacity')}</span><div style={{ fontWeight: 600 }}>{report.venue?.capacity} persons</div></div>
              <div><span className="text-muted">{t('location')}</span><div style={{ fontWeight: 600 }}>{report.venue?.location?.area}, {report.venue?.location?.city}</div></div>
              <div><span className="text-muted">{t('pricePerDay')}</span><div style={{ fontWeight: 600 }}>EGP {report.venue?.pricing?.perDay?.toLocaleString()}</div></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VenueReports;
