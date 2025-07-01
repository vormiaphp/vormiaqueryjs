import { createResource, Resource, ResourceActions, createSignal } from 'solid-js';
import { getGlobalVormiaClient, VormiaError } from '../../core/VormiaClient';
import type { VormiaQueryOptions, VormiaResponse } from '../../types';

export function createVormiaResource<T = any>(
  options: VormiaQueryOptions<T>,
  initialValue?: T
): [
  resource: Resource<VormiaResponse<T> | undefined>,
  actions: ResourceActions<VormiaResponse<T> | undefined> & {
    refetch: (opts?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T> | undefined>;
  }
] {
  const client = getGlobalVormiaClient();
  
  const fetchData = async (opts: Partial<VormiaQueryOptions<T>> = {}): Promise<VormiaResponse<T>> => {
    const mergedOptions = { ...options, ...opts };
    const { 
      endpoint, 
      method = 'GET', 
      params, 
      data, 
      headers, 
      axiosConfig, 
      transform, 
      onSuccess, 
      onError 
    } = mergedOptions;

    try {
      const config = {
        ...axiosConfig,
        headers: { 
          ...headers, 
          ...axiosConfig?.headers,
        },
        params: method === 'GET' ? params : undefined,
      };

      const response = await client.request({
        url: endpoint,
        method,
        data: method !== 'GET' ? (data || params) : undefined,
        ...config,
      });

      let result = response.data;
      
      // Transform data if transform function is provided
      if (transform && result?.response) {
        result.response = transform(result.response);
      }

      // Call onSuccess callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error: any) {
      const vormiaError = error instanceof VormiaError 
        ? error 
        : new VormiaError(
            error?.message || 'An unknown error occurred',
            error?.response?.status
          );

      // Call onError callback
      if (onError) {
        onError(vormiaError);
      }

      throw vormiaError;
    }
  };

  const [resource, { refetch, ...actions }] = createResource<VormiaResponse<T> | undefined>(
    (options as any).autoFetch !== false ? fetchData : undefined,
    { initialValue }
  );

  // Enhanced refetch that accepts options
  const enhancedRefetch = async (opts?: Partial<VormiaQueryOptions<T>>) => {
    return fetchData(opts);
  };

  return [resource, { ...actions, refetch: enhancedRefetch }];
}

// Mutation helper for SolidJS
export function createVormiaMutation<T = any, V = any>(
  options: {
    onSuccess?: (data: VormiaResponse<T>) => void;
    onError?: (error: VormiaError) => void;
  } = {}
) {
  const client = getGlobalVormiaClient();
  
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<VormiaError | null>(null);
  const [data, setData] = createSignal<VormiaResponse<T> | null>(null);

  const mutate = async (
    endpoint: string,
    values: V,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
    config?: any
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await client.request({
        url: endpoint,
        method,
        data: values,
        ...config,
      });
      
      setData(result.data);
      
      if (options.onSuccess) {
        options.onSuccess(result.data);
      }
      
      return result.data;
    } catch (err: any) {
      const vormiaError = err instanceof VormiaError 
        ? err 
        : new VormiaError(
            err?.message || 'An unknown error occurred',
            err?.response?.status
          );
      
      setError(vormiaError);
      
      if (options.onError) {
        options.onError(vormiaError);
      }
      
      throw vormiaError;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    data,
    mutate,
  };
}
