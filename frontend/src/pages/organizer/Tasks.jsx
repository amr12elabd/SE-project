import { useState, useEffect } from 'react';
import { tasksAPI, eventsAPI, usersAPI } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', event: '', priority: '' });
  const [modal, setModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ event: '', title: '', description: '', assignedTo: '', speciality: '', dueDate: '', priority: 'Medium', status: 'Not Assigned' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchTasks = async () => {
    try {
      const res = await tasksAPI.getAll(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
      setTasks(res.data);
    } catch { toast('Failed to load tasks', 'error'); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [eRes, sRes] = await Promise.all([eventsAPI.getAll(), usersAPI.getAll({ role: 'staff' })]);
        setEvents(eRes.data);
        setStaff(sRes.data);
      } catch { /* ignore */ }
      await fetchTasks();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { fetchTasks(); }, [filters]);

  const openModal = (task = null) => {
    if (task) {
      setEditTask(task);
      setForm({ event: task.event?._id || task.event || '', title: task.title, description: task.description || '', assignedTo: task.assignedTo?._id || task.assignedTo || '', speciality: task.speciality || '', dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', priority: task.priority || 'Medium', status: task.status });
    } else {
      setEditTask(null);
      setForm({ event: events[0]?._id || '', title: '', description: '', assignedTo: '', speciality: '', dueDate: '', priority: 'Medium', status: 'Not Assigned' });
    }
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.event || !form.title) { toast('Event and title are required', 'error'); return; }
    setSaving(true);
    try {
      if (editTask) {
        const res = await tasksAPI.update(editTask._id, form);
        setTasks(prev => prev.map(t => t._id === editTask._id ? res.data : t));
        toast('Task updated!', 'success');
      } else {
        const res = await tasksAPI.create(form);
        setTasks(prev => [...prev, res.data]);
        toast('Task created!', 'success');
      }
      setModal(false);
    } catch (err) { toast(err.response?.data?.message || 'Failed to save task', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await tasksAPI.delete(confirmDelete._id);
      setTasks(prev => prev.filter(t => t._id !== confirmDelete._id));
      toast('Task deleted', 'success');
      setConfirmDelete(null);
    } catch { toast('Failed to delete', 'error'); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const priorityColor = { Low: 'var(--success)', Medium: 'var(--warning)', High: 'var(--danger)' };
  const filteredTasks = tasks.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()) || t.speciality?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <ConfirmModal isOpen={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete}
        title="Delete Task" message={`Delete "${confirmDelete?.title}"? This cannot be undone.`} confirmLabel="Delete Task" />
      <div className="page-header">
        <h1>Tasks & Workflow</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ New Task</button>
      </div>

      <div className="filter-bar">
        <input type="search" className="form-control" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 2 }} />
        <select className="form-control" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {['Not Assigned', 'Pending', 'In Progress', 'Done'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-control" value={filters.event} onChange={e => setFilters(f => ({ ...f, event: e.target.value }))}>
          <option value="">All Events</option>
          {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <select className="form-control" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
        </select>
        <span className="text-muted text-sm">{tasks.length} tasks</span>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">✅</div><h3>{search ? 'No tasks match your search' : 'No tasks found'}</h3><p>{search ? 'Try a different search term.' : 'Create your first task and assign it to a staff member.'}</p>{!search && <button className="btn btn-primary mt-4" onClick={() => openModal()}>+ Create First Task</button>}</div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th><th>Event</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>
                      {t.speciality && <div className="text-xs text-muted">{t.speciality}</div>}
                      {t.description && <div className="text-xs text-muted truncate" style={{ maxWidth: 200 }}>{t.description}</div>}
                    </td>
                    <td className="text-sm text-muted">{t.event?.name || '—'}</td>
                    <td>
                      {t.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar avatar-sm">{t.assignedTo.name?.[0]}</div>
                          <span className="text-sm">{t.assignedTo.name}</span>
                        </div>
                      ) : <span className="text-muted text-sm">Unassigned</span>}
                    </td>
                    <td><span style={{ fontSize: 12, fontWeight: 600, color: priorityColor[t.priority] }}>{t.priority}</span></td>
                    <td className="text-sm text-muted">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openModal(t)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(t)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editTask ? 'Edit Task' : 'Create Task'}
        footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editTask ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Event *</label>
            <select className="form-control" value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))}>
              <option value="">Select event...</option>
              {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-control" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                <option value="">Unassigned</option>
                {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Speciality</label>
              <input className="form-control" placeholder="e.g. Barista, Setup..." value={form.speciality} onChange={e => setForm(f => ({ ...f, speciality: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-control" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-control" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {editTask && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['Not Assigned', 'Pending', 'In Progress', 'Done'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
