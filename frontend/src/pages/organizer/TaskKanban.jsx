import { useState } from 'react';
import { tasksAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

const COLUMNS = [
  { id: 'Not Assigned', label: 'Not Assigned', color: '#94a3b8', bg: '#f8fafc' },
  { id: 'Pending', label: 'Pending', color: '#dd6b20', bg: '#fffaf0' },
  { id: 'In Progress', label: 'In Progress', color: '#3182ce', bg: '#ebf8ff' },
  { id: 'Done', label: 'Done', color: '#38a169', bg: '#f0fff4' },
];

const PRIORITY_COLORS = { High: '#e53e3e', Medium: '#dd6b20', Low: '#38a169' };

const TaskKanban = ({ tasks, setTasks, onEdit }) => {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const toast = useToast();

  const handleDragStart = (e, task) => {
    setDragging(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, colId) => {
    e.preventDefault();
    if (!dragging || dragging.status === colId) { setDragging(null); setDragOver(null); return; }
    const prev = dragging.status;
    setTasks(ts => ts.map(t => t._id === dragging._id ? { ...t, status: colId } : t));
    try {
      await tasksAPI.updateStatus(dragging._id, { status: colId });
      toast(`"${dragging.title}" moved to ${colId}`, 'success');
    } catch {
      setTasks(ts => ts.map(t => t._id === dragging._id ? { ...t, status: prev } : t));
      toast('Failed to update task status', 'error');
    }
    setDragging(null);
    setDragOver(null);
  };

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
      {COLUMNS.map(col => (
        <div key={col.id}
          onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={e => handleDrop(e, col.id)}
          style={{ background: dragOver === col.id ? col.bg : '#f8fafc', border: `2px dashed ${dragOver === col.id ? col.color : 'var(--border)'}`, borderRadius: 12, padding: 12, minHeight: 200, transition: 'all 0.15s' }}>

          {/* Column header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${col.color}` }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: col.color }}>{col.label}</span>
            <span style={{ background: col.color, color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{grouped[col.id]?.length || 0}</span>
          </div>

          {/* Cards */}
          {grouped[col.id]?.map(task => (
            <div key={task._id}
              draggable
              onDragStart={e => handleDragStart(e, task)}
              onClick={() => onEdit(task)}
              style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'grab', border: '1px solid var(--border)', opacity: dragging?._id === task._id ? 0.4 : 1, transition: 'opacity 0.15s' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, lineHeight: 1.3 }}>{task.title}</div>
              {task.speciality && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>🏷️ {task.speciality}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                {task.assignedTo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div className="avatar avatar-sm" style={{ width: 20, height: 20, fontSize: 10 }}>{task.assignedTo.name?.[0]}</div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.assignedTo.name?.split(' ')[0]}</span>
                  </div>
                ) : <span style={{ fontSize: 11, color: '#94a3b8' }}>Unassigned</span>}
                {task.priority && <span style={{ fontSize: 10, fontWeight: 700, color: PRIORITY_COLORS[task.priority] }}>● {task.priority}</span>}
              </div>
              {task.dueDate && (
                <div style={{ fontSize: 11, color: new Date(task.dueDate) < new Date() ? 'var(--danger)' : 'var(--text-muted)', marginTop: 6 }}>
                  📅 {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}

          {grouped[col.id]?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#cbd5e1', fontSize: 12 }}>Drop tasks here</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskKanban;
