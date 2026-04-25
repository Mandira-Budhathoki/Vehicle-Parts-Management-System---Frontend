import React from 'react';
import { Row, Col, Card, Alert, Button, Form, InputGroup } from 'react-bootstrap';

export const StaffDashboard: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <h2 className="mb-4 text-light fw-bold">Staff Dashboard</h2>

      <Row className="g-4 mb-4">
        <Col xs={12} sm={6}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-cart3 fs-4"></i>
              </div>
              <div>
                <Card.Subtitle className="text-secondary mb-1">Today's Sales</Card.Subtitle>
                <Card.Title className="fs-3 fw-bold mb-0">14 Orders</Card.Title>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success" style={{ width: '50px', height: '50px' }}>
                <i className="bi bi-people fs-4"></i>
              </div>
              <div>
                <Card.Subtitle className="text-secondary mb-1">Customers Walked-in</Card.Subtitle>
                <Card.Title className="fs-3 fw-bold mb-0">25</Card.Title>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="bg-dark text-light border-secondary mb-4 border-warning bg-opacity-10">
        <Card.Body>
          <div className="d-flex align-items-center gap-2 mb-4 text-warning">
            <i className="bi bi-exclamation-circle-fill fs-5"></i>
            <h4 className="mb-0">Needs Attention</h4>
          </div>
          
          <Alert variant="warning" className="d-flex align-items-center justify-content-between mb-0 border-warning bg-dark text-light">
            <div>
              Customer <strong>Bob (XYZ-987)</strong> has an overdue credit payment of 35 days.
            </div>
            <Button variant="outline-warning" size="sm" className="d-none d-sm-block">Send Email Reminder</Button>
            <Button variant="warning" size="sm" className="d-sm-none"><i className="bi bi-envelope"></i></Button>
          </Alert>
        </Card.Body>
      </Card>
      
      <Card className="bg-dark text-light border-secondary">
        <Card.Body>
          <h4 className="mb-3 text-light">Quick Search Customer</h4>
          <InputGroup>
            <InputGroup.Text className="bg-transparent border-secondary text-secondary">
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control 
              type="text" 
              placeholder="Search by vehicle number, phone, ID, or name..." 
              className="bg-dark text-light border-secondary border-start-0 shadow-none ps-0"
            />
          </InputGroup>
        </Card.Body>
      </Card>
    </div>
  );
};
