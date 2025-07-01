import { VormiaConfig, VormiaError, VormiaRequestConfig, VormiaInstance, VormiaResponse } from '../types';
import { encryptData } from './utils/encryption';

// Helper function to convert headers to HeadersInit
const toHeadersInit = (headers?: Record<string, string | string[] | undefined>): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!headers) return result;
  
  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[key] = value.join(',');
    } else if (value !== undefined) {
      result[key] = value;
    }
  });
  
  return result;
};

// Create a simple HTTP client that matches our VormiaInstance interface
const createHttpClient = (baseConfig: VormiaRequestConfig): VormiaInstance => {
  const client: VormiaInstance = {
    request: async <T = any>(config: VormiaRequestConfig): Promise<VormiaResponse<T>> => {
      const fullUrl = config.url ? new URL(config.url, config.baseURL || baseConfig.baseURL).toString() : '';
      const headers = toHeadersInit({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...baseConfig.headers,
        ...config.headers,
      });

      try {
        const response = await fetch(fullUrl, {
          method: config.method || 'GET',
          headers,
          body: config.data ? JSON.stringify(config.data) : undefined,
          credentials: config.withCredentials || baseConfig.withCredentials ? 'include' : 'same-origin',
        });

        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          throw new VormiaError(
            responseData.message || 'Request failed',
            response.status,
            {
              data: responseData,
              status: response.status,
              statusText: response.statusText,
              headers: {},
              config,
              request: {},
              success: false,
              timestamp: new Date().toISOString(),
            },
            response.status.toString()
          );
        }

        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: {},
          config,
          request: {},
          success: true,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof VormiaError) {
          throw error;
        }
        throw new VormiaError(
          error instanceof Error ? error.message : 'Request failed'
        );
      }
    },
    get: <T = any>(url: string, config?: VormiaRequestConfig) => 
      client.request<T>({ ...config, method: 'GET', url }),
    post: <T = any>(url: string, data?: any, config?: VormiaRequestConfig) => 
      client.request<T>({ ...config, method: 'POST', url, data }),
    put: <T = any>(url: string, data?: any, config?: VormiaRequestConfig) => 
      client.request<T>({ ...config, method: 'PUT', url, data }),
    patch: <T = any>(url: string, data?: any, config?: VormiaRequestConfig) => 
      client.request<T>({ ...config, method: 'PATCH', url, data }),
    delete: <T = any>(url: string, config?: VormiaRequestConfig) => 
      client.request<T>({ ...config, method: 'DELETE', url }),
    head: <T = any>(url: string, config?: VormiaRequestConfig) => 
      client.request<T>({ ...config, method: 'HEAD', url }),
    options: <T = any>(url: string, config?: VormiaRequestConfig) => 
      client.request<T>({ ...config, method: 'OPTIONS', url }),
    interceptors: {
      request: {
        use: () => 0,
        eject: () => {}
      },
      response: {
        use: () => 0,
        eject: () => {}
      }
    },
    defaults: {
      headers: toHeadersInit(baseConfig.headers)
    }
  };
  
  return client;
};

export class VormiaClient {
  private http: VormiaInstance;
  private config: VormiaConfig;

  constructor(config: VormiaConfig) {
    this.config = {
      authTokenKey: 'auth_token',
      withCredentials: false,
      timeout: 30000,
      ...config,
    };

    this.http = createHttpClient({
      baseURL: this.config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.headers,
      },
      withCredentials: this.config.withCredentials,
      timeout: this.config.timeout,
    });
  }

  // Simplified interceptor-like functionality
  private async handleRequest<T>(config: VormiaRequestConfig): Promise<VormiaResponse<T>> {
    // Add auth token to request
    const token = this.getAuthToken();
    const headers = {
      ...config.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    try {
      const response = await this.http.request<T>({ ...config, headers });
      
      // Handle 204 No Content
      if (response.status === 204) {
        return {
          ...response,
          data: { response: [], message: 'No content found' } as any,
        };
      }
      
      return response;
    } catch (error: any) {
      if (error.status === 401) {
        this.handleUnauthorized();
      }

      if (error.status === 204) {
        return {
          data: { response: [], message: 'No content found' } as any,
          status: 204,
          statusText: 'No Content',
          headers: {},
          config,
          success: true,
          timestamp: new Date().toISOString(),
        };
      }

      const vormiaError = new VormiaError(
        error.message || 'Request failed',
        error.status,
        error.response,
        error.code
      );

      if (this.config.onError) {
        this.config.onError(vormiaError);
      }

      throw vormiaError;
    }
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

  public async request<T = any>(config: VormiaRequestConfig & { encryptData?: boolean }): Promise<VormiaResponse<T>> {
    const { encryptData: shouldEncrypt, ...requestConfig } = config;

    // Encrypt data if needed
    if (shouldEncrypt && requestConfig.data && this.config.encryptionKey) {
      requestConfig.data = encryptData(requestConfig.data, this.config.encryptionKey);
    }

    return this.handleRequest<T>(requestConfig);
  }

  public async get<T = any>(url: string, config?: VormiaRequestConfig): Promise<VormiaResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T = any>(
    url: string, 
    data?: any, 
    config?: VormiaRequestConfig & { encryptData?: boolean }
  ): Promise<VormiaResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T = any>(
    url: string, 
    data?: any, 
    config?: VormiaRequestConfig & { encryptData?: boolean }
  ): Promise<VormiaResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async patch<T = any>(
    url: string, 
    data?: any, 
    config?: VormiaRequestConfig & { encryptData?: boolean }
  ): Promise<VormiaResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  public async delete<T = any>(url: string, config?: VormiaRequestConfig): Promise<VormiaResponse<T>> {
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