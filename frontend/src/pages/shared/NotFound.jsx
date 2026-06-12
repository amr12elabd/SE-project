import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 80 }}>☕</div>
      <h1 style={{ fontSize: '4rem', color: 'var(--primary)' }}>404</h1>
      <h2>Page Not Found</h2>
      <p className="text-muted">This page seems to have brewed away. Let's get you back.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Home</button>
      </div>
    </div>
  );
};

export default NotFound;
