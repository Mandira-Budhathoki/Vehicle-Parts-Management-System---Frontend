import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';

export const History: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <h2 className="mb-4 text-light fw-bold">Purchase & Service History</h2>

      <Card className="bg-dark text-light border-secondary mb-4">
        <Card.Body className="p-4">
          <h4 className="mb-4 fw-bold">Service History</h4>
          <div className="d-flex flex-column gap-3">
            <div className="p-3 bg-secondary bg-opacity-10 rounded border border-secondary d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-wrench-adjustable fs-5"></i>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Brake Pad Replacement</h5>
                  <p className="mb-0 text-secondary small">March 12, 2026</p>
                </div>
              </div>
              <Button variant="outline-warning" size="sm" className="d-flex align-items-center justify-content-center gap-2">
                <i className="bi bi-star-fill"></i> Leave Review
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="bg-dark text-light border-secondary">
        <Card.Body className="p-0 overflow-hidden">
          <div className="p-4 pb-2">
            <h4 className="mb-3 fw-bold">Parts Purchase History</h4>
          </div>
          <Table hover variant="dark" responsive className="mb-0">
            <thead className="border-secondary">
              <tr>
                <th className="p-3 border-bottom-0">Order ID</th>
                <th className="p-3 border-bottom-0">Date</th>
                <th className="p-3 border-bottom-0">Items</th>
                <th className="p-3 border-bottom-0">Total</th>
                <th className="p-3 border-bottom-0">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-secondary align-middle">#ORD-7192</td>
                <td className="p-3 border-secondary align-middle text-secondary">Feb 20, 2026</td>
                <td className="p-3 border-secondary align-middle">2x Brake Pads, 1x Oil Filter</td>
                <td className="p-3 border-secondary align-middle fw-medium">$380.00</td>
                <td className="p-3 border-secondary align-middle">
                  <Badge bg="info" text="dark" className="px-2 py-1">COMPLETED</Badge>
                </td>
              </tr>
              <tr>
                <td className="p-3 border-secondary align-middle">#ORD-6821</td>
                <td className="p-3 border-secondary align-middle text-secondary">Jan 05, 2026</td>
                <td className="p-3 border-secondary align-middle">1x Headlight Bulb</td>
                <td className="p-3 border-secondary align-middle fw-medium">$50.00</td>
                <td className="p-3 border-secondary align-middle">
                  <Badge bg="info" text="dark" className="px-2 py-1">COMPLETED</Badge>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};
