const LoadingSpinner = ({ size = 'md', fullPage = false }) => {
  const cls = size === 'sm' ? 'spinner spinner-sm' : 'spinner';
  if (fullPage) {
    return (
      <div className="loading-container" style={{ minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className={cls} />
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</span>
        </div>
      </div>
    );
  }
  return <div className="loading-container"><div className={cls} /></div>;
};

export default LoadingSpinner;
