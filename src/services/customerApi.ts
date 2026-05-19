// Customer feature API - Features 13 & 14
// Appointments, Reviews, Part Requests, Sales History

const API = '/api';
const API_BASE = '/api/auth';

export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== Auth ====================

export interface LoginData {
  email: string;
  password: string;
}

// Unified login for all roles
export const loginUser = async (data: LoginData): Promise<any> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Invalid email or password' }));
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

// ==================== Auth Headers ====================

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
  date: string;
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

export const getAppointments = async (userId: number) => {
  const res = await fetch(`${API}/appointments/user/${userId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to load appointments');
  return res.json();
};

export const bookAppointment = async (data: CreateAppointmentData) => {
  const res = await fetch(`${API}/appointments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to book appointment');
  return res.json();
};

export const cancelAppointment = async (id: number) => {
  const res = await fetch(`${API}/appointments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to cancel appointment');
  return res.json();
};

// ── Reviews ──────────────────────────────────────────────────────────────────

export const getUserReviews = async (userId: number) => {
  const res = await fetch(`${API}/reviews/user/${userId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to load reviews');
  return res.json();
};

export const submitReview = async (data: CreateReviewData) => {
  const res = await fetch(`${API}/reviews`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
};

// ── Part Requests ─────────────────────────────────────────────────────────────

export const getPartRequests = async (userId: number) => {
  const res = await fetch(`${API}/part-requests/user/${userId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to load part requests');
  return res.json();
};

export const submitPartRequest = async (data: CreatePartRequestData) => {
  const res = await fetch(`${API}/part-requests`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to submit part request');
  return res.json();
};

// ── Sales History ─────────────────────────────────────────────────────────────

export const getSalesHistory = async (userId: number) => {
  const res = await fetch(`${API}/sales-history/user/${userId}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
};