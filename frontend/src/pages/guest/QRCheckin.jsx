import { useState, useEffect } from 'react';
import { guestsAPI, invitationsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import QRCode from 'qrcode.react';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const QRCheckin = () => {
  const { user } = useAuth();
  const { t } = useLang();
  const [guestRecords, setGuestRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await invitationsAPI.getGuestInvitations();
        const records = res.data.map(i => i.guest).filter(Boolean);
        const unique = records.filter((r, i, a) => a.findIndex(x => x._id === r._id) === i);
        setGuestRecords(unique);
        if (unique.length > 0) setSelected(unique[0]);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header"><h1>🎟️ {t('myQRCode')}</h1></div>

      {guestRecords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎟️</div>
          <h3>No QR codes yet</h3>
          <p>Your QR code will appear here once you've been invited to an event.</p>
        </div>
      ) : (
        <>
          {guestRecords.length > 1 && (
            <div className="filter-bar mb-4">
              <label className="form-label" style={{ margin: 0 }}>{t('selectEvent2')}:</label>
              {guestRecords.map(r => (
                <button key={r._id} className={`btn btn-sm ${selected?._id === r._id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelected(r)}>
                  {r.event?.name || 'Event'}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div style={{ maxWidth: 440, margin: '0 auto' }}>
              <div className="card card-body" style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <StatusBadge status={selected.rsvpStatus} />
                  {selected.checkInStatus && <span className="badge badge-success">✓ Checked In</span>}
                </div>

                <div style={{ display: 'inline-flex', padding: 20, background: 'white', borderRadius: 12, border: '3px solid var(--primary)', marginBottom: 20 }}>
                  <QRCode
                    value={selected.qrCodeValue}
                    size={220}
                    level="H"
                    includeMargin
                    renderAs="canvas"
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{selected.guestName}</div>
                  <div className="text-muted text-sm">{selected.email}</div>
                  {selected.group && <div><span className="chip">{selected.group}</span></div>}
                </div>

                <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{t('yourCheckInCode')}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', color: 'var(--text-secondary)' }}>{selected.qrCodeValue}</div>
                </div>

                {selected.dietaryPreferences?.length > 0 && (
                  <div style={{ fontSize: 13, color: 'var(--info)', marginBottom: 6 }}>
                    🥗 Dietary: {selected.dietaryPreferences.join(', ')}
                  </div>
                )}
                {selected.allergies?.length > 0 && (
                  <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 6 }}>
                    ⚠️ Allergies: {selected.allergies.join(', ')}
                  </div>
                )}

                {selected.checkInStatus ? (
                  <div className="alert" style={{ background: '#f0fff4', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                    ✅ You have been checked in at {selected.checkedInAt ? new Date(selected.checkedInAt).toLocaleTimeString() : 'the event'}. Enjoy!
                  </div>
                ) : (
                  <div className="alert" style={{ background: '#fffaf0', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                    📲 {t('showAtEntrance')}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16, fontSize: 12, textAlign: 'center', color: 'var(--text-muted)' }}>
                💡 Take a screenshot to have this code available offline.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QRCheckin;
