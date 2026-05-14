import React from 'react';

// A dummy SSRProvider that does nothing, to satisfy react-bootstrap in React 18+
export const SSRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const useSSRSafeId = (id?: string) => id || Math.random().toString(36).substring(2, 9);
