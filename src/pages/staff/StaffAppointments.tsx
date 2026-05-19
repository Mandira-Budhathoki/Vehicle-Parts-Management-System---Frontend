import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, Table, Badge, Button, Spinner, ButtonGroup, Alert
} from 'react-bootstrap';
import { useToast } from '../../context/ToastContext';


interface StaffAppointment {
    appointmentId: number;
    vehicleId: number;
    vehicleNumber: string;
    brand: string;
    model: string;
    customerId: number;
    customerName: string;
    customerEmail: string;
    date: string;
    status: string;
    serviceType: string;
    notes?: string;
}


const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const fetchAppointments = async (status?: string): Promise<StaffAppointment[]> => {
    const url = status
        ? `/api/appointments/all?status=${encodeURIComponent(status)}`
        : '/api/appointments/all';
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load appointments');
    return res.json();
};

const updateStatus = async (id: number, status: string): Promise<void> => {
    const res = await fetch(`/api/appointments/${id}/status`, {
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
    s === 'Approved' ? 'success' :
        s === 'Rejected' ? 'danger' :
            s === 'Completed' ? 'primary' :
                s === 'Cancelled' ? 'secondary' : 'warning';

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];


export const StaffAppointments: React.FC = () => {
    const { showToast } = useToast();

    const [appointments, setAppointments] = useState<StaffAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [updating, setUpdating] = useState<number | null>(null);

    const load = useCallback(async (statusFilter: string) => {
        setLoading(true);
        try {
            const data = await fetchAppointments(statusFilter === 'All' ? undefined : statusFilter);
            setAppointments(data);
        } catch (err: any) {
            showToast(err.message || 'Failed to load appointments', 'danger');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(filter); }, [filter]);

    const handleStatusChange = async (id: number, status: string) => {
        setUpdating(id);
        try {
            await updateStatus(id, status);
            showToast(`Appointment marked as ${status}. Customer notified.`, 'success');
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
                <div className="bg-primary bg-gradient p-2 rounded shadow">
                    <i className="bi bi-calendar-check fs-4 text-white"></i>
                </div>
                <div>
                    <h2 className="mb-0 text-dark fw-bold">Appointments</h2>
                    <p className="mb-0 text-secondary small">Approve or reject customer service bookings</p>
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
                            <p className="mt-2 text-secondary">Loading appointments...</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <Alert variant="info" className="m-4 border-0">
                            No {filter !== 'All' ? filter.toLowerCase() : ''} appointments found.
                        </Alert>
                    ) : (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead style={{ background: '#f1f3f9' }}>
                                <tr>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-3 py-3">Vehicle</th>
                                    <th className="px-3 py-3">Service</th>
                                    <th className="px-3 py-3">Date & Time</th>
                                    <th className="px-3 py-3">Notes</th>
                                    <th className="px-3 py-3">Status</th>
                                    <th className="px-3 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map(a => (
                                    <tr key={a.appointmentId}>
                                        <td className="px-4 py-3">
                                            <div className="fw-semibold">{a.customerName}</div>
                                            <div className="text-secondary small">{a.customerEmail}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="fw-semibold">{a.vehicleNumber}</div>
                                            <div className="text-secondary small">{a.brand} {a.model}</div>
                                        </td>
                                        <td className="px-3 py-3">{a.serviceType}</td>
                                        <td className="px-3 py-3 text-nowrap">
                                            <div>{new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            <div className="text-secondary small">{new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-secondary small fst-italic">
                                                {a.notes || '�'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <Badge bg={statusVariant(a.status)} className="px-2 py-1">
                                                {a.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            {updating === a.appointmentId ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : a.status === 'Pending' ? (
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleStatusChange(a.appointmentId, 'Approved')}
                                                    >
                                                        <i className="bi bi-check-lg me-1"></i>Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleStatusChange(a.appointmentId, 'Rejected')}
                                                    >
                                                        <i className="bi bi-x-lg me-1"></i>Reject
                                                    </Button>
                                                </div>
                                            ) : a.status === 'Approved' ? (
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => handleStatusChange(a.appointmentId, 'Completed')}
                                                >
                                                    <i className="bi bi-check-circle me-1"></i>Mark Done
                                                </Button>
                                            ) : (
                                                <span className="text-secondary small">�</span>
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
                Customers are automatically notified via in-app notification when their appointment is approved or rejected.
            </p>
        </div>
    );
};