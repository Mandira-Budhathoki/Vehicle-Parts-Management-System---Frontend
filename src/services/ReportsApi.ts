import { apiClient } from './apiClient';

const BASE = 'http://localhost:5114/api/reports';

export interface RegularCustomer {
    userId: number;
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    lastPurchaseDate: string;
}

export interface HighSpender {
    userId: number;
    name: string;
    email: string;
    phone: string;
    totalSpent: number;
    totalOrders: number;
    hasLoyaltyDiscount: boolean;
}

export interface PendingCredit {
    userId: number;
    name: string;
    email: string;
    phone: string;
    salesId: number;
    amountDue: number;
    saleDate: string;
    daysOverdue: number;
}

export interface FinancialBreakdownItem {
    label: string;
    revenue: number;
    expenses: number;
    profit: number;
}

export interface TopPart {
    partId: number;
    partName: string;
    category: string;
    quantitySold: number;
    revenueGenerated: number;
}

export interface RecentTransaction {
    id: string;
    type: string;
    date: string;
    description: string;
    amount: number;
    status: string;
}

export interface FinancialReport {
    period: string;
    referenceDate: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalSalesCount: number;
    totalPurchasesCount: number;
    breakdown: FinancialBreakdownItem[];
    topSellingParts: TopPart[];
    recentTransactions: RecentTransaction[];
}

export const reportsApi = {
    getRegularCustomers: async (): Promise<RegularCustomer[]> => {
        const res = await apiClient(`${BASE}/regular-customers`);
        if (!res.ok) throw new Error('Failed to fetch regular customers');
        return res.json();
    },

    getHighSpenders: async (): Promise<HighSpender[]> => {
        const res = await apiClient(`${BASE}/high-spenders`);
        if (!res.ok) throw new Error('Failed to fetch high spenders');
        return res.json();
    },

    getPendingCredits: async (): Promise<PendingCredit[]> => {
        const res = await apiClient(`${BASE}/pending-credits`);
        if (!res.ok) throw new Error('Failed to fetch pending credits');
        return res.json();
    },

    getFinancialReport: async (period: string, date?: string): Promise<FinancialReport> => {
        const url = `${BASE}/financial?period=${period}${date ? `&date=${date}` : ''}`;
        const res = await apiClient(url);
        if (!res.ok) throw new Error(`Failed to fetch financial report for ${period}`);
        return res.json();
    },
};