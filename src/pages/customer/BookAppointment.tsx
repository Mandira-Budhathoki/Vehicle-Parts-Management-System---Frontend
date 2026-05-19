import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, InputGroup, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getVehicles, type Vehicle } from '../../services/authApi';
import {
    bookAppointment,
    getAppointments,
    cancelAppointment,
    type Appointment,
} from '../../services/customerApi';

const SERVICE_TYPES = [
    'General Maintenance',
    'Brake Replacement',
    'Oil Change',
    'Engine Diagnostics',
    'Tire Rotation',
    'Battery Check',
    'Transmission Service',
    'Air Filter Replacement',
];

export const BookAppointment: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [vehicleId, setVehicleId] = useState('');
    const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    const userId = user?.id;

    useEffect(() => {
        if (!userId) return;
        Promise.all([
            getVehicles(userId).then(setVehicles),
            getAppointments(userId).then(setAppointments),
        ])
            .catch(() => showToast('Failed to load data.', 'danger'))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicleId) {
            showToast('Please select a vehicle.', 'warning');
            return;
        }
        if (!date || !time) {
            showToast('Please select a date and time.', 'warning');
            return;
        }

        // Combine date + time into ISO string
        const combined = new Date(`${date}T${time}:00`);
        if (isNaN(combined.getTime())) {
            showToast('Invalid date/time.', 'danger');
            return;
        }

        setSubmitting(true);
        try {
            await bookAppointment({
                vehicleId: parseInt(vehicleId),
                date: combined.toISOString(),
                serviceType,
                notes: notes || undefined,
            });
            showToast('Appointment booked successfully!', 'success');
            // Reset form
            setVehicleId('');
            setDate('');
            setTime('');
            setNotes('');
            // Refresh appointment list
            if (userId) {
                const updated = await getAppointments(userId);
                setAppointments(updated);
            }
        } catch (err: any) {
            showToast(err.message || 'Failed to book appointment.', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (appointmentId: number) => {
        try {
            await cancelAppointment(appointmentId);
            showToast('Appointment cancelled.', 'success');
            setAppointments(prev => prev.map(a =>
                a.appointmentId === appointmentId ? { ...a, status: 'Cancelled' } : a
            ));
        } catch (err: any) {
            showToast(err.message || 'Failed to cancel appointment.', 'danger');
        }
    };

    const statusVariant = (s: string) =>
        s === 'Completed' ? 'success' : s === 'Cancelled' ? 'secondary' : 'warning';

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3 text-secondary">Loading...</span>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h2 className="mb-4 text-light fw-bold">Book an Appointment</h2>

            {vehicles.length === 0 && (
                <Alert variant="warning" className="mb-4">
                    You have no vehicles registered. Please add a vehicle from your{' '}
                    <a href="/customer/profile" className="alert-link">profile</a> first.
                </Alert>
            )}

            <Card className="bg-dark text-light border-secondary mb-4" style={{ maxWidth: '800px' }}>
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-secondary fw-medium">Select Vehicle</Form.Label>
                            <Form.Select
                                className="bg-dark text-light border-secondary shadow-none"
                                value={vehicleId}
                                onChange={e => setVehicleId(e.target.value)}
                                required
                                disabled={vehicles.length === 0}
                            >
                                <option value="">-- Choose your vehicle --</option>
                                {vehicles.map(v => (
                                    <option key={v.vehicleId} value={v.vehicleId}>
                                        {v.brand} {v.model} ({v.vehicleNumber})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="text-secondary fw-medium">Select Service Type</Form.Label>
                            <Form.Select
                                className="bg-dark text-light border-secondary shadow-none"
                                value={serviceType}
                                onChange={e => setServiceType(e.target.value)}
                            >
                                {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                            </Form.Select>
                        </Form.Group>

                        <Row className="g-3 mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="text-secondary fw-medium">Preferred Date</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-transparent border-secondary text-secondary">
                                            <i className="bi bi-calendar3"></i>
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            className="bg-dark text-light border-secondary border-start-0 shadow-none ps-0"
                                            value={date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => setDate(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="text-secondary fw-medium">Preferred Time</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-transparent border-secondary text-secondary">
                                            <i className="bi bi-clock"></i>
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="time"
                                            className="bg-dark text-light border-secondary border-start-0 shadow-none ps-0"
                                            value={time}
                                            onChange={e => setTime(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label className="text-secondary fw-medium">Additional Notes (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Describe any specific issues..."
                                className="bg-dark text-light border-secondary shadow-none"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100 py-2 fw-bold text-uppercase mt-2"
                            disabled={submitting || vehicles.length === 0}
                        >
                            {submitting ? <><Spinner size="sm" className="me-2" />Booking...</> : 'Confirm Booking'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* Existing Appointments */}
            <h4 className="text-light fw-bold mb-3">My Appointments</h4>
            {appointments.length === 0 ? (
                <p className="text-secondary">No appointments booked yet.</p>
            ) : (
                <ListGroup variant="flush">
                    {appointments.map(a => (
                        <ListGroup.Item
                            key={a.appointmentId}
                            className="bg-dark text-light border-secondary mb-2 rounded"
                        >
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                <div>
                                    <div className="fw-bold">{a.serviceType}</div>
                                    <div className="text-secondary small">
                                        {a.brand} {a.model} &middot; {a.vehicleNumber}
                                    </div>
                                    <div className="text-secondary small">
                                        {new Date(a.date).toLocaleString()}
                                    </div>
                                    {a.notes && <div className="text-secondary small fst-italic">{a.notes}</div>}
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <Badge bg={statusVariant(a.status)}>{a.status.toUpperCase()}</Badge>
                                    {a.status === 'Pending' && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleCancel(a.appointmentId)}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};
