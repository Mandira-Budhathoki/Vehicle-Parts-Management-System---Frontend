import React from 'react';
import { Card, Form, Row, Col, Button, InputGroup } from 'react-bootstrap';

export const BookAppointment: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <h2 className="mb-4 text-light fw-bold">Book an Appointment</h2>

      <Card className="bg-dark text-light border-secondary" style={{ maxWidth: '800px' }}>
        <Card.Body className="p-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="text-secondary fw-medium">Select Service Type</Form.Label>
              <Form.Select className="bg-dark text-light border-secondary shadow-none">
                <option>General Maintenance</option>
                <option>Brake Replacement</option>
                <option>Oil Change</option>
                <option>Engine Diagnostics</option>
              </Form.Select>
            </Form.Group>

            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary fw-medium">Preferred Date</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-secondary text-secondary">
                      <i className="bi bi-calendar3"></i>
                    </InputGroup.Text>
                    <Form.Control type="date" className="bg-dark text-light border-secondary border-start-0 shadow-none ps-0" />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary fw-medium">Preferred Time</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent border-secondary text-secondary">
                      <i className="bi bi-clock"></i>
                    </InputGroup.Text>
                    <Form.Control type="time" className="bg-dark text-light border-secondary border-start-0 shadow-none ps-0" />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="text-secondary fw-medium">Additional Notes (Optional)</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Describe any specific issues..." className="bg-dark text-light border-secondary shadow-none" />
            </Form.Group>

            <Button variant="primary" type="button" className="w-100 py-2 fw-bold text-uppercase mt-2">
              Confirm Booking
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};
