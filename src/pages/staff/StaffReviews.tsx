import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useToast } from '../../context/ToastContext';


interface PublicReview {
    reviewId: number;
    rating: number;
    comment: string;
    createdAt: string;
    customerName: string;
    vehicleNumber: string;
}


const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const fetchAllReviews = async (): Promise<PublicReview[]> => {
    const res = await fetch('/api/reviews', { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to load reviews');
    return res.json();
};


const Stars: React.FC<{ rating: number }> = ({ rating }) => (
    <span>
        {[1, 2, 3, 4, 5].map(i => (
            <i
                key={i}
                className={`bi bi-star${i <= rating ? '-fill' : ''} text-warning me-1`}
                style={{ fontSize: '0.9rem' }}
            />
        ))}
    </span>
);


export const StaffReviews: React.FC = () => {
    const { showToast } = useToast();

    const [reviews, setReviews] = useState<PublicReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [minRating, setMinRating] = useState(0);

    useEffect(() => {
        fetchAllReviews()
            .then(setReviews)
            .catch(err => showToast(err.message || 'Failed to load reviews', 'danger'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = reviews.filter(r => {
        const matchSearch =
            !search ||
            r.customerName.toLowerCase().includes(search.toLowerCase()) ||
            r.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
            r.comment.toLowerCase().includes(search.toLowerCase());
        const matchRating = r.rating >= minRating;
        return matchSearch && matchRating;
    });

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—';

    const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
        n,
        count: reviews.filter(r => r.rating === n).length
    }));

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
                    <i className="bi bi-star-half fs-4 text-white"></i>
                </div>
                <div>
                    <h2 className="mb-0 text-dark fw-bold">Customer Reviews</h2>
                    <p className="mb-0 text-secondary small">All service reviews submitted by customers</p>
                </div>
            </div>

            {/* Stats row */}
            <Row className="g-3 mb-4">
                <Col xs={12} md={4}>
                    <Card className="border-0 shadow-sm text-center p-3" style={{ borderRadius: '12px' }}>
                        <div className="fs-1 fw-bold text-warning">{avgRating}</div>
                        <Stars rating={Math.round(Number(avgRating))} />
                        <div className="text-secondary small mt-1">Average Rating</div>
                    </Card>
                </Col>
                <Col xs={12} md={4}>
                    <Card className="border-0 shadow-sm text-center p-3" style={{ borderRadius: '12px' }}>
                        <div className="fs-1 fw-bold text-primary">{reviews.length}</div>
                        <div className="text-secondary small mt-1">Total Reviews</div>
                    </Card>
                </Col>
                <Col xs={12} md={4}>
                    <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '12px' }}>
                        {ratingCounts.map(({ n, count }) => (
                            <div key={n} className="d-flex align-items-center gap-2 mb-1">
                                <span className="text-secondary small" style={{ width: '20px' }}>{n}</span>
                                <i className="bi bi-star-fill text-warning" style={{ fontSize: '0.75rem' }}></i>
                                <div
                                    className="flex-grow-1 rounded"
                                    style={{
                                        height: '8px',
                                        background: '#e9ecef',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        className="h-100 rounded"
                                        style={{
                                            width: reviews.length
                                                ? `${(count / reviews.length) * 100}%`
                                                : '0%',
                                            background: '#f59e0b'
                                        }}
                                    />
                                </div>
                                <span className="text-secondary small" style={{ width: '24px' }}>{count}</span>
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="g-3 mb-4">
                <Col xs={12} md={8}>
                    <InputGroup>
                        <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                        <Form.Control
                            placeholder="Search by customer, vehicle or comment..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Select
                        value={minRating}
                        onChange={e => setMinRating(Number(e.target.value))}
                    >
                        <option value={0}>All ratings</option>
                        <option value={5}>5 stars only</option>
                        <option value={4}>4+ stars</option>
                        <option value={3}>3+ stars</option>
                        <option value={2}>2+ stars</option>
                        <option value={1}>1+ star</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* Reviews list */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-secondary">Loading reviews...</p>
                </div>
            ) : filtered.length === 0 ? (
                <Alert variant="info" className="border-0">
                    No reviews match your search.
                </Alert>
            ) : (
                <Row className="g-3">
                    {filtered.map(r => (
                        <Col key={r.reviewId} xs={12} md={6} xl={4}>
                            <Card
                                className="h-100 border-0 shadow-sm"
                                style={{ borderRadius: '12px' }}
                            >
                                <Card.Body className="p-4">
                                    {/* Stars + date */}
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Stars rating={r.rating} />
                                        <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
                                            {new Date(r.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {/* Comment */}
                                    <p
                                        className="mb-3 text-dark"
                                        style={{
                                            fontSize: '0.9rem',
                                            lineHeight: '1.5',
                                            minHeight: '48px'
                                        }}
                                    >
                                        "{r.comment}"
                                    </p>

                                    {/* Footer */}
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-semibold small">{r.customerName}</div>
                                        </div>
                                        <Badge bg="light" text="dark" className="border">
                                            {r.vehicleNumber}
                                        </Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};
