const API_BASE = '/api/notification';

export interface AppNotification {
    notificationId: number;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getNotifications = async (): Promise<AppNotification[]> => {
    const response = await fetch(API_BASE, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) return [];
    return response.json();
};

export const markAsRead = async (notificationId: number): Promise<void> => {
    await fetch(`${API_BASE}/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
    });
};

export const markAllAsRead = async (): Promise<void> => {
    await fetch(`${API_BASE}/read-all`, {
        method: 'PUT',
        headers: getAuthHeaders(),
    });
};