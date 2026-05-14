import React, { useState } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
const mockUsers: any[] = []; const mockParts: any[] = []; type User = any;

export const StaffManagement: React.FC = () => {
  const [users] = useState<User[]>(mockUsers.filter(u => u.role === 'staff' || u.role === 'admin'));

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">Staff Management</h2>
        <Button variant="primary" className="d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Register New Staff
        </Button>
      </div>

      <Card className="bg-dark text-light border-secondary">
        <Card.Body className="p-0 overflow-hidden">
          <Table hover variant="dark" responsive className="mb-0">
            <thead className="border-secondary">
              <tr>
                <th className="p-3 border-bottom-0">Name</th>
                <th className="p-3 border-bottom-0">Email</th>
                <th className="p-3 border-bottom-0">Role</th>
                <th className="p-3 border-bottom-0 align-middle text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="p-3 border-secondary align-middle">{u.name}</td>
                  <td className="p-3 border-secondary align-middle text-secondary">{u.email}</td>
                  <td className="p-3 border-secondary align-middle">
                    <Badge bg={u.role === 'admin' ? 'danger' : 'info'} text={u.role === 'admin' ? 'light' : 'dark'} className="px-2 py-1">
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3 border-secondary align-middle text-end">
                    <div className="d-flex gap-2 justify-content-end">
                      <Button variant="outline-info" size="sm" className="border-0"><i className="bi bi-pencil"></i></Button>
                      <Button variant="outline-danger" size="sm" className="border-0"><i className="bi bi-trash"></i></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

