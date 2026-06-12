import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'organizer', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.role) { setError('All fields are required'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div style={{ fontSize: 48 }}>☕</div>
          <h1>PopEyez</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" placeholder="Your name" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" placeholder="+20 1xx xxx xxxx" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-control" value={form.role} onChange={set('role')}>
              <option value="organizer">Event Organizer</option>
              <option value="vendor">Vendor / Supplier</option>
              <option value="venueOwner">Venue Owner</option>
              <option value="guest">Guest</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-control" placeholder="Min. 6 chars" value={form.password} onChange={set('password')} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className="form-control" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
