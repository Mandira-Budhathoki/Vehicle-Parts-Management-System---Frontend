import React from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';

export const CustomerRegistration: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="d-flex align-items-center gap-3 mb-4">
        <i className="bi bi-person-plus fs-3 text-secondary"></i>
        <h2 className="mb-0 text-light fw-bold">Register Walk-in Customer</h2>
      </div>

      <Card className="bg-dark text-light border-secondary" style={{ maxWidth: '800px' }}>
        <Card.Body className="p-4">
          <Form>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Full Name</Form.Label>
                  <Form.Control type="text" placeholder="e.g. Jane Smith" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Phone Number</Form.Label>
                  <Form.Control type="tel" placeholder="123-456-7890" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-4">
              <Form.Label className="text-secondary">Email Address</Form.Label>
              <Form.Control type="email" placeholder="jane@example.com" className="bg-dark text-light border-secondary shadow-none" />
            </Form.Group>

            <h5 className="mt-4 mb-3 pt-4 border-top border-secondary fw-bold">Vehicle Information</h5>
            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Vehicle Make & Model</Form.Label>
                  <Form.Control type="text" placeholder="e.g. Toyota Camry" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Vehicle Registration Number</Form.Label>
                  <Form.Control type="text" placeholder="ABC-1234" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="button" className="w-100 py-2 fw-bold">
              Register Customer in System
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};
