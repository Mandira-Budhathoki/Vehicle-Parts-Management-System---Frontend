import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockLogin } from '../../services/mockApi';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await mockLogin(email);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.name);
      
      login(user); // Update the App's Auth context!
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'staff') navigate('/staff/dashboard');
      else navigate('/customer/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container position-relative">
      <div className="position-absolute top-0 end-0 p-3">
        <ThemeToggle />
      </div>
      <div className="glass-panel login-card">
        <h2 className="title">Welcome Back</h2>
        <p className="subtitle">Sign in to your account</p>
        
        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@vp.com" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password (Mock)</label>
            <input type="password" placeholder="Any password works" />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <span className="link" onClick={() => navigate('/register')}>Register</span></p>
          <div className="test-credentials">
            <p><strong>Test Accounts:</strong></p>
            <ul>
              <li>admin@vp.com</li>
              <li>staff@vp.com</li>
              <li>alice@vp.com</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
          padding: 1rem;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
        }

        .title {
          font-size: 1.75rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .subtitle {
          color: var(--text-secondary);
          text-align: center;
          margin-bottom: 2rem;
        }

        .alert-error {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 0.75rem;
          border-radius: var(--border-radius-sm);
          margin-bottom: 1.5rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
          font-size: 0.9rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .login-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .link {
          color: var(--accent-primary);
          cursor: pointer;
        }
        .link:hover {
          text-decoration: underline;
        }

        .test-credentials {
          margin-top: 1.5rem;
          background: var(--bg-tertiary);
          padding: 1rem;
          border-radius: var(--border-radius-sm);
          text-align: left;
          font-size: 0.85rem;
        }
        
        .test-credentials ul {
          margin-top: 0.5rem;
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};
