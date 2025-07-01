import { useSignal, useTask$ } from '@builder.io/qwik';
import { getGlobalVormiaClient, VormiaError } from '../../core/VormiaClient';
import type { VormiaQueryOptions, VormiaResponse } from '../../types';

type VormiaQueryResult<T> = {
  data: { value: T | null };
  error: { value: Error | null };
  isLoading: { value: boolean };
  isError: { value: boolean };
  isSuccess: { value: boolean };
  fetch: (opts?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T>>;
  refetch: (opts?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T>>;
};

type VormiaMutationResult<T, V> = {
  data: { value: VormiaResponse<T> | null };
  error: { value: Error | null };
  isLoading: { value: boolean };
  isError: { value: boolean };
  isSuccess: { value: boolean };
  mutate: (
    endpoint: string,
    values: V,
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    config?: any
  ) => Promise<VormiaResponse<T>>;
};

export function useVormiaQuery<T = any>(options: VormiaQueryOptions<T>) {
  const client = getGlobalVormiaClient();
  const data = useSignal<T | null>(null);
  const error = useSignal<Error | null>(null);
  const isLoading = useSignal(false);
  const isError = useSignal(false);
  const isSuccess = useSignal(false);

  const fetchData = async (opts: Partial<VormiaQueryOptions<T>> = {}) => {
    const mergedOptions = { ...options, ...opts };
    const { 
      endpoint, 
      method = 'GET', 
      params, 
      data: bodyData, 
      headers, 
      transform, 
      onSuccess, 
      onError 
    } = mergedOptions;

    isLoading.value = true;
    isError.value = false;
    isSuccess.value = false;

    try {
      const config = {
        method,
        url: endpoint,
        params: method === 'GET' ? params : undefined,
        data: method !== 'GET' ? (bodyData || params) : undefined,
        headers
      };

      const response = await client.request(config);
      let result = response.data;
      
      if (transform && result?.response) {
        result.response = transform(result.response);
      }

      data.value = result.response;
      isSuccess.value = true;
      
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err: any) {
      const vormiaError = err instanceof VormiaError 
        ? err 
        : new VormiaError(
            err?.message || 'An unknown error occurred',
            err?.response?.status
          );
      
      error.value = vormiaError;
      isError.value = true;
      
      if (onError) {
        onError(vormiaError);
      }

      throw vormiaError;
    } finally {
      isLoading.value = false;
    }
  };

  // Auto-fetch if enabled
  useTask$(async () => {
    if ((options as any).enabled !== false) {
      await fetchData();
    }
  });

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    fetch: fetchData,
    refetch: fetchData
  };
}

export function useVormiaMutation<T = any, V = any>(options: {
  onSuccess?: (data: VormiaResponse<T>) => void;
  onError?: (error: VormiaError) => void;
} = {}) {
  const client = getGlobalVormiaClient();
  const data = useSignal<VormiaResponse<T> | null>(null);
  const error = useSignal<Error | null>(null);
  const isLoading = useSignal(false);
  const isError = useSignal(false);
  const isSuccess = useSignal(false);

  const mutate = async (
    endpoint: string,
    values: V,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
    config: any = {}
  ) => {
    isLoading.value = true;
    isError.value = false;
    isSuccess.value = false;
    
    try {
      const response = await client.request({
        method,
        url: endpoint,
        data: values,
        ...config,
      });
      
      data.value = response.data;
      isSuccess.value = true;
      
      if (options.onSuccess) {
        options.onSuccess(response.data);
      }
      
      return response.data;
    } catch (err: any) {
      const vormiaError = err instanceof VormiaError 
        ? err 
        : new VormiaError(
            err?.message || 'An unknown error occurred',
            err?.response?.status
          );
      
      error.value = vormiaError;
      isError.value = true;
      
      if (options.onError) {
        options.onError(vormiaError);
      }
      
      throw vormiaError;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    mutate,
  };
}
