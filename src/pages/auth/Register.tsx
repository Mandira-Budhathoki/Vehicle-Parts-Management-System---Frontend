import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock successful signup and redirect login
    alert("Registration successful! Please login.");
    navigate('/login');
  };

  return (
    <div className="register-container position-relative">
      <div className="position-absolute top-0 end-0 p-3">
        <ThemeToggle />
      </div>
      <div className="glass-panel register-card">
        <h2 className="title">Create Account</h2>
        <p className="subtitle">Join as a new Customer</p>

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-row">
            <div className="form-group w-full">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" required />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="john@example.com" required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" placeholder="1234567890" required />
          </div>
          <div className="form-group">
            <label>Vehicle Number (Optional)</label>
            <input type="text" placeholder="ABC-1234" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4">
            Register Let's Go
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
