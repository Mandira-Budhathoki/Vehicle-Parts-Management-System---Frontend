import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

interface CartItem {
    partId: number;
    name: string;
    price: number;
    quantity: number;
}

interface Part {
    partId: number;
    partName: string;
    price: number;
    stockQuantity: number;
}

export const PointOfSale: React.FC = () => {
    const { user } = useAuth();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const [parts] = useState<Part[]>([
        { partId: 1, partName: 'Brake Pad', price: 1200, stockQuantity: 10 },
        { partId: 2, partName: 'Oil Filter', price: 800, stockQuantity: 15 },
        { partId: 3, partName: 'Air Filter', price: 600, stockQuantity: 20 }
    ]);

    // Add to cart
    const addToCart = (part: Part) => {
        setCart(prev => {
            const existing = prev.find(i => i.partId === part.partId);

            if (existing) {
                return prev.map(i =>
                    i.partId === part.partId
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }

            return [
                ...prev,
                {
                    partId: part.partId,
                    name: part.partName,
                    price: part.price,
                    quantity: 1
                }
            ];
        });
    };

    const updateQty = (partId: number, qty: number) => {
        if (qty < 1) return;

        setCart(prev =>
            prev.map(i =>
                i.partId === partId ? { ...i, quantity: qty } : i
            )
        );
    };

    const removeItem = (partId: number) => {
        setCart(prev => prev.filter(i => i.partId !== partId));
    };

    // Totals
    const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
    const discount = subtotal > 5000 ? subtotal * 0.10 : 0;
    const total = subtotal - discount;

    // Checkout
    const handleCheckout = async () => {
        if (!customerId) {
            alert('Please enter a Customer ID');
            return;
        }

        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                userId: customerId,
                staffId: user?.id || 0,
                items: cart.map(i => ({
                    partId: i.partId,
                    quantity: i.quantity
                }))
            };

            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error('Failed to create sale');
            }

            const data = await res.json();

            alert(`Sale Completed!\nFinal Amount: Rs ${data.finalAmount}`);

            // reset cart
            setCart([]);

        } catch (err: any) {
            alert(err.message || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="mb-4 text-light fw-bold">Point of Sale</h2>

            <Row className="g-4">

                {/* LEFT */}
                <Col lg={7}>
                    <Card className="bg-dark text-light border-secondary">
                        <Card.Body>

                            <h5 className="mb-3">Customer ID</h5>

                            <Form.Control
                                type="number"
                                placeholder="Enter Customer ID"
                                value={customerId ?? ''}
                                onChange={(e) =>
                                    setCustomerId(e.target.value ? Number(e.target.value) : null)
                                }
                                className="mb-4"
                            />

                            <h5 className="mb-3">Parts</h5>

                            {parts.map(part => (
                                <div
                                    key={part.partId}
                                    className="d-flex justify-content-between align-items-center p-3 border border-secondary rounded mb-2"
                                >
                                    <div>
                                        <div className="fw-bold">{part.partName}</div>
                                        <small className="text-secondary">
                                            Rs {part.price} | Stock: {part.stockQuantity}
                                        </small>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline-light"
                                        onClick={() => addToCart(part)}
                                    >
                                        Add
                                    </Button>
                                </div>
                            ))}

                        </Card.Body>
                    </Card>
                </Col>

                {/* RIGHT */}
                <Col lg={5}>
                    <Card className="bg-dark text-light border-secondary">
                        <Card.Body>

                            <h5 className="mb-3">Cart</h5>

                            {cart.length === 0 ? (
                                <p className="text-secondary">Cart is empty</p>
                            ) : (
                                cart.map(item => (
                                    <div
                                        key={item.partId}
                                        className="d-flex justify-content-between align-items-center mb-2"
                                    >
                                        <div>
                                            <div>{item.name}</div>
                                            <small>Rs {item.price}</small>
                                        </div>

                                        <div className="d-flex align-items-center gap-2">
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateQty(item.partId, Number(e.target.value))
                                                }
                                                style={{ width: 60 }}
                                            />

                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => removeItem(item.partId)}
                                            >
                                                X
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}

                            <hr />

                            <div className="d-flex justify-content-between">
                                <span>Subtotal</span>
                                <span>Rs {subtotal}</span>
                            </div>

                            <div className="d-flex justify-content-between text-success">
                                <span>Discount</span>
                                <span>- Rs {discount}</span>
                            </div>

                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>Total</span>
                                <span>Rs {total}</span>
                            </div>

                            {subtotal > 5000 && (
                                <Badge bg="success" className="mt-2">
                                    10% Loyalty Discount Applied
                                </Badge>
                            )}

                            <Button
                                className="w-100 mt-3"
                                onClick={handleCheckout}
                                disabled={loading || cart.length === 0}
                            >
                                {loading ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Checkout'
                                )}
                            </Button>

                        </Card.Body>
                    </Card>
                </Col>

            </Row>
        </div>
    );
};