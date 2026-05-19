import api from './api';

export interface AppNotification {
    notificationId: number;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export const getNotifications = async (): Promise<AppNotification[]> => {
    const response = await api.get('/notification');
    return response.data;
};

export const markAsRead = async (notificationId: number): Promise<void> => {
    await api.put(`/notification/${notificationId}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
    await api.put('/notification/read-all');
};