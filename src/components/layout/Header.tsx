import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Dropdown, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { getNotifications, markAsRead, markAllAsRead, type AppNotification } from '../../services/notificationApi';

export const Header: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    useEffect(() => {
        if (user) {
            loadNotifications();
            const interval = setInterval(loadNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const loadNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    const handleNotificationClick = async (notification: AppNotification) => {
        if (notification.isRead) return;
        try {
            await markAsRead(notification.notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.notificationId === notification.notificationId ? { ...n, isRead: true } : n
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'Appointment': return 'bi-calendar-check text-success';
            case 'PartRequest': return 'bi-cart-check text-warning';
            case 'ALERT': return 'bi-exclamation-triangle text-danger';
            default: return 'bi-info-circle text-primary';
        }
    };

    return (
        <Navbar
            expand="lg"
            className="px-4 border-bottom app-header"
            style={{ height: '70px' }}
        >
            <div className="d-flex justify-content-between w-100 align-items-center">

                {/* Search bar */}
                <Form className="d-none d-md-flex" style={{ width: '300px' }}>
                    <InputGroup>
                        <InputGroup.Text>
                            <i className="bi bi-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search anything..."
                            className="border-start-0 shadow-none ps-0"
                        />
                    </InputGroup>
                </Form>

                <Nav className="ms-auto d-flex align-items-center gap-3">
                    <ThemeToggle className="me-2" />

                    {/* Notification Bell */}
                    <Dropdown align="end">
                        <Dropdown.Toggle
                            variant="link"
                            className="position-relative p-2 rounded-circle nav-icon-btn text-decoration-none"
                            style={{
                                cursor: 'pointer',
                                border: 'none',
                                background: 'transparent',
                                color: 'inherit',
                                boxShadow: 'none'
                            }}
                        >
                            <i className="bi bi-bell fs-5"></i>
                            {unreadCount > 0 && (
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                    style={{ fontSize: '0.6rem' }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                            style={{ width: '320px', maxHeight: '420px', overflowY: 'auto' }}
                            className="p-0 shadow"
                        >
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="m-0 fw-bold">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span
                                            className="badge bg-danger ms-2"
                                            style={{ fontSize: '0.7rem' }}
                                        >
                                            {unreadCount}
                                        </span>
                                    )}
                                </h6>
                                {unreadCount > 0 && (
                                    <span
                                        onClick={handleMarkAllRead}
                                        style={{
                                            fontSize: '0.78rem',
                                            color: '#6366f1',
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Mark all as read
                                    </span>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-muted">
                                    <i className="bi bi-bell-slash fs-4 d-block mb-2"></i>
                                    <small>No notifications</small>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <Dropdown.Item
                                        key={n.notificationId}
                                        onClick={() => handleNotificationClick(n)}
                                        style={{ whiteSpace: 'normal' }}
                                        className={`p-3 border-bottom ${!n.isRead ? 'bg-light' : ''}`}
                                    >
                                        <div className="d-flex gap-2 align-items-start">
                                            <i className={`bi ${getNotificationIcon(n.type)} mt-1 flex-shrink-0`}></i>
                                            <div style={{ minWidth: 0 }}>
                                                <p
                                                    className={`mb-1 ${!n.isRead ? 'fw-semibold' : 'text-muted'}`}
                                                    style={{ fontSize: '0.85rem' }}
                                                >
                                                    {n.message}
                                                </p>
                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </small>
                                            </div>
                                            {!n.isRead && (
                                                <span
                                                    className="rounded-circle bg-primary flex-shrink-0 ms-auto mt-1"
                                                    style={{ width: '8px', height: '8px', display: 'inline-block' }}
                                                />
                                            )}
                                        </div>
                                    </Dropdown.Item>
                                ))
                            )}
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* User menu */}
                    <Dropdown align="end">
                        <Dropdown.Toggle
                            variant="link"
                            className="d-flex align-items-center gap-2 text-decoration-none"
                            style={{ cursor: 'pointer', border: 'none', background: 'transparent', color: 'inherit', boxShadow: 'none' }}
                        >
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-primary bg-primary bg-opacity-10"
                                style={{ width: '40px', height: '40px' }}
                            >
                                <i className="bi bi-person-fill fs-5"></i>
                            </div>
                            <span className="fw-medium user-name">{user?.name || 'User'}</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item href="#">
                                <i className="bi bi-person me-2"></i>Profile
                            </Dropdown.Item>
                            <Dropdown.Item href="#">
                                <i className="bi bi-gear me-2"></i>Settings
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                </Nav>
            </div>
        </Navbar>
    );
};