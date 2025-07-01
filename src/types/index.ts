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
import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface VormiaConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  authTokenKey?: string;
  encryptionKey?: string;
  onUnauthorized?: () => void;
  onError?: (error: VormiaError) => void;
}

export interface VormiaResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  response: T;
  errors?: Record<string, string[]>;
  meta?: {
    current_page?: number;
    from?: number;
    last_page?: number;
    per_page?: number;
    to?: number;
    total?: number;
  };
}

export interface VormiaErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface VormiaAuthResponse<T = any> {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at?: string;
  user?: T;
}

export interface VormiaQueryOptions<T = any> {
  endpoint: string;
  method?: HttpMethod;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  transform?: (data: any) => T;
  onSuccess?: (data: VormiaResponse<T>) => void;
  onError?: (error: VormiaError) => void;
  axiosConfig?: AxiosRequestConfig;
  autoFetch?: boolean;
  retry?: number;
  retryDelay?: number;
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
  axiosConfig?: AxiosRequestConfig;
  transform?: (data: any) => T;
  encryptData?: boolean;
}

export class VormiaError extends Error {
  public status?: number;
  public response?: AxiosResponse;
  public code?: string;

  constructor(message: string, status?: number, response?: AxiosResponse, code?: string) {
    super(message);
    this.name = 'VormiaError';
    this.status = status;
    this.response = response;
    this.code = code;
  }
}