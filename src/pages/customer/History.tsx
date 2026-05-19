import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, Table, Badge, Button, Spinner, Modal, Form,
    Row, Col, InputGroup
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getVehicles, type Vehicle } from '../../services/authApi';
import {
    getUserReviews,
    submitReview,
    type Review,
} from '../../services/customerApi';


interface SalesHistoryItem {
    salesId: number;
    date: string;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    paymentStatus: string;
    items: {
        partName: string;
        quantity: number;
        price: number;
        subtotal: number;
    }[];
}


const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const getSalesHistory = async (
    userId: string | number,
    from?: string,
    to?: string,
    search?: string
): Promise<SalesHistoryItem[]> => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (search) params.set('search', search);

    const qs = params.toString();
    const url = `/api/sales-history/user/${userId}${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load history');
    return res.json();
};


const statusVariant = (s: string) =>
    s === 'Paid' || s === 'Completed' ? 'success' :
        s === 'Credit' ? 'warning' : 'secondary';


const printInvoice = (sale: SalesHistoryItem) => {
    const rows = sale.items
        .map(i => `
            <tr>
                <td>${i.partName}</td>
                <td style="text-align:center">${i.quantity}</td>
                <td style="text-align:right">Rs. ${i.price.toFixed(2)}</td>
                <td style="text-align:right">Rs. ${i.subtotal.toFixed(2)}</td>
            </tr>`)
        .join('');

    const discountRow = sale.discount > 0
        ? `<tr><td colspan="3" style="text-align:right;color:green">Loyalty Discount</td><td style="text-align:right;color:green">– Rs. ${sale.discount.toFixed(2)}</td></tr>`
        : '';

    const html = `
        <html>
        <head>
            <title>Invoice #${sale.salesId}</title>
            <style>
                body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 40px auto; }
                h2 { color: #6366f1; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                th { background: #6366f1; color: #fff; padding: 8px 12px; text-align: left; }
                td { padding: 8px 12px; border-bottom: 1px solid #eee; }
                .total { font-size: 1.15em; font-weight: bold; color: #6366f1; }
            </style>
        </head>
        <body>
            <h2>VP Vehicle Parts — Invoice #${sale.salesId.toString().padStart(6, '0')}</h2>
            <p><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <table>
                <thead>
                    <tr><th>Part</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                    ${rows}
                    ${discountRow}
                </tbody>
            </table>
            <p style="text-align:right;margin-top:12px">Subtotal: <strong>Rs. ${sale.totalAmount.toFixed(2)}</strong></p>
            <p style="text-align:right" class="total">Total Paid: Rs. ${sale.finalAmount.toFixed(2)}</p>
            <p style="text-align:right">Status: <strong>${sale.paymentStatus.toUpperCase()}</strong></p>
            <hr/>
            <p style="color:#999;font-size:0.8em;text-align:center">Thank you for choosing VP Vehicle Parts Center.</p>
        </body>
        </html>`;

    const win = window.open('', '_blank', 'width=700,height=600');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
};


export const History: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [sales, setSales] = useState<SalesHistoryItem[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Filters ───────────────────────────────────────────────────────────────
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [search, setSearch] = useState('');
    const [filtering, setFiltering] = useState(false);

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

    const applyFilters = useCallback(async () => {
        if (!userId) return;
        setFiltering(true);
        try {
            const data = await getSalesHistory(
                userId,
                fromDate || undefined,
                toDate || undefined,
                search || undefined
            );
            setSales(data);
        } catch {
            showToast('Failed to apply filters.', 'danger');
        } finally {
            setFiltering(false);
        }
    }, [userId, fromDate, toDate, search]);

    const clearFilters = async () => {
        setFromDate('');
        setToDate('');
        setSearch('');
        if (!userId) return;
        setFiltering(true);
        try {
            setSales(await getSalesHistory(userId));
        } finally {
            setFiltering(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewVehicleId) { showToast('Please select a vehicle.', 'warning'); return; }
        setSubmittingReview(true);
        try {
            await submitReview({
                vehicleId: parseInt(reviewVehicleId),
                rating: reviewRating,
                comment: reviewComment,
            });
            showToast('Review submitted!', 'success');
            setShowReviewModal(false);
            setReviewComment('');
            setReviewRating(5);
            setReviewVehicleId('');
            if (userId) setReviews(await getUserReviews(userId));
        } catch (err: any) {
            showToast(err.message || 'Failed to submit review.', 'danger');
        } finally {
            setSubmittingReview(false);
        }
    };

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

            {/* Page header */}
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

            {/* ── Filters ── */}
            <Card className="bg-dark text-light border-secondary mb-4">
                <Card.Body className="p-3">
                    <Row className="g-2 align-items-end">
                        <Col xs={12} md={3}>
                            <Form.Label className="small text-secondary mb-1">From Date</Form.Label>
                            <Form.Control
                                type="date"
                                size="sm"
                                className="bg-dark text-light border-secondary"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                            />
                        </Col>
                        <Col xs={12} md={3}>
                            <Form.Label className="small text-secondary mb-1">To Date</Form.Label>
                            <Form.Control
                                type="date"
                                size="sm"
                                className="bg-dark text-light border-secondary"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                            />
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Label className="small text-secondary mb-1">Search by Part Name</Form.Label>
                            <InputGroup size="sm">
                                <InputGroup.Text className="bg-dark border-secondary text-secondary">
                                    <i className="bi bi-search"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. brake pad"
                                    className="bg-dark text-light border-secondary border-start-0"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={12} md={2} className="d-flex gap-2">
                            <Button
                                size="sm"
                                variant="primary"
                                className="flex-grow-1"
                                onClick={applyFilters}
                                disabled={filtering}
                            >
                                {filtering ? <Spinner size="sm" animation="border" /> : 'Apply'}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={clearFilters}
                                disabled={filtering}
                            >
                                Clear
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* ── My Reviews ── */}
            {reviews.length > 0 && (
                <Card className="bg-dark text-light border-secondary mb-4">
                    <Card.Body className="p-4">
                        <h4 className="mb-4 fw-bold">My Reviews</h4>
                        <div className="d-flex flex-column gap-3">
                            {reviews.map(r => (
                                <div
                                    key={r.reviewId}
                                    className="p-3 bg-secondary bg-opacity-10 rounded border border-secondary"
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div className="fw-bold mb-1">{r.vehicleNumber}</div>
                                            <div className="mb-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <i
                                                        key={i}
                                                        className={`bi bi-star${i < r.rating ? '-fill' : ''} text-warning me-1`}
                                                    />
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

            {/* ── Purchase History table ── */}
            <Card className="bg-dark text-light border-secondary">
                <Card.Body className="p-0 overflow-hidden">
                    <div className="p-4 pb-2 d-flex justify-content-between align-items-center">
                        <h4 className="mb-0 fw-bold">Parts Purchase History</h4>
                        <span className="text-secondary small">{sales.length} record{sales.length !== 1 ? 's' : ''}</span>
                    </div>

                    {sales.length === 0 ? (
                        <p className="text-secondary px-4 pb-4">
                            {fromDate || toDate || search
                                ? 'No purchases match your filters.'
                                : 'No purchase history found.'}
                        </p>
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
                                    <th className="p-3 border-bottom-0 text-center">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map(s => (
                                    <tr key={s.salesId}>
                                        <td className="p-3 border-secondary align-middle fw-semibold">
                                            #{s.salesId.toString().padStart(6, '0')}
                                        </td>
                                        <td className="p-3 border-secondary align-middle text-secondary">
                                            {new Date(s.date).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-3 border-secondary align-middle">
                                            {s.items.map((item, i) => (
                                                <div key={i} className="small">
                                                    {item.quantity}× {item.partName}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="p-3 border-secondary align-middle">
                                            Rs. {s.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="p-3 border-secondary align-middle text-success">
                                            {s.discount > 0 ? `– Rs. ${s.discount.toFixed(2)}` : '—'}
                                        </td>
                                        <td className="p-3 border-secondary align-middle fw-medium">
                                            Rs. {s.finalAmount.toFixed(2)}
                                        </td>
                                        <td className="p-3 border-secondary align-middle">
                                            <Badge
                                                bg={statusVariant(s.paymentStatus)}
                                                className="px-2 py-1"
                                            >
                                                {s.paymentStatus.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="p-3 border-secondary align-middle text-center">
                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                title="Print invoice"
                                                onClick={() => printInvoice(s)}
                                            >
                                                <i className="bi bi-printer me-1"></i>Print
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* ── Leave Review Modal ── */}
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
                            <Form.Label>Rating</Form.Label>
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
                            {submittingReview
                                ? <><Spinner size="sm" className="me-1" />Submitting...</>
                                : 'Submit Review'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};
