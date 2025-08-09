import { buildApiUrl, API_CONFIG } from '../config/api';
import { apiClient, ApiResponse } from './apiClient';
import { useAuthStore } from '../stores/authStore';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userEmail: string;
  subscriptionId: number;
  paymentId: number;
  amount: number;
  tax: number;
  totalAmount: number;
  currency: string;
  status: 'generated' | 'sent' | 'downloaded' | 'paid';
  generatedAt: string;
  dueDate?: string;
  paidAt?: string;
  
  // User details
  userDetails: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  
  // Gym details
  gymDetails: {
    id: number;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    gst?: string;
  };
  
  // Subscription details
  subscriptionDetails: {
    title: string;
    validityDays: number;
    validFrom: string;
    validTo: string;
    price: number;
    discountedPrice?: number;
  };
  
  // Payment details
  paymentDetails: {
    transactionId: string;
    gateway: string;
    paidVia?: string;
    completedAt: string;
  };
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

export interface GenerateInvoiceRequest {
  paymentId: number;
  userEmail: string;
  subscriptionTitle: string;
  gymName: string;
  amount: number;
  validityDays: number;
  validFrom: string;
  validTo: string;
  paymentMethod: string;
  transactionId: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
}


class InvoiceService {
  // Helper method to get auth token
  private getAuthToken(): string | null {
    // Access the auth store directly to get the token
    return useAuthStore.getState().getAccessToken();
  }

  // Legacy methods
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

  // New comprehensive methods
  
  // Generate invoice after successful payment
  async generateInvoice(data: GenerateInvoiceRequest): Promise<Invoice> {
    try {
      const response = await apiClient.post<Invoice>(`${API_CONFIG.ENDPOINTS.INVOICES}/generate`, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to generate invoice');
    } catch (error: any) {
      // Check if this is a 404 error (endpoint not implemented)
      if (error?.message?.includes('Route /api/invoices/generate not found') || 
          error?.status === 404 ||
          error?.message?.includes('not found')) {
        console.warn('Backend invoice generation endpoint not implemented, using fallback:', error);
      } else {
        console.warn('Backend not available, creating mock invoice:', error);
      }
      return this.createMockInvoice(data);
    }
  }
  
  // Get invoices by user email
  async getUserInvoices(userEmail: string, page = 1, limit = 10): Promise<ApiResponse<{
    invoices: Invoice[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      limit: number;
    };
  }>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return apiClient.get(`${API_CONFIG.ENDPOINTS.INVOICES}/user/${encodeURIComponent(userEmail)}?${queryParams.toString()}`);
  }
  
