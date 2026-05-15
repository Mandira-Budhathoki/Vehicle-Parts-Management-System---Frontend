import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getVehicles, type Vehicle } from '../../services/authApi';
import {
    getSalesHistory,
    getUserReviews,
    submitReview,
    type SalesHistoryItem,
    type Review,
} from '../../services/customerApi';

export const History: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [sales, setSales] = useState<SalesHistoryItem[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    // Review modal
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewVehicleId, setReviewVehicleId] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const userId = user?.id;

    useEffect(() => {
        if (!userId) return;
        Promise.all([
            getSalesHistory(userId).then(setSales),
            getUserReviews(userId).then(setReviews),
            getVehicles(userId).then(setVehicles),
        ])
            .catch(() => showToast('Failed to load history.', 'danger'))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewVehicleId) {
            showToast('Please select a vehicle.', 'warning');
            return;
        }
        setSubmittingReview(true);
        try {
            await submitReview({
                vehicleId: parseInt(reviewVehicleId),
                rating: reviewRating,
                comment: reviewComment,
            });
            showToast('Review submitted successfully!', 'success');
            setShowReviewModal(false);
            setReviewComment('');
            setReviewRating(5);
            setReviewVehicleId('');
            if (userId) {
                const updated = await getUserReviews(userId);
                setReviews(updated);
            }
        } catch (err: any) {
            showToast(err.message || 'Failed to submit review.', 'danger');
        } finally {
            setSubmittingReview(false);
        }
    };

    const statusVariant = (s: string) =>
        s === 'Paid' ? 'success' : s === 'Credit' ? 'warning' : 'secondary';

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-3 text-secondary">Loading history...</span>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-light fw-bold mb-0">Purchase & Service History</h2>
                <Button
                    variant="outline-warning"
                    className="d-flex align-items-center gap-2"
                    onClick={() => setShowReviewModal(true)}
                >
                    <i className="bi bi-star-fill"></i> Leave a Review
                </Button>
            </div>

            {/* My Reviews */}
            {reviews.length > 0 && (
                <Card className="bg-dark text-light border-secondary mb-4">
                    <Card.Body className="p-4">
                        <h4 className="mb-4 fw-bold">My Reviews</h4>
                        <div className="d-flex flex-column gap-3">
                            {reviews.map(r => (
                                <div key={r.reviewId} className="p-3 bg-secondary bg-opacity-10 rounded border border-secondary">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div className="fw-bold mb-1">{r.vehicleNumber}</div>
                                            <div className="mb-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <i
                                                        key={i}
                                                        className={`bi bi-star${i < r.rating ? '-fill' : ''} text-warning me-1`}
                                                    ></i>
                                                ))}
                                            </div>
                                            <p className="mb-0 text-secondary small">{r.comment}</p>
                                        </div>
                                        <div className="text-secondary small">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Purchase History */}
            <Card className="bg-dark text-light border-secondary">
                <Card.Body className="p-0 overflow-hidden">
                    <div className="p-4 pb-2">
                        <h4 className="mb-3 fw-bold">Parts Purchase History</h4>
                    </div>

                    {sales.length === 0 ? (
                        <p className="text-secondary px-4 pb-4">No purchase history found.</p>
                    ) : (
                        <Table hover responsive className="mb-0">
                            <thead className="border-secondary">
                                <tr>
                                    <th className="p-3 border-bottom-0">Order ID</th>
                                    <th className="p-3 border-bottom-0">Date</th>
                                    <th className="p-3 border-bottom-0">Items</th>
                                    <th className="p-3 border-bottom-0">Total</th>
                                    <th className="p-3 border-bottom-0">Discount</th>
                                    <th className="p-3 border-bottom-0">Final</th>
                                    <th className="p-3 border-bottom-0">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map(s => (
                                    <tr key={s.salesId}>
                                        <td className="p-3 border-secondary align-middle">#{s.salesId}</td>
                                        <td className="p-3 border-secondary align-middle text-secondary">
                                            {new Date(s.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 border-secondary align-middle">
                                            {s.items.map((item, i) => (
                                                <div key={i} className="small">
                                                    {item.quantity}x {item.partName}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="p-3 border-secondary align-middle">NPR {s.totalAmount.toFixed(2)}</td>
                                        <td className="p-3 border-secondary align-middle text-success">
                                            {s.discount > 0 ? `-NPR ${s.discount.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="p-3 border-secondary align-middle fw-medium">
                                            NPR {s.finalAmount.toFixed(2)}
                                        </td>
                                        <td className="p-3 border-secondary align-middle">
                                            <Badge bg={statusVariant(s.paymentStatus)} className="px-2 py-1">
                                                {s.paymentStatus.toUpperCase()}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Leave Review Modal */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered data-bs-theme="dark">
                <Modal.Header closeButton className="bg-dark text-light border-secondary">
                    <Modal.Title>Leave a Review</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmitReview}>
                    <Modal.Body className="bg-dark text-light">
                        <Form.Group className="mb-3">
                            <Form.Label>Select Vehicle</Form.Label>
                            <Form.Select
                                className="bg-dark text-light border-secondary"
                                value={reviewVehicleId}
                                onChange={e => setReviewVehicleId(e.target.value)}
                                required
                            >
                                <option value="">-- Choose vehicle --</option>
                                {vehicles.map(v => (
                                    <option key={v.vehicleId} value={v.vehicleId}>
                                        {v.brand} {v.model} ({v.vehicleNumber})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Rating (1–5)</Form.Label>
                            <div className="d-flex gap-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <Button
                                        key={n}
                                        type="button"
                                        variant={reviewRating >= n ? 'warning' : 'outline-warning'}
                                        size="sm"
                                        onClick={() => setReviewRating(n)}
                                    >
                                        <i className="bi bi-star-fill"></i>
                                    </Button>
                                ))}
                                <span className="ms-2 align-self-center text-secondary">{reviewRating}/5</span>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Share your experience..."
                                className="bg-dark text-light border-secondary"
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-dark border-secondary">
                        <Button variant="secondary" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                        <Button variant="warning" type="submit" disabled={submittingReview}>
                            {submittingReview ? <><Spinner size="sm" className="me-1" />Submitting...</> : 'Submit Review'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};
