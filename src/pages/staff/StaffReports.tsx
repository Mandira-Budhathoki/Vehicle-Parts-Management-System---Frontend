import React, { useEffect, useState, useCallback } from 'react';
import {
    Card, Table, Badge, Button, Spinner,
    Modal, Nav, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { reportsApi, type RegularCustomer, type HighSpender, type PendingCredit } from '../../services/reportsApi';
import { useToast } from '../../context/ToastContext';

type ActiveTab = 'regulars' | 'highSpenders' | 'pendingCredits';

interface ModalState {
    show: boolean;
    title: string;
    rows: { label: string; value: React.ReactNode }[];
}

export const StaffReports: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<ActiveTab>('regulars');
    const [regulars, setRegulars] = useState<RegularCustomer[]>([]);
    const [highSpenders, setHighSpenders] = useState<HighSpender[]>([]);
    const [pendingCredits, setPendingCredits] = useState<PendingCredit[]>([]);
    const [loading, setLoading] = useState<Record<ActiveTab, boolean>>({
        regulars: false, highSpenders: false, pendingCredits: false,
    });
    const [modal, setModal] = useState<ModalState>({ show: false, title: '', rows: [] });

    const setTabLoading = (tab: ActiveTab, val: boolean) =>
        setLoading(prev => ({ ...prev, [tab]: val }));

    const fetchRegulars = useCallback(async () => {
        setTabLoading('regulars', true);
        try {
            const data = await reportsApi.getRegularCustomers();
            setRegulars(data);
        } catch {
            showToast('Failed to load regular customers report.', 'danger');
        } finally {
            setTabLoading('regulars', false);
        }
    }, [showToast]);

    const fetchHighSpenders = useCallback(async () => {
        setTabLoading('highSpenders', true);
        try {
            const data = await reportsApi.getHighSpenders();
            setHighSpenders(data);
        } catch {
            showToast('Failed to load high spenders report.', 'danger');
        } finally {
            setTabLoading('highSpenders', false);
        }
    }, [showToast]);

    const fetchPendingCredits = useCallback(async () => {
        setTabLoading('pendingCredits', true);
        try {
            const data = await reportsApi.getPendingCredits();
            setPendingCredits(data);
        } catch {
            showToast('Failed to load pending credits report.', 'danger');
        } finally {
            setTabLoading('pendingCredits', false);
        }
    }, [showToast]);

    useEffect(() => {
        if (activeTab === 'regulars' && regulars.length === 0) fetchRegulars();
        if (activeTab === 'highSpenders' && highSpenders.length === 0) fetchHighSpenders();
        if (activeTab === 'pendingCredits' && pendingCredits.length === 0) fetchPendingCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleRefresh = () => {
        if (activeTab === 'regulars') fetchRegulars();
        if (activeTab === 'highSpenders') fetchHighSpenders();
        if (activeTab === 'pendingCredits') fetchPendingCredits();
        showToast('Report refreshed.', 'info');
    };

    const openRegularDetail = (c: RegularCustomer) => setModal({
        show: true,
        title: `Regular Customer — ${c.name}`,
        rows: [
            { label: 'Customer ID', value: `#${c.userId}` },
            { label: 'Email', value: c.email },
            { label: 'Phone', value: c.phone },
            { label: 'Total Orders', value: <Badge bg="primary">{c.totalOrders}</Badge> },
            { label: 'Total Spent', value: <strong className="text-success">Rs. {c.totalSpent.toLocaleString()}</strong> },
            { label: 'Last Purchase', value: new Date(c.lastPurchaseDate).toLocaleDateString() },
        ],
    });

    const openHighSpenderDetail = (c: HighSpender) => setModal({
        show: true,
        title: `High Spender — ${c.name}`,
        rows: [
            { label: 'Customer ID', value: `#${c.userId}` },
            { label: 'Email', value: c.email },
            { label: 'Phone', value: c.phone },
            { label: 'Total Spent', value: <strong className="text-warning">Rs. {c.totalSpent.toLocaleString()}</strong> },
            { label: 'Total Orders', value: c.totalOrders },
            { label: 'Loyalty Status', value: c.hasLoyaltyDiscount ? <Badge bg="success">10% Discount Eligible</Badge> : <Badge bg="secondary">Not Yet Eligible</Badge> },
        ],
    });

    const openCreditDetail = (c: PendingCredit) => setModal({
        show: true,
        title: `Pending Credit — ${c.name}`,
        rows: [
            { label: 'Customer ID', value: `#${c.userId}` },
            { label: 'Invoice #', value: `#${c.salesId}` },
            { label: 'Email', value: c.email },
            { label: 'Phone', value: c.phone },
            { label: 'Amount Due', value: <strong className="text-danger">Rs. {c.amountDue.toLocaleString()}</strong> },
            { label: 'Sale Date', value: new Date(c.saleDate).toLocaleDateString() },
            { label: 'Days Overdue', value: <span className={c.daysOverdue > 60 ? 'text-danger fw-bold' : 'text-warning'}>{c.daysOverdue} days {c.daysOverdue > 60 ? '⚠ CRITICAL' : ''}</span> },
        ],
    });

    const isLoading = loading[activeTab];

    const tabConfig = [
        { key: 'regulars' as ActiveTab, label: 'Regular Customers', icon: 'bi-person-check-fill', color: 'primary' },
        { key: 'highSpenders' as ActiveTab, label: 'High Spenders', icon: 'bi-star-fill', color: 'warning' },
        { key: 'pendingCredits' as ActiveTab, label: 'Pending Credits', icon: 'bi-credit-card-fill', color: 'danger' },
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-light mb-1">Customer Reports</h2>
                    <p className="text-secondary mb-0 small">Insights into regulars, high spenders, and overdue credits</p>
                </div>
                <OverlayTrigger placement="left" overlay={<Tooltip>Refresh current report</Tooltip>}>
                    <Button variant="outline-secondary" size="sm" onClick={handleRefresh} disabled={isLoading}>
                        <i className={`bi bi-arrow-clockwise`}></i>
                        <span className="ms-2 d-none d-md-inline">Refresh</span>
                    </Button>
                </OverlayTrigger>
            </div>

            {/* Tab Navigation */}
            <Nav variant="pills" className="mb-4 gap-2" activeKey={activeTab} onSelect={k => setActiveTab(k as ActiveTab)}>
                {tabConfig.map(tab => (
                    <Nav.Item key={tab.key}>
                        <Nav.Link
                            eventKey={tab.key}
                            className="d-flex align-items-center gap-2 px-3"
                            style={{
                                backgroundColor: activeTab === tab.key ? `var(--bs-${tab.color})` : 'rgba(255,255,255,0.05)',
                                color: activeTab === tab.key ? '#fff' : 'var(--bs-secondary)',
                                border: `1px solid ${activeTab === tab.key ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <i className={`bi ${tab.icon}`}></i>
                            <span className="d-none d-sm-inline">{tab.label}</span>
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            {/* Spinner */}
            {isLoading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-secondary mt-3 small">Loading report data…</p>
                </div>
            )}

            {/* Regular Customers */}
            {!isLoading && activeTab === 'regulars' && (
                <Card className="border overflow-hidden">
                    <Card.Header className="bg-primary bg-opacity-10 border-secondary p-3 d-flex align-items-center justify-content-between">
                        <h6 className="mb-0 text-light d-flex align-items-center gap-2">
                            <i className="bi bi-person-check-fill text-primary"></i>
                            Regular Customers
                            <Badge bg="primary" className="ms-1">{regulars.length}</Badge>
                        </h6>
                        <small className="text-secondary">3+ purchases</small>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {regulars.length === 0
                            ? <EmptyState message="No regular customers found yet." icon="bi-person-x" />
                            : (
                                <Table hover responsive className="mb-0">
                                    <thead>
                                        <tr className="border-secondary">
                                            <th className="p-3">Customer</th>
                                            <th className="p-3">Orders</th>
                                            <th className="p-3">Total Spent</th>
                                            <th className="p-3">Last Purchase</th>
                                            <th className="p-3">View</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {regulars.map(c => (
                                            <tr key={c.userId} className="border-secondary">
                                                <td className="p-3 align-middle">
                                                    <div className="fw-semibold">{c.name}</div>
                                                    <small className="text-secondary">{c.phone}</small>
                                                </td>
                                                <td className="p-3 align-middle"><Badge bg="primary">{c.totalOrders}</Badge></td>
                                                <td className="p-3 align-middle fw-bold text-success">Rs. {c.totalSpent.toLocaleString()}</td>
                                                <td className="p-3 align-middle text-secondary">{new Date(c.lastPurchaseDate).toLocaleDateString()}</td>
                                                <td className="p-3 align-middle">
                                                    <Button variant="outline-primary" size="sm" onClick={() => openRegularDetail(c)}>
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                    </Card.Body>
                </Card>
            )}

            {/* High Spenders */}
            {!isLoading && activeTab === 'highSpenders' && (
                <Card className="border overflow-hidden">
                    <Card.Header className="bg-warning bg-opacity-10 border-secondary p-3 d-flex align-items-center justify-content-between">
                        <h6 className="mb-0 text-light d-flex align-items-center gap-2">
                            <i className="bi bi-star-fill text-warning"></i>
                            High Spenders
                            <Badge bg="warning" text="dark" className="ms-1">{highSpenders.length}</Badge>
                        </h6>
                        <small className="text-secondary">Total spend &gt; Rs. 2,000</small>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {highSpenders.length === 0
                            ? <EmptyState message="No high spenders found yet." icon="bi-star" />
                            : (
                                <Table hover responsive className="mb-0">
                                    <thead>
                                        <tr className="border-secondary">
                                            <th className="p-3">Customer</th>
                                            <th className="p-3">Total Spent</th>
                                            <th className="p-3">Orders</th>
                                            <th className="p-3">Loyalty</th>
                                            <th className="p-3">View</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {highSpenders.map(c => (
                                            <tr key={c.userId} className="border-secondary">
                                                <td className="p-3 align-middle">
                                                    <div className="fw-semibold">{c.name}</div>
                                                    <small className="text-secondary">{c.phone}</small>
                                                </td>
                                                <td className="p-3 align-middle fw-bold text-warning">Rs. {c.totalSpent.toLocaleString()}</td>
                                                <td className="p-3 align-middle">{c.totalOrders}</td>
                                                <td className="p-3 align-middle">
                                                    {c.hasLoyaltyDiscount
                                                        ? <Badge bg="success">10% Discount</Badge>
                                                        : <Badge bg="secondary">Standard</Badge>}
                                                </td>
                                                <td className="p-3 align-middle">
                                                    <Button variant="outline-warning" size="sm" onClick={() => openHighSpenderDetail(c)}>
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                    </Card.Body>
                </Card>
            )}

            {/* Pending Credits */}
            {!isLoading && activeTab === 'pendingCredits' && (
                <Card className="border overflow-hidden">
                    <Card.Header className="bg-danger bg-opacity-10 border-secondary p-3 d-flex align-items-center justify-content-between">
                        <h6 className="mb-0 text-light d-flex align-items-center gap-2">
                            <i className="bi bi-credit-card-fill text-danger"></i>
                            Pending Credits
                            <Badge bg="danger" className="ms-1">{pendingCredits.length}</Badge>
                        </h6>
                        <small className="text-secondary">Unpaid invoices &gt; 30 days</small>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {pendingCredits.length === 0
                            ? <EmptyState message="No overdue pending credits. All clear!" icon="bi-check-circle" />
                            : (
                                <Table hover responsive className="mb-0">
                                    <thead>
                                        <tr className="border-secondary">
                                            <th className="p-3">Customer</th>
                                            <th className="p-3">Invoice</th>
                                            <th className="p-3">Amount Due</th>
                                            <th className="p-3">Days Overdue</th>
                                            <th className="p-3">View</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingCredits.map(c => (
                                            <tr key={`${c.userId}-${c.salesId}`} className="border-secondary">
                                                <td className="p-3 align-middle">
                                                    <div className="fw-semibold">{c.name}</div>
                                                    <small className="text-secondary">{c.phone}</small>
                                                </td>
                                                <td className="p-3 align-middle text-secondary">#{c.salesId}</td>
                                                <td className="p-3 align-middle fw-bold text-danger">Rs. {c.amountDue.toLocaleString()}</td>
                                                <td className="p-3 align-middle">
                                                    <span className={c.daysOverdue > 60 ? 'text-danger fw-bold' : 'text-warning'}>
                                                        {c.daysOverdue}d {c.daysOverdue > 60 && <i className="bi bi-exclamation-triangle-fill ms-1"></i>}
                                                    </span>
                                                </td>
                                                <td className="p-3 align-middle">
                                                    <Button variant="outline-danger" size="sm" onClick={() => openCreditDetail(c)}>
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                    </Card.Body>
                </Card>
            )}

            {/* Customer Detail Modal */}
            <Modal
                show={modal.show}
                onHide={() => setModal(m => ({ ...m, show: false }))}
                centered
                contentClassName="bg-dark border-secondary text-light"
            >
                <Modal.Header
                    closeButton
                    closeVariant="white"
                    className="border-secondary"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                    <Modal.Title className="fs-6 fw-semibold">{modal.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <table className="w-100" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <tbody>
                            {modal.rows.map((row, i) => (
                                <tr key={i}>
                                    <td className="text-secondary pe-3" style={{ whiteSpace: 'nowrap', width: '40%' }}>{row.label}</td>
                                    <td>{row.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer className="border-secondary">
                    <Button variant="outline-secondary" size="sm" onClick={() => setModal(m => ({ ...m, show: false }))}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const EmptyState: React.FC<{ message: string; icon: string }> = ({ message, icon }) => (
    <div className="text-center py-5 text-secondary">
        <i className={`bi ${icon} fs-1 mb-3 d-block`}></i>
        <p className="mb-0">{message}</p>
    </div>
);