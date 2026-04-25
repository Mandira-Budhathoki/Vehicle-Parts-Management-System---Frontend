import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';

export const PurchaseInvoices: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">Purchase Invoices</h2>
        <Button variant="primary" className="d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Create Invoice
        </Button>
      </div>

      <Card className="bg-dark text-light border-secondary">
        <Card.Body className="p-0 overflow-hidden">
          <Table hover variant="dark" responsive className="mb-0">
            <thead className="border-secondary">
              <tr>
                <th className="p-3 border-bottom-0">Invoice ID</th>
                <th className="p-3 border-bottom-0">Vendor</th>
                <th className="p-3 border-bottom-0">Date</th>
                <th className="p-3 border-bottom-0">Total Amount</th>
                <th className="p-3 border-bottom-0">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-secondary align-middle">#INV-9281</td>
                <td className="p-3 border-secondary align-middle">AutoParts Corp</td>
                <td className="p-3 border-secondary align-middle">2026-04-05</td>
                <td className="p-3 border-secondary align-middle">$2,500.00</td>
                <td className="p-3 border-secondary align-middle">
                  <Badge bg="success" className="px-2 py-1">PAID</Badge>
                </td>
              </tr>
              <tr>
                <td className="p-3 border-secondary align-middle">#INV-9282</td>
                <td className="p-3 border-secondary align-middle">Global Wheels</td>
                <td className="p-3 border-secondary align-middle">2026-04-08</td>
                <td className="p-3 border-secondary align-middle">$8,250.00</td>
                <td className="p-3 border-secondary align-middle">
                  <Badge bg="warning" text="dark" className="px-2 py-1">PENDING</Badge>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};
