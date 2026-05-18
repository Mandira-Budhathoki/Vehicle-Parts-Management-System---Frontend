import React, { useEffect, useState, useCallback } from 'react';
import {
    Row, Col, Card, Table, Badge, Button, Spinner,
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

    const isLoading = loading[activeTab];

    const EmptyState: React.FC<{ message: string; icon: string }> = ({ message, icon }) => (
        <div className="text-center py-5 text-secondary">
            <i className={`bi ${icon} fs-1 mb-3 d-block`}></i>
            <p className="mb-0">{message}</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h2 className="fw-bold text-light mb-4">Customer Reports</h2>

            {isLoading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {!isLoading && activeTab === 'regulars' && (
                <Card>
                    <Card.Body>
                        {regulars.length === 0 ? (
                            <EmptyState message="No regular customers found." icon="bi-person-x" />
                        ) : (
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Orders</th>
                                        <th>Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regulars.map(c => (
                                        <tr key={c.userId}>
                                            <td>{c.name}</td>
                                            <td>{c.totalOrders}</td>
                                            <td>Rs. {c.totalSpent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};