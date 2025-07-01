import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { VormiaQueryOptions, VormiaResponse, VormiaError } from '../../types';
import { getGlobalVormiaClient } from '../../core/VormiaClient';

export const useVormiaQuery = <T = any>(
  options: VormiaQueryOptions<T>
): UseQueryResult<VormiaResponse<T>, VormiaError> & {
  invalidate: () => Promise<void>;
  refetch: () => Promise<UseQueryResult<VormiaResponse<T>, VormiaError>>;
} => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();

  const {
    endpoint,
    method = 'GET',
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
  const queryConfig = {
    ...queryOptions,
    queryKey,
  };

  const queryResult = useQuery<VormiaResponse<T>, VormiaError>({
    ...queryConfig,
    queryFn: async (): Promise<VormiaResponse<T>> => {
      try {
        const config = {
          ...axiosConfig,
          headers: { ...headers, ...axiosConfig?.headers },
          params: method === 'GET' ? params : undefined,
        };

        const response = await client.request({
          url: endpoint,
          method,
          data: method !== 'GET' ? data || params : undefined,
          ...config,
        });

        // Transform data if transform function is provided
        let result = response.data;
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
    },
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
