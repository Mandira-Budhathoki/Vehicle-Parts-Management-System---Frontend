import api from './api';

export interface Vendor {
  vendorId: number;
  vendorName: string;
  phone: string;
  email: string;
  address: string;
}

export interface VendorDto {
  vendorName: string;
  phone: string;
  email: string;
  address: string;
}

export const getVendors = async (): Promise<Vendor[]> => {
  const response = await api.get<Vendor[]>('/vendor');
  return response.data;
};

export const getVendorById = async (id: number): Promise<Vendor> => {
  const response = await api.get<Vendor>(`/vendor/${id}`);
  return response.data;
};

export const createVendor = async (data: VendorDto): Promise<Vendor> => {
  const response = await api.post<Vendor>('/vendor', data);
  return response.data;
};

export const updateVendor = async (id: number, data: VendorDto): Promise<void> => {
  await api.put(`/vendor/${id}`, data);
};

export const deleteVendor = async (id: number): Promise<void> => {
  await api.delete(`/vendor/${id}`);
};
