import api from './api';

export interface LoginResponse {
  token: string;
  role: string;
  name: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};
