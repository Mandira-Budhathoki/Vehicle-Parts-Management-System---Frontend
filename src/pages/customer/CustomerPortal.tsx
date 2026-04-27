import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import {
  getProfile,
  updateProfile,
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  type UserProfile,
  type Vehicle,
    type VehicleData,
} from '../../services/authApi';

export const CustomerPortal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Edit profile modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ name: '', email: '', phone: '', password: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Vehicle modal (add/edit)
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleFormData, setVehicleFormData] = useState<VehicleData>({
    vehicleNumber: '', model: '', brand: '', year: new Date().getFullYear(),
  });
  const [savingVehicle, setSavingVehicle] = useState(false);



  const userId = user?.id;

  // Fetch profile on mount
  useEffect(() => {
    if (!userId) return;
    fetchProfile();
    fetchVehicles();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;
    setLoadingProfile(true);
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch (err: any) {
      showToast('Failed to load profile.', 'danger');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchVehicles = async () => {
    if (!userId) return;
    setLoadingVehicles(true);
    try {
      const data = await getVehicles(userId);
      setVehicles(data);
    } catch (err: any) {
      showToast('Failed to load vehicles.', 'danger');
    } finally {
      setLoadingVehicles(false);
    }
  };



  // ============ Profile Edit Handlers ============
  const openEditProfile = () => {
    if (profile) {
      setEditProfileData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        password: '',
      });
    }
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSavingProfile(true);
    try {
      await updateProfile(userId, editProfileData);
      showToast('Profile updated successfully!', 'success');
      setShowEditProfile(false);
      await fetchProfile();
      // Update auth context with new data
      updateUser({ name: editProfileData.name, email: editProfileData.email, phone: editProfileData.phone });
    } catch (err: any) {
      showToast('Failed to update profile.', 'danger');
    } finally {
      setSavingProfile(false);
    }
  };

  // ============ Vehicle Handlers ============
  const openAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleFormData({ vehicleNumber: '', model: '', brand: '', year: new Date().getFullYear() });
    setShowVehicleModal(true);
  };

  const openEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v);
    setVehicleFormData({
      vehicleNumber: v.vehicleNumber,
      model: v.model,
      brand: v.brand,
      year: v.year,
    });
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSavingVehicle(true);
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.vehicleId, vehicleFormData);
        showToast('Vehicle updated successfully!', 'success');
      } else {
        await addVehicle(userId, vehicleFormData);
        showToast('Vehicle added successfully!', 'success');
      }
      setShowVehicleModal(false);
      await fetchVehicles();
    } catch (err: any) {
      showToast(err.message || 'Failed to save vehicle.', 'danger');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    const confirmed = await confirm({
      title: 'Delete Vehicle',
      message: 'Are you sure you want to delete this vehicle? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      await deleteVehicle(vehicleId);
      showToast('Vehicle deleted successfully!', 'success');
      await fetchVehicles();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete vehicle.', 'danger');
    }
  };

  // Loading state
  if (loadingProfile || loadingVehicles) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-secondary">Loading your dashboard...</span>
      </div>
    );
  }

  const displayName = profile?.name || user?.name || 'Customer';

  return (
    <div className="animate-fade-in customer-portal">


      {/* Welcome Banner */}
      <Card className="mb-4 text-white border-0" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div>
            <h2 className="fw-bold mb-2">Welcome back, {displayName}!</h2>
            <p className="mb-0 text-white text-opacity-75">Manage your profile and vehicles from this portal.</p>
          </div>

          <div className="d-flex align-items-center gap-3 p-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <i className="bi bi-star-fill text-warning fs-3"></i>
            <div>
              <div className="fw-bold fs-5">Loyalty Member</div>
              <div className="small text-white text-opacity-75">10% Discount Active</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {/* Profile Card */}
        <Col xs={12} md={6}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="p-4 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">
                  <i className="bi bi-person-circle me-2 text-info"></i>My Profile
                </h4>
                <Button variant="outline-info" size="sm" onClick={openEditProfile}>
                  <i className="bi bi-pencil-square me-1"></i>Edit
                </Button>
              </div>

              {profile ? (
                <div className="d-flex flex-column gap-3 flex-grow-1">
                  <div>
                    <div className="text-secondary small">Full Name</div>
                    <div className="fw-semibold fs-5">{profile.name}</div>
                  </div>
                  <div>
                    <div className="text-secondary small">Email</div>
                    <div className="fw-semibold">{profile.email}</div>
                  </div>
                  <div>
                    <div className="text-secondary small">Phone</div>
                    <div className="fw-semibold">{profile.phone || 'Not set'}</div>
                  </div>
                  <div>
                    <div className="text-secondary small">User ID</div>
                    <Badge bg="secondary">{profile.userId}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">Profile not found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Vehicles Card */}
        <Col xs={12} md={6}>
          <Card className="bg-dark text-light border-secondary h-100">
            <Card.Body className="p-4 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">
                  <i className="bi bi-truck me-2 text-success"></i>My Vehicles
                </h4>
                <Button variant="outline-success" size="sm" onClick={openAddVehicle}>
                  <i className="bi bi-plus-lg me-1"></i>Add Vehicle
                </Button>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center text-secondary py-4 flex-grow-1 d-flex flex-column justify-content-center">
                  <i className="bi bi-truck fs-1 mb-2"></i>
                  <p>No vehicles registered yet.</p>
                  <Button variant="outline-light" size="sm" onClick={openAddVehicle}>
                    Add Your First Vehicle
                  </Button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 flex-grow-1">
                  {vehicles.map((v) => (
                    <div key={v.vehicleId} className="p-3 rounded border border-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-bold">{v.brand} {v.model}</div>
                          <div className="text-secondary small">
                            <Badge bg="info" className="me-2">{v.vehicleNumber}</Badge>
                            Year: {v.year}
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <Button variant="outline-light" size="sm" onClick={() => openEditVehicle(v)}>
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteVehicle(v.vehicleId)}>
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ============ Edit Profile Modal ============ */}
      <Modal show={showEditProfile} onHide={() => setShowEditProfile(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProfile}>
          <Modal.Body className="bg-dark text-light">
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={editProfileData.name}
                onChange={(e) => setEditProfileData(d => ({ ...d, name: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={editProfileData.email}
                onChange={(e) => setEditProfileData(d => ({ ...d, email: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={editProfileData.phone}
                onChange={(e) => setEditProfileData(d => ({ ...d, phone: e.target.value }))}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-secondary">
            <Button variant="secondary" onClick={() => setShowEditProfile(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={savingProfile}>
              {savingProfile ? <><Spinner size="sm" className="me-1" />Saving...</> : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ============ Add/Edit Vehicle Modal ============ */}
      <Modal show={showVehicleModal} onHide={() => setShowVehicleModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveVehicle}>
          <Modal.Body className="bg-dark text-light">
            <Form.Group className="mb-3">
              <Form.Label>Vehicle Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. BA 1 JA 1234"
                value={vehicleFormData.vehicleNumber}
                onChange={(e) => setVehicleFormData(d => ({ ...d, vehicleNumber: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Toyota"
                value={vehicleFormData.brand}
                onChange={(e) => setVehicleFormData(d => ({ ...d, brand: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Model</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Camry"
                value={vehicleFormData.model}
                onChange={(e) => setVehicleFormData(d => ({ ...d, model: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="number"
                min="1900"
                max="2099"
                value={vehicleFormData.year}
                onChange={(e) => setVehicleFormData(d => ({ ...d, year: parseInt(e.target.value) || 0 }))}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-secondary">
            <Button variant="secondary" onClick={() => setShowVehicleModal(false)}>Cancel</Button>
            <Button variant="success" type="submit" disabled={savingVehicle}>
              {savingVehicle ? <><Spinner size="sm" className="me-1" />Saving...</> : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

