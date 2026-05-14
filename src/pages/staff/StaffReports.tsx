import React from 'react';
import { Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
const mockUsers: any[] = []; const mockParts: any[] = []; type User = any;

export const StaffReports: React.FC = () => {
  const highSpenders = mockUsers.filter(u => u.role === 'customer' && u.totalSpent && u.totalSpent > 2000);
  const pendingCredits = mockUsers.filter(u => u.role === 'customer' && u.creditOverdueDays && u.creditOverdueDays > 0);

  return (
    <div className="animate-fade-in reports-wrapper">
      <h2 className="mb-4 text-light fw-bold">Staff Reports & Insights</h2>

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <Card className="bg-dark border-secondary h-100 overflow-hidden">
            <Card.Header className="bg-primary bg-opacity-10 border-secondary p-3 d-flex align-items-center">
              <h5 className="mb-0 text-light d-flex align-items-center gap-2">
                <i className="bi bi-star-fill text-warning"></i> High Spenders / Regulars
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover variant="dark" responsive className="mb-0">
                <thead className="border-secondary">
                  <tr>
                    <th className="p-3 border-bottom-0">Customer</th>
                    <th className="p-3 border-bottom-0">Total Spent</th>
                    <th className="p-3 border-bottom-0">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {highSpenders.map(c => (
                    <tr key={c.id}>
                      <td className="p-3 border-secondary align-middle">{c.name}</td>
                      <td className="p-3 border-secondary align-middle fw-bold">${c.totalSpent}</td>
                      <td className="p-3 border-secondary align-middle">
                        {c.totalSpent! > 5000 ? <Badge bg="success">Loyalty Program</Badge> : <Badge bg="secondary">Regular</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card className="bg-dark border-secondary h-100 overflow-hidden">
            <Card.Header className="bg-danger bg-opacity-10 border-secondary p-3 d-flex align-items-center">
              <h5 className="mb-0 text-light d-flex align-items-center gap-2">
                <i className="bi bi-credit-card-fill text-danger"></i> Pending Credits
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover variant="dark" responsive className="mb-0">
                <thead className="border-secondary">
                  <tr>
                    <th className="p-3 border-bottom-0">Customer</th>
                    <th className="p-3 border-bottom-0">Days Overdue</th>
                    <th className="p-3 border-bottom-0">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCredits.map(c => (
                    <tr key={c.id}>
                      <td className="p-3 border-secondary align-middle">
                        <div>{c.name}</div>
                        <small className="text-secondary">{c.phone}</small>
                      </td>
                      <td className="p-3 border-secondary align-middle">
                        {c.creditOverdueDays! > 30 ? (
                          <span className="text-danger fw-bold">{c.creditOverdueDays} days (CRITICAL)</span>
                        ) : (
                          <span>{c.creditOverdueDays} days</span>
                        )}
                      </td>
                      <td className="p-3 border-secondary align-middle">
                        <Button variant="outline-danger" size="sm">Notify</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

