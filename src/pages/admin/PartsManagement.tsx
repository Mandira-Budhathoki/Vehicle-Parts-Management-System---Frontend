import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { getAllParts, createPart, updatePart, deletePart, Part, CreatePartData } from '../../services/partApi';

export const PartsManagement: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState<CreatePartData>({
    partName: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    reorderLevel: 10,
    vendorId: null
  });

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const loadParts = async () => {
    try {
      setLoading(true);
      const data = await getAllParts();
      setParts(data);
    } catch (error) {
      showToast('Failed to load parts', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, []);

  const handleOpenModal = (part?: Part) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        partName: part.partName,
        description: part.description || '',
        price: part.price,
        stockQuantity: part.stockQuantity,
        reorderLevel: part.reorderLevel,
        vendorId: part.vendorId
      });
    } else {
      setEditingPart(null);
      setFormData({
        partName: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        reorderLevel: 10,
        vendorId: null
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPart) {
        await updatePart(editingPart.partId, formData);
        showToast('Part updated successfully', 'success');
      } else {
        await createPart(formData);
        showToast('Part added successfully', 'success');
      }
      handleCloseModal();
      loadParts();
    } catch (error: any) {
      showToast(error.message || 'Operation failed', 'danger');
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm('Are you sure you want to delete this part?');
    if (isConfirmed) {
      try {
        await deletePart(id);
        showToast('Part deleted successfully', 'success');
        loadParts();
      } catch (error: any) {
        showToast(error.message || 'Failed to delete part', 'danger');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">Parts Management</h2>
        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-lg"></i> Purchase / Add Part
        </Button>
      </div>

      <Card className="bg-dark text-light border-secondary">
        <Card.Body className="p-0 overflow-hidden">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table hover variant="dark" responsive className="mb-0">
              <thead className="border-secondary">
                <tr>
                  <th className="p-3 border-bottom-0">Part Name</th>
                  <th className="p-3 border-bottom-0">Description</th>
                  <th className="p-3 border-bottom-0">Price ($)</th>
                  <th className="p-3 border-bottom-0">Stock</th>
                  <th className="p-3 border-bottom-0">Status</th>
                  <th className="p-3 border-bottom-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-muted">No parts found in inventory.</td>
                  </tr>
                ) : parts.map(p => (
                  <tr key={p.partId}>
                    <td className="p-3 border-secondary align-middle">{p.partName}</td>
                    <td className="p-3 border-secondary align-middle text-truncate" style={{ maxWidth: '200px' }}>{p.description}</td>
                    <td className="p-3 border-secondary align-middle fw-medium">${p.price.toFixed(2)}</td>
                    <td className="p-3 border-secondary align-middle">{p.stockQuantity}</td>
                    <td className="p-3 border-secondary align-middle">
                      {p.stockQuantity <= p.reorderLevel ? (
                        <Badge bg="danger" className="d-inline-flex align-items-center gap-1 px-2 py-1">
                          <i className="bi bi-exclamation-triangle-fill"></i> Low Stock
                        </Badge>
                      ) : (
                        <Badge bg="success" className="px-2 py-1">Healthy</Badge>
                      )}
                    </td>
                    <td className="p-3 border-secondary align-middle text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button variant="outline-info" size="sm" className="border-0" onClick={() => handleOpenModal(p)}>
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" className="border-0" onClick={() => handleDelete(p.partId)}>
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

      <Modal show={showModal} onHide={handleCloseModal} contentClassName="bg-dark text-light border-secondary">
        <Modal.Header closeButton className="border-secondary" closeVariant="white">
          <Modal.Title>{editingPart ? 'Edit Part' : 'Add New Part'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Part Name</Form.Label>
              <Form.Control
                required
                className="bg-dark text-light border-secondary"
                value={formData.partName}
                onChange={e => setFormData({...formData, partName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                className="bg-dark text-light border-secondary"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </Form.Group>
            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="bg-dark text-light border-secondary"
                    value={formData.price || ''}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    required
                    className="bg-dark text-light border-secondary"
                    value={formData.stockQuantity || ''}
                    onChange={e => setFormData({...formData, stockQuantity: parseInt(e.target.value, 10)})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Reorder Level</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    required
                    className="bg-dark text-light border-secondary"
                    value={formData.reorderLevel || ''}
                    onChange={e => setFormData({...formData, reorderLevel: parseInt(e.target.value, 10)})}
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{editingPart ? 'Save Changes' : 'Add Part'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};
