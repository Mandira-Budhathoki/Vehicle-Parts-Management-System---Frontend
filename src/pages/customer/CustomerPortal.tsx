import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

export const CustomerPortal: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Alice';

  return (
    <div className="animate-fade-in customer-portal">
      <Card className="mb-4 text-white border-0" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div>
            <h2 className="fw-bold mb-2">Welcome back, {userName}!</h2>
            <p className="mb-0 text-white text-opacity-75">Your vehicle is in good shape. Next service recommended in 2 months.</p>
          </div>
          
          <div className="d-flex align-items-center gap-3 p-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <i className="bi bi-star-fill text-warning fs-3"></i>
            <div>
              <div className="fw-bold fs-5">Loyalty Member</div>
              <div className="small text-white text-opacity-75">10% Discount Active</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xs={12} md={6}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">Registered Vehicle</h4>
                <i className="bi bi-activity fs-4 text-info"></i>
              </div>
              <h5 className="fs-4 fw-bold mb-1">Toyota Camry</h5>
              <div className="text-secondary mb-4">ABC-1234</div>
              
              <div className="bg-info bg-opacity-10 text-info p-3 rounded small">
                <strong><i className="bi bi-robot"></i> AI Prediction:</strong> Brake pads wear detected. Consider replacing in the next 1,500 miles.
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="p-4 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">Account Credit</h4>
                <i className="bi bi-credit-card-fill fs-4 text-success"></i>
              </div>
              <h5 className="fs-4 fw-bold mb-1">None</h5>
              <div className="text-secondary mb-4 flex-grow-1">All payments are up to date!</div>
              
              <Button variant="outline-light" className="w-100 mt-auto">View Billing History</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
