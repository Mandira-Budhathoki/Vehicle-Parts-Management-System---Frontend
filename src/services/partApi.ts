const API_BASE = '/api';

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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const getAllParts = async (): Promise<Part[]> => {
  const response = await fetch(`${API_BASE}/parts`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch parts');
  }
  return response.json();
};

export const getPartById = async (id: number): Promise<Part> => {
  const response = await fetch(`${API_BASE}/parts/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch part');
  }
  return response.json();
};

export const createPart = async (data: CreatePartData): Promise<Part> => {
  const response = await fetch(`${API_BASE}/parts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create part' }));
    throw new Error(error.message || 'Failed to create part');
  }
  return response.json();
};

export const updatePart = async (id: number, data: CreatePartData): Promise<Part> => {
  const response = await fetch(`${API_BASE}/parts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update part' }));
    throw new Error(error.message || 'Failed to update part');
  }
  return response.json();
};

export const deletePart = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/parts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete part' }));
    throw new Error(error.message || 'Failed to delete part');
  }
};
