import { writable, type Readable } from 'svelte/store';
import { getGlobalVormiaClient } from '../../core/VormiaClient';
import type { VormiaQueryOptions, VormiaResponse } from '../../types';
import { VormiaError } from '../../core/VormiaClient';

// Define our own types to avoid direct axios dependencies
type AxiosRequestConfig = {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  cancelToken?: any;
  [key: string]: any;
};
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
  request?: any;
};

type CancelTokenSource = {
  token: any;
  cancel: (message?: string) => void;
};

interface VormiaStoreBase<T> {
  loading: Readable<boolean>;
  error: Readable<VormiaError | null>;
  response: Readable<VormiaResponse<T> | null>;
  fetch: (options?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T>>;
  refresh: () => Promise<VormiaResponse<T>>;
  cancel: () => void;
  cleanup?: () => void;
}

interface VormiaStore<T> extends Readable<T | null>, VormiaStoreBase<T> {}

interface VormiaMutationResultBase<T = any, V = any> {
  loading: Readable<boolean>;
  error: Readable<VormiaError | null>;
  data: Readable<VormiaResponse<T> | null>;
  mutate: (endpoint: string, values: any, method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE', config?: AxiosRequestConfig) => Promise<VormiaResponse<T>>;
  cancel: () => void;
  cleanup?: () => void;
}

interface VormiaMutationResult<T = any, V = any> extends VormiaMutationResultBase<T, V> {}

/**
 * Creates a Svelte store for managing API query state
 * @template T - The expected response data type
 * @param {VormiaQueryOptions<T>} options - Query configuration options
 * @param {number} [options.retry=0] - Number of retry attempts on failure
 * @param {number} [options.retryDelay=1000] - Delay between retries in milliseconds
 * @param {boolean} [options.autoFetch=true] - Whether to fetch automatically on store creation
 * @returns {VormiaStore<T>} A Svelte store with query state and methods
 */
export function createVormiaStore<T = any>(options: VormiaQueryOptions<T> & { 
  retry?: number;
  retryDelay?: number;
}): VormiaStore<T> {
  const client = getGlobalVormiaClient();
  // Extract options with defaults
  const { 
    endpoint, 
    method = 'GET', 
    params, 
    data: initialData, 
    headers, 
    axiosConfig = {},
    transform,
    retry = 0,
    retryDelay = 1000,
    ...restOptions
  } = options as any; // Type assertion to handle additional options
  
  // Check autoFetch from options with proper type checking
  const autoFetch = 'autoFetch' in options ? (options as any).autoFetch !== false : true;
  
  let cancelTokenSource: CancelTokenSource | null = null;

  const loading = writable(false);
  const error = writable<VormiaError | null>(null);
  const data = writable<T | null>(null);
  const response = writable<VormiaResponse<T> | null>(null);

  const fetch = async (fetchOptions?: Partial<VormiaQueryOptions<T>>): Promise<VormiaResponse<T>> => {
    const mergedOptions = { ...options, ...fetchOptions };
    let retryCount = 0;
    
    const executeRequest = async (attempt: number): Promise<VormiaResponse<T>> => {
      // Cancel any existing request
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Request cancelled by new request');
      }
      
      // Create a simple cancel token implementation
      const source = {
        token: Symbol('cancelToken'),
        cancel: (message?: string) => {
          // Store the cancel message in the token
          (source.token as any).__CANCEL__ = {
            message: message || 'Request cancelled',
            __CANCEL__: true
          };
        }
      };
      cancelTokenSource = source;
      
      try {
        loading.set(true);
        error.set(null);

        const config: AxiosRequestConfig = {
          ...axiosConfig,
          ...mergedOptions.axiosConfig,
          headers: { 
            ...headers, 
            ...mergedOptions.headers,
            ...axiosConfig?.headers,
            ...mergedOptions.axiosConfig?.headers,
          },
          params: mergedOptions.method === 'GET' ? (mergedOptions.params || params) : undefined,
          cancelToken: cancelTokenSource.token,
        };

        const result = await client.request({
          url: mergedOptions.endpoint || endpoint,
          method: mergedOptions.method || method,
          data: mergedOptions.method !== 'GET' ? (mergedOptions.data || initialData) : undefined,
          ...config,
        });

        let resultData = result.data;
        
        if (transform && resultData?.response) {
          resultData.response = transform(resultData.response);
        }

        data.set(resultData.response);
        response.set(resultData);
        
        if (mergedOptions.onSuccess) {
          mergedOptions.onSuccess(resultData);
        }

        return resultData;
      } catch (err: any) {
        // If request was cancelled, don't retry
        if (err?.__CANCEL__) {
          throw new VormiaError('Request was cancelled', 0);
        }
        
        const vormiaError = err instanceof VormiaError 
          ? err 
          : new VormiaError(
              err?.message || 'An unknown error occurred',
              err?.response?.status
            );
        
        error.set(vormiaError);
        
        // Retry logic - cast to any to avoid type issues with retry options
        const maxRetries = (mergedOptions as any).retry ?? retry;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, mergedOptions.retryDelay ?? retryDelay));
          return executeRequest(attempt + 1);
        }
        
