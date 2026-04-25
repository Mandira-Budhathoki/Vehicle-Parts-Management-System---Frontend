import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Nav } from 'react-bootstrap';

const AdminLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'bi-grid-1x2' },
  { name: 'Financial Reports', path: '/admin/reports', icon: 'bi-file-earmark-text' },
  { name: 'Staff Management', path: '/admin/staff', icon: 'bi-people' },
  { name: 'Parts Management', path: '/admin/parts', icon: 'bi-box-seam' },
  { name: 'Vendors', path: '/admin/vendors', icon: 'bi-truck' },
  { name: 'Purchase Invoices', path: '/admin/invoices', icon: 'bi-receipt' },
];

const StaffLinks = [
  { name: 'Dashboard', path: '/staff/dashboard', icon: 'bi-grid-1x2' },
  { name: 'POS / Sales', path: '/staff/pos', icon: 'bi-cart' },
  { name: 'Register Customer', path: '/staff/register-customer', icon: 'bi-person-plus' },
  { name: 'Customer Directory', path: '/staff/customers', icon: 'bi-people' },
  { name: 'Staff Reports', path: '/staff/reports', icon: 'bi-file-earmark-text' },
];

const CustomerLinks = [
  { name: 'My Profile', path: '/customer/profile', icon: 'bi-person' },
  { name: 'Book Appointment', path: '/customer/book', icon: 'bi-calendar-event' },
  { name: 'My History', path: '/customer/history', icon: 'bi-clock-history' },
  { name: 'Request Parts', path: '/customer/request-parts', icon: 'bi-cart-plus' },
];

export const Sidebar: React.FC = () => {
  const { role, logout } = useAuth();
  const links = role === 'admin' ? AdminLinks : role === 'staff' ? StaffLinks : CustomerLinks;

  return (
    <div
      className="d-flex flex-column border-end app-sidebar"
      style={{ width: '250px', height: '100%' }}
    >
      <div className="p-4 border-bottom sidebar-divider">
        <h3 className="mb-2 fw-bold" style={{ color: '#6366f1' }}>VP System</h3>
        {role && (
          <span className="badge text-uppercase border sidebar-badge">
            {role}
          </span>
        )}
      </div>

      <Nav className="flex-column flex-grow-1 p-3 overflow-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 px-3 py-2 mb-2 rounded nav-link-custom ${isActive ? 'active' : ''}`
            }
          >
            <i className={`bi ${link.icon} fs-5`}></i>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </Nav>

      <div className="p-4 border-top sidebar-divider">
        <button
          className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={logout}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};