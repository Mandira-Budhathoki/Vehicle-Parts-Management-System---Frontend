import React from 'react';
import { Card, Button } from 'react-bootstrap';

export const VendorsManagement: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">Vendors Management</h2>
        <Button variant="primary" className="d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Add New Vendor
        </Button>
      </div>

      <Card className="bg-dark text-light border-secondary mb-4">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary" style={{ width: '48px', height: '48px' }}>
              <i className="bi bi-building fs-5"></i>
            </div>
            <div>
              <h5 className="mb-1 text-light fw-bold">AutoParts Corp</h5>
              <div className="text-secondary small">autoparts@corp.com | +1 800-123-4567</div>
            </div>
          </div>
          <p className="text-secondary mb-4">Supplier of high quality brake pads and filters.</p>
          <div className="d-flex gap-2">
            <Button variant="outline-light" size="sm">Edit Vendor</Button>
            <Button variant="outline-danger" size="sm">Delete</Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
