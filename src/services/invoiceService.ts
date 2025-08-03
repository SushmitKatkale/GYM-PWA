import { buildApiUrl, API_CONFIG } from '../config/api';

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

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class InvoiceService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = '';

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (Array.isArray(data.error)) {
            errorMessage = data.error.join(', ');
          } else if (typeof data.error === 'object') {
            errorMessage = data.error.message || JSON.stringify(data.error);
          }
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        return {
          success: false,
          message: errorMessage,
          error: errorMessage
        };
      }

      return data;
    } catch (parseError) {
      return {
        success: false,
        message: response.ok 
          ? 'Invalid response format from server'
          : `HTTP ${response.status}: ${response.statusText}`,
        error: response.statusText
      };
    }
  }

  async createInvoice(invoiceData: CreateInvoiceRequest, token: string): Promise<ApiResponse<Invoice>> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.INVOICES), {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(invoiceData),
      });

      return await this.handleResponse<Invoice>(response);
    } catch (error) {
      console.error('Create invoice network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }

  async getInvoices(token: string): Promise<ApiResponse<Invoice[]>> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.INVOICES), {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      return await this.handleResponse<Invoice[]>(response);
    } catch (error) {
      console.error('Get invoices network error:', error);
      return {
        success: false,
        message: 'Network error occurred. Please check your connection and try again.',
        error: error instanceof Error ? error.message : 'Unknown network error'
      };
    }
  }
}

export const invoiceService = new InvoiceService();
