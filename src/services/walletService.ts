import { apiClient, ApiResponse } from './apiClient';

export interface WalletData {
  currentBalance: number;
  pendingEarnings: number;
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyGrowth: number;
  lastPayout: string;
  nextPayoutDate: string;
  commission: number;
}

export interface Transaction {
  id: number;
  type: 'earning' | 'payout' | 'commission';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  gymName?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PayoutRequest {
  id: number;
  amount: number;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: string;
  expectedProcessingDate?: string;
}

class WalletService {
  async getWalletOverview(): Promise<ApiResponse<WalletData>> {
    return apiClient.get<WalletData>('/owner/wallet');
  }

  async getTransactions(page: number = 1, limit: number = 20, type?: string, status?: string): Promise<ApiResponse<TransactionsResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (type) params.append('type', type);
    if (status) params.append('status', status);

    return apiClient.get<TransactionsResponse>(`/owner/wallet/transactions?${params.toString()}`);
  }

  async requestPayout(amount: number, method: string = 'bank_transfer'): Promise<ApiResponse<PayoutRequest>> {
    return apiClient.post<PayoutRequest>('/owner/wallet/payout', {
      amount,
      method
    });
  }
}

export const walletService = new WalletService();