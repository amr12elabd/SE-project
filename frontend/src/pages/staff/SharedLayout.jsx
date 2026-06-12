import { useState, useEffect } from 'react';
import { layoutAPI, eventsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const COLORS = { table: '#4CAF50', booth: '#9C27B0', bar: '#795548', stage: '#FF5722', entrance: '#2196F3', exit: '#F44336', equipment: '#607D8B', decoration: '#8BC34A' };

const SharedLayout = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
        if (res.data.length > 0) setSelectedEvent(res.data[0]._id);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    const fetch = async () => {
      try {
        const res = await layoutAPI.get(selectedEvent);
        setLayout(res.data);
      } catch { toast('Failed to load layout', 'error'); }
    };
    fetch();
  }, [selectedEvent]);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1>🗺️ Venue Floor Plan</h1>
        <select className="form-control" style={{ width: 220 }} value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
      </div>

      {!layout?.elements?.length ? (
        <div className="empty-state"><div className="empty-state-icon">🗺️</div><h3>No layout available</h3><p>The organizer hasn't shared a floor plan yet.</p></div>
      ) : (
        <>
          {!layout.sharedWithStaff && (
            <div className="alert alert-warning mb-4">⚠️ This layout has not been officially shared with staff yet. Viewing in preview mode.</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
            <div>
              <div className="card card-body mb-3">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
                  {Object.entries(COLORS).map(([type, color]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
                      <span style={{ textTransform: 'capitalize' }}>{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="layout-canvas" style={{ width: '100%', height: 600, position: 'relative', background: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #e2e8f0 39px, #e2e8f0 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #e2e8f0 39px, #e2e8f0 40px)', cursor: 'default' }}>
                {layout.elements.map(el => (
                  <div key={el.id} className="layout-element"
                    style={{ left: el.x, top: el.y, width: el.width, height: el.height, background: el.color || COLORS[el.type] || '#4CAF50', transform: `rotate(${el.rotation || 0}deg)`, cursor: 'default', fontSize: Math.min(el.width, el.height) > 60 ? 12 : 10 }}>
                    <div style={{ textAlign: 'center', padding: 4 }}>
                      <div>{el.label}</div>
                      {el.seats > 0 && <div style={{ fontSize: 10 }}>{el.seats} seats</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="card card-body mb-3">
                <h3 className="mb-3">Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Total Elements</span><span style={{ fontWeight: 600 }}>{layout.elements.length}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Tables</span><span style={{ fontWeight: 600 }}>{layout.elements.filter(e => e.type === 'table').length}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Booths</span><span style={{ fontWeight: 600 }}>{layout.elements.filter(e => e.type === 'booth').length}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Total Seats</span><span style={{ fontWeight: 600 }}>{layout.elements.reduce((s, e) => s + (e.seats || 0), 0)}</span></div>
                </div>
              </div>

              {layout.setupInstructions && (
                <div className="card card-body">
                  <h3 className="mb-3">Setup Instructions</h3>
                  <div style={{ fontSize: 13, whiteSpace: 'pre-line', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{layout.setupInstructions}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SharedLayout;
