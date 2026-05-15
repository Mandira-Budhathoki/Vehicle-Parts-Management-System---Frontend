import React, { useState } from 'react';
import { Card, Form, InputGroup, Row, Col, Button, Badge } from 'react-bootstrap';
const mockUsers: any[] = []; const mockParts: any[] = []; type User = any;

export const CustomerDirectory: React.FC = () => {
  const [search, setSearch] = useState('');

  const customers = mockUsers.filter(u => u.role === 'customer' && (
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.vehicleNumber?.includes(search)
  ));

  return (
    <div className="animate-fade-in">
      <h2 className="mb-4 text-light fw-bold">Customer Directory</h2>

      <Card className="bg-dark border-secondary mb-4">
        <Card.Body className="p-4">
          <InputGroup>
            <InputGroup.Text className="bg-transparent border-secondary text-secondary">
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by vehicle number, phone, ID, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-dark text-light border-secondary border-start-0 shadow-none ps-0"
            />
          </InputGroup>
        </Card.Body>
      </Card>

      <Row xs={1} md={2} xl={3} className="g-4">
        {customers.map(c => (
          <Col key={c.id}>
            <Card className="bg-dark text-light border-secondary h-100">
              <Card.Body className="d-flex flex-column p-4">
                <h4 className="fw-bold mb-1">{c.name}</h4>
                <p className="text-secondary small mb-3">{c.email} | {c.phone}</p>
                <div className="mb-4">
                  <Badge bg="secondary" className="px-2 py-1 align-items-center gap-1">
                    <i className="bi bi-car-front-fill"></i> {c.vehicleNumber || 'No Vehicle'}
                  </Badge>
                </div>

                <div className="d-flex justify-content-between border-top border-secondary pt-3 mt-auto">
                  <Button variant="outline-info" size="sm" className="d-flex align-items-center gap-1">
                    <i className="bi bi-eye"></i> View History
                  </Button>
                  <Button variant="outline-light" size="sm" className="d-flex align-items-center gap-1">
                    <i className="bi bi-file-text"></i> Statement
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {customers.length === 0 && <p className="text-secondary mt-4">No customers found.</p>}
    </div>
  );
};

