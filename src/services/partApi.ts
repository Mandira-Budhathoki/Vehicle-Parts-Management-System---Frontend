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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getAllParts = async (): Promise<Part[]> => {
  const response = await fetch(API_BASE, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch parts');
  }

  return response.json();
};
