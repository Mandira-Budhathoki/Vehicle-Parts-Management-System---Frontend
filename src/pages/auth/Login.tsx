import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log("Attempting login with:", { email, password });

    try {
      const response = await apiLogin(email, password);
      console.log("Login successful, response:", response);
      
      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.role.toLowerCase());
      localStorage.setItem('userName', response.name);
      
      const userRole = response.role.toLowerCase() as Role;
      
      // Update Auth Context to match the expected 'User' interface
      login({
        id: '1', // Temporary ID
        name: response.name,
        email: email,
        role: userRole
      });
      
      // Redirect based on role
      if (userRole === 'admin') navigate('/admin/dashboard');
      else if (userRole === 'staff') navigate('/staff/dashboard');
      else navigate('/customer/profile');
    } catch (err: any) {
      console.error("Login error details:", err);
      setError(err.response?.data || 'Invalid email or password.');
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
              placeholder="e.g. admin@gmail.com" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" 
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <span className="link" onClick={() => navigate('/register')}>Register</span></p>
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
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
          font-size: 0.9rem;
          text-align: center;
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

        .form-group input {
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
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
      `}</style>
    </div>
  );
};
