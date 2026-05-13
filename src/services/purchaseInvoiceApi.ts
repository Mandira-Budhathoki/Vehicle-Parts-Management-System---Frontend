// src/services/purchaseInvoiceApi.ts
import { getAuthHeader } from './customerApi';

const API_BASE = '/api';

export interface Vendor {
  vendorId: number;
  vendorName: string;
  phone: string;
  email: string;
}

export interface PurchaseItem {
  purchaseItemId?: number;
  partId: number;
  partName?: string;
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

// Fetch all vendors for the dropdown
export const getVendors = async (): Promise<Vendor[]> => {
  const response = await fetch(`${API_BASE}/PurchaseInvoices/vendors`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Failed to fetch vendors');
  return response.json();
};

// Fetch parts specifically for the purchase invoice form (minimal data)
export const getPartsForPurchase = async (): Promise<{ partId: number; partName: string; stockQuantity: number }[]> => {
  const response = await fetch(`${API_BASE}/PurchaseInvoices/parts`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Failed to fetch parts');
  return response.json();
};

// Fetch all purchase invoices
export const getPurchaseInvoices = async (): Promise<PurchaseInvoice[]> => {
  const response = await fetch(`${API_BASE}/PurchaseInvoices`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error('Failed to fetch purchase invoices');
  return response.json();
};

// Create a new purchase invoice (Admin only)
export const createPurchaseInvoice = async (data: CreatePurchaseInvoiceData): Promise<PurchaseInvoice> => {
  const response = await fetch(`${API_BASE}/PurchaseInvoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create purchase invoice');
  }

  return response.json();
};
