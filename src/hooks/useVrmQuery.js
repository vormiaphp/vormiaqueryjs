import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGlobalVormiaClient } from '../client/createVormiaClient';

/**
 * Hook for making API queries with Vormia
 * @param {Object} options - Query options
 * @param {string} options.endpoint - API endpoint
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.params] - Query parameters
 * @param {Object} [options.data] - Request body
 * @param {Object} [options.headers] - Custom headers
 * @param {Function} [options.transform] - Transform function for response data
 * @param {boolean} [options.enabled=true] - Whether the query should execute
 * @returns {Object} Query result
 */
export const useVrmQuery = (options) => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = 'GET',
    params,
    data,
    headers,
    transform,
    enabled = true,
    ...queryOptions
  } = options;

  const queryKey = [endpoint, method, params, data];

  const queryFn = async () => {
    try {
      const config = {
        method,
        url: endpoint,
        params: method === 'GET' ? params : undefined,
        data: method !== 'GET' ? data : undefined,
        headers,
      };

      const response = await client.request(config);
      
      if (transform && typeof transform === 'function') {
        return {
          ...response,
          data: transform(response.data)
        };
      }
      
      return response;
    } catch (error) {
      // Re-throw with VormiaError for consistent error handling
      throw error instanceof Error ? error : new Error('An unknown error occurred');
    }
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    ...queryOptions,
  });
};

/**
 * Hook for manually invalidating queries
 * @returns {Function} Function to invalidate queries
 */
export const useInvalidateVrmQuery = () => {
  const queryClient = useQueryClient();
  
  return (endpoint, params) => {
    return queryClient.invalidateQueries({
      queryKey: [endpoint, params],
    });
  };
};

/**
 * Hook for prefetching queries
 * @returns {Function} Function to prefetch queries
 */
export const usePrefetchVrmQuery = () => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();
  
  return async (options) => {
    const {
      endpoint,
      method = 'GET',
      params,
      data,
      headers,
      transform,
      ...queryOptions
    } = options;
    
    const queryKey = [endpoint, method, params, data];
    
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        try {
          const config = {
            method,
            url: endpoint,
            params: method === 'GET' ? params : undefined,
            data: method !== 'GET' ? data : undefined,
            headers,
          };
          
          const response = await client.request(config);
          
          if (transform && typeof transform === 'function') {
            return transform(response.data);
          }
          
          return response.data;
        } catch (error) {
          throw error instanceof Error ? error : new Error('Prefetch failed');
        }
      },
      ...queryOptions,
    });
  };
};
