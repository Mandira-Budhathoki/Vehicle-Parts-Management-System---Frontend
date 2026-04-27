import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { getStaff, registerStaff, updateStaff, deleteStaff, type User } from '../../services/staffService';

export const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'STAFF'
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await getStaff();
      setStaff(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load staff members.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleShowModal = (member?: User) => {
    if (member) {
      setIsEditing(true);
      setSelectedId(member.userId);
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        role: member.role.toUpperCase(),
        password: '' // Don't show password on edit
      });
    } else {
      setIsEditing(false);
      setSelectedId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'STAFF'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedId) {
        await updateStaff(selectedId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        });
      } else {
        await registerStaff(formData);
      }
      handleCloseModal();
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data || 'An error occurred while saving.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
        fetchStaff();
      } catch (err: any) {
        alert('Failed to delete staff member.');
      }
    }
  };

  return (
    <div className="animate-fade-in p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">Staff Management</h2>
        <Button variant="primary" onClick={() => handleShowModal()} className="d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Register New Staff
        </Button>
      </div>

      <Card className="bg-dark text-light border-secondary shadow-lg">
        <Card.Body className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-5 text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-secondary">Loading staff members...</p>
            </div>
          ) : (
            <Table hover variant="dark" responsive className="mb-0">
              <thead className="bg-black bg-opacity-20">
                <tr>
                  <th className="p-3 border-bottom-0">Name</th>
                  <th className="p-3 border-bottom-0">Email</th>
                  <th className="p-3 border-bottom-0">Phone</th>
                  <th className="p-3 border-bottom-0">Role</th>
                  <th className="p-3 border-bottom-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-5 text-center text-secondary italic">No staff members found.</td>
                  </tr>
                ) : (
                  staff.map(u => (
                    <tr key={u.userId}>
                      <td className="p-3 border-secondary align-middle">{u.name}</td>
                      <td className="p-3 border-secondary align-middle text-secondary">{u.email}</td>
                      <td className="p-3 border-secondary align-middle text-secondary">{u.phone || '-'}</td>
                      <td className="p-3 border-secondary align-middle">
                        <Badge bg={u.role.toUpperCase() === 'ADMIN' ? 'danger' : 'info'} text={u.role.toUpperCase() === 'ADMIN' ? 'light' : 'dark'} className="px-2 py-1 text-uppercase">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3 border-secondary align-middle text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="border-0"
                            onClick={() => handleShowModal(u)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="border-0"
                            onClick={() => handleDelete(u.userId)}
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

      {/* Register/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered contentClassName="bg-dark text-light border-secondary">
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title>{isEditing ? 'Edit Staff Member' : 'Register New Staff'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                className="bg-secondary bg-opacity-10 text-light border-secondary shadow-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              />
            </Form.Group>
            {!isEditing && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  className="bg-secondary bg-opacity-10 text-light border-secondary shadow-none"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                className="bg-secondary bg-opacity-10 text-light border-secondary shadow-none"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="outline-secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{isEditing ? 'Save Changes' : 'Register Staff'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};
