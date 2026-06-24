import { useState, useEffect } from 'react';
import { feedbackAPI, eventsAPI } from '../../api';
import { useLang } from '../../context/LanguageContext';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const FeedbackReview = () => {
  const { t } = useLang();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [data, setData] = useState({ feedbacks: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
      } catch { toast('Failed to load events', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      try {
        const res = await feedbackAPI.getForEvent(selectedEvent);
        setData(res.data);
      } catch { /* ignore */ }
    };
    fetch();
  }, [selectedEvent]);

  const stars = (rating) => '★'.repeat(Math.round(rating || 0)) + '☆'.repeat(5 - Math.round(rating || 0));
  const { stats, feedbacks } = data;

  const radarData = [
    { subject: 'Overall', A: (stats.avgOverall || 0).toFixed(1) },
    { subject: 'Food', A: (stats.avgFood || 0).toFixed(1) },
    { subject: 'Venue', A: (stats.avgVenue || 0).toFixed(1) },
    { subject: 'Organization', A: (stats.avgOrg || 0).toFixed(1) },
  ];

  const sentimentData = [
    { name: 'Positive', value: stats.sentimentCount?.Positive || 0, color: '#38a169' },
    { name: 'Neutral', value: stats.sentimentCount?.Neutral || 0, color: '#dd6b20' },
    { name: 'Negative', value: stats.sentimentCount?.Negative || 0, color: '#e53e3e' },
  ];

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>{t('feedback')}</h1>
        <select className="form-control" style={{ width: 220 }} value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
      </div>

      <div className="grid-4 mb-6">
        <DashboardCard icon="📝" label={t('totalResponses')} value={stats.total || 0} color="#1a6b5c" />
        <DashboardCard icon="⭐" label={t('avgRating')} value={(stats.avgOverall || 0).toFixed(1) + '/5'} color="#dd6b20" />
        <DashboardCard icon="😊" label={t('positive')} value={stats.sentimentCount?.Positive || 0} color="#38a169" />
        <DashboardCard icon="😞" label={t('negative')} value={stats.sentimentCount?.Negative || 0} color="#e53e3e" />
      </div>

      {feedbacks.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">⭐</div><h3>{t('noFeedback')}</h3></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div className="card card-body">
              <h3 className="mb-4">Rating Breakdown</h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card card-body">
              <h3 className="mb-4">Sentiment Distribution</h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                      {sentimentData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Individual Feedback</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {feedbacks.map(f => (
                <div key={f._id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div className="avatar avatar-sm">{f.guest?.guestName?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{f.guest?.guestName}</div>
                        <div style={{ color: 'var(--accent)', fontSize: 14 }}>{stars(f.overallRating)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <StatusBadge status={f.sentiment} />
                      <span className="text-xs text-muted">{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {f.foodRating && <span>🍕 Food: {stars(f.foodRating)}</span>}
                    {f.venueRating && <span>🏛️ Venue: {stars(f.venueRating)}</span>}
                    {f.organizationRating && <span>📋 Org: {stars(f.organizationRating)}</span>}
                  </div>
                  {f.comments && <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{f.comments}"</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackReview;
