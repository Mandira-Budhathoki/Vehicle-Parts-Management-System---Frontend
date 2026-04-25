import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';

export const PartRequest: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <h2 className="mb-3 text-light fw-bold">Request Unavailable Parts</h2>
      
      <p className="text-secondary mb-4" style={{ maxWidth: '600px' }}>
        Can't find what you are looking for in our inventory? Submit a request here and we will order it for you from our vendors.
      </p>

      <Card className="bg-dark text-light border-secondary" style={{ maxWidth: '600px' }}>
        <Card.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="text-secondary">Part Name / ID</Form.Label>
              <Form.Control type="text" placeholder="e.g. Michelin CrossClimate 2 Tires" className="bg-dark text-light border-secondary shadow-none" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-secondary">Vehicle Make & Model</Form.Label>
              <Form.Control type="text" placeholder="e.g. Toyota Camry 2021" className="bg-dark text-light border-secondary shadow-none" />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-secondary">Description / Manufacturer Link</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Provide any links or additional details to help us find the exact part..." className="bg-dark text-light border-secondary shadow-none" />
            </Form.Group>

            <Button variant="primary" type="button" className="d-flex align-items-center gap-2">
              <i className="bi bi-send"></i> Submit Request
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};
