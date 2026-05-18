import React, { useEffect, useState, useCallback } from 'react';
import {
    Card, Table, Badge, Button, Spinner,
    Modal, Nav, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { reportsApi, type RegularCustomer, type HighSpender, type PendingCredit } from '../../services/ReportsApi';
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
        regulars: false,
        highSpenders: false,
        pendingCredits: false,
    });

    const [modal, setModal] = useState<ModalState>({
        show: false,
        title: '',
        rows: [],
    });

    const setTabLoading = (tab: ActiveTab, val: boolean) =>
        setLoading(prev => ({ ...prev, [tab]: val }));

    // ================= FETCH DATA =================
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
    }, [activeTab]);

    const handleRefresh = () => {
        if (activeTab === 'regulars') fetchRegulars();
        if (activeTab === 'highSpenders') fetchHighSpenders();
        if (activeTab === 'pendingCredits') fetchPendingCredits();
        showToast('Report refreshed.', 'info');
    };

    // ================= MODALS =================
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
            {
                label: 'Loyalty Status',
                value: c.hasLoyaltyDiscount
                    ? <Badge bg="success">10% Discount Eligible</Badge>
                    : <Badge bg="secondary">Not Yet Eligible</Badge>
            },
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
            {
                label: 'Days Overdue',
                value: (
                    <span className={c.daysOverdue > 60 ? 'text-danger fw-bold' : 'text-warning'}>
                        {c.daysOverdue} days {c.daysOverdue > 60 ? '⚠ CRITICAL' : ''}
                    </span>
                )
            },
        ],
    });

    const isLoading = loading[activeTab];

    const EmptyState: React.FC<{ message: string; icon: string }> = ({ message, icon }) => (
        <div className="text-center py-5 text-secondary">
            <i className={`bi ${icon} fs-1 mb-3 d-block`}></i>
            <p className="mb-0">{message}</p>
        </div>
    );

    const tabConfig: {
        key: ActiveTab;
        label: string;
        icon: string;
    }[] = [
            {
                key: 'regulars',
                label: 'Regular Customers',
                icon: 'bi-people-fill'
            },
            {
                key: 'highSpenders',
                label: 'High Spenders',
                icon: 'bi-cash-coin'
            },
            {
                key: 'pendingCredits',
                label: 'Pending Credits',
                icon: 'bi-exclamation-triangle-fill'
            }
        ];

    return (
        <div className="animate-fade-in">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-light mb-1">Customer Reports</h2>
                    <p className="text-secondary mb-0 small">
                        Insights into customers and financial status
                    </p>
                </div>

                <Button variant="outline-secondary" size="sm" onClick={handleRefresh}>
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                </Button>
            </div>

            {/* TABS */}
            <Nav variant="pills" className="mb-4 gap-2">
                {tabConfig.map(tab => (
                    <Nav.Item key={tab.key}>
                        <Nav.Link
                            active={activeTab === tab.key}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <i className={`bi ${tab.icon} me-2`}></i>
                            {tab.label}
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            {/* LOADING */}
            {isLoading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-secondary mt-3">Loading...</p>
                </div>
            )}

            {/* REGULARS */}
            {!isLoading && activeTab === 'regulars' && (
                <Card>
                    <Card.Body className="p-0">
                        <Table hover responsive>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Orders</th>
                                    <th>Spent</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {regulars.map(c => (
                                    <tr key={c.userId}>
                                        <td>{c.name}</td>
                                        <td><Badge bg="primary">{c.totalOrders}</Badge></td>
                                        <td>Rs. {c.totalSpent.toLocaleString()}</td>
                                        <td>
                                            <Button size="sm" onClick={() => openRegularDetail(c)}>
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* HIGH SPENDERS */}
            {!isLoading && activeTab === 'highSpenders' && (
                <Card>
                    <Card.Body className="p-0">
                        <Table hover responsive>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Spent</th>
                                    <th>Orders</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {highSpenders.map(c => (
                                    <tr key={c.userId}>
                                        <td>{c.name}</td>
                                        <td>Rs. {c.totalSpent.toLocaleString()}</td>
                                        <td>{c.totalOrders}</td>
                                        <td>
                                            <Button size="sm" onClick={() => openHighSpenderDetail(c)}>
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* PENDING CREDITS */}
            {!isLoading && activeTab === 'pendingCredits' && (
                <Card>
                    <Card.Body className="p-0">
                        <Table hover responsive>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Invoice</th>
                                    <th>Due</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingCredits.map(c => (
                                    <tr key={`${c.userId}-${c.salesId}`}>
                                        <td>{c.name}</td>
                                        <td>#{c.salesId}</td>
                                        <td className="text-danger">
                                            Rs. {c.amountDue.toLocaleString()}
                                        </td>
                                        <td>
                                            <Button size="sm" variant="danger" onClick={() => openCreditDetail(c)}>
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* MODAL */}
            <Modal show={modal.show} onHide={() => setModal(m => ({ ...m, show: false }))} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modal.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className="w-100">
                        <tbody>
                            {modal.rows.map((row, i) => (
                                <tr key={i}>
                                    <td className="text-secondary pe-3">{row.label}</td>
                                    <td>{row.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Modal.Body>
            </Modal>
        </div>
    );
};

// EMPTY STATE (kept in case you need later)
const EmptyState: React.FC<{ message: string; icon: string }> = ({ message, icon }) => (
    <div className="text-center py-5 text-secondary">
        <i className={`bi ${icon} fs-1 mb-3 d-block`}></i>
        <p className="mb-0">{message}</p>
    </div>
);