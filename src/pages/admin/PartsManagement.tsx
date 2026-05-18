import React, { useState } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import { mockParts, type Part } from '../../services/mockApi';

export const PartsManagement: React.FC = () => {
  const [parts] = useState<Part[]>(mockParts);

  return (
    <div className="animate-fade-in h-100 d-flex flex-column text-light" style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)', padding: '1.5rem', borderRadius: '12px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-gradient p-2 rounded shadow">
            <i className="bi bi-box-seam fs-4 text-white"></i>
          </div>
          <h2 className="mb-0 text-light fw-bold" style={{ letterSpacing: '0.5px' }}>Parts Inventory</h2>
        </div>
        <Button 
          className="d-flex align-items-center gap-2 px-4 py-2 fw-bold shadow text-white border-0"
          style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
        >
          <i className="bi bi-plus-circle-fill"></i> Add New Part
        </Button>
      </div>

      <Card className="text-light border-0 shadow-lg" style={{ background: 'rgba(30, 34, 45, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '16px' }}>
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
                <tr key={p.id} style={{ transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="p-3 border-secondary align-middle text-light fw-semibold">{p.name}</td>
                  <td className="p-3 border-secondary align-middle fw-bold text-success">${p.price}</td>
                  <td className="p-3 border-secondary align-middle text-info fw-medium">{p.stock}</td>
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
