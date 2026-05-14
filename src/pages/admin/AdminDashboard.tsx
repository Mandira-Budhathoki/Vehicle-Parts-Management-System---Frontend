import React from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
const mockUsers: any[] = []; const mockParts: any[] = []; type User = any;

export const AdminDashboard: React.FC = () => {
  const lowStockParts = mockParts.filter(p => p.stock < 10);

  return (
    <div className="animate-fade-in admin-dashboard">
      <h2 className="mb-4 text-light fw-bold">Admin Dashboard</h2>

      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-graph-up-arrow fs-4"></i>
              </div>
              <div>
                <Card.Subtitle className="text-secondary mb-1">Today's Revenue</Card.Subtitle>
                <Card.Title className="fs-3 fw-bold mb-0">$4,500</Card.Title>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-info bg-opacity-10 text-info" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-box-seam fs-4"></i>
              </div>
              <div>
                <Card.Subtitle className="text-secondary mb-1">Total Inventory</Card.Subtitle>
                <Card.Title className="fs-3 fw-bold mb-0">$45,200</Card.Title>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-exclamation-triangle fs-4"></i>
              </div>
              <div>
                <Card.Subtitle className="text-secondary mb-1">Low Stock Items</Card.Subtitle>
                <Card.Title className="fs-3 fw-bold mb-0">{lowStockParts.length}</Card.Title>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-people fs-4"></i>
              </div>
              <div>
                <Card.Subtitle className="text-secondary mb-1">New Customers</Card.Subtitle>
                <Card.Title className="fs-3 fw-bold mb-0">12</Card.Title>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12} lg={6}>
          <Card className="bg-dark text-light border-secondary border-danger bg-opacity-10">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-4 text-danger">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <h4 className="mb-0">Critical Alerts</h4>
              </div>

              {lowStockParts.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {lowStockParts.map(part => (
                    <Alert variant="danger" key={part.id} className="d-flex align-items-center justify-content-between mb-0 border-danger bg-dark text-light">
                      <div>
                        <strong>{part.name}</strong> is running low. Only {part.stock} left.
                      </div>
                      <Button variant="outline-danger" size="sm">Order</Button>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-secondary mb-0">No critical alerts right now.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

