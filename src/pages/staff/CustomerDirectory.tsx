import React, { useState, useEffect } from 'react';
import { Card, Form, InputGroup, Row, Col, Button, Badge, Modal, Nav, Spinner, Table } from 'react-bootstrap';
import { getAllCustomers, getCustomerFullProfile, type CustomerResponse, type CustomerFullProfile } from '../../services/authApi';
import { useToast } from '../../context/ToastContext';

type ProfileTab = 'details' | 'vehicles' | 'sales' | 'appointments' | 'requests';

export const CustomerDirectory: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Profile Modal State
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('details');
  const [profile, setProfile] = useState<CustomerFullProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch all customers on mount
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (err: any) {
      showToast('Failed to load customers from database.', 'danger');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch full customer details when modal opens
  const handleOpenProfile = async (customerId: number) => {
    setActiveTab('details');
    setShowModal(true);
    setLoadingProfile(true);
    setProfile(null);
    try {
      const data = await getCustomerFullProfile(customerId);
      setProfile(data);
    } catch (err: any) {
      showToast('Failed to load full customer profile details.', 'danger');
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    const matchesName = c.name.toLowerCase().includes(term);
    const matchesEmail = c.email.toLowerCase().includes(term);
    const matchesPhone = c.phone?.includes(term);
    const matchesVehicle = c.vehicles?.some(v => 
      v.vehicleNumber.toLowerCase().includes(term) || 
      v.brand.toLowerCase().includes(term) || 
      v.model.toLowerCase().includes(term)
    );
    return matchesName || matchesEmail || matchesPhone || matchesVehicle;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'completed' || s === 'approved') return <Badge bg="success">Approved/Paid</Badge>;
    if (s === 'pending' || s === 'credit') return <Badge bg="warning" text="dark">Pending/Credit</Badge>;
    return <Badge bg="danger">Cancelled/Rejected</Badge>;
  };

  return (
    <div className="animate-fade-in p-2">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Customer Directory</h2>
          <p className="text-muted mb-0 small">Manage, view histories, and inspect vehicles registered by customers</p>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={fetchCustomers} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="bg-white border-light-subtle mb-4 shadow-sm">
        <Card.Body className="p-3">
          <InputGroup>
            <InputGroup.Text className="bg-transparent border-light-subtle text-secondary">
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by name, email, phone, vehicle number, model, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white text-dark border-light-subtle border-start-0 shadow-none ps-0"
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Main Content Grid */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3 small">Retrieving customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="bg-white border-light-subtle border-dashed p-5 text-center shadow-sm">
          <i className="bi bi-people-fill text-muted fs-1 mb-3"></i>
          <h5 className="text-dark fw-bold">No Customers Found</h5>
          <p className="text-muted small">Try adjusting your search queries or adding new customers.</p>
        </Card>
      ) : (
        <Row xs={1} md={2} xl={3} className="g-4">
          {filteredCustomers.map(c => (
            <Col key={c.userId}>
              <Card 
                className="bg-white text-dark border-light-subtle h-100 shadow-sm transition-transform hover-translate-y hover-shadow-md"
                style={{ transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                onClick={() => handleOpenProfile(c.userId)}
              >
                <Card.Body className="d-flex flex-column p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h4 className="fw-bold mb-0 text-dark fs-5">{c.name}</h4>
                      <small className="text-primary font-monospace">ID: #{c.userId}</small>
                    </div>
                    <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                      {c.vehicles?.length || 0} Cars
                    </Badge>
                  </div>
                  
                  <p className="text-muted small mb-3 text-truncate">
                    <i className="bi bi-envelope-fill me-2 text-muted"></i>{c.email} <br />
                    <i className="bi bi-telephone-fill me-2 text-muted"></i>{c.phone || 'No phone'}
                  </p>

                  <div className="mb-4 flex-grow-1">
                    <span className="text-muted small d-block mb-2">Registered Vehicles</span>
                    <div className="d-flex flex-wrap gap-2">
                      {c.vehicles && c.vehicles.length > 0 ? (
                        c.vehicles.map(v => (
                          <Badge key={v.vehicleId} bg="light" className="text-dark border border-light-subtle px-2 py-1 align-items-center gap-1">
                            <i className="bi bi-car-front-fill me-1 text-info"></i>
                            {v.brand} {v.model} ({v.vehicleNumber})
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted fst-italic small">No vehicles registered</span>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between border-top border-light-subtle pt-3 mt-auto">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="d-flex align-items-center gap-1 border-0 bg-transparent text-primary hover-text-dark px-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProfile(c.userId);
                      }}
                    >
                      <i className="bi bi-eye"></i> View Full Customer Profile
                    </Button>
                    <span className="text-muted small align-self-center">Details &rarr;</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Multi-Tab Navigated Customer Profile Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        size="lg" 
        centered 
        contentClassName="bg-white text-dark border border-secondary border-opacity-25 shadow-lg"
      >
        <Modal.Header closeButton className="border-light-subtle px-4 py-3 bg-light">
          <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2 text-dark">
            <i className="bi bi-person-badge-fill text-primary"></i>
            {loadingProfile ? 'Loading Customer Profile...' : `Profile for ${profile?.name || 'Customer'}`}
          </Modal.Title>
        </Modal.Header>

        {loadingProfile ? (
          <Modal.Body className="p-5 text-center bg-white">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3 mb-0">Eager-loading customer data, vehicles, sales invoices, appointments, and requests...</p>
          </Modal.Body>
        ) : !profile ? (
          <Modal.Body className="p-5 text-center bg-white">
            <i className="bi bi-exclamation-triangle text-danger fs-1 mb-3"></i>
            <h5 className="text-dark">Failed to Load Profile</h5>
            <p className="text-muted small">We encountered an issue fetching this customer's data.</p>
          </Modal.Body>
        ) : (
          <>
            {/* Modal Body with internal Multi-Tab Navigation */}
            <Modal.Body className="p-0 bg-white">
              <Row className="g-0">
                {/* Left Navigation Sidebar */}
                <Col xs={12} md={3} className="bg-light border-end border-light-subtle p-3">
                  <Nav variant="pills" className="flex-column gap-2" activeKey={activeTab} onSelect={(k) => setActiveTab(k as ProfileTab)}>
                    <Nav.Item>
                      <Nav.Link eventKey="details" className="d-flex align-items-center gap-2 px-3 py-2 rounded">
                        <i className="bi bi-person-lines-fill text-primary"></i>
                        <span className="text-dark">Details</span>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="vehicles" className="d-flex align-items-center gap-2 px-3 py-2 rounded">
                        <i className="bi bi-car-front-fill text-info"></i>
                        <span className="text-dark">Vehicles ({profile.vehicles?.length || 0})</span>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="sales" className="d-flex align-items-center gap-2 px-3 py-2 rounded">
                        <i className="bi bi-cart-check-fill text-success"></i>
                        <span className="text-dark">Purchases ({profile.salesHistory?.length || 0})</span>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="appointments" className="d-flex align-items-center gap-2 px-3 py-2 rounded">
                        <i className="bi bi-calendar3 text-warning"></i>
                        <span className="text-dark">Appointments ({profile.appointments?.length || 0})</span>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="requests" className="d-flex align-items-center gap-2 px-3 py-2 rounded">
                        <i className="bi bi-chat-left-quote-fill text-danger"></i>
                        <span className="text-dark">Part Requests ({profile.partRequests?.length || 0})</span>
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>

                {/* Right Content Pane representing the navigated "pages" */}
                <Col xs={12} md={9} className="p-4 bg-white" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  
                  {/* --- DETAILS PAGE --- */}
                  {activeTab === 'details' && (
                    <div className="animate-fade-in">
                      <h4 className="fw-bold mb-3 border-bottom border-light-subtle pb-2 text-primary">General Contact Details</h4>
                      <Table borderless className="text-dark">
                        <tbody>
                          <tr>
                            <td className="text-muted fw-semibold ps-0" style={{ width: '35%' }}>Customer ID</td>
                            <td className="font-monospace text-primary fw-bold">#{profile.userId}</td>
                          </tr>
                          <tr>
                            <td className="text-muted fw-semibold ps-0">Full Name</td>
                            <td className="fw-bold">{profile.name}</td>
                          </tr>
                          <tr>
                            <td className="text-muted fw-semibold ps-0">Email Address</td>
                            <td><a href={`mailto:${profile.email}`} className="text-dark decoration-none">{profile.email}</a></td>
                          </tr>
                          <tr>
                            <td className="text-muted fw-semibold ps-0">Phone Number</td>
                            <td className="text-dark">{profile.phone || <span className="text-muted italic">None</span>}</td>
                          </tr>
                          <tr>
                            <td className="text-muted fw-semibold ps-0">Total Purchases</td>
                            <td>
                              <Badge bg="success" className="px-2 py-1 text-white">
                                Rs. {profile.salesHistory?.reduce((acc, s) => acc + s.finalAmount, 0).toLocaleString() || 0}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted fw-semibold ps-0">Total Invoices</td>
                            <td>{profile.salesHistory?.length || 0} total sales invoices</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  )}

                  {/* --- VEHICLES PAGE --- */}
                  {activeTab === 'vehicles' && (
                    <div className="animate-fade-in">
                      <h4 className="fw-bold mb-3 border-bottom border-light-subtle pb-2 text-info">Registered Vehicles</h4>
                      {profile.vehicles?.length === 0 ? (
                        <p className="text-muted fst-italic py-3">No vehicles registered under this customer yet.</p>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {profile.vehicles.map(v => (
                            <Card key={v.vehicleId} className="bg-light border-light-subtle text-dark">
                              <Card.Body className="d-flex align-items-center gap-3">
                                <div className="rounded bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                                  <i className="bi bi-car-front-fill fs-4"></i>
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-1 text-dark">{v.brand} {v.model}</h6>
                                  <div className="small text-muted">
                                    <span className="me-3"><strong className="text-dark">License:</strong> {v.vehicleNumber}</span>
                                    <span><strong className="text-dark">Year:</strong> {v.year}</span>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- PURCHASES PAGE --- */}
                  {activeTab === 'sales' && (
                    <div className="animate-fade-in">
                      <h4 className="fw-bold mb-3 border-bottom border-light-subtle pb-2 text-success">Parts Purchase & Sales Invoices</h4>
                      {profile.salesHistory?.length === 0 ? (
                        <p className="text-muted fst-italic py-3">No purchases found for this customer.</p>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {profile.salesHistory.map(s => (
                            <Card key={s.salesId} className="bg-light border-light-subtle text-dark">
                              <Card.Header className="bg-white border-bottom border-light-subtle d-flex justify-content-between align-items-center py-2 px-3">
                                <span className="fw-bold text-success font-monospace">Invoice #{s.salesId}</span>
                                <small className="text-muted">{new Date(s.date).toLocaleDateString()}</small>
                              </Card.Header>
                              <Card.Body className="p-3">
                                <div className="mb-2">
                                  {s.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="small d-flex justify-content-between border-bottom border-light-subtle border-opacity-25 py-1">
                                      <span className="text-dark">{item.quantity}x {item.partName}</span>
                                      <span className="text-muted">Rs. {item.price.toLocaleString()} ea</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="d-flex justify-content-between align-items-center pt-2">
                                  {getStatusBadge(s.paymentStatus)}
                                  <div className="text-end">
                                    {s.discount > 0 && <small className="text-muted d-block">Discount: -Rs. {s.discount.toLocaleString()}</small>}
                                    <strong className="text-success fs-6">Total: Rs. {s.finalAmount.toLocaleString()}</strong>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- APPOINTMENTS PAGE --- */}
                  {activeTab === 'appointments' && (
                    <div className="animate-fade-in">
                      <h4 className="fw-bold mb-3 border-bottom border-light-subtle pb-2 text-warning">Service Appointments</h4>
                      {profile.appointments?.length === 0 ? (
                        <p className="text-muted fst-italic py-3">No appointments booked by this customer.</p>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {profile.appointments.map(a => (
                            <Card key={a.appointmentId} className="bg-light border-light-subtle text-dark">
                              <Card.Header className="bg-white border-bottom border-light-subtle d-flex justify-content-between align-items-center py-2 px-3">
                                <span className="fw-semibold text-warning">{a.serviceType}</span>
                                <small className="text-muted">{new Date(a.date).toLocaleDateString()} {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                              </Card.Header>
                              <Card.Body className="p-3">
                                <div className="small text-muted mb-2">
                                  <strong>Vehicle:</strong> {a.brand} {a.model} ({a.vehicleNumber})
                                </div>
                                {a.notes && (
                                  <div className="p-2 rounded bg-white border border-light-subtle text-muted small mb-3">
                                    <strong className="text-dark">Notes:</strong> {a.notes}
                                  </div>
                                )}
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="small text-muted">ID: #{a.appointmentId}</span>
                                  {getStatusBadge(a.status)}
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- PART REQUESTS PAGE --- */}
                  {activeTab === 'requests' && (
                    <div className="animate-fade-in">
                      <h4 className="fw-bold mb-3 border-bottom border-light-subtle pb-2 text-danger">Unavailable Part Requests</h4>
                      {profile.partRequests?.length === 0 ? (
                        <p className="text-muted fst-italic py-3">No part requests submitted by this customer.</p>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {profile.partRequests.map(r => (
                            <Card key={r.requestId} className="bg-light border-light-subtle text-dark">
                              <Card.Header className="bg-white border-bottom border-light-subtle d-flex justify-content-between align-items-center py-2 px-3">
                                <span className="fw-bold text-dark">{r.partName}</span>
                                <small className="text-muted">{new Date(r.requestDate).toLocaleDateString()}</small>
                              </Card.Header>
                              <Card.Body className="p-3">
                                {r.notes && (
                                  <p className="text-muted small mb-3">
                                    <strong className="text-dark">Description:</strong> {r.notes}
                                  </p>
                                )}
                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="small text-muted">ID: #{r.requestId}</span>
                                  {getStatusBadge(r.status)}
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </Col>
              </Row>
            </Modal.Body>

            <Modal.Footer className="border-light-subtle px-4 py-3 bg-light justify-content-end">
              <Button variant="outline-secondary" size="sm" onClick={() => setShowModal(false)}>
                Close Profile
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};