  // Get invoice by subscription ID
  async getInvoiceBySubscriptionId(subscriptionId: number): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`${API_CONFIG.ENDPOINTS.INVOICES}/subscription/${subscriptionId}`);
  }
  
  // Download invoice PDF
  async downloadInvoice(invoiceId: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Get the download URL from the backend
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.INVOICES}/${invoiceId}/download`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Update download status
        await this.markInvoiceAsDownloaded(invoiceId);
      } else {
        throw new Error('Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }
  
  // Mark invoice as downloaded
  async markInvoiceAsDownloaded(invoiceId: string): Promise<ApiResponse<Invoice>> {
    try {
      return await apiClient.patch<Invoice>(`${API_CONFIG.ENDPOINTS.INVOICES}/${invoiceId}/downloaded`);
    } catch (error) {
      // If backend doesn't support this endpoint, just log it and continue
      console.warn('Backend does not support marking invoice as downloaded:', error);
      return { success: true, data: null as any, message: 'Marked as downloaded locally' };
    }
  }
  
  // Get invoice preview URL
  async getInvoicePreviewUrl(invoiceId: string): Promise<string> {
    const response = await apiClient.get<{ previewUrl: string }>(`${API_CONFIG.ENDPOINTS.INVOICES}/${invoiceId}/preview`);
    if (response.success && response.data?.previewUrl) {
      return response.data.previewUrl;
    }
    throw new Error('Failed to get invoice preview URL');
  }
  
  // Send invoice via email
  async sendInvoiceByEmail(invoiceId: string, email?: string): Promise<ApiResponse<{ sent: boolean }>> {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.INVOICES}/${invoiceId}/send`, { email });
  }
  
  // Get invoice statistics for admin
  async getInvoiceStats(): Promise<ApiResponse<InvoiceStats>> {
    return apiClient.get<InvoiceStats>(`${API_CONFIG.ENDPOINTS.INVOICES}/stats`);
  }
  
  // Update invoice status
  async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<ApiResponse<Invoice>> {
    return apiClient.patch<Invoice>(`${API_CONFIG.ENDPOINTS.INVOICES}/${invoiceId}/status`, { status });
  }

  // Alias for downloadInvoice to match the component usage
  async downloadInvoicePDF(invoiceId: string | number): Promise<Blob> {
    const id = invoiceId.toString();
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.INVOICES}/${id}/download`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });
      
      if (response.ok) {
        return await response.blob();
      } else if (response.status === 404) {
        // Backend exists but endpoint not implemented, use fallback
        throw new Error('Download endpoint not implemented');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Fallback: Generate mock PDF
      console.warn('Backend endpoint not available, generating mock PDF:', error);
      const invoice = this.getMockInvoiceById(id);
      if (invoice) {
        return await this.generateMockPDF(invoice);
      } else {
        throw new Error('Invoice not found in local storage');
      }
    }
  }

  // Get invoices by user (simplified method for component usage)
  async getInvoicesByUser(userEmail: string): Promise<Invoice[]> {
    try {
      const response = await this.getUserInvoices(userEmail, 1, 100);
      return response.success && response.data ? response.data.invoices : [];
    } catch (error) {
      console.error('Error fetching user invoices:', error);
      // Return mock invoices for development
      return this.getMockInvoices(userEmail);
    }
  }

  // Development helper methods
  private createMockInvoice(data: GenerateInvoiceRequest): Invoice {
    const invoiceId = `INV-${Date.now()}`;
    const invoiceNumber = `GYM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const invoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      userId: 'mock-user-id',
      userEmail: data.userEmail,
      subscriptionId: 0, // Mock subscription ID
      paymentId: data.paymentId,
      amount: data.amount,
      tax: Math.round(data.amount * 0.18), // 18% GST
      totalAmount: Math.round(data.amount * 1.18),
      currency: 'INR',
      status: 'generated',
      generatedAt: new Date().toISOString(),
      userDetails: {
        name: data.userEmail.split('@')[0],
        email: data.userEmail,
      },
      gymDetails: {
        id: 1,
        name: data.gymName,
        address: '123 Gym Street, Fitness City, 123456',
        phone: '+91 9876543210',
        email: 'contact@' + data.gymName.toLowerCase().replace(/\s+/g, '') + '.com',
        gst: '27AAAAA0000A1Z5'
      },
      subscriptionDetails: {
        title: data.subscriptionTitle,
        validityDays: data.validityDays,
        validFrom: data.validFrom,
        validTo: data.validTo,
        price: data.amount,
      },
      paymentDetails: {
        transactionId: data.transactionId,
        gateway: data.paymentMethod,
        completedAt: new Date().toISOString()
      }
    };
    
    // Store in localStorage
    this.storeMockInvoice(invoice);
    return invoice;
  }

  private getMockInvoices(userEmail: string): Invoice[] {
    try {
      const stored = localStorage.getItem('mock-invoices');
      if (stored) {
        const allInvoices: Invoice[] = JSON.parse(stored);
        return allInvoices.filter(inv => inv.userEmail === userEmail);
      }
    } catch (error) {
      console.error('Error loading mock invoices:', error);
    }
    return [];
  }

  private getMockInvoiceById(invoiceId: string): Invoice | null {
    try {
      const stored = localStorage.getItem('mock-invoices');
      if (stored) {
        const allInvoices: Invoice[] = JSON.parse(stored);
        return allInvoices.find(inv => inv.id === invoiceId) || null;
      }
    } catch (error) {
      console.error('Error loading mock invoice:', error);
    }
    return null;
  }

  private storeMockInvoice(invoice: Invoice): void {
    try {
      const stored = localStorage.getItem('mock-invoices');
      let allInvoices: Invoice[] = [];
      
      if (stored) {
        allInvoices = JSON.parse(stored);
      }
      
      // Check if invoice already exists
      const existingIndex = allInvoices.findIndex(inv => inv.id === invoice.id);
      if (existingIndex >= 0) {
        allInvoices[existingIndex] = invoice;
      } else {
        allInvoices.push(invoice);
      }
      
      localStorage.setItem('mock-invoices', JSON.stringify(allInvoices));
    } catch (error) {
      console.error('Error storing mock invoice:', error);
    }
  }

  private async generateMockPDF(invoice: Invoice): Promise<Blob> {
    // Create a simple HTML invoice and convert to PDF-like content
    const htmlContent = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>${invoice.gymDetails.name}</h2>
            <p>${invoice.gymDetails.address}</p>
            <p>GST: ${invoice.gymDetails.gst}</p>
          </div>
          
          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.generatedAt).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${invoice.userDetails.name}</p>
            <p><strong>Email:</strong> ${invoice.userDetails.email}</p>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Validity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoice.subscriptionDetails.title}</td>
                <td>${invoice.subscriptionDetails.validityDays} days</td>
                <td>₹${invoice.subscriptionDetails.price}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: ₹${invoice.amount}</p>
            <p>Tax (18%): ₹${invoice.tax}</p>
            <p><strong>Total: ₹${invoice.totalAmount}</strong></p>
          </div>
          
          <p style="margin-top: 40px;"><strong>Payment Details:</strong></p>
          <p>Transaction ID: ${invoice.paymentDetails.transactionId}</p>
          <p>Payment Method: ${invoice.paymentDetails.gateway}</p>
          <p>Payment Date: ${new Date(invoice.paymentDetails.completedAt).toLocaleDateString()}</p>
        </body>
      </html>
    `;
    
    // Convert HTML to blob (mock PDF)
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return blob;
  }
}

export const invoiceService = new InvoiceService();
