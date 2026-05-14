import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import {
  getAllParts,
  createPart,
  updatePart,
  deletePart,
  type Part,
  type CreatePartData,
} from '../../services/partApi';

const CATEGORIES = [
  'Engine',
  'Transmission & Drivetrain',
  'Brake System',
  'Suspension & Steering',
  'Electrical',
  'Wheels & Exterior',
  'Fluids & Consumables',
  'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Engine': 'danger',
  'Transmission & Drivetrain': 'warning',
  'Brake System': 'primary',
  'Suspension & Steering': 'info',
  'Electrical': 'success',
  'Wheels & Exterior': 'secondary',
  'Fluids & Consumables': 'primary',
  'Other': 'secondary',
};

const emptyForm: CreatePartData = {
  partName: '',
  category: 'Engine',
  description: '',
  price: 0,
  stockQuantity: 0,
  reorderLevel: 5,
  vendorId: null,
};

export const PartsManagement: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState<CreatePartData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirm state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPart, setDeletingPart] = useState<Part | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchParts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllParts();
      setParts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const filteredParts = filterCategory === 'All'
    ? parts
    : parts.filter(p => p.category === filterCategory);

  const handleAddNew = () => {
    setEditingPart(null);
    setFormData(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setFormData({
      partName: part.partName,
      category: part.category || 'Other',
      description: part.description,
      price: part.price,
      stockQuantity: part.stockQuantity,
      reorderLevel: part.reorderLevel,
      vendorId: part.vendorId ?? null,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.partName.trim()) { setFormError('Part name is required.'); return; }
    if (!formData.category) { setFormError('Category is required.'); return; }
    if (formData.price <= 0) { setFormError('Price must be greater than 0.'); return; }
    try {
      setSaving(true);
      setFormError('');
      if (editingPart) {
        await updatePart(editingPart.partId, formData);
      } else {
        await createPart(formData);
      }
      setShowModal(false);
      await fetchParts();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save part.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (part: Part) => {
    setDeletingPart(part);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPart) return;
    try {
      setDeleting(true);
      await deletePart(deletingPart.partId);
      setShowDeleteModal(false);
      setDeletingPart(null);
      await fetchParts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete part.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">
          <i className="bi bi-box-seam me-2 text-primary"></i>Parts Inventory
        </h2>
        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={handleAddNew}>
          <i className="bi bi-cart-plus"></i> Purchase New Part
        </Button>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Card className="bg-dark border-secondary text-center p-3">
            <div className="fs-2 fw-bold text-primary">{parts.length}</div>
            <div className="text-secondary small">Total Parts</div>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card className="bg-dark border-secondary text-center p-3">
            <div className="fs-2 fw-bold text-danger">
              {parts.filter(p => p.stockQuantity <= p.reorderLevel).length}
            </div>
            <div className="text-secondary small">Low Stock</div>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card className="bg-dark border-secondary text-center p-3">
            <div className="fs-2 fw-bold text-success">
              {parts.filter(p => p.stockQuantity > p.reorderLevel).length}
            </div>
            <div className="text-secondary small">In Stock</div>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card className="bg-dark border-secondary text-center p-3">
            <div className="fs-2 fw-bold text-warning">
              {new Set(parts.map(p => p.category)).size}
            </div>
            <div className="text-secondary small">Categories</div>
          </Card>
        </div>
      </div>

      {/* Filter by Category */}
      <div className="d-flex gap-2 flex-wrap mb-3">
        {['All', ...CATEGORIES].map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={filterCategory === cat ? 'primary' : 'outline-secondary'}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Table */}
      <Card className="bg-white text-dark shadow-sm border-0">
        <Card.Body className="p-0 overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary mt-2">Loading parts...</p>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-box fs-1 mb-3 d-block"></i>
              {filterCategory === 'All' ? 'No parts found. Click "Purchase New Part" to get started.' : `No parts in "${filterCategory}" category.`}
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="bg-light text-dark">
                <tr>
                  <th className="p-3 border-bottom-0">S.No</th>
                  <th className="p-3 border-bottom-0">Part Name</th>
                  <th className="p-3 border-bottom-0">Category</th>
                  <th className="p-3 border-bottom-0">Description</th>
                  <th className="p-3 border-bottom-0">Price (Rs.)</th>
                  <th className="p-3 border-bottom-0">Stock</th>
                  <th className="p-3 border-bottom-0">Status</th>
                  <th className="p-3 border-bottom-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((p, index) => (
                  <tr key={p.partId}>
                    <td className="p-3 align-middle text-muted">{index + 1}</td>
                    <td className="p-3 align-middle fw-semibold">{p.partName}</td>
                    <td className="p-3 align-middle">
                      <Badge bg={CATEGORY_COLORS[p.category] || 'secondary'} className="px-2 py-1">
                        {p.category || 'Uncategorized'}
                      </Badge>
                    </td>
                    <td className="p-3 align-middle text-muted" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.description || '—'}
                    </td>
                    <td className="p-3 align-middle fw-medium text-success">
                      Rs. {Number(p.price).toLocaleString()}
                    </td>
                    <td className="p-3 align-middle">{p.stockQuantity}</td>
                    <td className="p-3 align-middle">
                      {p.stockQuantity <= p.reorderLevel ? (
                        <Badge bg="danger" className="d-inline-flex align-items-center gap-1 px-2 py-1">
                          <i className="bi bi-exclamation-triangle-fill"></i> Low Stock
                        </Badge>
                      ) : (
                        <Badge bg="success" className="px-2 py-1">In Stock</Badge>
                      )}
                    </td>
                    <td className="p-3 align-middle text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button variant="outline-info" size="sm" className="border-0" title="Edit" onClick={() => handleEdit(p)}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" className="border-0" title="Delete" onClick={() => handleDeleteClick(p)}>
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered data-bs-theme="dark">
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>
            <i className={`bi ${editingPart ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
            {editingPart ? 'Edit Part' : 'Purchase New Part'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Part Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Brake Pads"
                value={formData.partName}
                onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-dark text-light border-secondary"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Short description of the part"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
            <div className="row">
              <Form.Group className="mb-3 col-6">
                <Form.Label>Price (Rs.) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={formData.price === 0 ? '' : formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  className="bg-dark text-light border-secondary"
                />
              </Form.Group>
              <Form.Group className="mb-3 col-6">
                <Form.Label>Stock Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={formData.stockQuantity === 0 ? '' : formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  className="bg-dark text-light border-secondary"
                />
              </Form.Group>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Reorder Level</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={formData.reorderLevel === 0 ? '' : formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                className="bg-dark text-light border-secondary"
              />
              <Form.Text className="text-secondary">Low Stock alert shows when stock ≤ this number</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <><Spinner size="sm" className="me-1" />Saving...</> : (editingPart ? 'Update Part' : 'Purchase Part')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered data-bs-theme="dark" size="sm">
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <div className="d-flex align-items-start gap-3">
            <i className="bi bi-exclamation-triangle-fill text-warning fs-3"></i>
            <div>Are you sure you want to delete <strong>{deletingPart?.partName}</strong>? This cannot be undone.</div>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? <><Spinner size="sm" className="me-1" />Deleting...</> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
