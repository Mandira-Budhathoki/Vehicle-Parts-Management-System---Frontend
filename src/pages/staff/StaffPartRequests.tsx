import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, Table, Badge, Button, Spinner, ButtonGroup, Alert
} from 'react-bootstrap';
import { useToast } from '../../context/ToastContext';


interface StaffPartRequest {
    requestId: number;
    partName: string;
    notes?: string;
    status: string;
    requestDate: string;
    customerId: number;
    customerName: string;
    customerEmail: string;
}


const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const fetchRequests = async (status?: string): Promise<StaffPartRequest[]> => {
    const url = status
        ? `/api/part-requests/all?status=${encodeURIComponent(status)}`
        : '/api/part-requests/all';
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load part requests');
    return res.json();
};

const updateStatus = async (id: number, status: string): Promise<void> => {
    const res = await fetch(`/api/part-requests/${id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to update' }));
        throw new Error(err.message);
    }
};


const statusVariant = (s: string) =>
    s === 'Fulfilled' ? 'success' :
        s === 'Rejected' ? 'danger' : 'warning';

const FILTERS = ['All', 'Pending', 'Fulfilled', 'Rejected'];


export const StaffPartRequests: React.FC = () => {
    const { showToast } = useToast();

    const [requests, setRequests] = useState<StaffPartRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [updating, setUpdating] = useState<number | null>(null);

    const load = useCallback(async (statusFilter: string) => {
        setLoading(true);
        try {
            const data = await fetchRequests(statusFilter === 'All' ? undefined : statusFilter);
            setRequests(data);
        } catch (err: any) {
            showToast(err.message || 'Failed to load requests', 'danger');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(filter); }, [filter]);

    const handleStatusChange = async (id: number, status: string) => {
        setUpdating(id);
        try {
            await updateStatus(id, status);
            showToast(`Request marked as ${status}. Customer notified.`, 'success');
            await load(filter);
        } catch (err: any) {
            showToast(err.message || 'Update failed', 'danger');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="animate-fade-in"
            style={{
                background: 'linear-gradient(145deg,#f8f9fa 0%,#e9ecef 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                minHeight: '100%'
            }}
        >
            {/* Header */}
            <div className="d-flex align-items-center mb-4 gap-3">
                <div className="bg-warning bg-gradient p-2 rounded shadow">
                    <i className="bi bi-cart-plus fs-4 text-white"></i>
                </div>
                <div>
                    <h2 className="mb-0 text-dark fw-bold">Part Requests</h2>
                    <p className="mb-0 text-secondary small">Manage customer requests for unavailable parts</p>
                </div>
            </div>

            {/* Filter tabs */}
            <ButtonGroup className="mb-4 flex-wrap gap-1">
                {FILTERS.map(f => (
                    <Button
                        key={f}
                        size="sm"
                        variant={filter === f ? 'primary' : 'outline-secondary'}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </Button>
                ))}
            </ButtonGroup>

            <Card className="border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                <Card.Body className="p-0 overflow-hidden" style={{ borderRadius: '16px' }}>
                    {loading ? (
                        <div className="p-5 text-center">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-secondary">Loading requests...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <Alert variant="info" className="m-4 border-0">
                            No {filter !== 'All' ? filter.toLowerCase() : ''} part requests found.
                        </Alert>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead style={{ background: '#f1f3f9' }}>
                                <tr>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-3 py-3">Part Requested</th>
                                    <th className="px-3 py-3">Notes</th>
                                    <th className="px-3 py-3">Date</th>
                                    <th className="px-3 py-3">Status</th>
                                    <th className="px-3 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r.requestId}>
                                        <td className="px-4 py-3">
                                            <div className="fw-semibold">{r.customerName}</div>
                                            <div className="text-secondary small">{r.customerEmail}</div>
                                        </td>
                                        <td className="px-3 py-3 fw-semibold">{r.partName}</td>
                                        <td className="px-3 py-3">
                                            <span className="text-secondary small fst-italic">
                                                {r.notes || '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-nowrap text-secondary small">
                                            {new Date(r.requestDate).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-3 py-3">
                                            <Badge bg={statusVariant(r.status)} className="px-2 py-1">
                                                {r.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            {updating === r.requestId ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : r.status === 'Pending' ? (
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleStatusChange(r.requestId, 'Fulfilled')}
                                                    >
                                                        <i className="bi bi-check-lg me-1"></i>Fulfilled
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleStatusChange(r.requestId, 'Rejected')}
                                                    >
                                                        <i className="bi bi-x-lg me-1"></i>Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-secondary small">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <p className="text-secondary small mt-3">
                <i className="bi bi-info-circle me-1"></i>
                Customers are automatically notified when a request is marked as Fulfilled or Rejected.
            </p>
        </div>
    );
};
