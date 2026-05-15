// API service for Customer and Vehicle endpoints
// Connects to the ASP.NET Core backend

const API_BASE = '/api/auth';
const API = '/api';

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// ==================== Types ====================

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UserProfile {
    userId: number;
    name: string;
    email: string;
    phone: string;
}

export interface VehicleData {
    vehicleNumber: string;
    model: string;
    brand: string;
    year: number;
}

export interface Vehicle extends VehicleData {
    vehicleId: number;
}

// ==================== Auth ====================

// Register a new customer
export const registerCustomer = async (
    data: RegisterData
): Promise<{ message: string; userId: number }> => {
    const response = await fetch(`${API}/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(error.message || 'Registration failed');
    }

    return response.json();
};

// Login a user
export const loginUser = async (data: LoginData) => {
    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Invalid email or password');
    }

    return response.json();
};

// ==================== Customer Profile ====================

export const getProfile = async (id: number): Promise<UserProfile> => {
    const response = await fetch(`${API}/customer/${id}`, {
        headers: authHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }

    return response.json();
};

export const updateProfile = async (
    id: number,
    data: Partial<RegisterData>
): Promise<{ message: string }> => {
    const response = await fetch(`${API}/customer/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to update profile');
    }

    return response.json();
};

// ==================== Vehicle API ====================

export const getVehicles = async (userId: number): Promise<Vehicle[]> => {
    const response = await fetch(`${API}/vehicle/user/${userId}`, {
        headers: authHeaders(),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch vehicles' }));
        throw new Error(error.message || 'Failed to fetch vehicles');
    }

    return response.json();
};

export const addVehicle = async (
    userId: number,
    data: VehicleData
): Promise<{ message: string }> => {
    const response = await fetch(`${API}/vehicle/${userId}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to add vehicle' }));
        throw new Error(error.message || 'Failed to add vehicle');
    }

    return response.json();
};

export const updateVehicle = async (
    id: number,
    data: VehicleData
): Promise<{ message: string }> => {
    const response = await fetch(`${API}/vehicle/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to update vehicle' }));
        throw new Error(error.message || 'Failed to update vehicle');
    }

    return response.json();
};

export const deleteVehicle = async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API}/vehicle/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete vehicle' }));
        throw new Error(error.message || 'Failed to delete vehicle');
    }

    return response.json();
};