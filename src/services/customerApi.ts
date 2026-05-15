// Customer feature API - Features 13 & 14
// Appointments, Reviews, Part Requests, Sales History

const API = '/api';

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// ── Types ───────────────────────────────────────────────────────────────────

export interface Appointment {
    appointmentId: number;
    vehicleId: number;
    vehicleNumber: string;
    brand: string;
    model: string;
    date: string;
    status: string;
    serviceType: string;
    notes?: string;
}

export interface CreateAppointmentData {
    vehicleId: number;
    date: string;        // ISO datetime string
    serviceType: string;
    notes?: string;
}

export interface Review {
    reviewId: number;
    vehicleId: number;
    vehicleNumber: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface CreateReviewData {
    vehicleId: number;
    rating: number;
    comment: string;
}

export interface PartRequest {
    requestId: number;
    partName: string;
    notes?: string;
    status: string;
    requestDate: string;
}

export interface CreatePartRequestData {
    partName: string;
    notes?: string;
}

export interface SalesHistoryItem {
    salesId: number;
    date: string;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    paymentStatus: string;
    items: {
        partName: string;
        quantity: number;
        price: number;
        subtotal: number;
    }[];
}

// ── Appointments ─────────────────────────────────────────────────────────────

export const getAppointments = async (userId: number): Promise<Appointment[]> => {
    const res = await fetch(`${API}/appointments/user/${userId}`, {
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to load appointments' }));
        throw new Error(err.message || 'Failed to load appointments');
    }
    return res.json();
};

export const bookAppointment = async (data: CreateAppointmentData): Promise<{ message: string; appointmentId: number }> => {
    const res = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to book appointment' }));
        throw new Error(err.message || 'Failed to book appointment');
    }
    return res.json();
};

export const cancelAppointment = async (appointmentId: number): Promise<{ message: string }> => {
    const res = await fetch(`${API}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to cancel appointment' }));
        throw new Error(err.message || 'Failed to cancel appointment');
    }
    return res.json();
};

// ── Reviews ──────────────────────────────────────────────────────────────────

export const getUserReviews = async (userId: number): Promise<Review[]> => {
    const res = await fetch(`${API}/reviews/user/${userId}`, {
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to load reviews' }));
        throw new Error(err.message || 'Failed to load reviews');
    }
    return res.json();
};

export const submitReview = async (data: CreateReviewData): Promise<{ message: string; reviewId: number }> => {
    const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to submit review' }));
        throw new Error(err.message || 'Failed to submit review');
    }
    return res.json();
};

// ── Part Requests ─────────────────────────────────────────────────────────────

export const getPartRequests = async (userId: number): Promise<PartRequest[]> => {
    const res = await fetch(`${API}/part-requests/user/${userId}`, {
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to load part requests' }));
        throw new Error(err.message || 'Failed to load part requests');
    }
    return res.json();
};

export const submitPartRequest = async (data: CreatePartRequestData): Promise<{ message: string; requestId: number }> => {
    const res = await fetch(`${API}/part-requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to submit part request' }));
        throw new Error(err.message || 'Failed to submit part request');
    }
    return res.json();
};

// ── Sales History ─────────────────────────────────────────────────────────────

export const getSalesHistory = async (userId: number): Promise<SalesHistoryItem[]> => {
    const res = await fetch(`${API}/sales-history/user/${userId}`, {
        headers: authHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to load history' }));
        throw new Error(err.message || 'Failed to load history');
    }
    return res.json();
};