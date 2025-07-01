// @ts-ignore - Workaround for axios type issues
import axios = require('axios');
import type { VormiaConfig } from '../types';

// Define our own types to avoid direct axios dependency
type AxiosRequestConfig = any;
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
  request?: any;
};

interface AxiosInstance {
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  interceptors: {
    request: {
      use: (onFulfilled?: any, onRejected?: any) => number;
      eject: (id: number) => void;
    };
    response: {
      use: (onFulfilled?: any, onRejected?: any) => number;
      eject: (id: number) => void;
    };
  };
  defaults: any;
}

export class VormiaError extends Error {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'VormiaError';
    this.status = status;
    this.code = code;
    this.details = details;
    
    // This is needed to make the instanceof work correctly with TypeScript
    Object.setPrototypeOf(this, VormiaError.prototype);
  }
}

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

    // @ts-ignore - Type assertion to avoid axios type issues
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
      timeout: this.config.timeout,
      withCredentials: this.config.withCredentials,
    }) as unknown as AxiosInstance;

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // Add auth token if exists
        const token = localStorage.getItem(this.config.authTokenKey!);
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(new VormiaError(error.message, error.response?.status));
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        return Promise.reject(new VormiaError(message, status));
      }
    );
  }

  // Core HTTP methods
  public async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request<T>(config);
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  // Auth methods
  public setAuthToken(token: string): void {
    localStorage.setItem(this.config.authTokenKey!, token);
  }

  public getAuthToken(): string | null {
    return localStorage.getItem(this.config.authTokenKey!);
  }

  public clearAuthToken(): void {
    localStorage.removeItem(this.config.authTokenKey!);
  }
}

// Global instance management
let globalClient: VormiaClient | null = null;

export const createVormiaClient = (config: VormiaConfig): VormiaClient => {
  globalClient = new VormiaClient(config);
  return globalClient;
};

export const getGlobalVormiaClient = (): VormiaClient => {
  if (!globalClient) {
    throw new Error('VormiaClient has not been initialized. Call createVormiaClient first.');
  }
  return globalClient;
};

export const setGlobalVormiaClient = (client: VormiaClient): void => {
  globalClient = client;
};
