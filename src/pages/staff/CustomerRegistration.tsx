import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { registerCustomer, addVehicle } from '../../services/authApi';

export const CustomerRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    vehicleModel: '',
    vehicleBrand: '',
    vehicleYear: new Date().getFullYear().toString(),
    vehicleNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const registeredEmail = formData.email;
    const registeredPassword = formData.password;

    try {
      // 1. Register the Customer (using the custom password provided)
      const registerRes = await registerCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      console.log('Customer registration response:', registerRes);

      const newUserId = registerRes.userId || (registerRes as any).UserId || (registerRes as any).id || (registerRes as any).Id;

      // 2. Register the Vehicle linked to the new Customer
      await addVehicle(newUserId, {
        vehicleNumber: formData.vehicleNumber,
        model: formData.vehicleModel,
        brand: formData.vehicleBrand,
        year: parseInt(formData.vehicleYear),
      });

      setSuccess(`Customer and Vehicle successfully registered! (Login Email: ${registeredEmail})`);
      
      // Clear form
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        vehicleModel: '',
        vehicleBrand: '',
        vehicleYear: new Date().getFullYear().toString(),
        vehicleNumber: '',
      });
      setShowPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to register customer. Please check the details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex align-items-center gap-3 mb-4">
        <i className="bi bi-person-plus fs-3 text-secondary"></i>
        <h2 className="mb-0 text-light fw-bold">Register Walk-in Customer</h2>
      </div>

      <Card className="bg-dark text-light border-secondary" style={{ maxWidth: '800px' }}>
        <Card.Body className="p-4">
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Full Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="e.g. Jane Smith" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Phone Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="123-456-7890" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Email Address <span className="text-danger">*</span></Form.Label>
                  <Form.Control required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="jane@example.com" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Password <span className="text-danger">*</span></Form.Label>
                  <InputGroup>
                    <Form.Control 
                      required 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Set login password" 
                      className="bg-dark text-light border-secondary shadow-none" 
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="border-secondary text-secondary bg-dark shadow-none"
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4 mb-3 pt-4 border-top border-secondary fw-bold">Vehicle Information</h5>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Vehicle Brand <span className="text-danger">*</span></Form.Label>
                  <Form.Control required name="vehicleBrand" value={formData.vehicleBrand} onChange={handleChange} type="text" placeholder="e.g. Toyota" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Vehicle Model <span className="text-danger">*</span></Form.Label>
                  <Form.Control required name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} type="text" placeholder="e.g. Camry" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Vehicle Year <span className="text-danger">*</span></Form.Label>
                  <Form.Control required name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} type="number" min="1900" max={new Date().getFullYear() + 1} className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-secondary">Registration Number (Plate) <span className="text-danger">*</span></Form.Label>
                  <Form.Control required name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} type="text" placeholder="ABC-1234" className="bg-dark text-light border-secondary shadow-none" />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit" disabled={loading} className="w-100 py-2 fw-bold">
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Registering...
                </>
              ) : (
                'Register Customer in System'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};
