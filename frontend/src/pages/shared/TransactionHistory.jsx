import { useState, useEffect } from 'react';
import { activityAPI } from '../../api';
import { useLang } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';

const ENTITY_ICONS = { Booking: '🏛️', Invoice: '🧾', SourcingRequest: '📦', Task: '✅', Guest: '🎟️', Event: '📅' };
const STATUS_COLORS = {
  Approved: '#38a169', Delivered: '#38a169', Done: '#38a169', Attending: '#38a169', 'Checked In': '#38a169',
  Declined: '#e53e3e', Rejected: '#e53e3e', 'Not Attending': '#e53e3e',
  Pending: '#dd6b20', 'Pending Review': '#dd6b20', 'In Progress': '#3182ce',
  'Out for Delivery': '#7c3aed', 'Counter-Proposed': '#7c3aed', Maybe: '#94a3b8',
};

const StatusPill = ({ status }) => (
  <span style={{ background: (STATUS_COLORS[status] || '#94a3b8') + '22', color: STATUS_COLORS[status] || '#94a3b8', border: `1px solid ${STATUS_COLORS[status] || '#94a3b8'}44`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
    {status}
  </span>
);

const TransactionHistory = () => {
  const { t } = useLang();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const toast = useToast();
  const LIMIT = 20;

  const fetchLogs = async (p = 1, entityType = filter) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page: p };
      if (entityType) params.entityType = entityType;
      const res = await activityAPI.getMyActivity(params);
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch { toast('Failed to load history', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(1, filter); setPage(1); }, [filter]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🕑 {t('transactionHistory')}</h1>
          <p className="text-muted text-sm">{total} total transactions recorded</p>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar mb-4">
        <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 200 }}>
          <option value="">{t('allTypes')}</option>
          {['Booking', 'Invoice', 'SourcingRequest', 'Task', 'Guest', 'Event'].map(t => (
            <option key={t} value={t}>{ENTITY_ICONS[t]} {t}</option>
          ))}
        </select>
        <span className="text-muted text-sm">{total} records</span>
      </div>

      {loading ? <LoadingSpinner fullPage /> : logs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🕑</div>
            <h3>{t('noData')}</h3>
            <p>Your actions on bookings, invoices, tasks, sourcing requests, and guests will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('dateTime')}</th>
                  <th>{t('type')}</th>
                  <th>{t('action')}</th>
                  <th>{t('description')}</th>
                  <th>{t('statusChange')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(entry => (
                  <tr key={entry._id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-muted)' }}>
                      <div>{new Date(entry.createdAt).toLocaleDateString()}</div>
                      <div>{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 18 }}>{ENTITY_ICONS[entry.entityType]}</span>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entry.entityType}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{entry.action}</div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300 }}>
                      {entry.description}
                    </td>
                    <td>
                      {entry.oldStatus || entry.newStatus ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {entry.oldStatus && <StatusPill status={entry.oldStatus} />}
                          {entry.oldStatus && entry.newStatus && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>}
                          {entry.newStatus && <StatusPill status={entry.newStatus} />}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => { setPage(p => p - 1); fetchLogs(page - 1); }}>← Prev</button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>Page {page} of {totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => { setPage(p => p + 1); fetchLogs(page + 1); }}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
