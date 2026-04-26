// API service for Customer and Vehicle endpoints
// Connects to the ASP.NET Core backend

const API_BASE = '/api';

// ==================== Customer API ====================

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  phone: string;
}

export interface VehicleData {
  vehicleNumber: string;
  model: string;
  brand: string;
  year: number;
}

export interface Vehicle extends VehicleData {
  vehicleId: number;
}

// Register a new customer
export const registerCustomer = async (data: RegisterData): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
};

// Login a customer
export const loginCustomer = async (data: LoginData): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE}/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Invalid email or password' }));
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

// Get customer profile
export const getProfile = async (id: number): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE}/customer/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
};

// Update customer profile
export const updateProfile = async (id: number, data: Partial<RegisterData>): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/customer/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
};

// ==================== Vehicle API ====================

// Get all vehicles for a user
export const getVehicles = async (userId: number): Promise<Vehicle[]> => {
  const response = await fetch(`${API_BASE}/vehicle/user/${userId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch vehicles' }));
    throw new Error(error.message || 'Failed to fetch vehicles');
  }

  return response.json();
};

// Add a vehicle for a user
export const addVehicle = async (userId: number, data: VehicleData): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/vehicle/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add vehicle' }));
    throw new Error(error.message || 'Failed to add vehicle');
  }

  return response.json();
};

// Update a vehicle
export const updateVehicle = async (id: number, data: VehicleData): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/vehicle/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update vehicle' }));
    throw new Error(error.message || 'Failed to update vehicle');
  }

  return response.json();
};

// Delete a vehicle
export const deleteVehicle = async (id: number): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/vehicle/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete vehicle' }));
    throw new Error(error.message || 'Failed to delete vehicle');
  }

  return response.json();
};

