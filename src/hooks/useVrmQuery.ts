import { useQuery, useQueryClient, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import { VormiaResponse, VormiaError } from '../types';
import { getGlobalVormiaClient } from '../client/createVormiaClient';

export interface VormiaQueryOptions<T = any> extends Omit<UseQueryOptions<VormiaResponse<T>, VormiaError>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  axiosConfig?: any;
  transform?: (data: any) => T;
}

export const useVrmQuery = <T = any>(
  options: VormiaQueryOptions<T>
) => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = 'POST',
    params,
    data,
    headers,
    axiosConfig,
    transform,
    ...queryOptions
  } = options;

  const queryKey = [endpoint, method, params, data];

  const queryConfig = {
    ...queryOptions,
    queryKey,
  };

  const queryResult = useQuery({
    ...queryConfig,
    queryFn: async () => {
      try {
        let response: any;

        const config = {
          ...axiosConfig,
          headers: { ...headers, ...axiosConfig?.headers },
          params: method === 'GET' ? params : undefined,
        };

        switch (method.toUpperCase()) {
          case 'GET':
            response = await client.get(endpoint, config);
            break;
          case 'POST':
            response = await client.post(endpoint, data || params, config);
            break;
          case 'PUT':
            response = await client.put(endpoint, data || params, config);
            break;
          case 'PATCH':
            response = await client.patch(endpoint, data || params, config);
            break;
          case 'DELETE':
            response = await client.delete(endpoint, config);
            break;
          default:
            throw new VormiaError(`Unsupported HTTP method: ${method}`);
        }

        // Transform data if transform function is provided
        if (transform && response.data) {
          response.data = transform(response.data);
        }

        return response;
      } catch (error) {
        const vormiaError = error instanceof VormiaError ? error : new VormiaError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        );

        // Error will be handled by React Query's onError

        throw vormiaError;
      }
    },
    ...queryOptions,
  });

  // Helper functions
  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey });
  };

  return {
    ...queryResult,
    invalidate,
    refetch: queryResult.refetch,
  } as const;
};

// Hook for manually invalidating queries
export const useInvalidateVrmQuery = () => {
  const queryClient = useQueryClient();

  return (endpoint: string, method?: string, params?: any, data?: any) => {
    const queryKey = [endpoint, method || 'POST', params, data];
    return queryClient.invalidateQueries({ queryKey });
  };
};

// Hook for prefetching queries
export const usePrefetchVrmQuery = () => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();

  return async <T = any>(options: VormiaQueryOptions<T>) => {
    const {
      endpoint,
      method = 'POST',
      params,
      data,
      headers,
      axiosConfig,
      transform,
    } = options;

    const queryKey = [endpoint, method, params, data];

    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async (): Promise<VormiaResponse<T>> => {
        let response: any;

        const config = {
          ...axiosConfig,
          headers: { ...headers, ...axiosConfig?.headers },
          params: method === 'GET' ? params : undefined,
        };

        switch (method.toUpperCase()) {
          case 'GET':
            response = await client.get(endpoint, config);
            break;
          case 'POST':
            response = await client.post(endpoint, data || params, config);
            break;
          case 'PUT':
            response = await client.put(endpoint, data || params, config);
            break;
          case 'PATCH':
            response = await client.patch(endpoint, data || params, config);
            break;
          case 'DELETE':
            response = await client.delete(endpoint, config);
            break;
          default:
            throw new VormiaError(`Unsupported HTTP method: ${method}`);
        }

        if (transform && response.response) {
          response.response = transform(response.response);
        }

        return response;
      },
    });
  };
};