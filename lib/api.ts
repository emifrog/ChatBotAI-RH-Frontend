import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types pour les réponses API
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

class ApiService {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur de requête - ajouter le token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse - gestion auto refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Authentification
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>('/api/auth/login', {
      email,
      password,
    });

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      this.setTokens(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data.data;
    }

    throw new Error(response.data.message || 'Erreur de connexion');
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    department?: string;
    role?: string;
  }): Promise<User> {
    const response = await this.client.post<ApiResponse<{ user: User }>>('/api/auth/register', userData);

    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }

    throw new Error(response.data.message || 'Erreur lors de l\'inscription');
  }

  async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<string> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      throw new Error('Pas de refresh token');
    }

    const response = await this.client.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/api/auth/refresh', {
      refreshToken,
    });

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      this.setTokens(accessToken, newRefreshToken);
      return accessToken;
    }

    throw new Error('Impossible de rafraîchir le token');
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<ApiResponse<{ user: User }>>('/api/auth/profile');
    
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }

    throw new Error('Impossible de récupérer le profil');
  }

  // Congés
  async getLeaveBalance() {
    const response = await this.client.get<ApiResponse>('/api/leaves/balance');
    return response.data.data;
  }

  async createLeaveRequest(requestData: {
    type: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) {
    const response = await this.client.post<ApiResponse>('/api/leaves/request', requestData);
    return response.data.data;
  }

  async getLeaveRequests() {
    const response = await this.client.get<ApiResponse>('/api/leaves/requests');
    return response.data.data;
  }

  async getLeaveStats() {
    const response = await this.client.get<ApiResponse>('/api/leaves/stats');
    return response.data.data;
  }

  // Paie (simulation - à adapter selon vos APIs)
  async getPayslips() {
    // Simulation en attendant l'API réelle
    return {
      payslips: [
        {
          id: '1',
          period: '2024-11',
          netSalary: 3245,
          grossSalary: 4380,
          downloadUrl: '#'
        }
      ]
    };
  }

  // Formations (simulation)
  async getTrainings() {
    return {
      trainings: [
        {
          id: '1',
          title: 'React Advanced',
          description: 'Formation React avancée',
          duration: '2 jours',
          availableSpots: 8,
          recommended: true
        }
      ]
    };
  }

  // Chat
  async getConversations() {
    const response = await this.client.get<ApiResponse>('/api/chat/conversations');
    return response.data.data;
  }

  async getMessages(conversationId: string) {
    const response = await this.client.get<ApiResponse>(`/api/chat/conversations/${conversationId}/messages`);
    return response.data.data;
  }

  async saveFeedback(feedbackData: {
    messageId: string;
    type: string;
    rating?: number;
    comment?: string;
  }) {
    const response = await this.client.post<ApiResponse>('/api/chat/feedback', feedbackData);
    return response.data.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export type { ApiResponse, LoginResponse, User };