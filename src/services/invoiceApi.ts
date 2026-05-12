const API_BASE = '/api/PurchaseInvoices';

export interface Vendor {
  vendorId: number;
  vendorName: string;
  phone: string;
  email: string;
}

export interface PartBasic {
  partId: number;
  partName: string;
  stockQuantity: number;
}

export interface PurchaseItem {
  purchaseItemId: number;
  partId: number;
  partName: string;
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface PurchaseInvoice {
  purchaseId: number;
  vendorId: number;
  vendorName: string;
  date: string;
  totalAmount: number;
  items: PurchaseItem[];
}

export interface CreatePurchaseItemData {
  partId: number;
  quantity: number;
  costPrice: number;
}

export interface CreatePurchaseInvoiceData {
  vendorId: number;
  items: CreatePurchaseItemData[];
}

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

export const getVendors = async (): Promise<Vendor[]> => {
  const response = await fetch(`${API_BASE}/vendors`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch vendors');
  return response.json();
};

export const getParts = async (): Promise<PartBasic[]> => {
  const response = await fetch(`${API_BASE}/parts`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch parts');
  return response.json();
};

export const getInvoices = async (): Promise<PurchaseInvoice[]> => {
  const response = await fetch(`${API_BASE}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch invoices');
  return response.json();
};

export const createInvoice = async (data: CreatePurchaseInvoiceData): Promise<PurchaseInvoice> => {
  const response = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create invoice' }));
    throw new Error(error.message || 'Failed to create invoice');
  }
  return response.json();
};
