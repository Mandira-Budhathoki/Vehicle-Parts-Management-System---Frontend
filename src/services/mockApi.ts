// Mock data for the system

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  phone?: string;
  vehicleNumber?: string;
  totalSpent?: number;
  creditOverdueDays?: number;
}

export const mockUsers: User[] = [
  { id: '1', name: 'Admin Boss', email: 'admin@vp.com', role: 'admin' },
  { id: '2', name: 'Staff John', email: 'staff@vp.com', role: 'staff' },
  { id: '3', name: 'Customer Alice', email: 'alice@vp.com', role: 'customer', phone: '1234567890', vehicleNumber: 'ABC-123', totalSpent: 6000, creditOverdueDays: 0 },
  { id: '4', name: 'Customer Bob', email: 'bob@vp.com', role: 'customer', phone: '0987654321', vehicleNumber: 'XYZ-987', totalSpent: 1200, creditOverdueDays: 35 },
];

export interface Part {
  id: string;
  name: string;
  stock: number;
  price: number;
}

export const mockParts: Part[] = [
  { id: 'p1', name: 'Brake Pads', stock: 50, price: 1500 },
  { id: 'p2', name: 'Oil Filter', stock: 8, price: 800 }, // Low stock
  { id: 'p3', name: 'Headlight Bulb', stock: 20, price: 500 },
];

export const mockLogin = async (email: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      if (user) resolve(user);
      else reject(new Error('User not found. Use admin@vp.com, staff@vp.com, or alice@vp.com'));
    }, 500);
  });
};

// Staff Management Mock Functions
export const registerStaffMock = async (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = { ...data, id: Math.random().toString(36).substr(2, 9) };
      mockUsers.push(newUser);
      resolve(newUser);
    }, 500);
  });
};

export const updateStaffMock = async (id: string, data: any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...data };
        resolve(mockUsers[index]);
      } else {
        reject(new Error('User not found'));
      }
    }, 500);
  });
};

export const deleteStaffMock = async (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers.splice(index, 1);
      }
      resolve(true);
    }, 500);
  });
};
