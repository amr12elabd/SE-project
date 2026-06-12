import { useState, useEffect } from 'react';
import { tasksAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const AssignedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
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
    try {
      await tasksAPI.updateStatus(id, { status });
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status } : t));
      toast(`Task marked as ${status}`, 'success');
    } catch { toast('Failed to update status', 'error'); }
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
          {filtered.map(t => (
            <div key={t._id} className="card card-body">
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
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {t.status === 'Pending' && <button className="btn btn-outline btn-sm" onClick={() => updateStatus(t._id, 'In Progress')}>▶ Start</button>}
                  {t.status === 'In Progress' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(t._id, 'Done')}>✓ Complete</button>}
                  {t.status === 'Done' && <span className="badge badge-success">Completed ✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedTasks;
