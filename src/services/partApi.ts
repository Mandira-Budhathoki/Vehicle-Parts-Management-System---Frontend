const API_BASE = '/api/parts';

export interface Part {
  partId: number;
  partName: string;
  categoryId: number;
  categoryName: string;
  vendorId: number;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
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
