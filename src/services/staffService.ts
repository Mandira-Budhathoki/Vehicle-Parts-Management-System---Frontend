import api from './api';

export interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

export interface StaffRegisterData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: string;
}

export const getStaff = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/staff');
  return response.data;
};

export const registerStaff = async (data: StaffRegisterData): Promise<User> => {
  const response = await api.post<User>('/staff/register', data);
  return response.data;
};

export const updateStaff = async (id: number, data: StaffRegisterData): Promise<void> => {
  await api.put(`/staff/${id}`, data);
};

export const deleteStaff = async (id: number): Promise<void> => {
  await api.delete(`/staff/${id}`);
};
