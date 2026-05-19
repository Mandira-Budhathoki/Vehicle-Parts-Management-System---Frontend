import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Form,
    Button,
    Spinner,
    Alert,
    Modal,
    Table,
    Badge
} from 'react-bootstrap';

import { getCustomers, type UserProfile } from '../../services/authApi';
import { getAllParts, type Part } from '../../services/partApi';
import { createSalesInvoice } from '../../services/salesApi';
import { useAuth } from '../../context/AuthContext';

export const PointOfSale: React.FC = () => {
    const { user } = useAuth();

    const [customers, setCustomers] = useState<UserProfile[]>([]);
    const [parts, setParts] = useState<Part[]>([]);

    const [cart, setCart] = useState<{
        partId: number;
        quantity: number;
        name: string;
        price: number;
        stock: number;
    }[]>([]);

    const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [createdInvoice, setCreatedInvoice] = useState<any>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customersData, partsData] = await Promise.all([
                    getCustomers(),
                    getAllParts()
                ]);

                setCustomers(customersData);
                setParts(partsData);
            } catch (err) {
                setError('Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const matchedCustomer = selectedCustomerId
        ? customers.find(c => c.userId === Number(selectedCustomerId))
        : null;

    const addToCart = (part: Part) => {
        const existing = cart.find(c => c.partId === part.partId);

        if (existing) {
            if (existing.quantity >= part.stockQuantity) return;

            setCart(
                cart.map(c =>
                    c.partId === part.partId
                        ? { ...c, quantity: c.quantity + 1 }
                        : c
                )
            );
        } else {
            setCart([
                ...cart,
                {
                    partId: part.partId,
                    quantity: 1,
                    name: part.partName,
                    price: part.price,
                    stock: part.stockQuantity
                }
            ]);
        }
    };

    const removeFromCart = (partId: number) => {
        setCart(cart.filter(c => c.partId !== partId));
    };

    const updateQuantity = (partId: number, delta: number) => {
        setCart(
            cart.map(c => {
                if (c.partId === partId) {
                    const newQ = c.quantity + delta;

                    if (newQ <= 0) return c;
                    if (newQ > c.stock) return c;

                    return {
                        ...c,
                        quantity: newQ
                    };
                }

                return c;
            })
        );
    };

    const total = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    const isLoyaltyEligible = matchedCustomer
        ? (matchedCustomer.totalSpent || 0) + total >= 5000
        : false;

    const discountAmount = isLoyaltyEligible ? total * 0.10 : 0;
    const finalAmount = total - discountAmount;

    const handleCharge = async () => {
        if (!matchedCustomer) {
            setError('Please select a customer.');
            return;
        }

        if (cart.length === 0) {
            setError('Cart is empty.');
            return;
        }

        setProcessing(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                userId: matchedCustomer.userId,
                staffId: user ? Number(user.id) : 1,
                salesItems: cart.map(c => ({
                    partId: c.partId,
                    quantity: c.quantity
                }))
            };

            const res = await createSalesInvoice(payload);

            setCreatedInvoice(res);
            setShowInvoiceModal(true);

            setSuccess('Invoice created successfully!');

            setCart([]);
            setSelectedCustomerId('');

            const updatedParts = await getAllParts();
            setParts(updatedParts);

        } catch (err: any) {
            setError(err.message || 'Failed to create invoice.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-center text-light">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <div
            className="animate-fade-in h-100 d-flex flex-column text-dark"
            style={{
                background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '1.5rem',
                borderRadius: '12px'
            }}
        >
            <div className="d-flex align-items-center mb-4 gap-3">
                <div className="bg-primary bg-gradient p-2 rounded shadow">
                    <i className="bi bi-cart-check fs-4 text-white"></i>
                </div>

                <h2
                    className="mb-0 text-dark fw-bold"
                    style={{ letterSpacing: '0.5px' }}
                >
                    Point of Sale
                </h2>
            </div>

            {error && (
                <Alert variant="danger" className="border-0 shadow-sm">
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" className="border-0 shadow-sm">
                    {success}
                </Alert>
            )}

            <Row className="g-4 flex-grow-1">

                {/* LEFT SIDE */}
                <Col xs={12} lg={7} xl={8}>

                    <Card
                        className="text-dark h-100 d-flex flex-column border-0 shadow-lg"
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px'
                        }}
                    >
                        <Card.Body className="d-flex flex-column p-4">

                            <h5 className="mb-3 fw-bold text-primary">
                                <i className="bi bi-person-badge me-2"></i>
                                Select Customer
                            </h5>

                            <Form.Select
                                className="text-dark border-secondary mb-4 shadow-sm"
                                value={selectedCustomerId}
                                onChange={(e) =>
                                    setSelectedCustomerId(
                                        e.target.value ? Number(e.target.value) : ''
                                    )
                                }
                            >
                                <option value="">▼ Choose a Customer --</option>

                                {customers.map(c => (
                                    <option key={c.userId} value={c.userId}>
                                        {c.name} ({c.phone || c.email})
                                    </option>
                                ))}
                            </Form.Select>

                            {matchedCustomer && (
                                <div
                                    className="p-3 rounded mb-4 shadow-sm"
                                    style={{
                                        background:
                                            'linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.02) 100%)',
                                        borderLeft: '4px solid #6366f1'
                                    }}
                                >
                                    <div className="fw-bold fs-5 text-dark mb-1">
                                        {matchedCustomer.name}
                                    </div>

                                    <div className="small text-secondary">
                                        {matchedCustomer.email} | {matchedCustomer.phone}
                                    </div>

                                    {isLoyaltyEligible && (
                                        <Badge bg="success" className="mt-2">
                                            Loyalty Member - 10% Discount Available
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <h5 className="mt-3 mb-3 fw-bold text-primary">
                                <i className="bi bi-box-seam me-2"></i>
                                Available Parts
                            </h5>

                            <div
                                className="flex-grow-1 overflow-auto pe-2"
                                style={{
                                    maxHeight: 'max(400px, calc(100vh - 450px))'
                                }}
                            >
                                <div className="d-flex flex-column gap-3">

                                    {parts.filter(p => p.stockQuantity > 0).map(part => (

                                        <div
                                            key={part.partId}
                                            className="d-flex justify-content-between align-items-center p-3 rounded"
                                            style={{
                                                background: '#ffffff',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div>
                                                <div className="fw-bold fs-6 text-dark mb-1">
                                                    {part.partName}
                                                </div>

                                                <div className="small d-flex align-items-center gap-3">
                                                    <span className="text-success fw-semibold">
                                                        Rs. {part.price.toLocaleString()}
                                                    </span>

                                                    <span className="text-info">
                                                        Stock: {part.stockQuantity}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => addToCart(part)}
                                            >
                                                Add
                                            </Button>
                                        </div>

                                    ))}

                                </div>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>

                {/* RIGHT SIDE */}
                <Col xs={12} lg={5} xl={4}>

                    <Card
                        className="text-dark h-100 d-flex flex-column border-0 shadow-lg"
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px'
                        }}
                    >
                        <Card.Body className="d-flex flex-column p-4">

                            <h5 className="mb-4 fw-bold text-primary">
                                <i className="bi bi-cart3 me-2"></i>
                                Current Order
                            </h5>

                            <div
                                className="flex-grow-1 mb-4 overflow-auto pe-2"
                                style={{
                                    maxHeight: 'max(300px, calc(100vh - 450px))'
                                }}
                            >
                                {cart.length === 0 ? (
                                    <p className="text-secondary fst-italic">
                                        Cart is empty.
                                    </p>
                                ) : (
                                    <div className="d-flex flex-column gap-3">

                                        {cart.map((item, idx) => (

                                            <div
                                                key={idx}
                                                className="d-flex flex-column p-3 rounded"
                                                style={{
                                                    background: '#ffffff',
                                                    border: '1px solid rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center mb-3">

                                                    <span className="fw-bold">
                                                        {item.name}
                                                    </span>

                                                    <Button
                                                        variant="link"
                                                        className="text-danger p-0 border-0"
                                                        onClick={() =>
                                                            removeFromCart(item.partId)
                                                        }
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center">

                                                    <div className="d-flex align-items-center gap-2">

                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() =>
                                                                updateQuantity(item.partId, -1)
                                                            }
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            -
                                                        </Button>

                                                        <span>{item.quantity}</span>

                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() =>
                                                                updateQuantity(item.partId, 1)
                                                            }
                                                            disabled={item.quantity >= item.stock}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>

                                                    <span className="text-success fw-bold">
                                                        Rs. {(item.price * item.quantity).toLocaleString()}
                                                    </span>

                                                </div>
                                            </div>

                                        ))}

                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-4 border-top">

                                <div className="d-flex justify-content-between mb-2 fs-6">
                                    <span className="text-secondary fw-medium">
                                        Subtotal
                                    </span>

                                    <span className="text-dark fw-semibold">
                                        Rs. {total.toLocaleString()}
                                    </span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="d-flex justify-content-between text-success mb-2">
                                        <span>Loyalty Discount (10%)</span>
                                        <span>
                                            - Rs. {discountAmount.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div
                                    className="d-flex justify-content-between fw-bold fs-4 mt-3 mb-4 p-3 rounded shadow-sm"
                                    style={{
                                        background: 'rgba(99,102,241,0.05)'
                                    }}
                                >
                                    <span className="text-primary">Total</span>

                                    <span className="text-dark">
                                        Rs. {finalAmount.toLocaleString()}
                                    </span>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-100"
                                    disabled={
                                        cart.length === 0 ||
                                        !matchedCustomer ||
                                        processing
                                    }
                                    onClick={handleCharge}
                                >
                                    {processing ? (
                                        <>
                                            <Spinner animation="border" size="sm" />
                                            {' '}Processing...
                                        </>
                                    ) : (
                                        'Charge & Create Invoice'
                                    )}
                                </Button>

                            </div>

                        </Card.Body>
                    </Card>

                </Col>
            </Row>

            {/* INVOICE MODAL */}
            <Modal
                show={showInvoiceModal}
                onHide={() => setShowInvoiceModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Invoice Generated
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    {createdInvoice && (
                        <div>

                            <h4 className="mb-4">
                                Invoice #{createdInvoice.salesId}
                            </h4>

                            <Table bordered>

                                <thead>
                                    <tr>
                                        <th>Part</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {createdInvoice.salesItems?.map((item: any) => (
                                        <tr key={item.salesItemId}>
                                            <td>{item.partName}</td>
                                            <td>{item.quantity}</td>
                                            <td>Rs. {item.price}</td>
                                            <td>Rs. {item.subtotal}</td>
                                        </tr>
                                    ))}

                                </tbody>

                            </Table>

                            <div className="text-end mt-4">

                                <h6>
                                    Subtotal: Rs. {createdInvoice.totalAmount}
                                </h6>
                                {createdInvoice.discount > 0 && (
                                    <h6 className="text-success mb-2">
                                        Loyalty Discount (10%): - Rs. {createdInvoice.discount}
                                    </h6>
                                )}
                                <h4 className="mt-3 text-primary">
                                    Total: Rs. {createdInvoice.finalAmount}
                                </h4>

                            </div>

                        </div>
                    )}

                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowInvoiceModal(false)}
                    >
                        Close
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => window.print()}
                    >
                        Print
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};