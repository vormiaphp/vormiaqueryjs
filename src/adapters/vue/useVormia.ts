import { ref, Ref } from 'vue';
import { getGlobalVormiaClient } from '../../client/createVormiaClient';
import { VormiaError } from '../../client/utils/VormiaError';
import type { 
  VormiaQueryOptions, 
  VormiaResponse, 
  VormiaRequestConfig,
  HttpMethod
} from '../../types';

type VormiaQueryResult<T> = {
  data: Ref<T | null>;
  error: Ref<VormiaError | null>;
  isLoading: Ref<boolean>;
  isError: Ref<boolean>;
  isSuccess: Ref<boolean>;
  fetch: (opts?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T>>;
  refetch: (opts?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T>>;
};

export function useVormiaQuery<T = any>(options: VormiaQueryOptions<T>): VormiaQueryResult<T> {
  const client = getGlobalVormiaClient();
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<VormiaError | null>(null) as Ref<VormiaError | null>;
  const isLoading = ref(false);
  const isError = ref(false);
  const isSuccess = ref(false);

  const fetchData = async (opts: Partial<VormiaQueryOptions<T>> = {}) => {
    type MergedOptions = VormiaQueryOptions<T> & VormiaRequestConfig & {
      data?: any;
      onSuccess?: (data: VormiaResponse<T>) => void;
      onError?: (error: VormiaError) => void;
    };
    
    const mergedOptions = { ...options, ...opts } as MergedOptions;
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
      const config: VormiaRequestConfig = {
        method: method as HttpMethod,
        params: method === 'GET' ? params : undefined,
        headers
      };

      const response = await client.request<T>({
        url: endpoint,
        method: method as HttpMethod,
        data: method !== 'GET' ? (bodyData || params) : undefined,
        ...config,
      });
      
      let result = response.data;
      
      if (transform && result) {
        result = transform(result);
        response.data = result;
      }

      data.value = result;
      isSuccess.value = true;
      
      if (onSuccess) {
        onSuccess(response as VormiaResponse<T>);
      }

      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      const status = (err as any)?.response?.status;
      const errorData = (err as any)?.response?.data;
      
      const errorObj = err instanceof VormiaError 
        ? err 
        : new VormiaError(errorMessage, status, errorData);
        
      error.value = errorObj;
      isError.value = true;
      
      if (onError) {
        onError(errorObj);
      }
      
      throw errorObj;
    } finally {
      isLoading.value = false;
    }
  };

  // Auto-fetch if enabled
  if ((options as any).enabled !== false) {
    fetchData();
  }

  const result: VormiaQueryResult<T> = {
    data: data as Ref<T | null>,
    error: error as Ref<VormiaError | null>,
    isLoading: isLoading as Ref<boolean>,
    isError: isError as Ref<boolean>,
    isSuccess: isSuccess as Ref<boolean>,
    fetch: fetchData as (opts?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T>>,
    refetch: fetchData as (opts?: Partial<VormiaQueryOptions<T>>) => Promise<VormiaResponse<T>>
  };
  
  return result;
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
