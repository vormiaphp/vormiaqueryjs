import { writable } from 'svelte/store';
import { getGlobalVormiaClient } from '../../client/createVormiaClient';
import { VormiaError } from '../../client/utils/VormiaError';

export function createVormiaStore(initialOptions = {}) {
  const client = getGlobalVormiaClient();
  const { subscribe, set, update } = writable({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  async function fetchData(options = {}) {
    const mergedOptions = { ...initialOptions, ...options };
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

    update(state => ({ ...state, isLoading: true, isError: false, isSuccess: false }));

    try {
      const config = {
        method,
        params: method === 'GET' ? params : undefined,
        data: method !== 'GET' ? (bodyData || params) : undefined,
        headers
      };

      const response = await client.request({
        url: endpoint,
        ...config
      });

      let result = response.data;

      if (transform) {
        result = transform(result);
      }

      const newState = {
        data: result,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true
      };

      set(newState);
      
      if (onSuccess) {
        onSuccess(newState);
      }

      return newState;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      const status = err?.response?.status;
      const errorData = err?.response?.data;
      
      const errorObj = err instanceof VormiaError 
        ? err 
        : new VormiaError(errorMessage, status, errorData);

      const errorState = {
        data: null,
        error: errorObj,
        isLoading: false,
        isError: true,
        isSuccess: false
      };

      set(errorState);
      
      if (onError) {
        onError(errorObj);
      }

      throw errorObj;
    }
  }

  if (initialOptions.immediate !== false) {
    fetchData();
  }

  return {
    subscribe,
    fetch: fetchData,
    refetch: fetchData,
    set,
    update
  };
}