        if (mergedOptions.onError) {
          mergedOptions.onError(vormiaError);
        }

        throw vormiaError;
      } finally {
        const maxRetries = (mergedOptions as any).retry ?? retry;
        if (attempt >= maxRetries) {
          loading.set(false);
        }
      }
    };
    
    return executeRequest(0);
  };

  // Initial fetch if autoFetch is true (default)
  if (autoFetch) {
    fetch();
  }

  const cancel = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Request cancelled by user');
      cancelTokenSource = null;
    }
  };

  // Create store object with proper typing
  const store: VormiaStore<T> = {
    subscribe: data.subscribe,
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe },
    response: { subscribe: response.subscribe },
    fetch,
    refresh: () => fetch(),
    cancel,
  };
  
  // Auto-cleanup on component destroy
  if (typeof window !== 'undefined') {
    const handleBeforeUnload = () => {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Page unloaded');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Add cleanup method to store
    (store as any).cleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Component unmounted');
      }
    };
  }
  
  return store;
}

/**
 * Creates a Svelte store for managing API mutations
 * @template T - The expected response data type
 * @template V - The input values type
 * @param {Object} options - Mutation configuration
 * @param {number} [options.retry=0] - Number of retry attempts on failure
 * @param {number} [options.retryDelay=1000] - Delay between retries in milliseconds
 * @returns {VormiaMutationResult<T, V>} A Svelte store with mutation state and methods
 */
interface VormiaMutationOptions<T = any> {
  onSuccess?: (data: VormiaResponse<T>) => void;
  onError?: (error: VormiaError) => void;
  retry?: number;
  retryDelay?: number;
}

export function createVormiaMutation<T = any, V = any>({
  onSuccess,
  onError,
  retry = 0,
  retryDelay = 1000
}: VormiaMutationOptions<T> = {}): VormiaMutationResult<T> {
  let cancelTokenSource: CancelTokenSource | null = null;
  const loading = writable(false);
  const error = writable<VormiaError | null>(null);
  const data = writable<VormiaResponse<T> | null>(null);

  const mutate = async (
    endpoint: string,
    values: V,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
    config: AxiosRequestConfig = {}
  ): Promise<VormiaResponse<T>> => {
    const client = getGlobalVormiaClient();
    let retryCount = 0;
    const maxRetries = retry;
    
    const executeRequest = async (attempt: number): Promise<VormiaResponse<T>> => {
      // Cancel any existing request
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Request cancelled by new request');
      }
      
      // Create a simple cancel token implementation
      const source = {
        token: Symbol('cancelToken'),
        cancel: (message?: string) => {
          // Store the cancel message in the token
          (source.token as any).__CANCEL__ = {
            message: message || 'Request cancelled',
            __CANCEL__: true
          };
        }
      };
      cancelTokenSource = source;
      
      try {
        loading.set(true);
        error.set(null);
        
        const result = await client.request({
          url: endpoint,
          method,
          data: values,
          cancelToken: cancelTokenSource.token,
          ...config,
        });
        
        data.set(result.data);
        
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        return result.data;
      } catch (err: any) {
        // If request was cancelled, don't retry
        if (err?.__CANCEL__) {
          throw new VormiaError('Request was cancelled', 0);
        }
        
        const vormiaError = err instanceof VormiaError 
          ? err 
          : new VormiaError(
              err?.message || 'An unknown error occurred',
              err?.response?.status
            );
        
        error.set(vormiaError);
        
        // Retry logic
        if (attempt < maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay)
          );
          return executeRequest(attempt + 1);
        }
        
        if (onError) {
          onError(vormiaError);
        }
        
        throw vormiaError;
      } finally {
        if (attempt >= maxRetries) {
          loading.set(false);
        }
      }
    };
    
    return executeRequest(0);
  };

  const cancel = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Request cancelled by user');
      cancelTokenSource = null;
      loading.set(false);
    }
  };
  
  // Create store object with proper typing
  const store: VormiaMutationResult<T> = {
    loading: { subscribe: loading.subscribe },
    error: { subscribe: error.subscribe },
    data: { subscribe: data.subscribe },
    mutate,
    cancel,
  };
  
  // Auto-cleanup on component destroy
  if (typeof window !== 'undefined') {
    const handleBeforeUnload = () => {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Page unloaded');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Add cleanup method to store
    (store as any).cleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Component unmounted');
      }
    };
  }
  
  return store;
}
