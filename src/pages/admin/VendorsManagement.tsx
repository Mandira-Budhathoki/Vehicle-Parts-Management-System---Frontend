import { useState, useEffect, type FC } from 'react';
import { Card, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { getVendors, createVendor, updateVendor, deleteVendor, type Vendor } from '../../services/vendorService';

export const VendorsManagement: FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    vendorName: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await getVendors();
      setVendors(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load vendors.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleShowModal = (vendor?: Vendor) => {
    if (vendor) {
      setIsEditing(true);
      setSelectedId(vendor.vendorId);
      setFormData({
        vendorName: vendor.vendorName,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address
      });
    } else {
      setIsEditing(false);
      setSelectedId(null);
      setFormData({
        vendorName: '',
        email: '',
        phone: '',
        address: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedId) {
        await updateVendor(selectedId, formData);
      } else {
        await createVendor(formData);
      }
      handleCloseModal();
      fetchVendors();
    } catch (err: any) {
      alert(err.response?.data || 'An error occurred while saving.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteVendor(id);
        fetchVendors();
      } catch (err: any) {
        alert('Failed to delete vendor.');
      }
    }
  };

  return (
    <div className="animate-fade-in p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">Vendors Management</h2>
        <Button variant="primary" onClick={() => handleShowModal()} className="d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Add New Vendor
        </Button>
      </div>
      {error && <div className="alert alert-danger mx-4 mb-3">{error}</div>}

      <Card className="bg-dark text-light border-secondary shadow-lg">
        <Card.Body className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-5 text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-secondary">Loading vendors...</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="bg-black bg-opacity-20">
                <tr>
                  <th className="p-3 border-bottom-0">Vendor Name</th>
                  <th className="p-3 border-bottom-0">Email</th>
                  <th className="p-3 border-bottom-0">Phone</th>
                  <th className="p-3 border-bottom-0">Address</th>
                  <th className="p-3 border-bottom-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-5 text-center text-secondary italic">No vendors found.</td>
                  </tr>
                ) : (
                  vendors.map(v => (
                    <tr key={v.vendorId}>
                      <td className="p-3 border-secondary align-middle">{v.vendorName}</td>
                      <td className="p-3 border-secondary align-middle text-secondary">{v.email}</td>
                      <td className="p-3 border-secondary align-middle text-secondary">{v.phone}</td>
                      <td className="p-3 border-secondary align-middle text-secondary">{v.address}</td>
                      <td className="p-3 border-secondary align-middle text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="border-0"
                            onClick={() => handleShowModal(v)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="border-0"
                            onClick={() => handleDelete(v.vendorId)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered contentClassName="bg-dark text-light border-secondary">
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Vendor Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter vendor name"
                className="bg-secondary bg-opacity-10 text-light border-secondary shadow-none"
                value={formData.vendorName}
                onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                className="bg-secondary bg-opacity-10 text-light border-secondary shadow-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone"
                className="bg-secondary bg-opacity-10 text-light border-secondary shadow-none"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter address"
                className="bg-secondary bg-opacity-10 text-light border-secondary shadow-none"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="outline-secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{isEditing ? 'Save Changes' : 'Add Vendor'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};
