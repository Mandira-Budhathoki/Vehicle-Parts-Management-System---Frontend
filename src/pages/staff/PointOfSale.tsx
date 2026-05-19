import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Form, Button, Spinner,
    Alert, Modal, Table, Badge, InputGroup
} from 'react-bootstrap';
import { getCustomers, type UserProfile } from '../../services/authApi';
import { getAllParts, type Part } from '../../services/partApi';
import { createSalesInvoice, type SalesInvoice } from '../../services/salesApi';
import { sendInvoiceEmail } from '../../services/emailApi';
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

    const [createdInvoice, setCreatedInvoice] = useState<SalesInvoice | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const [emailAddress, setEmailAddress] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailResult, setEmailResult] = useState<{ ok: boolean; msg: string } | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [customersData, partsData] = await Promise.all([
                    getCustomers(),
                    getAllParts()
                ]);

                setCustomers(customersData);
                setParts(partsData);

            } catch {
                setError('Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        })();
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

    // Loyalty logic aligned with backend
    const isLoyaltyEligible = matchedCustomer
        ? ((matchedCustomer.totalSpent || 0) + total) >= 5000
        : false;

    const discountAmount = isLoyaltyEligible
        ? total * 0.10
        : 0;

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
            const invoice = await createSalesInvoice({
                userId: matchedCustomer.userId,
                staffId: user ? Number(user.id) : 1,
                salesItems: cart.map(c => ({
                    partId: c.partId,
                    quantity: c.quantity
                }))
            });

            setCreatedInvoice(invoice);

            setEmailAddress(matchedCustomer.email ?? '');
            setEmailResult(null);

            setShowInvoiceModal(true);

            setSuccess('Invoice created successfully!');

            setCart([]);
            setSelectedCustomerId('');

            const updatedParts = await getAllParts();
            setParts(updatedParts);

        } catch (err: unknown) {
            const msg = err instanceof Error
                ? err.message
                : 'Failed to create invoice.';

            setError(msg);

        } finally {
            setProcessing(false);
        }
    };

    const handleSendEmail = async () => {
        if (!createdInvoice) return;

        if (!emailAddress.trim()) {
            setEmailResult({
                ok: false,
                msg: 'Please enter a valid email address.'
            });

            return;
        }

        setSendingEmail(true);
        setEmailResult(null);

        try {
            const res = await sendInvoiceEmail({
                salesId: createdInvoice.salesId,
                customerEmail: emailAddress.trim()
            });

            setEmailResult({
                ok: true,
                msg: res.message
            });

        } catch (err: unknown) {
            const msg = err instanceof Error
                ? err.message
                : 'Failed to send email.';

            setEmailResult({
                ok: false,
                msg
            });

        } finally {
            setSendingEmail(false);
        }
    };

    const handleCloseModal = () => {
        setShowInvoiceModal(false);
        setCreatedInvoice(null);
        setEmailResult(null);
        setEmailAddress('');
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
                onHide={handleCloseModal}
                size="lg"
                centered
            >
                <Modal.Header
                    closeButton
                    className="border-0 pb-0"
                    style={{
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        borderRadius: '8px 8px 0 0'
                    }}
                >
                    <Modal.Title className="fw-bold text-white">
                        <i className="bi bi-receipt me-2"></i>
                        Invoice Preview
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-4 pt-4" style={{ background: '#ffffff' }}>

                    {createdInvoice && (
                        <>

                            <div
                                className="d-flex justify-content-between align-items-start mb-3 p-3 rounded"
                                style={{ background: '#f8f9fa' }}
                            >
                                <div>
                                    <div className="text-secondary small">Customer</div>
                                    <div className="fw-bold text-dark">
                                        {createdInvoice.customerName}
                                    </div>
                                </div>

                                <div className="text-end">
                                    <div className="text-secondary small">Invoice</div>

                                    <div className="fw-bold text-dark">
                                        #{createdInvoice.salesId.toString().padStart(6, '0')}
                                    </div>

                                    <div className="text-secondary small">
                                        {new Date(createdInvoice.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <Table bordered size="sm" className="mb-3">
                                <thead>
                                    <tr>
                                        <th style={{ background: '#6366f1', color: '#fff' }}>
                                            Part
                                        </th>

                                        <th
                                            className="text-center"
                                            style={{ background: '#6366f1', color: '#fff' }}
                                        >
                                            Qty
                                        </th>

                                        <th
                                            className="text-end"
                                            style={{ background: '#6366f1', color: '#fff' }}
                                        >
                                            Unit Price
                                        </th>

                                        <th
                                            className="text-end"
                                            style={{ background: '#6366f1', color: '#fff' }}
                                        >
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {createdInvoice.salesItems?.map(item => (
                                        <tr key={item.salesItemId}>
                                            <td>{item.partName}</td>
                                            <td className="text-center">{item.quantity}</td>

                                            <td className="text-end">
                                                Rs. {item.price.toLocaleString()}
                                            </td>

                                            <td className="text-end">
                                                Rs. {item.subtotal.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </Table>

                            <div
                                className="text-end mb-4 p-3 rounded"
                                style={{ background: '#f8f9fa' }}
                            >
                                <div className="text-muted small">
                                    Subtotal:
                                    <strong>
                                        {' '}Rs. {createdInvoice.totalAmount.toLocaleString()}
                                    </strong>
                                </div>

                                {createdInvoice.discount > 0 && (
                                    <div className="text-success small">
                                        Loyalty Discount:
                                        <strong>
                                            {' '}- Rs. {createdInvoice.discount.toLocaleString()}
                                        </strong>
                                    </div>
                                )}

                                <div
                                    className="fw-bold fs-5 mt-1"
                                    style={{ color: '#6366f1' }}
                                >
                                    Total Due:
                                    {' '}Rs. {createdInvoice.finalAmount.toLocaleString()}
                                </div>

                                <Badge
                                    className="mt-1"
                                    bg={
                                        createdInvoice.paymentStatus === 'Completed'
                                            ? 'success'
                                            : 'warning'
                                    }
                                >
                                    {createdInvoice.paymentStatus.toUpperCase()}
                                </Badge>
                            </div>

                            <div
                                className="p-3 rounded"
                                style={{
                                    background: '#f0f0ff',
                                    border: '1px solid #c7c9f9'
                                }}
                            >
                                <h6
                                    className="fw-bold mb-2"
                                    style={{ color: '#6366f1' }}
                                >
                                    <i className="bi bi-envelope me-2"></i>
                                    Email Invoice to Customer
                                </h6>

                                <InputGroup className="mb-2">

                                    <InputGroup.Text
                                        style={{
                                            background: '#6366f1',
                                            color: '#fff',
                                            border: 'none'
                                        }}
                                    >
                                        <i className="bi bi-at"></i>
                                    </InputGroup.Text>

                                    <Form.Control
                                        type="email"
                                        placeholder="customer@example.com"
                                        value={emailAddress}
                                        onChange={e => {
                                            setEmailAddress(e.target.value);
                                            setEmailResult(null);
                                        }}
                                        style={{
                                            border: '1px solid #c7c9f9'
                                        }}
                                    />

                                    <Button
                                        onClick={handleSendEmail}
                                        disabled={sendingEmail}
                                        style={{
                                            background: '#6366f1',
                                            border: 'none',
                                            minWidth: '90px',
                                            color: '#fff'
                                        }}
                                    >
                                        {sendingEmail ? (
                                            <Spinner animation="border" size="sm" />
                                        ) : (
                                            <>
                                                <i className="bi bi-send me-1"></i>
                                                Send
                                            </>
                                        )}
                                    </Button>

                                </InputGroup>

                                {emailResult && (
                                    <Alert
                                        variant={emailResult.ok ? 'success' : 'danger'}
                                        className="mb-0 py-2 px-3"
                                    >
                                        <i
                                            className={`bi ${emailResult.ok
                                                    ? 'bi-check-circle'
                                                    : 'bi-exclamation-triangle'
                                                } me-2`}
                                        ></i>

                                        {emailResult.msg}
                                    </Alert>
                                )}
                            </div>

                        </>
                    )}

                </Modal.Body>

                <Modal.Footer
                    style={{
                        background: '#f8f9fa',
                        borderTop: '1px solid #dee2e6'
                    }}
                >
                    <Button
                        onClick={() => window.print()}
                        style={{
                            background: '#374151',
                            border: 'none',
                            color: '#fff',
                            minWidth: '90px'
                        }}
                    >
                        <i className="bi bi-printer me-1"></i>
                        Print
                    </Button>

                    <Button
                        onClick={handleCloseModal}
                        style={{
                            background: '#6b7280',
                            border: 'none',
                            color: '#fff',
                            minWidth: '90px'
                        }}
                    >
                        Close
                    </Button>
                </Modal.Footer>

            </Modal>
        </div>
    );
};