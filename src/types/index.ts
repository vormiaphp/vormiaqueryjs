import { AxiosRequestConfig, AxiosResponse } from 'axios';
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
  response: T;
  message?: string;
  status?: number;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    [key: string]: any;
  };
}

export interface VormiaAuthResponse<T = any> extends VormiaResponse<T> {
  token?: string;
  user?: any;
  expires_at?: string;
}

export interface VormiaQueryOptions<T = any> extends Omit<UseQueryOptions<VormiaResponse<T>>, 'queryFn'> {
  endpoint: string;
  method?: HttpMethod;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  axiosConfig?: AxiosRequestConfig;
  transform?: (data: any) => T;
  onSuccess?: (data: VormiaResponse<T>) => void;
  onError?: (error: VormiaError) => void;
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