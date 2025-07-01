import axios from 'axios';
import type { 
  VormiaConfig,
  VormiaRequestConfig,
  VormiaResponse,
  VormiaInstance
} from '../types';

// Environment variable fallbacks
const DEFAULT_CONFIG = {
  VORMIA_API_URL: process.env.VORMIA_API_URL || '',
  VORMIA_AUTH_TOKEN_KEY: process.env.VORMIA_AUTH_TOKEN_KEY || 'auth_token',
  VORMIA_TIMEOUT: process.env.VORMIA_TIMEOUT ? parseInt(process.env.VORMIA_TIMEOUT, 10) : 30000,
  VORMIA_WITH_CREDENTIALS: process.env.VORMIA_WITH_CREDENTIALS === 'true' || false
};

// Use our custom Vormia types

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
  private axiosInstance: VormiaInstance;
  private config: VormiaConfig;

  constructor(config: VormiaConfig = {}) {
    // Start with default config from environment variables
    const defaultConfig: VormiaConfig = {
      baseURL: DEFAULT_CONFIG.VORMIA_API_URL || '',
      authTokenKey: DEFAULT_CONFIG.VORMIA_AUTH_TOKEN_KEY,
      withCredentials: DEFAULT_CONFIG.VORMIA_WITH_CREDENTIALS,
      timeout: DEFAULT_CONFIG.VORMIA_TIMEOUT,
    };

    // Merge with user-provided config (user config takes precedence)
    this.config = { ...defaultConfig, ...config };

    // Validate required configuration
    if (!this.config.baseURL) {
      console.warn('VormiaClient: No baseURL provided. Please set VORMIA_API_URL in your .env file or pass baseURL in the config.');
    }

      // Create axios instance with proper typing
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
      withCredentials: this.config.withCredentials,
    }) as unknown as VormiaInstance;

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: VormiaRequestConfig) => {
        // Add auth token to request if it exists
        if (typeof window !== 'undefined' && this.config.authTokenKey) {
          const token = localStorage.getItem(this.config.authTokenKey);
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: VormiaResponse) => response,
      (error: any) => {
        if (error.response?.status === 401 && this.config.onUnauthorized) {
          this.config.onUnauthorized();
        }
        return Promise.reject(new VormiaError(
          error.response?.data?.message || error.message,
          error.response?.status,
          error.response,
          error.code
        ));
      }
    );
  }

  // Core HTTP methods
  public async request<T = any>(config: VormiaRequestConfig): Promise<VormiaResponse<T>> {
    return this.axiosInstance.request<T>(config);
  }

  public async get<T = any>(url: string, config?: VormiaRequestConfig): Promise<VormiaResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public async post<T = any>(
    url: string, 
    data?: any, 
    config?: VormiaRequestConfig
  ): Promise<VormiaResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public async put<T = any>(
    url: string, 
    data?: any, 
    config?: VormiaRequestConfig
  ): Promise<VormiaResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public async delete<T = any>(
    url: string, 
    config?: VormiaRequestConfig
  ): Promise<VormiaResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  public async patch<T = any>(
    url: string, 
    data?: any, 
    config?: VormiaRequestConfig
  ): Promise<VormiaResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  // Auth methods
  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.config.authTokenKey || 'auth_token', token);
    }
  }

  public clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.config.authTokenKey || 'auth_token');
    }
  }

  public getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.config.authTokenKey || 'auth_token');
    }
    return null;
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
