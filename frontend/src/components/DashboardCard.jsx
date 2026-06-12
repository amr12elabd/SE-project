const DashboardCard = ({ icon, label, value, color = '#1a6b5c', sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '20', color }}>
      {icon}
    </div>
    <div className="stat-info">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="text-xs text-muted mt-2">{sub}</div>}
    </div>
  </div>
);

export default DashboardCard;
