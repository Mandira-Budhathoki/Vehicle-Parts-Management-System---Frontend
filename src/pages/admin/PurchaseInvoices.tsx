import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getPurchaseInvoices, type PurchaseInvoice } from '../../services/purchaseInvoiceApi';

export const PurchaseInvoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPurchaseInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load purchase invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-light fw-bold">
          <i className="bi bi-receipt me-2 text-primary"></i>Purchase Invoices
        </h2>
        <Button 
          variant="primary" 
          className="d-flex align-items-center gap-2"
          onClick={() => navigate('/admin/invoices/new')}
        >
          <i className="bi bi-plus-lg"></i> Create Invoice
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="bg-dark border-secondary text-center p-3">
            <div className="fs-2 fw-bold text-primary">{invoices.length}</div>
            <div className="text-secondary small">Total Invoices</div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="bg-dark border-secondary text-center p-3">
            <div className="fs-2 fw-bold text-success">
              Rs. {invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-secondary small">Total Spent</div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="bg-dark border-secondary text-center p-3">
            <div className="fs-2 fw-bold text-info">
              {new Set(invoices.map(inv => inv.vendorId)).size}
            </div>
            <div className="text-secondary small">Unique Vendors</div>
          </Card>
        </div>
      </div>

      {/* Invoices Table */}
      <Card className="bg-dark text-light border-secondary">
        <Card.Body className="p-0 overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary mt-2">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-receipt fs-1 mb-3 d-block"></i>
              No purchase invoices found. Click "Create Invoice" to add stock.
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="border-secondary">
                <tr>
                  <th className="p-3 border-bottom-0">Invoice ID</th>
                  <th className="p-3 border-bottom-0">Vendor</th>
                  <th className="p-3 border-bottom-0">Date</th>
                  <th className="p-3 border-bottom-0">Items Count</th>
                  <th className="p-3 border-bottom-0">Total Amount (Rs.)</th>
                  <th className="p-3 border-bottom-0">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const dateObj = new Date(inv.date);
                  const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr key={inv.purchaseId}>
                      <td className="p-3 border-secondary align-middle fw-semibold text-info">#INV-{inv.purchaseId.toString().padStart(4, '0')}</td>
                      <td className="p-3 border-secondary align-middle">{inv.vendorName}</td>
                      <td className="p-3 border-secondary align-middle text-secondary">{formattedDate}</td>
                      <td className="p-3 border-secondary align-middle">{inv.items.length} parts</td>
                      <td className="p-3 border-secondary align-middle fw-medium text-success">
                        {inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 border-secondary align-middle">
                        <Badge bg="success" className="px-2 py-1">COMPLETED</Badge>
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
  );
};
