import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Container } from 'react-bootstrap';

export const AppLayout: React.FC = () => {
  return (
    <div className="d-flex flex-row vh-100 overflow-hidden app-layout" style={{ width: '100vw' }}>
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
        <Header />
        <main className="flex-grow-1 overflow-auto p-4">
          <Container fluid className="px-md-4">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
};