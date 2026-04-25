import React from 'react';
import { Navbar, Nav, Dropdown, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <Navbar
      expand="lg"
      className="px-4 border-bottom app-header"
      style={{ height: '70px' }}
    >
      <div className="d-flex justify-content-between w-100 align-items-center">
        <Form className="d-none d-md-flex" style={{ width: '300px' }}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search anything..."
              className="border-start-0 shadow-none ps-0"
            />
          </InputGroup>
        </Form>

        <Nav className="ms-auto d-flex align-items-center gap-3">
          <ThemeToggle className="me-2" />

          <Nav.Link
            href="#"
            className="position-relative p-2 rounded-circle nav-icon-btn"
            style={{ transition: 'background-color 0.2s' }}
          >
            <i className="bi bi-bell fs-5"></i>
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: '0.6rem' }}
            >
              3
            </span>
          </Nav.Link>

          <Dropdown align="end">
            <Dropdown.Toggle
              as="div"
              className="d-flex align-items-center gap-2"
              style={{ cursor: 'pointer' }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-primary bg-primary bg-opacity-10"
                style={{ width: '40px', height: '40px' }}
              >
                <i className="bi bi-person-fill fs-5"></i>
              </div>
              <span className="fw-medium user-name">{user?.name || 'User'}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#">
                <i className="bi bi-person me-2"></i>Profile
              </Dropdown.Item>
              <Dropdown.Item href="#">
                <i className="bi bi-gear me-2"></i>Settings
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </div>
    </Navbar>
  );
};