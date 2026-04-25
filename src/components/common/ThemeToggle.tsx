import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-link p-2 rounded-circle nav-icon-btn ${className}`}
      style={{ textDecoration: 'none', transition: 'background-color 0.2s', color: 'var(--text-primary)' }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <i className="bi bi-moon-stars-fill fs-5"></i>
      ) : (
        <i className="bi bi-brightness-high-fill fs-5"></i>
      )}
    </button>
  );
};