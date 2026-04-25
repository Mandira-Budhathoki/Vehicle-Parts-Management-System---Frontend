import React, { useState } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import { mockParts, type Part } from '../../services/mockApi';

export const PartsManagement: React.FC = () => {
  const [parts] = useState<Part[]>(mockParts);

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">Parts Inventory</h2>
        <Button variant="primary" className="d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Add New Part
        </Button>
      </div>

      <Card className="bg-dark text-light border-secondary">
        <Card.Body className="p-0 overflow-hidden">
          <Table hover variant="dark" responsive className="mb-0">
            <thead className="border-secondary">
              <tr>
                <th className="p-3 border-bottom-0">Part Name</th>
                <th className="p-3 border-bottom-0">Price ($)</th>
                <th className="p-3 border-bottom-0">Stock</th>
                <th className="p-3 border-bottom-0">Status</th>
                <th className="p-3 border-bottom-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.map(p => (
                <tr key={p.id}>
                  <td className="p-3 border-secondary align-middle">{p.name}</td>
                  <td className="p-3 border-secondary align-middle fw-medium">${p.price}</td>
                  <td className="p-3 border-secondary align-middle">{p.stock}</td>
                  <td className="p-3 border-secondary align-middle">
                    {p.stock < 10 ? (
                      <Badge bg="danger" className="d-inline-flex align-items-center gap-1 px-2 py-1">
                        <i className="bi bi-exclamation-triangle-fill"></i> Low Stock
                      </Badge>
                    ) : (
                      <Badge bg="success" className="px-2 py-1">Healthy</Badge>
                    )}
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
