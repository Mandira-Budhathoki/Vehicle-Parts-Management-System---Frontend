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

        console.log('Attempting login with:', { email, password });

        try {
            const response = await apiLogin(email, password);

            console.log('Login successful:', response);

            // store auth data
            localStorage.setItem('token', response.token);
            localStorage.setItem('userRole', response.role.toLowerCase());
            localStorage.setItem('userName', response.name);

            const userRole = response.role.toLowerCase() as Role;

            login({
                id: 1,
                name: response.name,
                email: email,
                role: userRole,
            });

            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (userRole === 'staff') {
                navigate('/staff/dashboard');
            } else {
                navigate('/customer/profile');
            }

        } catch (err: any) {
            console.error('Login error:', err);
            setError('Invalid email or password.');
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
                    <p>
                        Don't have an account?{' '}
                        <span className="link" onClick={() => navigate('/register')}>
                            Register
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};