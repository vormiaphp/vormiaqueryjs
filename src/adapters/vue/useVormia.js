import { ref } from 'vue';
import { getGlobalVormiaClient } from '../../client/createVormiaClient';
import { VormiaError } from '../../client/utils/VormiaError';

export function useVormiaQuery(options) {
  const client = getGlobalVormiaClient();
  const data = ref(null);
  const error = ref(null);
  const isLoading = ref(false);
  const isError = ref(false);
  const isSuccess = ref(false);

  const fetchData = async (opts = {}) => {
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
        params: method === 'GET' ? params : undefined,
        headers
      };

      const response = await client.request({
        url: endpoint,
        method,
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
        onSuccess(response);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      const status = err?.response?.status;
      const errorData = err?.response?.data;
      
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

  if (options.immediate !== false) {
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

export function useVormiaMutation(options = {}) {
  const client = getGlobalVormiaClient();
  const data = ref(null);
  const error = ref(null);
  const isLoading = ref(false);
  const isError = ref(false);
  const isSuccess = ref(false);

  const mutate = async (endpoint, values, method = 'POST', config = {}) => {
    isLoading.value = true;
    isError.value = false;
    isSuccess.value = false;

    try {
      const response = await client.request({
        url: endpoint,
        method,
        data: values,
        ...config
      });

      data.value = response;
      isSuccess.value = true;
      
      if (options.onSuccess) {
        options.onSuccess(response);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      const status = err?.response?.status;
      const errorData = err?.response?.data;
      
      const errorObj = err instanceof VormiaError 
        ? err 
        : new VormiaError(errorMessage, status, errorData);
        
      error.value = errorObj;
      isError.value = true;
      
      if (options.onError) {
        options.onError(errorObj);
      }
      
      throw errorObj;
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
    mutate
  };
}
