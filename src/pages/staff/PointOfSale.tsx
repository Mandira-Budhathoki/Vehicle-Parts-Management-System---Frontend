import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, InputGroup, Button, Badge, Spinner, ListGroup } from 'react-bootstrap';
import { getAllCustomers, type CustomerResponse } from '../../services/authApi';
import { getAllParts, type Part } from '../../services/partApi';
import { useToast } from '../../context/ToastContext';

export const PointOfSale: React.FC = () => {
  const { showToast } = useToast();
  
  // Real data state from database
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  // Active interaction states
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
  const [partSearch, setPartSearch] = useState('');
  const [cart, setCart] = useState<{ partId: number; quantity: number; name: string; price: number; maxStock: number }[]>([]);

  // Fetch customers and parts on mount
  const fetchPosData = async () => {
    try {
      setLoading(true);
      const [fetchedCustomers, fetchedParts] = await Promise.all([
        getAllCustomers(),
        getAllParts()
      ]);
      setCustomers(fetchedCustomers);
      setParts(fetchedParts);
    } catch (err: any) {
      showToast('Failed to load database customers or parts inventory.', 'danger');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter customers based on name, ID, phone, email, or license plate
  const filteredCustomers = customers.filter(c => {
    const term = customerSearch.toLowerCase().trim();
    if (!term) return false;
    return (
      c.userId.toString().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      c.email.toLowerCase().includes(term) ||
      c.vehicles?.some(v => v.vehicleNumber.toLowerCase().includes(term))
    );
  });

  // Filter parts based on part name, category, or description
  const filteredParts = parts.filter(p => {
    const term = partSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      p.partName.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  });

  // Add a part to the checkout cart
  const addToCart = (part: Part) => {
    if (part.stockQuantity <= 0) {
      showToast(`'${part.partName}' is currently out of stock.`, 'warning');
      return;
    }

    const existingIndex = cart.findIndex(item => item.partId === part.partId);
    if (existingIndex !== -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= part.stockQuantity) {
        showToast(`Cannot add more. Live stock limit for '${part.partName}' is ${part.stockQuantity}.`, 'warning');
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
      showToast(`Incremented quantity for ${part.partName}.`, 'success');
    } else {
      setCart([...cart, {
        partId: part.partId,
        quantity: 1,
        name: part.partName,
        price: part.price,
        maxStock: part.stockQuantity
      }]);
      showToast(`Added ${part.partName} to order.`, 'success');
    }
  };

  // Adjust quantity from within the cart pane
  const updateQuantity = (partId: number, delta: number) => {
    const idx = cart.findIndex(item => item.partId === partId);
    if (idx === -1) return;

    const updated = [...cart];
    const newQty = updated[idx].quantity + delta;

    if (newQty <= 0) {
      updated.splice(idx, 1);
      setCart(updated);
      showToast('Item removed from cart.', 'info');
    } else if (newQty > updated[idx].maxStock) {
      showToast(`Cannot exceed live database stock level of ${updated[idx].maxStock} units.`, 'warning');
    } else {
      updated[idx].quantity = newQty;
      setCart(updated);
    }
  };

  const removeFromCart = (partId: number) => {
    setCart(cart.filter(item => item.partId !== partId));
    showToast('Item removed from cart.', 'info');
  };

  // Calculate pricing totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Give 10% loyalty discount if customer has registered vehicles
  const hasLoyaltyDiscount = selectedCustomer !== null && (selectedCustomer.vehicles?.length ?? 0) > 0;
  const discountRate = hasLoyaltyDiscount ? 0.10 : 0.0;
  const discountAmount = subtotal * discountRate;
  const finalTotal = subtotal - discountAmount;

  // Handle final invoice checkout
  const handleCheckout = () => {
    if (!selectedCustomer) {
      showToast('Please select a customer before charging.', 'danger');
      return;
    }
    if (cart.length === 0) {
      showToast('Your sales cart is empty.', 'danger');
      return;
    }

    // Success simulation
    showToast(`Invoice generated successfully! Rs. ${finalTotal.toLocaleString()} charged to ${selectedCustomer.name}.`, 'success');
    
    // Clear form states
    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setPartSearch('');
  };

  return (
    <div className="animate-fade-in h-100 d-flex flex-column p-2">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Point of Sale</h2>
        <p className="text-muted mb-0 small">Create new client sales transactions, manage invoices, and check database inventory levels</p>
      </div>

      {loading ? (
        <div className="text-center py-5 my-auto">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3 small">Loading POS real-time systems...</p>
        </div>
      ) : (
        <Row className="g-4 flex-grow-1">
          {/* LEFT: Customer Selection and Parts Grid */}
          <Col xs={12} lg={7} xl={8}>
            <div className="d-flex flex-column gap-4 h-100">
              
              {/* Select Customer Card */}
              <Card className="bg-white border-light-subtle shadow-sm">
                <Card.Body className="p-4">
                  <h5 className="mb-3 fw-bold text-dark d-flex align-items-center gap-2">
                    <i className="bi bi-person-fill text-primary"></i>
                    Select Customer
                  </h5>

                  {!selectedCustomer ? (
                    <div className="position-relative">
                      <InputGroup className="mb-1">
                        <InputGroup.Text className="bg-transparent border-light-subtle text-secondary">
                          <i className="bi bi-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search customer by ID, name, phone, license plate..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="bg-white text-dark border-light-subtle border-start-0 shadow-none ps-0"
                        />
                      </InputGroup>
                      <small className="text-muted d-block mb-3">Type to filter the active customer registry</small>

                      {/* Customer Results Dropdown list */}
                      {customerSearch.trim().length > 0 && (
                        <Card className="position-absolute w-100 shadow-lg border-light-subtle bg-white z-3" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                          <ListGroup variant="flush">
                            {filteredCustomers.length === 0 ? (
                              <ListGroup.Item className="text-muted py-3 small bg-white text-center">
                                No matching customers found in database.
                              </ListGroup.Item>
                            ) : (
                              filteredCustomers.map(c => (
                                <ListGroup.Item 
                                  key={c.userId} 
                                  action 
                                  onClick={() => {
                                    setSelectedCustomer(c);
                                    setCustomerSearch('');
                                  }}
                                  className="d-flex justify-content-between align-items-center py-2 px-3 bg-white text-dark hover-bg-light"
                                >
                                  <div>
                                    <strong className="d-block text-dark small">{c.name}</strong>
                                    <span className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                                      ID: #{c.userId} | Phone: {c.phone || 'N/A'}
                                    </span>
                                  </div>
                                  <Badge bg="secondary" pill className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 small">
                                    {c.vehicles?.length || 0} Vehicles
                                  </Badge>
                                </ListGroup.Item>
                              ))
                            )}
                          </ListGroup>
                        </Card>
                      )}
                    </div>
                  ) : (
                    // Customer Card Selected State
                    <div className="p-3 rounded border border-primary border-opacity-25 bg-primary bg-opacity-5 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <strong className="text-dark fs-6">{selectedCustomer.name}</strong>
                          <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25">
                            ID: #{selectedCustomer.userId}
                          </Badge>
                        </div>
                        <div className="small text-muted mt-1">
                          <i className="bi bi-envelope-fill me-1"></i> {selectedCustomer.email} 
                          {selectedCustomer.phone && (
                            <>
                              <span className="mx-2">|</span>
                              <i className="bi bi-telephone-fill me-1"></i> {selectedCustomer.phone}
                            </>
                          )}
                        </div>
                        {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {selectedCustomer.vehicles.map(v => (
                              <Badge key={v.vehicleId} bg="light" className="text-dark border border-light-subtle align-items-center py-1">
                                <i className="bi bi-car-front-fill me-1 text-info"></i>
                                {v.brand} {v.model} ({v.vehicleNumber})
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="small text-muted mt-1 fst-italic">No vehicles registered</div>
                        )}
                      </div>
                      <Button variant="outline-danger" size="sm" onClick={() => setSelectedCustomer(null)}>
                        Change Customer
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Inventory Selection Card */}
              <Card className="bg-white border-light-subtle shadow-sm flex-grow-1 d-flex flex-column overflow-hidden" style={{ minHeight: '380px' }}>
                <Card.Body className="d-flex flex-column p-4 overflow-hidden">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <i className="bi bi-gear-wide-connected text-success"></i>
                      Parts Inventory Catalogue
                    </h5>
                    <div style={{ width: '220px' }}>
                      <InputGroup size="sm">
                        <InputGroup.Text className="bg-transparent border-light-subtle text-secondary">
                          <i className="bi bi-funnel"></i>
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Filter parts..."
                          value={partSearch}
                          onChange={(e) => setPartSearch(e.target.value)}
                          className="bg-white text-dark border-light-subtle border-start-0 shadow-none ps-0"
                        />
                      </InputGroup>
                    </div>
                  </div>

                  <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '260px' }}>
                    {filteredParts.length === 0 ? (
                      <div className="text-center py-5 text-muted small">
                        No parts matching "{partSearch}" found.
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {filteredParts.map(part => {
                          const isLowStock = part.stockQuantity <= part.reorderLevel && part.stockQuantity > 0;
                          const isOut = part.stockQuantity === 0;

                          return (
                            <div 
                              key={part.partId} 
                              className="d-flex justify-content-between align-items-center p-3 border border-light-subtle rounded hover-bg-light"
                            >
                              <div style={{ maxWidth: '75%' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <strong className="text-dark small">{part.partName}</strong>
                                  <Badge bg="light" className="text-muted border border-light-subtle small px-1.5 py-0.5">
                                    {part.category}
                                  </Badge>
                                </div>
                                <div className="text-muted small mt-1 text-truncate" style={{ fontSize: '0.8rem' }}>
                                  {part.description || 'No description provided.'}
                                </div>
                                <div className="d-flex align-items-center gap-3 mt-2" style={{ fontSize: '0.8rem' }}>
                                  <span className="fw-semibold text-success">
                                    Rs. {part.price.toLocaleString()}
                                  </span>
                                  <span className="text-muted">
                                    Stock: <strong>{part.stockQuantity}</strong>
                                  </span>
                                  {isOut && <Badge bg="danger">Out of Stock</Badge>}
                                  {isLowStock && <Badge bg="warning" text="dark">Low Stock Alert</Badge>}
                                </div>
                              </div>
                              <Button
                                variant={isOut ? "outline-secondary" : "outline-primary"}
                                size="sm"
                                onClick={() => addToCart(part)}
                                disabled={isOut}
                                className="d-flex align-items-center gap-1"
                              >
                                <i className="bi bi-plus-lg"></i> Add
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>

            </div>
          </Col>

          {/* RIGHT: Active Order Cart Column */}
          <Col xs={12} lg={5} xl={4}>
            <Card className="bg-white text-dark border-light-subtle h-100 d-flex flex-column shadow-sm" style={{ minHeight: '500px' }}>
              <Card.Body className="d-flex flex-column p-4 h-100">
                <h5 className="mb-4 fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-cart-fill text-warning"></i>
                  Current Checkout Invoice
                </h5>

                <div className="flex-grow-1 mb-4 overflow-auto pe-1" style={{ maxHeight: 'calc(100vh - 460px)', minHeight: '220px' }}>
                  {cart.length === 0 ? (
                    <div className="text-center py-5 text-muted my-auto">
                      <i className="bi bi-cart text-muted fs-1 mb-2 d-block"></i>
                      <p className="fst-italic small mb-0">Invoice order is empty.</p>
                      <small className="text-muted">Add parts from the inventory list</small>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {cart.map((item) => (
                        <div key={item.partId} className="p-3 rounded border border-light-subtle bg-light">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="fw-semibold text-dark text-truncate me-2 small" style={{ maxWidth: '75%' }}>
                              {item.name}
                            </span>
                            <Button 
                              variant="link" 
                              className="text-danger p-0 border-0 fs-6 hover-text-dark" 
                              onClick={() => removeFromCart(item.partId)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                className="py-0 px-2 font-monospace"
                                onClick={() => updateQuantity(item.partId, -1)}
                              >
                                -
                              </Button>
                              <span className="fw-bold text-dark px-1 small">{item.quantity}</span>
                              <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                className="py-0 px-2 font-monospace"
                                onClick={() => updateQuantity(item.partId, 1)}
                              >
                                +
                              </Button>
                            </div>
                            <span className="fw-bold text-dark small">
                              Rs. {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-3 border-top border-light-subtle">
                  <div className="d-flex justify-content-between mb-2 small text-muted">
                    <span>Subtotal</span>
                    <span className="text-dark">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  
                  {hasLoyaltyDiscount && (
                    <div className="d-flex justify-content-between mb-2 text-success small">
                      <span>Loyalty Vehicle Discount (10%)</span>
                      <span>-Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between fw-bold fs-5 mt-3 mb-4 text-dark border-top border-light-subtle pt-2">
                    <span>Total Amount</span>
                    <span className="text-primary font-monospace">Rs. {finalTotal.toLocaleString()}</span>
                  </div>

                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handleCheckout}
                    className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2 shadow-sm" 
                    disabled={cart.length === 0}
                  >
                    <i className="bi bi-check2-circle"></i> Charge & Generate Invoice
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};
