import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useToast } from '../../context/ToastContext';
import { 
  getInvoices, 
  getVendors, 
  getParts, 
  createInvoice, 
} from '../../services/invoiceApi';
import type { 
  PurchaseInvoice, 
  Vendor, 
  PartBasic,
  CreatePurchaseItemData 
} from '../../services/invoiceApi';

export const PurchaseInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parts, setParts] = useState<PartBasic[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [vendorId, setVendorId] = useState<number | ''>('');
  const [items, setItems] = useState<CreatePurchaseItemData[]>([{ partId: 0, quantity: 1, costPrice: 0 }]);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, venData, ptsData] = await Promise.all([
        getInvoices(),
        getVendors(),
        getParts()
      ]);
      setInvoices(invData);
      setVendors(venData);
      setParts(ptsData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setVendorId('');
    setItems([{ partId: 0, quantity: 1, costPrice: 0 }]);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleAddItem = () => {
    setItems([...items, { partId: 0, quantity: 1, costPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof CreatePurchaseItemData, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) {
      showToast('Please select a vendor', 'warning');
      return;
    }
    if (items.some(i => !i.partId || i.quantity <= 0 || i.costPrice <= 0)) {
      showToast('Please ensure all items have a selected part, quantity > 0, and cost price > 0', 'warning');
      return;
    }

    try {
      await createInvoice({
        vendorId: Number(vendorId),
        items: items.filter(i => i.partId !== 0)
      });
      showToast('Invoice created and stock updated successfully!', 'success');
      handleCloseModal();
      loadData(); // Refresh data to show new invoice
    } catch (error: any) {
      showToast(error.message || 'Failed to create invoice', 'danger');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">Purchase Invoices</h2>
        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={handleOpenModal}>
          <i className="bi bi-plus-lg"></i> Create Invoice
        </Button>
      </div>

      <Card className="bg-dark text-light border-secondary">
        <Card.Body className="p-0 overflow-hidden">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="border-secondary">
                <tr>
                  <th className="p-3 border-bottom-0">Invoice ID</th>
                  <th className="p-3 border-bottom-0">Vendor</th>
                  <th className="p-3 border-bottom-0">Date</th>
                  <th className="p-3 border-bottom-0">Items</th>
                  <th className="p-3 border-bottom-0">Total Amount</th>
                  <th className="p-3 border-bottom-0">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-muted">No purchase invoices found.</td>
                  </tr>
                ) : invoices.map(inv => (
                  <tr key={inv.purchaseId}>
                    <td className="p-3 border-secondary align-middle fw-bold text-info">#INV-{inv.purchaseId.toString().padStart(4, '0')}</td>
                    <td className="p-3 border-secondary align-middle">{inv.vendorName}</td>
                    <td className="p-3 border-secondary align-middle">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="p-3 border-secondary align-middle">{inv.items.reduce((acc, item) => acc + item.quantity, 0)} parts</td>
                    <td className="p-3 border-secondary align-middle fw-medium">${inv.totalAmount.toFixed(2)}</td>
                    <td className="p-3 border-secondary align-middle">
                      <Badge bg="success" className="px-2 py-1">PAID</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" contentClassName="bg-dark text-light border-secondary">
        <Modal.Header closeButton className="border-secondary" closeVariant="white">
          <Modal.Title>Create Purchase Invoice</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-4">
              <Form.Label>Vendor</Form.Label>
              <Form.Select 
                required 
                className="bg-dark text-light border-secondary"
                value={vendorId}
                onChange={e => setVendorId(Number(e.target.value))}
              >
                <option value="">Select Vendor...</option>
                {vendors.map(v => (
                  <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <h5 className="border-bottom border-secondary pb-2 mb-3">Purchase Items</h5>
            
            {items.map((item, index) => (
              <div key={index} className="row align-items-end mb-3">
                <div className="col-md-5">
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">Part</Form.Label>
                    <Form.Select
                      required
                      className="bg-dark text-light border-secondary"
                      value={item.partId}
                      onChange={e => handleItemChange(index, 'partId', Number(e.target.value))}
                    >
                      <option value="0">Select Part...</option>
                      {parts.map(p => (
                        <option key={p.partId} value={p.partId}>{p.partName} (Stock: {p.stockQuantity})</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      required
                      className="bg-dark text-light border-secondary"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1">Unit Cost ($)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      className="bg-dark text-light border-secondary"
                      value={item.costPrice}
                      onChange={e => handleItemChange(index, 'costPrice', parseFloat(e.target.value) || 0)}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-1">
                  <Button 
                    variant="outline-danger" 
                    className="border-0 w-100" 
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-between align-items-center mt-4">
              <Button variant="outline-info" size="sm" onClick={handleAddItem}>
                <i className="bi bi-plus-lg me-1"></i> Add Another Item
              </Button>
              <h4 className="mb-0 text-success">Total: ${calculateTotal().toFixed(2)}</h4>
            </div>

          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">Submit & Update Stock</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};
