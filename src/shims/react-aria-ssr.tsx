import React from 'react';

export const SSRProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const useIsSSR = () => false;
export const useSSRSafeId = (id?: string) => id;
