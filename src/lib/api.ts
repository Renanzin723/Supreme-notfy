// Configuração da API para o sistema de admin
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('supreme-notify-token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erro na requisição',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro de conexão',
      };
    }
  }

  // Auth endpoints
  async login(identifier: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // License endpoints
  async getLicenseStatus() {
    return this.request('/api/license/status');
  }

  // Admin endpoints
  async getUsers(params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/api/admin/users?${searchParams}`);
  }

  async createUser(userData: any) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async resetUserPassword(userId: string, password?: string) {
    return this.request(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async getSubscriptions(params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/api/admin/subscriptions?${searchParams}`);
  }

  async createSubscription(subscriptionData: any) {
    return this.request('/api/admin/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async updateSubscription(subscriptionId: string, subscriptionData: any) {
    return this.request(`/api/admin/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(subscriptionData),
    });
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    return this.request(`/api/admin/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancelAtPeriodEnd }),
    });
  }

  async reactivateSubscription(subscriptionId: string) {
    return this.request(`/api/admin/subscriptions/${subscriptionId}/reactivate`, {
      method: 'POST',
    });
  }

  async getMetricsSummary() {
    return this.request('/api/admin/metrics/summary');
  }
}

export const apiClient = new ApiClient();
