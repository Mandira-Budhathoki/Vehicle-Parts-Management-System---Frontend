const API_BASE = '/api/email';

export interface SendInvoiceEmailData {
    salesId: number;
    customerEmail: string;
}

export interface SendInvoiceEmailResponse {
    message: string;
    salesId: number;
    sentTo: string;
}

const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};


export const sendInvoiceEmail = async (
    data: SendInvoiceEmailData
): Promise<SendInvoiceEmailResponse> => {
    const response = await fetch(`${API_BASE}/send-invoice`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ message: 'Failed to send invoice email' }));
        throw new Error(error.message || 'Failed to send invoice email');
    }

    return response.json();
};
