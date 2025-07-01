import { 
  useQuery, 
  useQueryClient, 
  UseQueryResult, 
  UseQueryOptions, 
  QueryKey,
  QueryFunctionContext,
  QueryObserverResult
} from '@tanstack/react-query';
import { 
  VormiaResponse, 
  VormiaError, 
  VormiaRequestConfig,
  HttpMethod
} from '../../types';
import { getGlobalVormiaClient } from '../../client/createVormiaClient';

// Separate Vormia-specific options from React Query options
type VormiaQueryHookOptions<T> = Omit<VormiaRequestConfig, 'url' | 'method' | 'params' | 'data' | 'headers'> & {
  endpoint: string;
  method?: HttpMethod;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  transform?: (data: any) => T;
  onSuccess?: (data: VormiaResponse<T>) => void;
  onError?: (error: VormiaError) => void;
};

export const useVormiaQuery = <T = any>(
  options: VormiaQueryHookOptions<T> & UseQueryOptions<VormiaResponse<T>, VormiaError>
): QueryObserverResult<VormiaResponse<T>, VormiaError> & {
  invalidate: () => Promise<void>;
  refetch: () => Promise<QueryObserverResult<VormiaResponse<T>, VormiaError>>;
} => {
  const queryClient = useQueryClient();
  const client = getGlobalVormiaClient();

  const {
    // Vormia-specific options
    endpoint,
    method = 'GET',
    params,
    data: requestData,
    headers,
    transform,
    onSuccess: onVormiaSuccess,
    onError: onVormiaError,
    // React Query options
    ...queryOptions
  } = options;

  const queryKey: QueryKey = [endpoint, method, params, requestData];

  const queryResult = useQuery<VormiaResponse<T>, VormiaError>({
    ...queryOptions,
    queryKey,
    queryFn: async (): Promise<VormiaResponse<T>> => {
      try {
        const config: VormiaRequestConfig = {
          headers: { ...headers },
          params: method === 'GET' ? params : undefined,
        };

        const response = await client.request<T>({
          url: endpoint,
          method: method as HttpMethod,
          data: method !== 'GET' ? requestData || params : undefined,
          ...config,
        });

        // Transform data if transform function is provided
        let transformedData = response.data;
        if (transform && transformedData) {
          transformedData = transform(transformedData);
          response.data = transformedData;
        }

        // Call onSuccess callback
        if (onVormiaSuccess) {
          onVormiaSuccess(response);
        }

        return response;
      } catch (error: unknown) {
        const vormiaError = error instanceof VormiaError 
          ? error 
          : new VormiaError(
              error instanceof Error ? error.message : 'An unknown error occurred',
              (error as any)?.response?.status
            );

        // Call onVormiaError callback
        if (onVormiaError) {
          onVormiaError(vormiaError);
        }

        throw vormiaError;
      }
    },
  });

  // Helper functions
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey });
  };

  const refetch = async () => {
    return queryResult.refetch();
  };

  // Return the query result with additional methods
  return {
    ...queryResult,
    invalidate,
    refetch,
  };
};
