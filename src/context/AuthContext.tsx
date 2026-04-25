import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 'admin' | 'staff' | 'customer' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedRole = localStorage.getItem('userRole') as Role;
    const savedName = localStorage.getItem('userName');
    if (savedRole && savedName) {
      return { id: '1', name: savedName, email: 'mock@example.com', role: savedRole };
    }
    return null;
  });

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
