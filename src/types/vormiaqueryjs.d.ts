declare module 'vormiaqueryjs' {
  // ===== Core Types =====
  
  export interface VormiaConfig {
    baseURL: string;
    headers?: Record<string, string>;
    withCredentials?: boolean;
    timeout?: number;
    debug?: boolean;
  }

  export interface VormiaQueryOptions {
    endpoint: string;
    method?: HttpMethod;
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
    showDebug?: boolean;
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    retry?: number | boolean;
    retryDelay?: number;
    staleTime?: number;
    gcTime?: number;
  }

  export interface VormiaMutationOptions {
    endpoint: string;
    method?: HttpMethod;
    data?: any;
    headers?: Record<string, string>;
    showDebug?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: VormiaError) => void;
  }

  export interface VormiaAuthOptions {
    endpoint: string;
    credentials: {
      email: string;
      password: string;
    };
    remember?: boolean;
    headers?: Record<string, string>;
    showDebug?: boolean;
  }

  export interface VormiaResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
    config: any;
  }

  export interface VormiaAuthResponse {
    user: any;
    token: string;
    expires_at?: string;
    message?: string;
  }

  export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

  // ===== Error Types =====
  
  export class VormiaError extends Error {
    name: string;
    status?: number;
    response?: any;
    code?: string;
    data?: any;
    debug?: any;
    timestamp: string;

    constructor(message: string | any, status?: number, response?: any, code?: string);
    
    getUserMessage(): string;
    isNetworkError(): boolean;
    isServerError(): boolean;
    isClientError(): boolean;
    isDatabaseError(): boolean;
    isUnauthenticated(): boolean;
    isUnauthorized(): boolean;
    isNotFound(): boolean;
    isValidationError(): boolean;
    getErrorMessage(): string;
    getValidationErrors(): Record<string, any> | null;
    getDebugInfo(): Record<string, any>;
  }

  // ===== Client Types =====
  
  export interface VormiaClient {
    request(config: {
      method?: string;
      url: string;
      params?: Record<string, any>;
      data?: any;
      headers?: Record<string, string>;
      withCredentials?: boolean;
    }): Promise<VormiaResponse>;
    
    get(url: string, config?: any): Promise<VormiaResponse>;
    post(url: string, data?: any, config?: any): Promise<VormiaResponse>;
    put(url: string, data?: any, config?: any): Promise<VormiaResponse>;
    patch(url: string, data?: any, config?: any): Promise<VormiaResponse>;
    delete(url: string, config?: any): Promise<VormiaResponse>;
  }

  export function createVormiaClient(config: VormiaConfig): VormiaClient;

  // ===== Hook Types =====
  
  export interface VormiaQueryResult<T = any> extends VormiaResponse<T> {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: VormiaError | null;
    data: T;
    refetch: () => void;
    getNotificationHtml: (type: string, title: string, message: string) => string;
    getDebugHtml: (response: any) => string;
    showSuccessNotification: (message: string, title?: string) => void;
    showErrorNotification: (message: string, title?: string) => void;
  }

  export function useVormiaQuery<T = any>(options: VormiaQueryOptions): VormiaQueryResult<T>;
  
  export function useVormiaQuerySimple<T = any>(options: VormiaQueryOptions): VormiaQueryResult<T>;
  
  export function useVrmQuery<T = any>(options: VormiaQueryOptions): VormiaQueryResult<T>;
  
  export function useVrmMutation(options: VormiaMutationOptions): {
    mutate: (data?: any) => void;
    mutateAsync: (data?: any) => Promise<any>;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: VormiaError | null;
    data: any;
    reset: () => void;
  };
  
  export function useVormiaQueryAuth(options: VormiaAuthOptions): {
    login: () => Promise<VormiaAuthResponse>;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: VormiaError | null;
    data: VormiaAuthResponse | null;
  };
  
  export function useVormiaQueryAuthMutation(options: VormiaAuthOptions): {
    mutate: () => void;
    mutateAsync: () => Promise<VormiaAuthResponse>;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: VormiaError | null;
    data: VormiaAuthResponse | null;
  };
  
  export function useVormiaAuth(options: VormiaAuthOptions): {
    login: () => Promise<VormiaAuthResponse>;
    logout: () => void;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: VormiaError | null;
    data: VormiaAuthResponse | null;
    isAuthenticated: boolean;
  };
  
  export function useVormiaConfig(): {
    config: VormiaConfig;
    updateConfig: (newConfig: Partial<VormiaConfig>) => void;
    resetConfig: () => void;
  };

  // ===== Component Types =====
  
  export interface VormiaProviderProps {
    children: React.ReactNode;
    config: VormiaConfig;
  }
  
  export const VormiaProvider: React.FC<VormiaProviderProps>;

  // ===== Utility Types =====
  
  export interface NotificationOptions {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }

  export interface DebugInfo {
    endpoint: string;
    method: string;
    params?: any;
    data?: any;
    response: any;
    error?: VormiaError;
    timestamp: string;
  }

  // ===== Form Data Transformation =====
  
  export function transformFormData(formData: FormData): Record<string, any>;
  export function transformToFormData(data: Record<string, any>): FormData;

  // ===== Error Handling =====
  
  export function handleVormiaError(error: VormiaError, options?: {
    showNotification?: boolean;
    showDebug?: boolean;
    logToConsole?: boolean;
  }): void;

  export function logErrorForDebug(error: VormiaError, context?: string): void;
  export function logSuccessForDebug(response: any, context?: string): void;
  export function getDebugConfig(): {
    enabled: boolean;
    logToConsole: boolean;
    showNotifications: boolean;
  };

  // ===== Constants =====
  
  export const HttpMethod: {
    GET: 'GET';
    POST: 'POST';
    PUT: 'PUT';
    PATCH: 'PATCH';
    DELETE: 'DELETE';
    HEAD: 'HEAD';
    OPTIONS: 'OPTIONS';
  };

  // ===== Legacy Export Objects =====
  export const VormiaError: {};
  export const VormiaConfig: {};
  export const VormiaQueryOptions: {};
  export const VormiaAuthOptions: {};
  export const VormiaMutationOptions: {};
  export const VormiaResponse: {};
  export const VormiaAuthResponse: {};
}

// ===== React Adapter Types =====
declare module 'vormiaqueryjs/react' {
  export * from 'vormiaqueryjs';
}

declare module 'vormiaqueryjs/react/VormiaProvider' {
  export * from 'vormiaqueryjs';
}

// ===== Other Adapter Types =====
declare module 'vormiaqueryjs/svelte' {
  export * from 'vormiaqueryjs';
}

declare module 'vormiaqueryjs/solid' {
  export * from 'vormiaqueryjs';
}

declare module 'vormiaqueryjs/vue' {
  export * from 'vormiaqueryjs';
}

declare module 'vormiaqueryjs/qwik' {
  export * from 'vormiaqueryjs';
}

declare module 'vormiaqueryjs/core' {
  export * from 'vormiaqueryjs';
}
