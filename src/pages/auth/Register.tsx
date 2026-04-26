import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCustomer } from '../../services/customerApi';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useToast } from '../../context/ToastContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerCustomer(formData);
      showToast('Registration successful! Please login with your credentials.', 'success');
      navigate('/login');
    } catch (err: any) {
      showToast(err.message || 'Registration failed. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container position-relative">
      <div className="position-absolute top-0 end-0 p-3">
        <ThemeToggle />
      </div>
      <div className="glass-panel register-card">
        <h2 className="title">Create Account</h2>
        <p className="subtitle">Join as a new Customer</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-row">
            <div className="form-group w-full">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="1234567890"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Registering...' : "Register — Let's Go"}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <span className="link" onClick={() => navigate('/login')}>Sign In</span></p>
        </div>
      </div>

      <style>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
          padding: 1rem;
        }

        .register-card {
          width: 100%;
          max-width: 500px;
          padding: 2.5rem;
        }
        
        .title { font-size: 1.75rem; text-align: center; }
        .subtitle { color: var(--text-secondary); text-align: center; margin-bottom: 2rem; }

        .alert-error {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 0.75rem;
          border-radius: var(--border-radius-sm);
          margin-bottom: 1.5rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
          font-size: 0.9rem;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .register-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .link {
          color: var(--accent-primary);
          cursor: pointer;
        }
        .link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};

