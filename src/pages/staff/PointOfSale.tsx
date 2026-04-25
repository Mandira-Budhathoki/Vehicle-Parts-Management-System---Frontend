import React, { useState } from 'react';
import { Card, Row, Col, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { mockParts, mockUsers } from '../../services/mockApi';

export const PointOfSale: React.FC = () => {
  const [cart, setCart] = useState<{partId: string, quantity: number, name: string, price: number}[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  
  const customer = mockUsers.find(u => u.name.toLowerCase().includes(customerSearch.toLowerCase()) && u.role === 'customer');

  const addToCart = (part: any) => {
    setCart([...cart, { partId: part.id, quantity: 1, name: part.name, price: part.price }]);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="animate-fade-in h-100 d-flex flex-column">
      <h2 className="mb-4 text-light fw-bold">Point of Sale</h2>

      <Row className="g-4 flex-grow-1">
        <Col xs={12} lg={7} xl={8}>
          <Card className="bg-dark text-light border-secondary h-100 d-flex flex-column">
            <Card.Body className="d-flex flex-column">
              <h5 className="mb-3 fw-bold">Select Customer</h5>
              <InputGroup className="mb-3">
                <InputGroup.Text className="bg-transparent border-secondary text-secondary">
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  placeholder="Search Customer..." 
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="bg-dark text-light border-secondary border-start-0 shadow-none ps-0"
                />
              </InputGroup>
              
              {customer && (
                <div className="p-3 rounded border border-secondary mb-4 bg-secondary bg-opacity-10">
                  <div className="fw-bold mb-1">{customer.name}</div>
                  <div className="small text-secondary">{customer.email} | {customer.phone}</div>
                  <div className="small text-secondary mb-2">Vehicle: {customer.vehicleNumber}</div>
                  {customer.totalSpent && customer.totalSpent > 5000 && (
                    <Badge bg="success">Loyalty Member - 10% Discount Available</Badge>
                  )}
                </div>
              )}
              
              <h5 className="mt-2 mb-3 fw-bold">Available Parts</h5>
              <div className="flex-grow-1 overflow-auto pe-2" style={{ maxHeight: 'max(400px, calc(100vh - 450px))' }}>
                <div className="d-flex flex-column gap-3">
                  {mockParts.map(part => (
                    <div key={part.id} className="d-flex justify-content-between align-items-center p-3 border border-secondary rounded">
                      <div>
                        <div className="fw-bold">{part.name}</div>
                        <div className="small text-secondary">${part.price} | Stock: {part.stock}</div>
                      </div>
                      <Button 
                        variant="outline-light" 
                        size="sm" 
                        onClick={() => addToCart(part)}
                        disabled={part.stock <= 0}
                        className="d-flex align-items-center gap-1"
                      >
                        <i className="bi bi-plus-lg"></i> Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={5} xl={4}>
          <Card className="bg-dark text-light border-secondary h-100 d-flex flex-column">
            <Card.Body className="d-flex flex-column">
              <h5 className="mb-4 fw-bold">Current Order</h5>
              
              <div className="flex-grow-1 mb-4 overflow-auto pe-2" style={{ maxHeight: 'max(300px, calc(100vh - 450px))' }}>
                {cart.length === 0 ? (
                  <p className="text-secondary fst-italic">Cart is empty.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {cart.map((item, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded bg-secondary bg-opacity-10">
                        <span className="text-truncate me-2">{item.name}</span>
                        <div className="d-flex align-items-center gap-3 flex-shrink-0">
                          <span className="text-secondary">x{item.quantity}</span>
                          <span>${item.price * item.quantity}</span>
                          <Button variant="link" className="text-danger p-0 border-0"><i className="bi bi-trash"></i></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-top border-secondary">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {customer?.totalSpent && customer.totalSpent > 5000 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Loyalty Discount (10%)</span>
                    <span>-${(total * 0.1).toFixed(2)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between fw-bold fs-5 mt-2 mb-4">
                  <span>Total</span>
                  <span>${(customer?.totalSpent && customer.totalSpent > 5000) ? (total * 0.9).toFixed(2) : total.toFixed(2)}</span>
                </div>
                <Button variant="primary" size="lg" className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2" disabled={cart.length === 0}>
                  <i className="bi bi-cart3"></i> Charge & Create Invoice
                </Button>
                <Button variant="outline-light" className="w-100">Email Invoice to Customer</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
