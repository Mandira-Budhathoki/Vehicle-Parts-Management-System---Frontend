import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { submitPartRequest, getPartRequests, type PartRequest as PR } from '../../services/customerApi';

export const PartRequest: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [partName, setPartName] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [requests, setRequests] = useState<PR[]>([]);
    const [loading, setLoading] = useState(true);

    const userId = user?.id;

    useEffect(() => {
        if (!userId) return;
        getPartRequests(userId)
            .then(setRequests)
            .catch(() => showToast('Failed to load your requests.', 'danger'))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!partName.trim()) {
            showToast('Part name is required.', 'warning');
            return;
        }
        setSubmitting(true);
        try {
            await submitPartRequest({ partName: partName.trim(), notes: notes.trim() || undefined });
            showToast('Part request submitted successfully!', 'success');
            setPartName('');
            setNotes('');
            // Refresh list
            if (userId) {
                const updated = await getPartRequests(userId);
                setRequests(updated);
            }
        } catch (err: any) {
            showToast(err.message || 'Failed to submit request.', 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    const statusVariant = (s: string) =>
        s === 'Fulfilled' ? 'success' : s === 'Rejected' ? 'danger' : 'warning';

    return (
        <div className="animate-fade-in">
            <h2 className="mb-3 text-light fw-bold">Request Unavailable Parts</h2>

            <p className="text-secondary mb-4" style={{ maxWidth: '600px' }}>
                Can't find what you are looking for in our inventory? Submit a request here and we will
                order it for you from our vendors.
            </p>

            <Card className="bg-dark text-light border-secondary mb-4" style={{ maxWidth: '600px' }}>
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-secondary">Part Name *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. Michelin CrossClimate 2 Tires"
                                className="bg-dark text-light border-secondary shadow-none"
                                value={partName}
                                onChange={e => setPartName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="text-secondary">Description / Notes (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Provide any links, vehicle details, or additional information..."
                                className="bg-dark text-light border-secondary shadow-none"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            className="d-flex align-items-center gap-2"
                            disabled={submitting}
                        >
                            {submitting
                                ? <><Spinner size="sm" />Submitting...</>
                                : <><i className="bi bi-send"></i> Submit Request</>
                            }
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* My Requests */}
            <h4 className="text-light fw-bold mb-3">My Part Requests</h4>
            {loading ? (
                <Spinner animation="border" variant="primary" />
            ) : requests.length === 0 ? (
                <p className="text-secondary">No part requests submitted yet.</p>
            ) : (
                <ListGroup variant="flush" style={{ maxWidth: '600px' }}>
                    {requests.map(r => (
                        <ListGroup.Item key={r.requestId} className="bg-dark text-light border-secondary mb-2 rounded">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="fw-bold">{r.partName}</div>
                                    {r.notes && <div className="text-secondary small">{r.notes}</div>}
                                    <div className="text-secondary small">
                                        {new Date(r.requestDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <Badge bg={statusVariant(r.status)}>{r.status.toUpperCase()}</Badge>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};
