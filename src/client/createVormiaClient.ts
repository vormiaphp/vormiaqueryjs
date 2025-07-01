import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { VormiaConfig, VormiaError } from '../types';
import { encryptData, decryptData } from '../utils/encryption';

export class VormiaClient {
  private axiosInstance: AxiosInstance;
  private config: VormiaConfig;

  constructor(config: VormiaConfig) {
    this.config = {
      authTokenKey: 'auth_token',
      withCredentials: false,
      timeout: 30000,
      ...config,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.config.headers,
      },
      withCredentials: this.config.withCredentials,
      timeout: this.config.timeout,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use((config) => {
      // Add auth token
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Handle 204 No Content
        if (response.status === 204) {
          return {
            ...response,
            data: { response: [], message: 'No content found' },
          };
        }

        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        if (error.response?.status === 204) {
          return Promise.resolve({
            ...error.response,
            data: { response: [], message: 'No content found' },
          });
        }

        const vormiaError = new VormiaError(
          error.message || 'Request failed',
          error.response?.status,
          error.response,
          error.code
        );

        if (this.config.onError) {
          this.config.onError(vormiaError);
        }

        return Promise.reject(vormiaError);
      }
    );
  }

  private handleUnauthorized() {
    this.removeAuthToken();
    if (this.config.onUnauthorized) {
      this.config.onUnauthorized();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  public getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.config.authTokenKey!);
  }

  public setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.config.authTokenKey!, token);
  }

  public removeAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.config.authTokenKey!);
  }

  public async request<T = any>(config: AxiosRequestConfig & { encryptData?: boolean }): Promise<T> {
    const { encryptData: shouldEncrypt, ...axiosConfig } = config;

    // Encrypt data if needed
    if (shouldEncrypt && axiosConfig.data && this.config.encryptionKey) {
      axiosConfig.data = encryptData(axiosConfig.data, this.config.encryptionKey);
    }

    const response = await this.axiosInstance.request<T>(axiosConfig);
    return response.data;
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { encryptData?: boolean }): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { encryptData?: boolean }): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { encryptData?: boolean }): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

export const createVormiaClient = (config: VormiaConfig): VormiaClient => {
  return new VormiaClient(config);
};

// Global client instance
let globalClient: VormiaClient | null = null;

export const setGlobalVormiaClient = (client: VormiaClient): void => {
  globalClient = client;
};

export const getGlobalVormiaClient = (): VormiaClient => {
  if (!globalClient) {
    throw new Error('VormiaClient not configured. Please wrap your app with VormiaQueryProvider or call createVormiaClient first.');
  }
  return globalClient;
};