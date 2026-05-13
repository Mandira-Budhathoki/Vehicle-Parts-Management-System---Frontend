import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  getVendors,
  getPartsForPurchase,
  createPurchaseInvoice,
  type Vendor,
  type CreatePurchaseItemData,
} from '../../services/purchaseInvoiceApi';

interface PartOption {
  partId: number;
  partName: string;
  stockQuantity: number;
}

export const CreatePurchaseInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parts, setParts] = useState<PartOption[]>([]);
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [selectedVendorId, setSelectedVendorId] = useState<number | ''>('');
  
  // The items the admin is adding to the invoice
  const [invoiceItems, setInvoiceItems] = useState<CreatePurchaseItemData[]>([]);

  // Local state for the "Add Item" form section
  const [selectedPartId, setSelectedPartId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        const [vendorsData, partsData] = await Promise.all([
          getVendors(),
          getPartsForPurchase(),
        ]);
        setVendors(vendorsData);
        setParts(partsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load vendors or parts.');
      } finally {
        setLoadingData(false);
      }
    };
    loadInitialData();
  }, []);

  const handleAddItem = () => {
    if (!selectedPartId || !quantity || !costPrice) {
      setError('Please select a part, quantity, and cost price to add an item.');
      return;
    }
    
    if (quantity <= 0 || costPrice < 0) {
      setError('Quantity must be > 0 and Cost Price cannot be negative.');
      return;
    }

    // Check if part is already added to avoid duplicates. Instead of blocking, we can combine or just warn.
    const exists = invoiceItems.find(i => i.partId === selectedPartId);
    if (exists) {
      setError('This part is already in the invoice. Please remove it first to update the quantity.');
      return;
    }

    const newItem: CreatePurchaseItemData = {
      partId: Number(selectedPartId),
      quantity: Number(quantity),
      costPrice: Number(costPrice)
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setError('');
    
    // Reset item form
    setSelectedPartId('');
    setQuantity('');
    setCostPrice('');
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...invoiceItems];
    newItems.splice(index, 1);
    setInvoiceItems(newItems);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((total, item) => total + (item.quantity * item.costPrice), 0);
  };

  const handleSubmit = async () => {
    if (!selectedVendorId) {
      setError('Please select a vendor.');
      return;
    }
    if (invoiceItems.length === 0) {
      setError('Please add at least one item to the invoice.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await createPurchaseInvoice({
        vendorId: Number(selectedVendorId),
        items: invoiceItems,
      });
      // Redirect back to the invoices list upon success
      navigate('/admin/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to submit purchase invoice.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-secondary">Loading vendors and parts...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">
          <i className="bi bi-file-earmark-plus me-2 text-primary"></i>Create Purchase Invoice
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/admin/invoices')}>
          <i className="bi bi-arrow-left me-1"></i> Back to Invoices
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <div className="row g-4">
        {/* Left Column: Vendor & Invoice Details */}
        <div className="col-lg-4">
          <Card className="bg-dark text-light border-secondary mb-4 h-100">
            <Card.Header className="bg-dark border-secondary">
              <h5 className="mb-0 fw-bold">Invoice Details</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-4">
                <Form.Label className="text-secondary fw-semibold">Select Vendor <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  className="bg-dark text-light border-secondary"
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">-- Choose a Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="mt-auto pt-4 border-top border-secondary">
                <h4 className="text-end mb-1">Total Amount:</h4>
                <h2 className="text-end text-success fw-bold">Rs. {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 mt-4 fw-bold"
                  onClick={handleSubmit}
                  disabled={saving || invoiceItems.length === 0 || !selectedVendorId}
                >
                  {saving ? <><Spinner size="sm" className="me-2" />Processing...</> : 'Confirm & Save Invoice'}
                </Button>
                <p className="text-secondary text-center small mt-2">
                  Saving this invoice will automatically update part stock quantities.
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Right Column: Items List & Add Item Form */}
        <div className="col-lg-8">
          <Card className="bg-dark text-light border-secondary mb-4">
            <Card.Header className="bg-dark border-secondary d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Add Parts to Invoice</h5>
            </Card.Header>
            <Card.Body className="bg-dark border-bottom border-secondary">
              <div className="row g-3 align-items-end">
                <div className="col-md-5">
                  <Form.Group>
                    <Form.Label className="text-secondary small mb-1">Part <span className="text-danger">*</span></Form.Label>
                    <Form.Select 
                      className="bg-dark text-light border-secondary"
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value ? Number(e.target.value) : '')}
                    >
                      <option value="">-- Select Part --</option>
                      {parts.map(p => (
                        <option key={p.partId} value={p.partId}>
                          {p.partName} (Current Stock: {p.stockQuantity})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label className="text-secondary small mb-1">Quantity <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="number" 
                      min="1"
                      placeholder="Qty"
                      className="bg-dark text-light border-secondary"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label className="text-secondary small mb-1">Cost/Unit (Rs.) <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      className="bg-dark text-light border-secondary"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : '')}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-1 text-end">
                  <Button variant="outline-info" onClick={handleAddItem} className="w-100" title="Add Item">
                    <i className="bi bi-plus-lg"></i>
                  </Button>
                </div>
              </div>
            </Card.Body>
            <Card.Body className="p-0 overflow-hidden">
              {invoiceItems.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                  <i className="bi bi-cart-x fs-1 mb-2 d-block"></i>
                  No parts added yet. Use the form above to add parts to this invoice.
                </div>
              ) : (
                <Table hover variant="dark" responsive className="mb-0">
                  <thead className="border-secondary">
                    <tr>
                      <th className="p-3 border-bottom-0">Part Name</th>
                      <th className="p-3 border-bottom-0 text-end">Quantity</th>
                      <th className="p-3 border-bottom-0 text-end">Cost/Unit (Rs.)</th>
                      <th className="p-3 border-bottom-0 text-end">Subtotal (Rs.)</th>
                      <th className="p-3 border-bottom-0 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, index) => {
                      const partName = parts.find(p => p.partId === item.partId)?.partName || 'Unknown Part';
                      const subtotal = item.quantity * item.costPrice;
                      return (
                        <tr key={index}>
                          <td className="p-3 border-secondary align-middle fw-medium">{partName}</td>
                          <td className="p-3 border-secondary align-middle text-end">{item.quantity}</td>
                          <td className="p-3 border-secondary align-middle text-end">{item.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 border-secondary align-middle text-end fw-semibold text-success">
                            {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 border-secondary align-middle text-center">
                            <Button variant="link" className="text-danger p-0" onClick={() => handleRemoveItem(index)}>
                              <i className="bi bi-x-circle fs-5"></i>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};
