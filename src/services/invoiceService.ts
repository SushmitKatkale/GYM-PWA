import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateInvoiceRequest {
  userId: string;
  amount: number;
  currency: string;
  dueDate: string;
  items: Omit<InvoiceItem, 'id'>[];
}


class InvoiceService {
  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    return apiClient.post<Invoice>(API_CONFIG.ENDPOINTS.INVOICES, invoiceData);
  }

  async getInvoices(): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get<Invoice[]>(API_CONFIG.ENDPOINTS.INVOICES);
  }

  async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`${API_CONFIG.ENDPOINTS.INVOICES}/${id}`);
  }

  async updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return apiClient.put<Invoice>(`${API_CONFIG.ENDPOINTS.INVOICES}/${id}`, invoiceData);
  }

  async deleteInvoice(id: string): Promise<ApiResponse> {
    return apiClient.delete(`${API_CONFIG.ENDPOINTS.INVOICES}/${id}`);
  }
}

export const invoiceService = new InvoiceService();
