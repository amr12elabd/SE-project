import { useState, useEffect } from 'react';
import { tasksAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const getDeadlineWarning = (dueDate, status) => {
  if (!dueDate || status === 'Done') return null;
  const daysLeft = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0)  return { label: 'OVERDUE',              color: '#7f1d1d', bg: '#fee2e2', border: '#fca5a5' };
  if (daysLeft === 1) return { label: '⚠ Due tomorrow!',      color: '#7c2d12', bg: '#ffedd5', border: '#fb923c' };
  if (daysLeft <= 3)  return { label: `⚠ Due in ${daysLeft} days`, color: '#92400e', bg: '#fef3c7', border: '#fcd34d' };
  if (daysLeft <= 7)  return { label: `Due in ${daysLeft} days`,    color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' };
  return null;
};

const STATUSES = ['Pending', 'In Progress', 'Done'];

const AssignedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await tasksAPI.getAll();
        setTasks(res.data);
      } catch { toast('Failed to load tasks', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await tasksAPI.updateStatus(id, { status });
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status } : t));
      toast(`Status updated to "${status}"`, 'success');
    } catch { toast('Failed to update status', 'error'); }
    finally { setUpdating(null); }
  };

  const filtered = tasks.filter(t => !filter || t.status === filter);
  const priorityColor = { Low: 'var(--success)', Medium: 'var(--warning)', High: 'var(--danger)' };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>My Tasks</h1></div>
      <div className="filter-bar">
        <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['Pending', 'In Progress', 'Done'].map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-muted text-sm">{filtered.length} tasks</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No tasks found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(t => {
            const warning = getDeadlineWarning(t.dueDate, t.status);
            return (
            <div key={t._id} className="card card-body" style={warning ? { borderLeft: `4px solid ${warning.border}` } : {}}>
              {warning && (
                <div style={{ marginBottom: 10, padding: '6px 12px', borderRadius: 6, background: warning.bg, color: warning.color, fontWeight: 600, fontSize: 13 }}>
                  {warning.label}
                </div>
              )}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <h3>{t.title}</h3>
                    <span style={{ fontSize: 12, fontWeight: 600, color: priorityColor[t.priority] }}>{t.priority}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  {t.description && <p className="text-sm text-muted mb-2">{t.description}</p>}
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>📅 Event: {t.event?.name}</span>
                    {t.speciality && <span>🎯 {t.speciality}</span>}
                    {t.dueDate && <span>⏰ Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Status</label>
                  <select
                    className="form-control"
                    value={t.status}
                    disabled={updating === t._id}
                    onChange={e => updateStatus(t._id, e.target.value)}
                    style={{ minWidth: 140, fontWeight: 500 }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignedTasks;
