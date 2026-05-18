const API_BASE = '/api/sales';

export interface CreateSalesItemData {
  partId: number;
  quantity: number;
}

export interface CreateSalesData {
  userId: number;
  staffId: number;
  discount?: number;
  paymentStatus?: string;
  salesItems: CreateSalesItemData[];
}

export interface SalesItem {
  salesItemId: number;
  salesId: number;
  partId: number;
  partName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface SalesInvoice {
  salesId: number;
  userId: number;
  customerName: string;
  staffId: number;
  date: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentStatus: string;
  salesItems: SalesItem[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const createSalesInvoice = async (data: CreateSalesData): Promise<SalesInvoice> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create sales invoice' }));
    throw new Error(error.message || 'Failed to create sales invoice');
  }

  return response.json();
};

export const getAllSalesInvoices = async (): Promise<SalesInvoice[]> => {
  const response = await fetch(API_BASE, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch sales invoices' }));
    throw new Error(error.message || 'Failed to fetch sales invoices');
  }

  return response.json();
};

export const getSalesInvoiceById = async (id: number): Promise<SalesInvoice> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch sales invoice' }));
    throw new Error(error.message || 'Failed to fetch sales invoice');
  }

  return response.json();
};
