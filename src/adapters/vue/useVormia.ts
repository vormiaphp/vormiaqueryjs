import { ref, Ref } from 'vue';
import { getGlobalVormiaClient, VormiaError } from '../../core/VormiaClient';
import type { VormiaQueryOptions, VormiaResponse } from '../../types';

type VormiaQueryResult<T> = {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  isLoading: Ref<boolean>;
  isError: Ref<boolean>;
  isSuccess: Ref<boolean>;
  fetch: (opts?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T>>;
  refetch: (opts?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T>>;
};

export function useVormiaQuery<T = any>(options: VormiaQueryOptions<T>): VormiaQueryResult<T> {
  const client = getGlobalVormiaClient();
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<Error | null>(null) as Ref<Error | null>;
  const isLoading = ref(false);
  const isError = ref(false);
  const isSuccess = ref(false);

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
  if ((options as any).enabled !== false) {
    fetchData();
  }

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

type VormiaMutationResult<T, V> = {
  data: Ref<VormiaResponse<T> | null>;
  error: Ref<Error | null>;
  isLoading: Ref<boolean>;
  isError: Ref<boolean>;
  isSuccess: Ref<boolean>;
  mutate: (
    endpoint: string,
    values: V,
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    config?: any
  ) => Promise<VormiaResponse<T>>;
};

export function useVormiaMutation<T = any, V = any>(options: {
  onSuccess?: (data: VormiaResponse<T>) => void;
  onError?: (error: VormiaError) => void;
} = {}): VormiaMutationResult<T, V> {
  const client = getGlobalVormiaClient();
  const data = ref<VormiaResponse<T> | null>(null) as Ref<VormiaResponse<T> | null>;
  const error = ref<Error | null>(null) as Ref<Error | null>;
  const isLoading = ref(false);
  const isError = ref(false);
  const isSuccess = ref(false);

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
