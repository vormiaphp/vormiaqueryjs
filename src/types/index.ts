// Define minimal types for Vormia
export interface VormiaRequestConfig {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  baseURL?: string;
  headers?: Record<string, string | string[] | undefined>;
  params?: any;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
  validateStatus?: (status: number) => boolean;
  [key: string]: any;
}

export interface VormiaResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: VormiaRequestConfig;
  request?: any;
  error?: {
    message: string;
    code?: string | number;
    details?: any;
  };
  success: boolean;
  timestamp: string;
  path?: string;
  method?: string;
}

// Extended VormiaInstance with all necessary methods
export interface VormiaInstance {
  // Core methods
  request<T = any>(config: VormiaRequestConfig): Promise<VormiaResponse<T>>;
  get<T = any>(url: string, config?: VormiaRequestConfig): Promise<VormiaResponse<T>>;
  delete<T = any>(url: string, config?: VormiaRequestConfig): Promise<VormiaResponse<T>>;
  head<T = any>(url: string, config?: VormiaRequestConfig): Promise<VormiaResponse<T>>;
  options<T = any>(url: string, config?: VormiaRequestConfig): Promise<VormiaResponse<T>>;
  post<T = any>(url: string, data?: any, config?: VormiaRequestConfig): Promise<VormiaResponse<T>>;
  put<T = any>(url: string, data?: any, config?: VormiaRequestConfig): Promise<VormiaResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: VormiaRequestConfig): Promise<VormiaResponse<T>>;
  
  // Interceptors
  interceptors: {
    request: {
      use: (onFulfilled?: (config: VormiaRequestConfig) => VormiaRequestConfig | Promise<VormiaRequestConfig>, 
            onRejected?: (error: any) => any) => number;
      eject: (id: number) => void;
    };
    response: {
      use: (onFulfilled?: (response: VormiaResponse) => VormiaResponse | Promise<VormiaResponse>,
            onRejected?: (error: any) => any) => number;
      eject: (id: number) => void;
    };
  };
  
  // Defaults
  defaults: {
    headers: Record<string, string>;
    [key: string]: any;
  };
}

import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface VormiaConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  authTokenKey?: string;
  encryptionKey?: string;
  onUnauthorized?: () => void;
  onError?: (error: VormiaError) => void;
}

export interface VormiaQueryOptions<TData = unknown, TError = Error> {
  queryKey: string | string[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean | 'always';
  refetchOnReconnect?: boolean | 'always';
  refetchInterval?: number | false | ((data: TData | undefined) => number | false);
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: (data: TData | undefined, error: TError | null) => void;
  select?: (data: TData) => any;
  keepPreviousData?: boolean;
  notifyOnChangeProps?: Array<keyof UseQueryOptions<TData, TError>> | 'all';
  meta?: Record<string, unknown>;
  initialData?: TData | (() => TData);
  initialDataUpdatedAt?: number | (() => number | undefined);
  placeholderData?: TData | (() => TData | undefined) | undefined;
  suspense?: boolean;
  useErrorBoundary?: boolean | ((error: TError) => boolean);
  structuralSharing?: boolean;
  isDataEqual?: (a: TData, b: TData) => boolean;
  context?: unknown;
  queryKeyHashFn?: (queryKey: any) => string;
  queryFnParamsFilter?: (args: any[]) => any[];
  queryKeySerializer?: (queryKey: any) => string;
  queryKeyHash?: string;
  throwOnError?: boolean | ((error: TError) => boolean);
  _defaulted?: boolean;
  _optimisticResults?: 'optimistic' | 'isRestoring' | 'isPaused';
  _optimistic?: boolean;
}

export interface VormiaAuthOptions<T = any> extends Omit<VormiaQueryOptions<T>, 'onSuccess'> {
  encryptData?: boolean;
  storeToken?: boolean;
  onSuccess?: (data: VormiaAuthResponse<T>) => void;
}

export interface VormiaMutationOptions<T = any, V = any> extends Omit<UseMutationOptions<VormiaResponse<T>, VormiaError, V>, 'mutationFn'> {
  endpoint: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  axiosConfig?: VormiaRequestConfig;
  transform?: (data: any) => T;
  encryptData?: boolean;
}

export interface VormiaErrorResponse {
  message: string;
  code?: string | number;
  status?: number;
}

export interface VormiaAuthResponse<T = any> {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: string;
  user?: T;
  refresh_token?: string;
}

export class VormiaError extends Error {
  public status?: number;
  public response?: VormiaResponse<any>;
  public code?: string;

  constructor(message: string, status?: number, response?: VormiaResponse<any>, code?: string) {
    super(message);
    this.name = 'VormiaError';
    this.status = status;
    this.response = response;
    this.code = code;
  }
}