import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { VormiaQueryOptions, VormiaResponse, VormiaError } from '../types';
import { getGlobalVormiaClient } from '../client/createVormiaClient';

export const useVrmQuery = <T = any>(
  options: VormiaQueryOptions<T>
): UseQueryResult<VormiaResponse<T>, VormiaError> & {
  invalidate: () => Promise<void>;
  refetch: () => Promise<UseQueryResult<VormiaResponse<T>, VormiaError>>;
} => {
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
    onSuccess,
    onError,
    ...queryOptions
  } = options;

  const queryKey = [endpoint, method, params, data];

  const queryResult = useQuery<VormiaResponse<T>, VormiaError>({
    queryKey,
    queryFn: async (): Promise<VormiaResponse<T>> => {
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
        if (transform && response.response) {
          response.response = transform(response.response);
        }

        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(response);
        }

        return response;
      } catch (error) {
        const vormiaError = error instanceof VormiaError ? error : new VormiaError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        );

        // Call onError callback
        if (onError) {
          onError(vormiaError);
        }

        throw vormiaError;
      }
    },
    ...queryOptions,
  });

  // Helper functions
  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const refetch = async () => {
    return queryResult.refetch();
  };

  return {
    ...queryResult,
    invalidate,
    refetch,
  };
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