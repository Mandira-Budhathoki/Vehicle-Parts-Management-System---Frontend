// API service for Parts endpoints
// Connects to ASP.NET Core backend

const API_BASE = '/api/parts';

export interface Part {
    partId: number;
    partName: string;
    category: string;
    description: string;
    price: number;
    stockQuantity: number;
    reorderLevel: number;
    vendorId?: number | null;
}

export interface CreatePartData {
    partName: string;
    category: string;
    description: string;
    price: number;
    stockQuantity: number;
    reorderLevel: number;
    vendorId?: number | null;
}

// Helper to get auth headers if token exists
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// ================= GET ALL PARTS =================
export const getAllParts = async (): Promise<Part[]> => {
    const response = await fetch(API_BASE, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch parts');
    }

    return response.json();
};

// ================= GET PART BY ID =================
export const getPartById = async (id: number): Promise<Part> => {
    const response = await fetch(`${API_BASE}/${id}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch part');
    }

    return response.json();
};

// ================= CREATE PART =================
export const createPart = async (data: CreatePartData): Promise<Part> => {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to create part',
        }));
        throw new Error(error.message || 'Failed to create part');
    }

    return response.json();
};

// ================= UPDATE PART =================
export const updatePart = async (
    id: number,
    data: CreatePartData
): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to update part',
        }));
        throw new Error(error.message || 'Failed to update part');
    }
};

// ================= DELETE PART =================
export const deletePart = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'Failed to delete part',
        }));
        throw new Error(error.message || 'Failed to delete part');
    }
};